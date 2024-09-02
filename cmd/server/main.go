// Default package
package main

//
// Kubeview API scraping service and client host
// Ben Coleman, July 2019, v1
//

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/benc-uk/go-rest-api/pkg/env"

	"github.com/gorilla/mux"
	_ "github.com/joho/godotenv/autoload" // Autoloads .env file if it exists
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

var (
	healthy   = true                // Simple health flag
	version   = "0.0.0"             // App version number, set at build time with -ldflags "-X main.version=1.2.3"
	buildInfo = "No build details"  // Build details, set at build time with -ldflags "-X main.buildInfo='Foo bar'"
	clientset *kubernetes.Clientset // Clientset is global because I don't care
)

//
// Main entry point, will start HTTP service
//
func main() {
	log.SetOutput(os.Stdout) // Personal preference on log output
	log.Printf("### Kubeview v%v starting...", version)

	// Port to listen on, change the default as you see fit
	serverPort := env.GetEnvInt("PORT", 8000)
	inCluster := env.GetEnvBool("IN_CLUSTER", false)

	log.Println("### Connecting to Kubernetes...")
	var kubeConfig *rest.Config
	var err error

	// In cluster connect using in-cluster "magic", else build config from .kube/config file
	if inCluster {
		log.Println("### Creating client in cluster mode")
		kubeConfig, err = rest.InClusterConfig()
	} else {
		var kubeconfigFile = filepath.Join(os.Getenv("HOME"), ".kube", "config")
		log.Println("### Creating client with config file:", kubeconfigFile)
		kubeConfig, err = clientcmd.BuildConfigFromFlags("", kubeconfigFile)
	}

	// We have to give up if we can't connect to Kubernetes
	if err != nil {
		panic(err.Error())
	}
	log.Println("### Connected to:", kubeConfig.Host)

	// Create the clientset, which is our main interface to the Kubernetes API
	clientset, err = kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		panic(err.Error())
	}

	// Use gorilla/mux for routing
	router := mux.NewRouter()
	// Add middleware for logging and CORS
	router.Use(starterMiddleware)

	// Application API routes here
	router.HandleFunc("/healthz", routeHealthCheck)
	router.HandleFunc("/api/status", routeStatus)
	router.HandleFunc("/api/namespaces", routeGetNamespaces)
	router.HandleFunc("/api/scrape/{ns}", routeScrapeData)
	router.HandleFunc("/api/config", routeConfig)

	// Serve the frontend Vue.js SPA
	staticDirectory := env.GetEnvString("STATIC_DIR", "./frontend")
	spa := spaHandler{staticPath: staticDirectory, indexPath: "index.html"}
	router.PathPrefix("/").Handler(spa)

	log.Printf("### Serving static content from '%v'\n", staticDirectory)

	// Start server
	log.Printf("### Server listening on %v\n", serverPort)
	err = http.ListenAndServe(fmt.Sprintf(":%d", serverPort), router)
	if err != nil {
		panic(err.Error())
	}
}

//
// Log all HTTP requests with client address, method and request URI
// Plus a cheap and dirty CORS enabler
//
func starterMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(resp http.ResponseWriter, req *http.Request) {
		resp.Header().Set("Access-Control-Allow-Origin", "*")
		log.Println("###", strings.Split(req.RemoteAddr, ":")[0], req.Method, req.RequestURI)
		next.ServeHTTP(resp, req)
	})
}

// spaHandler implements the http.Handler interface, so we can use it
// to respond to HTTP requests. The path to the static directory and
// path to the index file within that static directory are used to
// serve the SPA in the given static directory.
type spaHandler struct {
	staticPath string
	indexPath  string
}

// ServeHTTP inspects the URL path to locate a file within the static dir
// on the SPA handler. If a file is found, it will be served. If not, the
// file located at the index path on the SPA handler will be served. This
// is suitable behavior for serving an SPA (single page application).
func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// get the absolute path to prevent directory traversal
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		// if we failed to get the absolute path respond with a 400 bad request
		// and stop
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// prepend the path with the path to the static directory
	path = filepath.Join(h.staticPath, path)

	// check whether a file exists at the given path
	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		// file does not exist, serve index.html
		http.ServeFile(w, r, filepath.Join(h.staticPath, h.indexPath))
		return
	} else if err != nil {
		// if we got an error (that wasn't that the file doesn't exist) stating the
		// file, return a 500 internal server error and stop
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// otherwise, use http.FileServer to serve the static dir
	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}
