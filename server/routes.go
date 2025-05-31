// ==========================================================================================
// HTTP routes and handlers for the Kubeview API
// ==========================================================================================

package main

import (
	"errors"
	"log"
	"net/http"
	"regexp"

	"github.com/benc-uk/go-rest-api/pkg/problem"
	"github.com/go-chi/chi/v5"
)

// All application routes are defined here
func (s *KubeviewAPI) AddRoutes(r *chi.Mux) {
	// Serve the index.html file from the public folder
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "public/index.html")
	})

	// Serve the public folder, which contains static files, JS, CSS, images, etc.
	r.HandleFunc("/public/*", func(w http.ResponseWriter, r *http.Request) {
		http.StripPrefix("/public/", http.FileServer(http.Dir("public"))).ServeHTTP(w, r)
	})

	// Special route for SSE streaming events to connected clients
	r.HandleFunc("/updates", s.handleSSE)

	// REST API routes
	r.Get("/api/namespaces", s.handleNamespaceList)
	r.Get("/api/fetch/{namespace}", s.handleFetchData)
}

// Establish the SSE connection for streaming updates each client
func (s *KubeviewAPI) handleSSE(w http.ResponseWriter, r *http.Request) {
	clientID := r.URL.Query().Get("clientID")
	if clientID == "" {
		http.Error(w, "clientID is required", http.StatusBadRequest)
		return
	}

	log.Printf("⚡ SSE client connected: %s", clientID)

	err := s.sseBroker.Stream(clientID, w, *r)
	if err != nil {
		log.Fatalln("💥 Error in SSE broker stream:", err)
		return
	}
}

// Get the list of namespaces from the Kubernetes cluster
// This the first endpoint that the frontend will call to get the list of namespaces
// It also returns the cluster host, version, and build info
func (s *KubeviewAPI) handleNamespaceList(w http.ResponseWriter, r *http.Request) {
	log.Println("🔍 Fetching list of namespaces")

	var namespaces []string

	var err error

	if s.config.SingleNamespace != "" {
		// If SingleNamespace is set, we only return that namespace
		namespaces = []string{s.config.SingleNamespace}
	} else {
		namespaces, err = s.kubeService.GetNamespaces()
		if err != nil {
			problem.Wrap(500, r.RequestURI, "namespaces", err).Send(w)
			return
		}

		// Remove namespaces that are in the filter, filter is a regex
		if s.config.NameSpaceFilter != "" {
			filteredNamespaces := make([]string, 0, len(namespaces))

			for _, ns := range namespaces {
				if matched, err := regexp.MatchString(s.config.NameSpaceFilter, ns); !matched && err == nil {
					filteredNamespaces = append(filteredNamespaces, ns)
				}
			}

			if len(filteredNamespaces) == 0 {
				problem.Wrap(500, r.RequestURI, "no namespaces found",
					errors.New("no namespaces match the filter")).Send(w)
				return
			}

			namespaces = filteredNamespaces
		}
	}

	res := NamespaceListResult{
		ClusterHost: s.kubeService.ClusterHost,
		Namespaces:  namespaces,
		Version:     s.Version,
		BuildInfo:   s.BuildInfo,
	}

	s.ReturnJSON(w, res)
}

// Return the resources for a specific namespace
func (s *KubeviewAPI) handleFetchData(w http.ResponseWriter, r *http.Request) {
	ns := chi.URLParam(r, "namespace")

	clientID := r.URL.Query().Get("clientID")

	if clientID == "" {
		http.Error(w, "clientID is required", http.StatusBadRequest)
		return
	}

	log.Println("🍵 Fetching resources in", ns)

	// Check single namespace mode
	if s.config.SingleNamespace != "" && ns != s.config.SingleNamespace {
		problem.Wrap(403, r.RequestURI, "single namespace mode",
			errors.New("only namespace permitted is:"+s.config.SingleNamespace)).Send(w)

		return
	}

	// Critical: Puts the client in the correct SSE group for this namespace
	// Events are sent to this group, so the client will receive updates ONLY for this namespace
	s.sseBroker.RemoveFromAllGroups(clientID)
	s.sseBroker.AddToGroup(clientID, ns)

	exists := s.kubeService.CheckNamespaceExists(ns)
	if !exists {
		problem.Wrap(404, r.RequestURI, "namespace not found", errors.New("namespace does not exist")).Send(w)
		return
	}

	data, err := s.kubeService.FetchNamespace(ns)
	if err != nil {
		problem.Wrap(500, r.RequestURI, "fetch data", err).Send(w)
		return
	}

	s.ReturnJSON(w, data)
}
