# Kubeview Client Frontend
Vue.js client app, templated from the Vue CLI v3

App calls the REST API exposed by the hosting & API service (Written in Go, in the cmd/server folder), it calls `/api/namespaces` and `/api/scrape/{namespace}`. 

Once the API data is returned, it is parsed through by Kubernetes object type (Deployments, ReplicaSets, Pods, Services, etc) building up a graph of interlinked nodes, using the [Cytoscape.js library](http://js.cytoscape.org/). Nearly all of the application display logic is in a single Vue component `src/components/Viewer.vue`

There's a LOT of hardcoded display logic for things like colour coding by status, mapping the objects to icons and specifically linkage between things in the graph. The linking stuff is particularly messy with lots of internal conventions with underscores and string prefixes for assigning ids to links and nodes, if you can come up with a better way... Be my guest

## Config
The API endpoint is set by env var `VUE_APP_API_ENDPOINT`, see `.env.production` and `.env.development.local`  
In production mode it is set to `/api` so the API is called against the host serving out the Vue page/app

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

