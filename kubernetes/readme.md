# KubeView - Deployment Manifests

We assume RBAC is enabled in the cluster, so a *ServiceAccount* and custom *ClusterRole* is needed:
```
kubectl apply -f service-account.yaml
```

To deploy:
```
kubectl apply -f deploy.yaml
```

Deployment creates an external *LoadBalancer* IP by default, this can be changed of course to a *ClusterIP* should you wish:
```
kubectl get svc kubeview
```

Get the external IP and access URL with following command, it might take a little while to be assigned:
```
kubectl get svc kubeview -o jsonpath='{"Access KubeView at: http://"}{.status.loadBalancer.ingress[0].ip}{"/ \n"}'
```