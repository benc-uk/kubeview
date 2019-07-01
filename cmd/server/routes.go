package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	v1beta1 "k8s.io/api/extensions/v1beta1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Data struct to hold our returned data
type scrapeData struct {
	Pods                   []apiv1.Pod                   `json:"pods"`
	Services               []apiv1.Service               `json:"services"`
	Endpoints              []apiv1.Endpoints             `json:"endpoints"`
	PersistentVolumes      []apiv1.PersistentVolume      `json:"persistentvolumes"`
	PersistentVolumeClaims []apiv1.PersistentVolumeClaim `json:"persistentvolumeclaims"`
	Deployments            []appsv1.Deployment           `json:"deployments"`
	DaemonSets             []appsv1.DaemonSet            `json:"daemonsets"`
	ReplicaSets            []appsv1.ReplicaSet           `json:"replicasets"`
	StatefulSets           []appsv1.StatefulSet          `json:"statefulsets"`
	Ingresses              []v1beta1.Ingress             `json:"ingresses"`
}

// GetNamespaces - Return list of all namespaces in cluster
func GetNamespaces(w http.ResponseWriter, r *http.Request) {
	namespaces, err := clientset.CoreV1().Namespaces().List(metav1.ListOptions{})
	if err != nil {
		fmt.Println("### Kubernetes API error", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	namespacesJSON, _ := json.Marshal(namespaces.Items)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Add("Content-Type", "application/json")
	w.Write(namespacesJSON)
}

// ScrapeData - Return aggregated data from loads of different Kubernetes object types
func ScrapeData(w http.ResponseWriter, r *http.Request) {
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

	if err != nil {
		fmt.Println("### Kubernetes API error", err.Error())
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
	}

	scrapeResultJSON, _ := json.Marshal(scrapeResult)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Add("Content-Type", "application/json")
	w.Write([]byte(scrapeResultJSON))
}
