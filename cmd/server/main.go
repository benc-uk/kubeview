package main

//
// Kubeview API scraping service and client host
// Ben Coleman, July 2019, v1
//

import (
  "fmt"
  "net/http"
  "log"
  "os"
  "strings"
  "path/filepath"

  "github.com/benc-uk/go-starter/pkg/envhelper"
  
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
  "k8s.io/client-go/tools/clientcmd"
  "github.com/gorilla/mux"
  _ "github.com/joho/godotenv/autoload" // Autoloads .env file if it exists
)

var (
  healthy   = true                // Simple health flag
  version   = "0.1.7"             // App version number, set at build time with -ldflags "-X main.version=1.2.3"
  buildInfo = "No build details"  // Build details, set at build time with -ldflags "-X main.buildInfo='Foo bar'"
  clientset *kubernetes.Clientset   // Clientset is global because I don't care
)

//
// Main entry point, will start HTTP service
//
func main() {
  log.SetOutput(os.Stdout) // Personal preference on log output 
  log.Printf("### Kubeview v%v starting...", version)

  // Port to listen on, change the default as you see fit
  serverPort := envhelper.GetEnvInt("PORT", 8000)  
	inCluster := envhelper.GetEnvBool("IN_CLUSTER", false)
  
	log.Println("### Connecting to Kubernetes...")
	var config *rest.Config
	var err error

	// In cluster connect using in-cluster "magic", else build config from .kube/config file
	if inCluster {
		log.Println("### Creating client in cluster mode")
		config, err = rest.InClusterConfig()
	} else {
		var kubeconfig = filepath.Join(os.Getenv("HOME"), ".kube", "config")
		log.Println("### Creating client with config file:", kubeconfig)
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
  }

  // We have to give up if we can't connect to Kubernetes
	if err != nil {
		panic(err.Error())
	}
	log.Println("### Connected to:", config.Host)

	// Create the clientset, which is our main interface to the Kubernetes API
	clientset, err = kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
  }
  
  // Use gorilla/mux for routing  
  router := mux.NewRouter()     
  // Add middleware for logging and CORS
  router.Use(starterMiddleware) 

  // Application routes here
  router.HandleFunc("/healthz", routeHealthCheck)
  router.HandleFunc("/api/status", routeStatus)
	router.HandleFunc("/api/namespaces", routeGetNamespaces)
	router.HandleFunc("/api/scrape/{ns}", routeScrapeData)

  staticDirectory := envhelper.GetEnvString("STATIC_DIR", "./frontend")
  fileServer := http.FileServer(http.Dir(staticDirectory))
  router.PathPrefix("/js").Handler(http.StripPrefix("/", fileServer))
  router.PathPrefix("/css").Handler(http.StripPrefix("/", fileServer))
  router.PathPrefix("/img").Handler(http.StripPrefix("/", fileServer))
  router.PathPrefix("/favicon.png").Handler(http.StripPrefix("/", fileServer))
  // EVERYTHING else redirect to index.html
  router.NotFoundHandler = http.HandlerFunc(func (resp http.ResponseWriter, req *http.Request) {
    http.ServeFile(resp, req, staticDirectory + "/index.html")
  })
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