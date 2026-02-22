// ==========================================================================================
// Unit tests for the Kubernetes service
// ==========================================================================================

package services

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/benc-uk/go-rest-api/pkg/sse"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic/fake"
	k8sfake "k8s.io/client-go/kubernetes/fake"
)

// mockKubernetes creates a mock Kubernetes service for testing
func mockKubernetes() *Kubernetes {
	// Create fake dynamic client with proper resource mappings
	scheme := runtime.NewScheme()

	// Define resource mappings for the fake client
	gvrToListKind := map[schema.GroupVersionResource]string{
		{Group: "", Version: "v1", Resource: "namespaces"}:                          "NamespaceList",
		{Group: "", Version: "v1", Resource: "pods"}:                                "PodList",
		{Group: "", Version: "v1", Resource: "services"}:                            "ServiceList",
		{Group: "", Version: "v1", Resource: "endpoints"}:                           "EndpointsList",
		{Group: "", Version: "v1", Resource: "configmaps"}:                          "ConfigMapList",
		{Group: "", Version: "v1", Resource: "secrets"}:                             "SecretList",
		{Group: "", Version: "v1", Resource: "persistentvolumeclaims"}:              "PersistentVolumeClaimList",
		{Group: "", Version: "v1", Resource: "events"}:                              "EventList",
		{Group: "apps", Version: "v1", Resource: "deployments"}:                     "DeploymentList",
		{Group: "apps", Version: "v1", Resource: "replicasets"}:                     "ReplicaSetList",
		{Group: "apps", Version: "v1", Resource: "statefulsets"}:                    "StatefulSetList",
		{Group: "apps", Version: "v1", Resource: "daemonsets"}:                      "DaemonSetList",
		{Group: "batch", Version: "v1", Resource: "jobs"}:                           "JobList",
		{Group: "batch", Version: "v1", Resource: "cronjobs"}:                       "CronJobList",
		{Group: "networking.k8s.io", Version: "v1", Resource: "ingresses"}:          "IngressList",
		{Group: "autoscaling", Version: "v2", Resource: "horizontalpodautoscalers"}: "HorizontalPodAutoscalerList",
		{Group: "discovery.k8s.io", Version: "v1", Resource: "endpointslices"}:      "EndpointSliceList",
	}

	fakeDynamicClient := fake.NewSimpleDynamicClientWithCustomListKinds(scheme, gvrToListKind)

	// Create fake clientset
	fakeClientSet := k8sfake.NewClientset()

	return &Kubernetes{
		dynamicClient:     fakeDynamicClient,
		clientSet:         fakeClientSet,
		ClusterHost:       "https://test-cluster",
		Mode:              "test",
		UseEndpointSlices: false,
		KubeVersion:       "v1.30.0",
	}
}

// createTestNamespace creates a test namespace object
func createTestNamespace(name string) *unstructured.Unstructured {
	return &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": "v1",
			"kind":       "Namespace",
			"metadata": map[string]interface{}{
				"name": name,
			},
		},
	}
}

// createTestPod creates a test pod object
func createTestPod(name, namespace string) *unstructured.Unstructured {
	return &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": "v1",
			"kind":       "Pod",
			"metadata": map[string]interface{}{
				"name":      name,
				"namespace": namespace,
			},
			"spec": map[string]interface{}{
				"containers": []interface{}{
					map[string]interface{}{
						"name":  "test-container",
						"image": "nginx:latest",
					},
				},
			},
		},
	}
}

// createTestSecret creates a test secret object
func createTestSecret(name, namespace string) *unstructured.Unstructured {
	return &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": "v1",
			"kind":       "Secret",
			"metadata": map[string]interface{}{
				"name":      name,
				"namespace": namespace,
			},
			"data": map[string]interface{}{
				"username": "dGVzdA==", // base64 encoded "test"
				"password": "c2VjcmV0", // base64 encoded "secret"
			},
		},
	}
}

func TestKubernetes_GetNamespaces(t *testing.T) {
	k := mockKubernetes()

	// Create test namespaces
	ns1 := createTestNamespace("default")
	ns2 := createTestNamespace("kube-system")
	ns3 := createTestNamespace("test-namespace")

	// Add namespaces to the fake client
	gvr := schema.GroupVersionResource{Group: "", Version: "v1", Resource: "namespaces"}
	_, _ = k.dynamicClient.Resource(gvr).Create(context.TODO(), ns1, metaV1.CreateOptions{})
	_, _ = k.dynamicClient.Resource(gvr).Create(context.TODO(), ns2, metaV1.CreateOptions{})
	_, _ = k.dynamicClient.Resource(gvr).Create(context.TODO(), ns3, metaV1.CreateOptions{})

	// Test GetNamespaces
	namespaces, err := k.GetNamespaces()
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	expectedCount := 3
	if len(namespaces) != expectedCount {
		t.Fatalf("Expected %d namespaces, got %d", expectedCount, len(namespaces))
	}

	// Check if all expected namespaces are present
	expectedNamespaces := []string{"default", "kube-system", "test-namespace"}
	for _, expectedNs := range expectedNamespaces {
		found := false

		for _, ns := range namespaces {
			if ns == expectedNs {
				found = true
				break
			}
		}

		if !found {
			t.Errorf("Expected namespace %s not found in result", expectedNs)
		}
	}
}

func TestKubernetes_CheckNamespaceExists(t *testing.T) {
	k := mockKubernetes()

	// Create a test namespace
	ns := createTestNamespace("test-namespace")
	gvr := schema.GroupVersionResource{Group: "", Version: "v1", Resource: "namespaces"}
	_, _ = k.dynamicClient.Resource(gvr).Create(context.TODO(), ns, metaV1.CreateOptions{})

	// Test existing namespace
	exists := k.CheckNamespaceExists("test-namespace")
	if !exists {
		t.Error("Expected namespace to exist, but CheckNamespaceExists returned false")
	}

	// Test non-existing namespace
	exists = k.CheckNamespaceExists("non-existent")
	if exists {
		t.Error("Expected namespace to not exist, but CheckNamespaceExists returned true")
	}
}

func TestKubernetes_GetResources(t *testing.T) {
	k := mockKubernetes()

	// Create test pods
	pod1 := createTestPod("pod1", "default")
	pod2 := createTestPod("pod2", "default")

	// Add pods to the fake client
	gvr := schema.GroupVersionResource{Group: "", Version: "v1", Resource: "pods"}
	_, _ = k.dynamicClient.Resource(gvr).Namespace("default").Create(context.TODO(), pod1, metaV1.CreateOptions{})
	_, _ = k.dynamicClient.Resource(gvr).Namespace("default").Create(context.TODO(), pod2, metaV1.CreateOptions{})

	// Test GetResources
	pods, err := k.GetResources("default", "", "v1", "pods")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	expectedCount := 2
	if len(pods) != expectedCount {
		t.Fatalf("Expected %d pods, got %d", expectedCount, len(pods))
	}

	// Check pod names
	podNames := make(map[string]bool)
	for _, pod := range pods {
		podNames[pod.GetName()] = true
	}

	if !podNames["pod1"] || !podNames["pod2"] {
		t.Error("Expected pods 'pod1' and 'pod2' to be present")
	}
}

func TestKubernetes_FetchNamespace(t *testing.T) {
	k := mockKubernetes()

	// Test empty namespace
	_, err := k.FetchNamespace("")
	if err == nil {
		t.Error("Expected error for empty namespace, got nil")
	}

	// Create test resources
	pod := createTestPod("test-pod", "default")
	secret := createTestSecret("test-secret", "default")

	// Add resources to the fake client
	podGvr := schema.GroupVersionResource{Group: "", Version: "v1", Resource: "pods"}
	secretGvr := schema.GroupVersionResource{Group: "", Version: "v1", Resource: "secrets"}

	_, _ = k.dynamicClient.Resource(podGvr).Namespace("default").Create(context.TODO(), pod, metaV1.CreateOptions{})
	_, _ = k.dynamicClient.Resource(secretGvr).Namespace("default").
		Create(context.TODO(), secret, metaV1.CreateOptions{})

	// Test FetchNamespace
	data, err := k.FetchNamespace("default")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Check that data contains expected resource types
	expectedTypes := []string{"pods", "services", "deployments", "secrets", "configmaps"}
	for _, resourceType := range expectedTypes {
		if _, exists := data[resourceType]; !exists {
			t.Errorf("Expected resource type %s to be present in data", resourceType)
		}
	}

	// Check that secrets are redacted
	if secrets, ok := data["secrets"]; ok && len(secrets) > 0 {
		secretData, exists := secrets[0].Object["data"].(map[string]interface{})
		if !exists {
			t.Error("Expected secret to have data field")
		} else {
			for key, value := range secretData {
				if value != "*REDACTED*" {
					t.Errorf("Expected secret data field %s to be redacted, got %v", key, value)
				}
			}
		}
	}
}

func TestKubernetes_GetPodLogs(t *testing.T) {
	k := mockKubernetes()

	// Test empty namespace
	_, err := k.GetPodLogs("", "test-pod", 100)
	if err == nil {
		t.Error("Expected error for empty namespace, got nil")
	}

	// Test empty pod name
	_, err = k.GetPodLogs("default", "", 100)
	if err == nil {
		t.Error("Expected error for empty pod name, got nil")
	}

	// Test default line count
	_, err = k.GetPodLogs("default", "test-pod", 0)
	// This will fail because we're using a fake client, but we can check that the validation works
	if err != nil {
		// This is expected to fail with the fake client
		t.Logf("Expected error when calling GetPodLogs with fake client: %v", err)
	}
}

func TestInCluster(t *testing.T) {
	// Test when not in cluster
	originalEnv := os.Getenv("KUBERNETES_SERVICE_HOST")
	defer func() {
		if originalEnv != "" {
			_ = os.Setenv("KUBERNETES_SERVICE_HOST", originalEnv)
		} else {
			_ = os.Unsetenv("KUBERNETES_SERVICE_HOST")
		}
	}()

	_ = os.Unsetenv("KUBERNETES_SERVICE_HOST")

	if inCluster() {
		t.Error("Expected inCluster() to return false when KUBERNETES_SERVICE_HOST is not set")
	}

	// Test when in cluster
	_ = os.Setenv("KUBERNETES_SERVICE_HOST", "kubernetes.default.svc.cluster.local")

	if !inCluster() {
		t.Error("Expected inCluster() to return true when KUBERNETES_SERVICE_HOST is set")
	}
}

func TestEventTypeEnum(t *testing.T) {
	// Test that all event types are properly defined
	testCases := []struct {
		event    EventTypeEnum
		expected string
	}{
		{AddEvent, "add"},
		{UpdateEvent, "update"},
		{DeleteEvent, "delete"},
		{PingEvent, "ping"},
	}

	for _, tc := range testCases {
		if string(tc.event) != tc.expected {
			t.Errorf("Expected %s, got %s", tc.expected, string(tc.event))
		}
	}
}

func TestKubeEvent(t *testing.T) {
	// Test KubeEvent structure
	pod := createTestPod("test-pod", "default")
	event := KubeEvent{
		EventType: AddEvent,
		Object:    pod,
	}

	if event.EventType != AddEvent {
		t.Errorf("Expected event type %s, got %s", AddEvent, event.EventType)
	}

	if event.Object.GetName() != "test-pod" {
		t.Errorf("Expected object name 'test-pod', got %s", event.Object.GetName())
	}

	if event.Object.GetNamespace() != "default" {
		t.Errorf("Expected object namespace 'default', got %s", event.Object.GetNamespace())
	}
}

func TestGetHandlerFuncs(t *testing.T) {
	// Create a mock SSE broker
	broker := sse.NewBroker[KubeEvent]()

	// Get handler functions
	handlers := getHandlerFuncs(broker)

	// Test that handlers are not nil
	if handlers.AddFunc == nil {
		t.Error("Expected AddFunc to not be nil")
	}

	if handlers.UpdateFunc == nil {
		t.Error("Expected UpdateFunc to not be nil")
	}

	if handlers.DeleteFunc == nil {
		t.Error("Expected DeleteFunc to not be nil")
	}

	// Test handler behaviour with a test object
	pod := createTestPod("test-pod", "default")

	// Test AddFunc (this won't actually send because there are no subscribers)
	if handlers.AddFunc != nil {
		handlers.AddFunc(pod)
	}

	// Test UpdateFunc
	if handlers.UpdateFunc != nil {
		handlers.UpdateFunc(pod, pod)
	}

	// Test DeleteFunc
	if handlers.DeleteFunc != nil {
		handlers.DeleteFunc(pod)
	}

	// Test that objects without namespace are ignored
	clusterResource := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": "v1",
			"kind":       "Node",
			"metadata": map[string]interface{}{
				"name": "test-node",
			},
		},
	}

	// These should not panic and should be ignored
	if handlers.AddFunc != nil {
		handlers.AddFunc(clusterResource)
	}

	if handlers.UpdateFunc != nil {
		handlers.UpdateFunc(clusterResource, clusterResource)
	}

	if handlers.DeleteFunc != nil {
		handlers.DeleteFunc(clusterResource)
	}
}

// Benchmark tests
func BenchmarkGetNamespaces(b *testing.B) {
	k := mockKubernetes()

	// Create test namespaces
	gvr := schema.GroupVersionResource{Group: "", Version: "v1", Resource: "namespaces"}

	for i := 0; i < 10; i++ {
		ns := createTestNamespace(fmt.Sprintf("ns-%d", i))
		_, _ = k.dynamicClient.Resource(gvr).Create(context.TODO(), ns, metaV1.CreateOptions{})
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _ = k.GetNamespaces()
	}
}

func BenchmarkCheckNamespaceExists(b *testing.B) {
	k := mockKubernetes()

	// Create a test namespace
	ns := createTestNamespace("test-namespace")
	gvr := schema.GroupVersionResource{Group: "", Version: "v1", Resource: "namespaces"}
	_, _ = k.dynamicClient.Resource(gvr).Create(context.TODO(), ns, metaV1.CreateOptions{})

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		k.CheckNamespaceExists("test-namespace")
	}
}

func BenchmarkGetResources(b *testing.B) {
	k := mockKubernetes()

	// Create test pods
	gvr := schema.GroupVersionResource{Group: "", Version: "v1", Resource: "pods"}

	for i := 0; i < 50; i++ {
		pod := createTestPod(fmt.Sprintf("pod-%d", i), "default")
		_, _ = k.dynamicClient.Resource(gvr).Namespace("default").Create(context.TODO(), pod, metaV1.CreateOptions{})
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _ = k.GetResources("default", "", "v1", "pods")
	}
}
