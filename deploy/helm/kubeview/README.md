# kubeview

![Version: 2.0.5](https://img.shields.io/badge/Version-2.0.5-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.1.1](https://img.shields.io/badge/AppVersion-2.1.1-informational?style=flat-square)

Kubernetes cluster visualiser and visual explorer

**Homepage:** <https://github.com/benc-uk/kubeview>

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| Ben Coleman | <benc.uk@gmail.com> | <https://github.com/benc-uk/> |

## Source Code

* <https://github.com/benc-uk/kubeview>

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| singleNamespace | bool | `false` | Configure single namespace mode: `false` - Show resources in all namespaces. This is the default. `true` - Show resources only in namespace Kubeview is installed to. "string" - Only show resources in the named namespace (can be *different* from the one Kubeview is installed to). |
| namespaceFilter | string | `""` | If you want to hide certain namespaces, use a regular expression here, e.g. `kube-\|aks-` |
| disablePodLogs | bool | `false` | Set to true to disable access to pod logs from the API and UI. |
| debug | bool | `false` | Set to true to enable debug mode, which outputs much more information in the logs |
| ingress.enabled | bool | `false` | Expose the app via an Ingress |
| ingress.host | string | `""` | The domain name to use for the Ingress, required if enabled |
| ingress.tlsSecretName | string | `""` | To enable HTTPS, set this to reference a TLS secret (with a valid cert) |
| ingress.className | string | `""` | The Ingress class to use, if you have multiple ingress controllers |
| ingress.annotations | object | `{}` | Extra Ingress annotations |
| loadBalancer.enabled | bool | `true` | Set to true to enable the LoadBalancer service type |
| loadBalancer.IP | string | `""` | Optionally set the LoadBalancer IP address if you want to use a static IP |
| nodePort.enabled | bool | `false` | Set to true to enable NodePort service type |
| nodePort.port | int | `30000` | Optionally set the NodePort number, if you want to use a specific one |
| imagePullSecrets | list | `[]` | This is for the secrets for pulling an image from a private repository |
| nameOverride | string | `""` | This is to override the chart name when naming resources |
| fullnameOverride | string | `""` | This is to fully override the name of the chart & release when naming resources |
| image.repository | string | `"ghcr.io/benc-uk/kubeview"` | Only change this if you've built & pushed your own image to a registry |
| image.pullPolicy | string | `"Always"` | This sets the pull policy for images |
| image.tag | string | `"latest"` | Specify the image tag to use. If you want to use a specific version, set it here. |
| podAnnotations | object | `{}` | For adding custom annotations to the pods |
| podLabels | object | `{}` | For adding custom labels to the pods |
| serviceAnnotations | object | `{}` | For adding custom annotations to the service |
| podSecurityContext | object | `{}` | Sets pod security context if you need that sort of thing |
| securityContext | object | `{}` | Sets container security context if you need to run as a specific user or group |
| replicaCount | int | `1` | Run multiple instances of the Kubeview pod |
| resources | object | `{"limits":{"cpu":"50m","memory":"64Mi"},"requests":{"cpu":"50m","memory":"64Mi"}}` | This is for changing the resource limits and requests for the Kubeview pods |
| nodeSelector | object | `{}` | If you want to schedule the pods to specific nodes, you can set node selectors here |
| tolerations | list | `[]` | If you want to set specific tolerations for the pods, you can set them here |
| affinity | object | `{}` | If you want to set specific affinity rules for the pods, you can set them here |

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
