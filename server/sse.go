package main

import (
	"encoding/json"
	"log"
	"time"

	"github.com/benc-uk/go-rest-api/pkg/sse"
	"github.com/benc-uk/kubeview/server/services"
)

// Wraps the SSE broker to handle Kubernetes events
type KubeEventBroker struct {
	*sse.Broker[services.KubeEvent]
}

func newKubeEventBroker(conf Config) KubeEventBroker {
	// This is the underlying SSE broker that will handle streaming events to connected clients
	broker := sse.NewBroker[services.KubeEvent]()

	// Customise the broker with specific handlers and message adapters
	broker.MessageAdapter = func(ke services.KubeEvent, clientID string) sse.SSE {
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

	broker.ClientDisconnectedHandler = func(clientID string) {
		log.Printf("🔌 Client disconnected: %s", clientID)
	}

	broker.ClientConnectedHandler = func(clientID string) {
		log.Printf("⚡ Client connected: %s", clientID)

		// Debug all groups and clients
		if conf.Debug {
			allGroups := broker.GetGroups()

			log.Printf("🔍 Debug: Current groups in SSE broker: %v", allGroups)
			log.Printf("🔍 Debug: Current clients in SSE broker: %v", broker.GetClients())

			for _, group := range allGroups {
				clients := broker.GetGroupClients(group)
				log.Printf("🔍 Debug: Group '%s' has clients: %v", group, clients)
			}
		}
	}

	// Start a SSE heartbeat to keep the connection alive, sent to all clients
	go func() {
		for {
			broker.SendToAll(services.KubeEvent{
				EventType: services.PingEvent,
				Object:    nil,
			})
			time.Sleep(10 * time.Second)
		}
	}()

	return KubeEventBroker{
		broker,
	}
}
