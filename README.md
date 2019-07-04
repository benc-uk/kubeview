# KubeView
Kubernetes cluster visualiser and visual explorer

KubeView displays what is happening inside a Kubernetes cluster, it maps out the API objects and how they are interconnected. Data is fetched real-time from the Kubernetes API. The status of some objects (Pods, ReplicaSets, Deployments) is colour coded red/green to represent their status and health

The app auto refreshes and dynamically updates the view as new data comes in or changes

Currently displays:
- Deployments
- ReplicaSets / StatefulSets / DaemonSets
- Pods
- Services
- Ingresses
- LoadBalancer IPs
- PersistentVolumeClaims

**Note.** This is a work in progress ☢

## Demo & Screenshots
### [Short video demo 🡕 ](https://www.youtube.com/watch?v=ukF6aLIUu58)

![demo](https://user-images.githubusercontent.com/14982936/53411103-87b68a00-39bd-11e9-81b2-df2fb9cd7b28.png)

## Application Components
- **Client SPA** - Vue.js single page app. All visualisation, mapping & logic done here
- **API Server** - Scrapes Kubernetes API and presents it back out as a custom REST API. Also acts as HTTP serving host to the SPA. Written in Go


# Repo Details
This projects follows the 'Standard Go Project Layout' directory structure and naming conventions as described [here](https://github.com/golang-standards/project-layout)

- [/cmd/server](./cmd/server) - Source of the API server, written in Go
- [/web/client](./web/client) - Source of the client app, written in Vue.js
- [/deployments](./deployments) - Kubernetes deployment manifests and instructions

### Azure Pipelines CI Build
[![Build Status](https://dev.azure.com/bencoleman/Experiments/_apis/build/status/Build%20KubeView?branchName=master)](https://dev.azure.com/bencoleman/Experiments/_build/latest?definitionId=53&branchName=master)


# Todo 
## Short Term
- Filtering improvements (no refresh)
- Support some CRDs? 
- Display Nodes?

## Medium Term
- Security
- Add AI
- Profit