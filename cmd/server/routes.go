package main

//
// Basic REST API microservice, template/reference code
// Ben Coleman, July 2019, v1
//

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"runtime"

	"github.com/gorilla/mux"

	appsv1 "k8s.io/api/apps/v1"
	autoscalingv1 "k8s.io/api/autoscaling/v1"
	apiv1 "k8s.io/api/core/v1"
	v1beta1 "k8s.io/api/extensions/v1beta1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

//
// Simple health check endpoint, returns 204 when healthy
//
func routeHealthCheck(resp http.ResponseWriter, req *http.Request) {
	if healthy {
		resp.WriteHeader(http.StatusNoContent)
		return
	}
	resp.WriteHeader(http.StatusServiceUnavailable)
}

//
// Return status information data - Remove if you like
//
func routeStatus(resp http.ResponseWriter, req *http.Request) {
	type status struct {
		Healthy    bool   `json:"healthy"`
		Version    string `json:"version"`
		BuildInfo  string `json:"buildInfo"`
		Hostname   string `json:"hostname"`
		OS         string `json:"os"`
		Arch       string `json:"architecture"`
		CPU        int    `json:"cpuCount"`
		GoVersion  string `json:"goVersion"`
		ClientAddr string `json:"clientAddress"`
		ServerHost string `json:"serverHost"`
	}

	hostname, err := os.Hostname()
	if err != nil {
		hostname = "hostname not available"
	}

	currentStatus := status{
		Healthy:    healthy,
		Version:    version,
		BuildInfo:  buildInfo,
		Hostname:   hostname,
		GoVersion:  runtime.Version(),
		OS:         runtime.GOOS,
		Arch:       runtime.GOARCH,
		CPU:        runtime.NumCPU(),
		ClientAddr: req.RemoteAddr,
		ServerHost: req.Host,
	}

	statusJSON, err := json.Marshal(currentStatus)
	if err != nil {
		http.Error(resp, "Failed to get status", http.StatusInternalServerError)
	}

	resp.Header().Add("Content-Type", "application/json")
	resp.Write(statusJSON)
}

// Data struct to hold our returned data
type scrapeData struct {
	Pods                   []apiv1.Pod                             `json:"pods"`
	Services               []apiv1.Service                         `json:"services"`
	Endpoints              []apiv1.Endpoints                       `json:"endpoints"`
	PersistentVolumes      []apiv1.PersistentVolume                `json:"persistentvolumes"`
	PersistentVolumeClaims []apiv1.PersistentVolumeClaim           `json:"persistentvolumeclaims"`
	Deployments            []appsv1.Deployment                     `json:"deployments"`
	DaemonSets             []appsv1.DaemonSet                      `json:"daemonsets"`
	ReplicaSets            []appsv1.ReplicaSet                     `json:"replicasets"`
	StatefulSets           []appsv1.StatefulSet                    `json:"statefulsets"`
	Ingresses              []v1beta1.Ingress                       `json:"ingresses"`
	AutoscalingGroups      []autoscalingv1.HorizontalPodAutoscaler `json:"autoscalinggroups"`
}

// GetNamespaces - Return list of all namespaces in cluster
func routeGetNamespaces(w http.ResponseWriter, r *http.Request) {
	namespaces, err := clientset.CoreV1().Namespaces().List(metav1.ListOptions{})
	if err != nil {
		log.Println("### Kubernetes API error", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	namespacesJSON, _ := json.Marshal(namespaces.Items)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Add("Content-Type", "application/json")
	w.Write(namespacesJSON)
}

// ScrapeData - Return aggregated data from loads of different Kubernetes object types
func routeScrapeData(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	namespace := params["ns"]

	pods, err := clientset.CoreV1().Pods(namespace).List(metav1.ListOptions{})
	services, err := clientset.CoreV1().Services(namespace).List(metav1.ListOptions{})
	endpoints, err := clientset.CoreV1().Endpoints(namespace).List(metav1.ListOptions{})
	pvs, err := clientset.CoreV1().PersistentVolumes().List(metav1.ListOptions{})
	pvcs, err := clientset.CoreV1().PersistentVolumeClaims(namespace).List(metav1.ListOptions{})

	deployments, err := clientset.AppsV1().Deployments(namespace).List(metav1.ListOptions{})
	daemonsets, err := clientset.AppsV1().DaemonSets(namespace).List(metav1.ListOptions{})
	replicasets, err := clientset.AppsV1().ReplicaSets(namespace).List(metav1.ListOptions{})
	statefulsets, err := clientset.AppsV1().StatefulSets(namespace).List(metav1.ListOptions{})

	ingresses, err := clientset.ExtensionsV1beta1().Ingresses(namespace).List(metav1.ListOptions{})

	autoscalinggroups, err := clientset.AutoscalingV1().HorizontalPodAutoscalers(namespace).List(metav1.ListOptions{})

	if err != nil {
		log.Println("### Kubernetes API error", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	scrapeResult := scrapeData{
		Pods:                   pods.Items,
		Services:               services.Items,
		Endpoints:              endpoints.Items,
		PersistentVolumes:      pvs.Items,
		PersistentVolumeClaims: pvcs.Items,
		Deployments:            deployments.Items,
		DaemonSets:             daemonsets.Items,
		ReplicaSets:            replicasets.Items,
		StatefulSets:           statefulsets.Items,
		Ingresses:              ingresses.Items,
		AutoscalingGroups:      autoscalinggroups.Items,
	}

	scrapeResultJSON, _ := json.Marshal(scrapeResult)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Add("Content-Type", "application/json")
	w.Write([]byte(scrapeResultJSON))
}
