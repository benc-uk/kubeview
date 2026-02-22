// ==========================================================================================
// Integration tests for the Kubernetes service
// These tests require a real Kubernetes cluster to be available
// ==========================================================================================

package services

import (
	"os"
	"testing"

	"github.com/benc-uk/go-rest-api/pkg/sse"
)

// TestNewKubernetes_Integration tests the actual NewKubernetes constructor
// This is an integration test that requires a real Kubernetes cluster
func TestNewKubernetes_Integration(t *testing.T) {
	// Skip this test if we're in CI or if KUBECONFIG is not set
	if os.Getenv("CI") != "" || (os.Getenv("KUBECONFIG") == "" && !fileExists(os.Getenv("HOME")+"/.kube/config")) {
		t.Skip("Skipping integration test - no Kubernetes cluster available")
	}

	// Create SSE broker
	broker := sse.NewBroker[KubeEvent]()

	// Test creating a new Kubernetes service
	k, err := NewKubernetes(broker, "")
	if err != nil {
		t.Skipf("Skipping integration test - could not connect to Kubernetes: %v", err)
	}

	// Test basic functionality
	if k.ClusterHost == "" {
		t.Error("Expected ClusterHost to be set")
	}

	if k.KubeVersion == "" {
		t.Error("Expected KubeVersion to be set")
	}

	if k.Mode == "" {
		t.Error("Expected Mode to be set")
	}

	// Test getting namespaces
	namespaces, err := k.GetNamespaces()
	if err != nil {
		t.Errorf("Failed to get namespaces: %v", err)
	}

	if len(namespaces) == 0 {
		t.Error("Expected at least one namespace")
	}

	// Check if default namespace exists
	defaultExists := false

	for _, ns := range namespaces {
		if ns == "default" {
			defaultExists = true
			break
		}
	}

	if !defaultExists {
		t.Error("Expected 'default' namespace to exist")
	}

	// Test namespace existence check
	if !k.CheckNamespaceExists("default") {
		t.Error("Expected 'default' namespace to exist")
	}

	if k.CheckNamespaceExists("this-namespace-should-not-exist-12345") {
		t.Error("Expected non-existent namespace check to return false")
	}

	t.Logf("✅ Integration test passed - connected to cluster %s running %s", k.ClusterHost, k.KubeVersion)
}

// TestNewKubernetes_SingleNamespace_Integration tests single namespace mode
func TestNewKubernetes_SingleNamespace_Integration(t *testing.T) {
	// Skip this test if we're in CI or if KUBECONFIG is not set
	if os.Getenv("CI") != "" || (os.Getenv("KUBECONFIG") == "" && !fileExists(os.Getenv("HOME")+"/.kube/config")) {
		t.Skip("Skipping integration test - no Kubernetes cluster available")
	}

	// Create SSE broker
	broker := sse.NewBroker[KubeEvent]()

	// Test creating a new Kubernetes service with single namespace
	k, err := NewKubernetes(broker, "default")
	if err != nil {
		t.Skipf("Skipping integration test - could not connect to Kubernetes: %v", err)
	}

	// Test that we can still access the default namespace
	if !k.CheckNamespaceExists("default") {
		t.Error("Expected 'default' namespace to exist")
	}

	// Test fetching namespace data
	data, err := k.FetchNamespace("default")
	if err != nil {
		t.Errorf("Failed to fetch namespace data: %v", err)
	}

	// Check that we get the expected resource types
	expectedTypes := []string{"pods", "services", "deployments", "configmaps", "secrets"}
	for _, resourceType := range expectedTypes {
		if _, exists := data[resourceType]; !exists {
			t.Errorf("Expected resource type %s to be present in namespace data", resourceType)
		}
	}

	t.Logf("✅ Single namespace integration test passed")
}

// fileExists checks if a file exists
func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}
