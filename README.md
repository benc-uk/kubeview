# KubeView
<img src="web/client/src/assets/logo.png" style="float:right">
Kubernetes cluster visualiser and visual explorer

KubeView displays what is happening inside a Kubernetes cluster (or single namespace), it maps out the API objects and how they are interconnected. Data is fetched real-time from the Kubernetes API. The status of some objects (Pods, ReplicaSets, Deployments) is colour coded red/green to represent their status and health

The app auto refreshes and dynamically updates the view as new data comes in or when it changes

Currently displays the following Kubernetes objects:
- Deployments
- ReplicaSets / StatefulSets / DaemonSets
- Pods
- Services
- Ingresses
- LoadBalancer IPs
- PersistentVolumeClaims
- Secrets
- ConfigMaps

### Status 
[![](https://img.shields.io/github/workflow/status/benc-uk/kubeview/Build%20Dockerhub%20Image?style=for-the-badge&logo=github)](https://github.com/benc-uk/kubeview/actions?query=workflow%3A%22Build+Dockerhub+Image%22)
[![](https://img.shields.io/github/last-commit/benc-uk/kubeview?style=for-the-badge&logo=github)](https://github.com/benc-uk/kubeview/commits/master)
[![](https://img.shields.io/github/v/release/benc-uk/kubeview?style=for-the-badge&logo=github)](https://github.com/benc-uk/kubeview/releases)


## Demo & Screenshots
#### Short video demo

[![](https://user-images.githubusercontent.com/14982936/76506327-ec1a7f00-6442-11ea-95ad-2ced7bb17114.png)](https://www.youtube.com/watch?v=ukF6aLIUu58)

#### Screenshots
![demo](https://user-images.githubusercontent.com/14982936/53411103-87b68a00-39bd-11e9-81b2-df2fb9cd7b28.png)
![demo2](https://user-images.githubusercontent.com/14982936/76505968-46671000-6442-11ea-8cda-1c62fbd26958.png)

## Application Components
The app consists of two separate but connected elements, in the standard pattern of backend REST API and JS client frontend

- **Client SPA** - Vue.js single page app. All visualisation, mapping & object connection logic is done client side
- **API Server** - Scrapes Kubernetes API and presents it back out as a custom REST API. Also acts as HTTP serving host to the SPA. Written in Go


# Repo Details
This projects follows the 'Standard Go Project Layout' directory structure and naming conventions as described [here](https://github.com/golang-standards/project-layout)

- [/cmd/server](./cmd/server) - Source of the API server, written in Go. See the readme there for more details
- [/web/client](./web/client) - Source of the client app, written in Vue.js. See the readme in there for more details
- [/deployments/helm](./deployments/helm) - Helm chart for simplifying deployment. See the readme in there for more details
- [/build](./build) - Build artifacts such as the Dockerfile


# Docker Image
Builds of the Docker image are hosted publicly on DockerHub here: [hub.docker.com/repository/docker/bencuk/kubeview](https://hub.docker.com/repository/docker/bencuk/kubeview)

- The `latest` tag is likely to be unstable   
- Versioned tags are build and pushed in sync with released versions of this repo, e.g. `bencuk/kubeview:0.1.13`

[![](https://img.shields.io/github/workflow/status/benc-uk/kubeview/Release%20Dockerhub%20Image?label=last%20release&style=for-the-badge&logo=docker)](https://hub.docker.com/repository/docker/bencuk/kubeview/tags?page=1)

# Project Meta
## Known Issues 
- Filtering only applies to certain objects such as pods and controllers
- On Firefox, the namespace picker doesn't show a drop down list, you have to start typing a name for the list to appear. This is Firefox behavior not a bug

## Todo / Roadmap
- Support some CRDs
- Display Nodes
- Filtering improvements (no refresh)
- Settings with detail levels

## Change Log
[See releases](https://github.com/benc-uk/kubeview/releases)