# KubeView
Kubernetes cluster visualiser and mapper

Shows what is happening inside a Kubernetes cluster in terms of objects and how they are interconnected. Data is fetched real-time from the Kubernetes API. The status of some objects (Pods, ReplicaSets) are colour coded red/green to represent their status and health

Currently displays:
- Deployments
- ReplicaSets / StatefulSets / DaemonSets
- Pods
- Services
- Ingresses
- LoadBalancer IPs
- PersistentVolumeClaims

**Note.** This is VERY work in progress! ☢

## Application Components
- **Client SPA** - Written in Vue.js. All visualisation, mapping & logic done here
- **API Server** - Scrapes Kubernetes API and presents it back out as a custom REST API. Also acts as HTTP server to the SPA

![demo](https://user-images.githubusercontent.com/14982936/53201465-0311e780-361c-11e9-96ad-f627e903ad1a.png)


# Repo Details
- [server](./server) - Source of the Node.js Express API server
- [client](./client) - Source of the Vue.js client app
- [kubernetes](./kubernetes) - Kubernetes deployment manifests and instructions

### Azure Pipelines CI Build
[![Build Status](https://dev.azure.com/bencoleman/Experiments/_apis/build/status/Build%20KubeView?branchName=master)](https://dev.azure.com/bencoleman/Experiments/_build/latest?definitionId=53&branchName=master)


# Todo 
## Short Term
- Improve the auto layout
- Show info/details popup when clicking on an element

## Medium Term
- Security
- Refresh data dynamically (without a full re-layout)
- Add AI
- Profit