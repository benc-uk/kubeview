// ==========================================================================================
// The backend API for KubeView, handling requests and serving data
// ==========================================================================================

package main

import (
	"encoding/json"
	"log"
	"time"

	"github.com/benc-uk/go-rest-api/pkg/api"
	"github.com/benc-uk/go-rest-api/pkg/sse"
	"github.com/benc-uk/kubeview/server/services"
)

// This is the core struct for the server & API
type KubeviewAPI struct {
	*api.Base
	kubeService *services.Kubernetes
	sseBroker   *sse.Broker[services.KubeEvent]
	config      Config
}

type NamespaceListResult struct {
	Namespaces []string `json:"namespaces"`
	// We munge a couple of extra fields into the API response
	// This saves us from having to make a separate request for the version and build info
	ClusterHost string `json:"clusterHost"`
	Version     string `json:"version"`
	BuildInfo   string `json:"buildInfo"`
	Mode        string `json:"mode"`
}

func NewKubeviewAPI(conf Config) *KubeviewAPI {
	// This is the SSE broker that will handle streaming events to connected clients
	sseBroker := sse.NewBroker[services.KubeEvent]()

	sseBroker.MessageAdapter = func(ke services.KubeEvent, clientID string) sse.SSE {
		json, err := json.Marshal(ke.Object)
		if err != nil {
			log.Printf("💥 Error marshalling object: %v", err)

			return sse.SSE{
				Data:  "Error marshalling object",
				Event: "error",
			}
		}

		if conf.Debug {
			log.Printf("🔄 Sending SSE event: %s, clientID: %s, data: %s", ke.EventType, clientID, json)
		}

		return sse.SSE{
			Data:  string(json),
			Event: string(ke.EventType),
		}
	}

	// Start a SSE heartbeat to keep the connection alive, sent to all clients
	go func() {
		for {
			sseBroker.SendToAll(services.KubeEvent{
				EventType: services.PingEvent,
				Object:    nil,
			})
			time.Sleep(10 * time.Second)
		}
	}()

	// Create a new Kubernetes service instance, which will connect to the cluster
	kubeSvc, err := services.NewKubernetes(sseBroker, conf.SingleNamespace)
	if err != nil {
		log.Fatalf("💥 Error connecting to Kubernetes, system will exit")
	}

	// Our API struct is a wrapper around the base API functionality
	return &KubeviewAPI{
		api.NewBase("kubeview", version, buildInfo, true),
		kubeSvc,
		sseBroker,
		conf,
	}
}
