package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"net/http"

	"github.com/benc-uk/kubeview/routes"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/rest"

	"github.com/gorilla/mux"
)

func main() {
	// Pass in arguments
	inCluster       := flag.Bool("incluster", false, "Set when running as a pod in K8s cluster (default: false)")
	staticDirectory := flag.String("static-dir", "./frontend", "The directory of static files to serve")
	port            := flag.Int("port", 8000, "Server port")
	flag.Parse()

	fmt.Println("### Connecting to Kubernetes...")
	var config *rest.Config
	var err error

	// In cluster connect using in-cluster "magic", else build config from .kube/config file 
	if(*inCluster) {
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
	routes.Clientset, err = kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	// Routing for API calls and serving static Vue.js frontend client app
	router := mux.NewRouter()
	router.HandleFunc("/api/namespaces", routes.GetNamespaces)
	router.HandleFunc("/api/scrape/{ns}", routes.ScrapeData)

	// This is enough to serve the Vue client app from the staticDirectory
	// - as it doesn't use in app routing (i.e. vue-router)
	router.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir(*staticDirectory))))

	fmt.Printf("### KubeView Server listening on port %v\n", *port)
	http.ListenAndServe(fmt.Sprintf(":%d", *port), router)
}
