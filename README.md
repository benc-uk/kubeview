# KubeView
Kubernetes visualiser prototype thing

☢ This is VERY work in progress!

Shows what is happening inside a Kubernetes cluster. Currently displays:
- ReplicaSets
- Pods
- Services
- Ingresses
- Public IPs

## Components
- **Client SPA**, written in Vue.js. All visualisation, mapping & logic done here
- **Server**, scrapes Kubernetes API and presents it back out as a custom REST API. Also will act as server to the SPA

![demo](https://user-images.githubusercontent.com/14982936/53127181-c978a800-3559-11e9-8903-183266db0ca9.png)

# Repo Details
- [server](./server) - Source of the Node.js Express server
- [client](./client) - Source of the Vue.js client app
- [deploy](./deploy) - Kubernetes deployment manifests

# Todo 
## Short Term
- Fix the auto layout
- Show info popup when clicking on an element

## Medium Term
- Security
- Refresh data dynamically