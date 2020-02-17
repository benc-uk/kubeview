package main

//
// Basic REST API microservice, template/reference code
// Ben Coleman, July 2019, v1
//

import (
  "encoding/json"
  "net/http"
  "bytes"
  "io"
  "os"
  "runtime"
  "log"
  "github.com/gorilla/mux"

  appsv1 "k8s.io/api/apps/v1"
  autoscalingv1 "k8s.io/api/autoscaling/v1"
  apiv1 "k8s.io/api/core/v1"
  v1beta1 "k8s.io/api/extensions/v1beta1"
  metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"


  _ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
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
	Nodes                  []apiv1.Node                  `json:"nodes"`
	AutoscalingGroups      []autoscalingv1.HorizontalPodAutoscaler `json:"autoscalinggroups"`

}

type Log struct { 
    logs string 
}
// GetNamespaces - Return list of all namespaces in cluster
func routeGetNamespaces(w http.ResponseWriter, r *http.Request) {
	namespaces, err := clientset.CoreV1().Namespaces().List(metav1.ListOptions{})
	if err != nil {
		log.Println("### Kubernetes API error", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	namespacesJSON, _ := json.Marshal(namespaces.Items)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Add("Content-Type", "application/json")
	w.Write(namespacesJSON)
}

func routeDeletePod(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	namespace := params["ns"]
	pod := params["pod"]

	if err := clientset.CoreV1().Pods(namespace).Delete(pod, &metav1.DeleteOptions{}); err != nil {
		log.Println("### Kubernetes Delete Pod API error", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	return
}

func routeGetPodLogs(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	namespace := params["ns"]
	podName := params["pod"]
	// Get the pod and ensure it is in a good state
	pod, err := clientset.CoreV1().Pods(namespace).Get(podName, metav1.GetOptions{})
	if err != nil {
		log.Println("### Kubernetes Get Pod Logs API error", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if pod.Status.Phase == apiv1.PodSucceeded || pod.Status.Phase == apiv1.PodFailed {
		log.Println("cannot exec into a completed pod; current phase is %s", pod.Status.Phase)
		http.Error(w, `cannot exec into a completed pod; current phase is ${pod.Status.Phase}`, http.StatusInternalServerError)
		return
	}

	// Infer container name if necessary
	/*
	if len(containerName) == 0 {
		if len(pod.Spec.Containers) > 1 {
			return nil, fmt.Errorf("pod %s has multiple containers, but no container was specified", pod.Name)
		}
		containerName = pod.Spec.Containers[0].Name
	}*/
	podLogOpt := apiv1.PodLogOptions{}
	podLogOpt.Container = pod.Spec.Containers[0].Name
	req := clientset.CoreV1().Pods(namespace).GetLogs(podName, &podLogOpt)
        podLogs, err := req.Stream()
        if err != nil {
		log.Println("### Kubernetes Get Pod Logs API error", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
        }
        defer podLogs.Close()

        buf := new(bytes.Buffer)
        _, err = io.Copy(buf, podLogs)
        if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
        }
        str := buf.String()
	jsonLog, err := json.Marshal(str)
        if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
        }
	log.Println("Response Hsing", string(str))
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Add("Content-Type", "application/json")
	w.Write([]byte(jsonLog))

	return
}
// ScrapeData - Return aggregated data from loads of different Kubernetes object types
func routeScrapeData(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	namespace := params["ns"]

	podsChan := make(chan *apiv1.PodList)
	go func(){
		podList, _ := clientset.CoreV1().Pods(namespace).List(metav1.ListOptions{})
		podsChan <- podList
        }()

	servicesChan := make(chan *apiv1.ServiceList)
	go func(){
		servicesList, _ := clientset.CoreV1().Services(namespace).List(metav1.ListOptions{})
		servicesChan <- servicesList
        }()

	endpointsChan := make(chan *apiv1.EndpointsList)
	go func(){
		endpointsList, _ := clientset.CoreV1().Endpoints(namespace).List(metav1.ListOptions{})
		endpointsChan <- endpointsList
        }()

	pvsChan := make(chan *apiv1.PersistentVolumeList)
	go func(){
		pvsList, _ := clientset.CoreV1().PersistentVolumes().List(metav1.ListOptions{})
		pvsChan <- pvsList
        }()

	pvcsChan := make(chan *apiv1.PersistentVolumeClaimList)
	go func(){
		pvcsList, _ := clientset.CoreV1().PersistentVolumeClaims(namespace).List(metav1.ListOptions{})
		pvcsChan <- pvcsList
        }()

	deploymentsChan := make(chan *appsv1.DeploymentList)
	go func(){
		deploymentsList, _ := clientset.AppsV1().Deployments(namespace).List(metav1.ListOptions{})
		deploymentsChan <- deploymentsList
        }()
	autoscalinggroupsChan := make(chan *autoscalingv1.HorizontalPodAutoscalerList)
	go func(){
		asgList, _ := clientset.AutoscalingV1().HorizontalPodAutoscalers(namespace).List(metav1.ListOptions{})
		autoscalinggroupsChan <- asgList
		}()
	
	daemonsetsChan := make(chan *appsv1.DaemonSetList)
	go func(){
		daemonsetsList, _ := clientset.AppsV1().DaemonSets(namespace).List(metav1.ListOptions{})
		daemonsetsChan <- daemonsetsList
        }()

	replicasetsChan := make(chan *appsv1.ReplicaSetList)
	go func(){
		replicasetsList, _ := clientset.AppsV1().ReplicaSets(namespace).List(metav1.ListOptions{})
		replicasetsChan <- replicasetsList
        }()

	statefulsetsChan := make(chan *appsv1.StatefulSetList)
	go func(){
		statefulsetsList, _ := clientset.AppsV1().StatefulSets(namespace).List(metav1.ListOptions{})
		statefulsetsChan <- statefulsetsList
        }()

	ingressesChan := make(chan *v1beta1.IngressList)
	go func(){
		ingressesList, _ := clientset.ExtensionsV1beta1().Ingresses(namespace).List(metav1.ListOptions{})
		ingressesChan <- ingressesList
        }()

	nodesChan := make(chan *apiv1.NodeList)
	go func(){
		nodesList, _ := clientset.CoreV1().Nodes().List(metav1.ListOptions{})
		nodesChan <- nodesList
        }()
	// pods, err := clientset.CoreV1().Pods(namespace).List(metav1.ListOptions{})
	// pods, err := clientset.CoreV1().Pods(namespace).List(metav1.ListOptions{})
	// services, err := clientset.CoreV1().Services(namespace).List(metav1.ListOptions{})
	// endpoints, err := clientset.CoreV1().Endpoints(namespace).List(metav1.ListOptions{})
	// pvs, err := clientset.CoreV1().PersistentVolumes().List(metav1.ListOptions{})
	// pvcs, err := clientset.CoreV1().PersistentVolumeClaims(namespace).List(metav1.ListOptions{})


	// deployments, err := clientset.AppsV1().Deployments(namespace).List(metav1.ListOptions{})
	// daemonsets, err := clientset.AppsV1().DaemonSets(namespace).List(metav1.ListOptions{})
	// replicasets, err := clientset.AppsV1().ReplicaSets(namespace).List(metav1.ListOptions{})
	// statefulsets, err := clientset.AppsV1().StatefulSets(namespace).List(metav1.ListOptions{})

	// ingresses, err := clientset.ExtensionsV1beta1().Ingresses(namespace).List(metav1.ListOptions{})

	// nodes, err := clientset.CoreV1().Nodes().List(metav1.ListOptions{})

	/*
	if err != nil {
		log.Println("### Kubernetes API error", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}*/

	pods := <-podsChan
	services := <-servicesChan
	endpoints := <-endpointsChan
	pvs := <-pvsChan
	pvcs := <-pvcsChan
	deployments := <-deploymentsChan
	daemonsets := <-daemonsetsChan
	replicasets := <-replicasetsChan
	statefulsets := <-statefulsetsChan
	ingresses := <-ingressesChan
	autoscalinggroups := <-autoscalinggroupsChan
	nodes := <-nodesChan

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
		Nodes:                  nodes.Items,
		AutoscalingGroups:      autoscalinggroups.Items,

	}

	scrapeResultJSON, _ := json.Marshal(scrapeResult)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Add("Content-Type", "application/json")
        log.Println("Response Hsing", string(scrapeResultJSON))
	w.Write([]byte(scrapeResultJSON))
}
