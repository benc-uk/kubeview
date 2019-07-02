package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/benc-uk/kubeview/pkg/envhelper"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"

	"github.com/gorilla/mux"
)

// Clientset is global because I don't care
var clientset *kubernetes.Clientset

func main() {
	// Pass in arguments
	
	inCluster := envhelper.GetEnvBool("IN_CLUSTER", false)
	staticDirectory :=  envhelper.GetEnvString("STATIC_DIR", "./frontend")
	port := envhelper.GetEnvInt("PORT", 8000)

	fmt.Println("### Connecting to Kubernetes...")
	var config *rest.Config
	var err error

	// In cluster connect using in-cluster "magic", else build config from .kube/config file
	if inCluster {
		fmt.Println("### Creating client in cluster mode")
		config, err = rest.InClusterConfig()
	} else {
		var kubeconfig = filepath.Join(os.Getenv("HOME"), ".kube", "config")
		fmt.Println("### Creating client with config file:", kubeconfig)
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
	}

	// We have to give up if we can't connect to Kubernetes
	if err != nil {
		panic(err.Error())
	}
	fmt.Println("### Connected to:", config.Host)

	// Create the clientset, which is our main interface to the API
	// This is set over on the routes package
	clientset, err = kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	// Routing for API calls and serving static Vue.js frontend client app
	router := mux.NewRouter()
	router.HandleFunc("/api/namespaces", GetNamespaces)
	router.HandleFunc("/api/scrape/{ns}", ScrapeData)

	// This is enough to serve the Vue client app from the staticDirectory
	// - as it doesn't use in app routing (i.e. vue-router)
	router.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir(staticDirectory))))

	fmt.Printf("### KubeView Server listening on port %v\n", port)
	http.ListenAndServe(fmt.Sprintf(":%d", port), router)
}
