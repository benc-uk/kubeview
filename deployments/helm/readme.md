# KubeView - Helm Chart

Supplied is a Helm chart called `kubeview` to deploy and install KubeView into your cluster.

Use the supplied sample `myvalues-sample.yaml` file (copy it to a new name, e.g. `myvalues.yaml`) to configure how to deploy KubeView. The main choice is if you want to expose the service via an ingress `ingress.enabled: true` or a load-balancer service `ingress.enabled: false`

When using an Ingress additionally configure the DNS hostname and TLS certs if you want to use HTTPS

## Cluster or Namespaced Deployment
Supports deployment in a single namespace, set `limitNamespace: true`. In this mode, KubeView will be limited to displaying only the namespace it is deployed into (via the helm `--namespace` flag), and the namespace picker will not be shown in the UI. The ServiceAccount/Role/Binding will be scoped to this namespace too, rather than cluster wide.  

This is passed to the server via the `NAMESPACE_SCOPE` env variable

# Usage
Deploy with the standard Helm install command:
```
cd deployments/helm
helm install kubeview ./kubeview -f myvalues.yaml
```