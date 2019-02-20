# KubeView - Deployment Manifests

We assume RBAC is enabled in the cluster

To deploy
```
kubectl apply -f service-account.yaml
kubectl apply -f deploy
```

Deployment creates an external LoadBalancer IP by default, this can be changed.
```
kubectl get svc kubeview
```