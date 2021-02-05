# Kubeview API Server

Go backend server and Kubernetes API scraper.

This effectively acts as an proxy/passthrough for the Kubernetes API with some small additions

It can run locally in which case it will locate the user's kube config and current context and use that, otherwise it connects to the API via "in cluster" mode. This is controlled with the `IN_CLUSTER` env variable

## API

The following API routes are available

| Verb | Route              | Description                                                     |
| ---- | ------------------ | --------------------------------------------------------------- |
| GET  | `/api/status`      | Simple status information                                       |
| GET  | `/api/namespaces`  | Return a list of namespaces                                     |
| GET  | `/api/scrape/{ns}` | Main data gathering call, returns objects in given namespace    |
| GET  | `/api/config`      | Called by front end to get `NAMESPACE_SCOPE` setting, see below |

## Configuration

The following environmental variables are used

| Name            | Description                                                     | Default      |
| --------------- | --------------------------------------------------------------- | ------------ |
| PORT            | Port to listen on                                               | `8000`       |
| IN_CLUSTER      | Running inside Kubernetes cluster (in a pod), or external       | `false`      |
| STATIC_DIR      | Location of static content to serve the frontend SPA, see below | `./frontend` |
| NAMESPACE_SCOPE | See below                                                       | `*`          |

## Serving Frontend SPA

Serving of static html/js/css is also done, if the called HTTP path doesn't match the API routes below it passes through to a static file handler. This is use to serve and host [the frontend Vue.js SPA](../../web/client).

The `STATIC_DIR` setting controls the location of this, it is expected to contain the bundled output of `npm run build`.

Note. the server **will** start if there is no content to serve and if `STATIC_DIR` doesn't exist, this means you can start the server and the debug the Vue.js app locally with `npm run serve` and point it to localhost for the API endpoint, see the [frontend client docs for more info](../../web/client)

## Namespace Scope

The `NAMESPACE_SCOPE` variable is passed over to the frontend via the `/api/config` API call, this determines how the front end behaves:

- When set to `*` (single asterisk) the app operates in cluster wide mode
- When set to any other string, this is taken to be single namespace mode, and the string value is the name of the namespace

See the [frontend client docs for more info](../../web/client)
