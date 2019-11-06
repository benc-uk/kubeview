# KubeView - Helm Chart

Supplied is a Helm chart called `kubeview` to deploy and install KubeView into your cluster.

Use the supplied sample `myvalues-sample.yaml` file (copy it to a new name, e.g. `myvalues.yaml`) to configure how to deploy KubeView. The main choice is if you want to expose the service via an ingress `ingress.enabled: true` or a load-balancer service `ingress.enabled: false`

When using an Ingress additionaly configure the DNS hostname and TLS certs if you want to use HTTPS

Install with the standatd Helm command:
```
cd deployments/helm
helm install ./kubeview --name kubeview -f myvalues.yaml
```