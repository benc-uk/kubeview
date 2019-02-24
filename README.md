# KubeView
Kubernetes cluster visualiser and mapper

Shows what is happening inside a Kubernetes cluster in terms of objects and how they are interconnected. Data is fetched real-time from the Kubernetes API. The status of some objects (Pods, ReplicaSets, Deployments) are colour coded red/green to represent their status and health

The app auto refresh and dynamically updates the view as new data comes in or changes

Currently displays:
- Deployments
- ReplicaSets / StatefulSets / DaemonSets
- Pods
- Services
- Ingresses
- LoadBalancer IPs
- PersistentVolumeClaims

**Note.** This is a work in progress ☢

## Application Components
- **Client SPA** - Vue.js single page app. All visualisation, mapping & logic done here
- **API Server** - Scrapes Kubernetes API and presents it back out as a custom REST API. Also acts as HTTP server to the SPA

<iframe width="560" height="315" src="https://www.youtube.com/embed/ukF6aLIUu58" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

![demo](https://user-images.githubusercontent.com/14982936/53201465-0311e780-361c-11e9-96ad-f627e903ad1a.png)


# Repo Details
- [server](./server) - Source of the Node.js Express API server
- [client](./client) - Source of the Vue.js client app
- [kubernetes](./kubernetes) - Kubernetes deployment manifests and instructions

### Azure Pipelines CI Build
[![Build Status](https://dev.azure.com/bencoleman/Experiments/_apis/build/status/Build%20KubeView?branchName=master)](https://dev.azure.com/bencoleman/Experiments/_build/latest?definitionId=53&branchName=master)


# Todo 
## Short Term
- ?

## Medium Term
- Security
- Add AI
- Profit