# Kubeview Client Frontend
Vue.js client app, templated from the Vue CLI v3

App calls the REST API exposed by the hosting & API service (Written in Go, in the cmd/server folder), it calls `/api/config`, `/api/namespaces` and `/api/scrape/{namespace}`. 

Once the API data is returned, it is parsed through by Kubernetes object type (Deployments, ReplicaSets, Pods, Services, etc) building up a graph of interlinked nodes, using the [Cytoscape.js library](http://js.cytoscape.org/). Nearly all of the application display logic is in a single Vue component `src/components/Viewer.vue`

There's a LOT of hardcoded display logic for things like colour coding by status, mapping the objects to icons and specifically linkage between things in the graph. The linking stuff is particularly messy with lots of internal conventions with underscores and string prefixes for assigning ids to links and nodes, if you can come up with a better way... Be my guest

## Config
The API endpoint is set by the variable `VUE_APP_API_ENDPOINT`, see `.env.production` and `.env.development.local`. Setting this to `http://localhost:8000/api` will allow you to start the API server independently and then run `npm run serve` to debug & test the frontend locally on your machine

In production mode `VUE_APP_API_ENDPOINT` is set to `/api` so the API is called against the host serving out the Vue page/app. Don't change this unless you know what you are doing.

Server side env variable `NAMESPACE_SCOPE` is passed to the frontend via the `/api/config` call. This modifies the behavior as follows:
- When set to `*` (single asterisk) the app operates in cluster wide mode: This will call `/api/namespaces` to get all namespaces, display a dropdown picker for the user to select the namespace.
- When set to any other string, this is taken to be single namespace mode. In this mode, only data from the given namespace is shown, and no picker is displayed

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

