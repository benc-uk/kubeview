# KubeView - Copilot Instructions

## Project Overview

KubeView is a Kubernetes cluster visualization tool providing a real-time graphical view of cluster resources and their relationships. It consists of a **Go backend** serving a REST API and static files, and a **vanilla JavaScript frontend** using ES modules (no bundler). The frontend uses G6 for graph visualization, Alpine.js for UI interactivity, and Bulma for CSS styling.

### Key Architecture Concepts

- The Go backend connects to Kubernetes via `client-go`, using both dynamic and typed clients.
- Real-time updates flow from Kubernetes informers → SSE broker → frontend `EventSource`.
- Clients are identified by a `clientID` (generated in the browser, stored in `localStorage`) and grouped by namespace for targeted SSE broadcasts.
- The frontend is embedded into the Go binary at build time using `//go:embed` (see `frontend-fs.go` at the project root).
- Kubernetes resources are handled as `unstructured.Unstructured` throughout, keeping the backend generic.
- Secret and ConfigMap data values are redacted to `*REDACTED*` before being sent to the frontend.

### Project Structure

- `server/` — Go backend: API handlers (`api.go`), HTTP routing (`routes.go`), SSE streaming (`sse.go`), configuration (`config.go`), entry point (`main.go`).
- `server/services/` — Kubernetes service layer: cluster connectivity, resource fetching, informer setup, pod logs.
- `frontend/` — Static web app: HTML, CSS, JS (ES modules), images, and third-party libraries in `ext/`.
- `frontend/js/` — Application JavaScript modules.
- `frontend/fragments/` — HTML fragments loaded dynamically at runtime via `loader.js`.
- `frontend-fs.go` — Root-level file that embeds the `frontend/` directory. Must remain at root for `//go:embed` to work.
- `deploy/` — Dockerfile (multi-stage build) and Helm chart for Kubernetes deployment.
- `.dev/` — Development tooling config: ESLint, Prettier, golangci-lint, Air (live reload), and a separate `tools.mod` for Go dev tools.
- `scripts/` — Install script for downloading pre-built binaries.

### API Routes

- `GET /api/namespaces` — List namespaces (also returns cluster metadata).
- `GET /api/fetch/{namespace}?clientID={clientID}` — Fetch all resources in a namespace; also registers the client to receive SSE updates for that namespace.
- `GET /api/logs/{namespace}/{podname}` — Fetch pod logs.
- `GET /api/status` — Server status, version, and build info.
- `GET /updates?clientID={clientID}` — SSE event stream for real-time resource updates.
- `GET /health` — Health check endpoint.
- `GET /` — Serves the main `index.html`.
- `GET /public/*` — Serves embedded static frontend files.

### Build & Dev Commands

- `make run` — Run locally with live reload (uses Air).
- `make build` — Build the Go binary.
- `make lint` — Lint both Go and JS code (CI mode).
- `make lint-fix` — Lint and auto-fix formatting.
- `make test` / `make test-unit` — Run unit tests.
- `make test-integration` — Run integration tests (requires a Kubernetes cluster).
- `make test-coverage` — Run tests with coverage report.
- `make image` — Build container image.
- `make clean` — Remove build artifacts.

---

## Go Coding Instructions

### Style & Conventions

- Use `:=` for variable declarations unless the variable is already declared.
- Use `log.Printf()` and `log.Println()` for logging, never `fmt.Printf()` or `fmt.Println()`.
- Use descriptive emoji prefixes in log messages: `🚀` startup, `💥` errors, `✅` success, `⚓` cluster operations, `🔍` data fetching.
- Organize imports in three groups separated by blank lines: standard library, third-party packages, local packages.
- Use comprehensive file-level banner comments (`// ====...====`) describing each file's purpose.
- Use meaningful short variable names: `gvr` for GroupVersionResource, `ns` for namespace, `k` for Kubernetes service receiver.
- Avoid global variables; pass dependencies as function parameters or struct fields.
- Use `make()` with capacity hints when the approximate size of slices/maps is known.
- Max line length is 120 characters (enforced by `revive` linter).
- Max cyclomatic complexity is 15 (enforced by `cyclop` linter).
- JSON/YAML struct tags must use `goCamel` naming (enforced by `tagliatelle` linter).

### Architecture Patterns

- **Composition over inheritance**: Embed structs/interfaces (e.g., `KubeviewAPI` embeds `*api.Base` from `go-rest-api`).
- **Constructor pattern**: Use `NewServiceName()` functions that return initialized structs.
- **Guard clauses**: Structure HTTP handlers to validate required parameters (namespace, clientID, etc.) and return early on errors.
- **Error responses**: Use `problem.Wrap(statusCode, URI, title, err).Send(w)` from the `go-rest-api` package for RFC 7807 structured error responses. Never use generic `http.Error()`.
- **Configuration**: Parse from environment variables in a dedicated function returning a config struct with sensible defaults applied. Use `strconv` for type conversions.
- **Routing**: Use the `chi` router (`github.com/go-chi/chi/v5`). Extract URL params with `chi.URLParam()`.
- **JSON responses**: Use `api.ReturnJSON()` and `api.ReturnText()` from the base API struct.
- **Resource cleanup**: Use proper context cancellation for long-running operations like informers.
- **Pointer receivers**: Use pointer receivers for struct methods, especially when modifying state or for consistency.

### Kubernetes Client Patterns

- Use `schema.GroupVersionResource` for dynamic client operations.
- Use `unstructured.Unstructured` for handling resources generically.
- Use `dynamicClient` for resource listing/getting, `clientSet` for typed operations like pod logs.
- Use `dynamicinformer` for setting up watchers with `cache.ResourceEventHandlerFuncs`.
- Use `context.TODO()` when context is not yet implemented, but prefer proper context propagation.
- Always handle and log errors with appropriate context.

### SSE (Server-Sent Events)

- The `KubeEventBroker` wraps `sse.Broker[KubeEvent]` from `go-rest-api`.
- Events are typed with a custom `EventTypeEnum` string type: `AddEvent`, `UpdateEvent`, `DeleteEvent`, `PingEvent`.
- Clients are grouped by namespace; events broadcast to the matching namespace group.
- A heartbeat goroutine sends `PingEvent` every 10 seconds via `SendToAll`.
- The message adapter marshals `KubeEvent.Object` to JSON and sets the SSE `event` field to the event type.

### Testing

- Unit tests use `fake.NewSimpleDynamicClientWithCustomListKinds()` and `k8sfake.NewSimpleClientset()` for mocking Kubernetes clients.
- Create helper functions for test setup: `mockKubernetes()`, `createTestNamespace()`, `createTestPod()`, etc.
- Name unit tests `TestKubernetes_MethodName`.
- Name integration tests `Test*_Integration` and run them with `-run Integration`. Integration tests should call `t.Skip()` when no cluster is available.
- Use white-box testing (tests in the same package, not `_test` package).
- Include benchmark tests where performance matters (`BenchmarkMethodName`).
- Run tests with: `make test-unit` (unit only), `make test-integration` (requires cluster), `make test-coverage` (with coverage report).

### Dependencies

- `github.com/benc-uk/go-rest-api` — Base API struct, JSON responses, CORS middleware, RFC 7807 problem responses, SSE broker.
- `github.com/go-chi/chi/v5` — HTTP router.
- `k8s.io/client-go` — Kubernetes client library (dynamic client, typed clientset, informers, discovery).
- `k8s.io/apimachinery` — Kubernetes API types (unstructured, schema, GVR).
- `k8s.io/api` — Kubernetes core API types.

### Linting (golangci-lint)

Configuration is in `.dev/golangci.yaml`. Enabled linters include: `bodyclose`, `cyclop`, `gocyclo`, `gosec`, `misspell` (UK locale), `nilerr`, `nilnil`, `revive`, `staticcheck`, `tagliatelle`, `wsl`. Run with `make lint` or `make lint-fix`.

---

## JavaScript Coding Instructions

### Style & Conventions

- **No semicolons** — enforced by Prettier (`.dev/.prettierrc`).
- **Single quotes** for strings.
- Always use `const` or `let`, never `var` (enforced by ESLint `no-var` and `prefer-const`).
- Use arrow functions for anonymous functions.
- Use template literals for string interpolation, never `+` concatenation.
- Use destructuring for objects and arrays where it improves readability.
- Prefer `for...of` loops over traditional `for` loops for iterating arrays.
- Use `async/await` for asynchronous code, never callbacks or `.then()` chaining.
- Never use `log.error()`, `log.warn()`, or `log.info()` — these do not exist. Use `console.log()` and `console.error()`.
- Prefix unused variables with `_` (e.g., `_err`, `_evt`) — enforced by ESLint.
- Use emoji prefixes in console messages, consistent with the Go backend.
- Use banner comments (`// ====...====`) for file headers describing purpose.
- Max line length is 150 characters (enforced by Prettier).
- Trailing commas are required (enforced by Prettier `"trailingComma": "all"`).

### Module System

- **Native ES modules** — no bundler, no transpiler. All imports use relative paths with `.js` extensions.
- External libraries live in `frontend/ext/` (Alpine.js ESM, G6 ESM, toast library).
- Export functions and constants explicitly; import only what is needed.

### Type Safety with JSDoc

- Every JS file starts with `//@ts-check` and `/// <reference path="./types/custom.d.ts" />`.
- Use JSDoc annotations (`@param`, `@returns`, `@type`) for function signatures and variable types.
- Custom type definitions live in `frontend/js/types/custom.d.ts` — add new types there as needed.
- Key types: `ResNode` (G6 node), `Config` (client config), `Resource` (generic K8s resource), `EventResource` (K8s event), `PanelData` (side panel data).

### Frontend Architecture

- **Alpine.js** manages UI state and reactivity. Main component is `Alpine.data('mainApp', ...)` bound to `<body>`. Sub-components (`sidePanel`, `eventsDialog`) are registered similarly.
- **G6 graph** is the core visualization. A single `Graph` instance is created in `main.js` and shared via exports.
- **Cache module** (`cache.js`) stores resources and events in plain JS objects for fast lookup. Use `store()`, `remove()`, `queryRes()`, `findResByName()`, `getResById()`, `getEvents()`, `clearCache()`.
- **Config module** (`config.js`) persists user settings to `localStorage`. Use `getConfig()` and `saveConfig()`.
- **Loader module** (`loader.js`) dynamically fetches and injects HTML fragments from `public/fragments/` into `<div data-fragment="name">` elements.
- **Events module** (`events.js`) manages the SSE `EventSource` connection and dispatches resource changes to the graph.
- **Custom DOM events** for inter-component communication: `connectionStateChange`, `nodeAdded`, `kubeEventAdded`, `eventsUpdated`, `closePanel`.
- **BroadcastChannel** (`'kubeview'`) for cross-tab communication.

### G6 Graph Patterns

- Nodes are created with `makeNode()` using SVG images from `public/img/res/` with colour suffixes based on resource status (green/red/grey).
- Edges are created with `addEdge()` between resource UIDs.
- Resource relationships are derived in `processLinks()` from: ownerReferences, Ingress→Service, Endpoints→Service→Pod, EndpointSlice→Service→Pod, Pod→PVC, Pod→ConfigMap/Secret (volume mounts & env vars), HPA→target.
- Two layout modes: `dagreLayout` (hierarchical top-to-bottom) and `forceLayout` (force-directed).
- `statusColour()` determines node colour from resource conditions.
- `fitToVisible()` is a workaround for a G6 bug where `fitView` includes hidden nodes.
- `nodeVisByLabel()` filters visible nodes by label text, hiding non-matching nodes and their edges.

### Alpine.js Patterns

- Register components with `Alpine.data('name', handlerFunction)` before calling `Alpine.start()`.
- Use `init()` lifecycle method for setup logic.
- Use `$watch()` for reactive side effects, `$nextTick()` for post-render actions.
- Common directives: `x-data`, `x-model`, `x-model.debounce`, `x-show`, `x-cloak`, `x-text`, `x-html`, `x-for` with `:key`, `x-if` inside `<template>`, `x-transition`, `@click`, `:class`, `:disabled`, `:selected`, `:value`, `:src`.
- Always use `x-cloak` on conditionally shown elements to prevent flash of unstyled content.

### HTML & CSS Patterns

- Use **Bulma** CSS framework classes for all styling. Dark theme enabled via `data-theme="dark"`.
- HTML fragments in `frontend/fragments/` are loaded dynamically — add new dialogs/panels as separate fragment files.
- Common Bulma patterns: `navbar`, `modal`, `panel`, `notification`, `tabs`, `button`, `select`, `input`, with size/colour modifiers (`is-info`, `is-danger`, `is-dark`, `is-outlined`, etc.).

### Linting (ESLint + Prettier)

Configuration is in `.dev/eslint.config.mjs` and `.dev/.prettierrc`. Run with `make lint` or `make lint-fix`. Key rules: `prefer-const`, `no-var`, unused vars with `_` prefix allowed, `no-empty` off, no semicolons, single quotes, trailing commas.

---

## Helm Chart Instructions

- Chart source is in `deploy/helm/kubeview/`.
- Templates use standard helpers defined in `_helpers.tpl`: `kubeview.fullname`, `kubeview.labels`, `kubeview.selectorLabels`.
- RBAC templates dynamically create either `ClusterRole` or `Role` depending on the `singleNamespace` value.
- Configuration is passed to the deployment as environment variables matching the Go `Config` struct fields.
- Default resource limits: 50m CPU, 64Mi memory.
- Key values: `singleNamespace` (false/true/string), `namespaceFilter` (regex), `disablePodLogs`, `debug`.

---

## Dockerfile Instructions

- Multi-stage build: `golang:1.25-alpine` for build, `alpine:3.23` for runtime.
- Cross-compilation uses Docker BuildKit platform variables (`BUILDPLATFORM`, `TARGETOS`, `TARGETARCH`).
- Version and build info are injected via `-ldflags` at build time.
- The final image copies the binary and `public/` directory, exposing port 8000.

---

## General Guidelines

- Before submitting changes, always run `make lint` and `make test`.
- Use `make lint-fix` to auto-format code.
- Keep PRs small and focused. Create an issue before starting major features.
- All contributions are under the MIT license.
- Environment variables for configuration: `PORT` (default 8000), `SINGLE_NAMESPACE`, `NAMESPACE_FILTER` (regex), `DISABLE_POD_LOGS`, `DEBUG`.

## Release Notes

When using a skill to generate release notes, ensure to include the following sections:

Download binary:

```bash
curl -sL https://raw.githubusercontent.com/benc-uk/kubeview/x.y.z/scripts/install.sh | sh
```

Quick run:

```
docker run --rm -it --volume "$HOME/.kube:/root/.kube" \
 -p 8000:8000 ghcr.io/benc-uk/kubeview:x.y.z
```

Helm install:

```bash
helm repo add kubeview https://code.benco.io/kubeview/deploy/helm
helm repo update
helm install kubeview kubeview/kubeview
```
