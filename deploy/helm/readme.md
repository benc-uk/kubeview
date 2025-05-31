# 🪖 Helm Chart For Kubeview

A Helm chart is provided for easily deploying Kubeview.

[📃 Chart Readme](./kubeview/README.md)

To install the Kubeview Helm chart, you can use the chart repository hosted from GitHub pages, which means no need to clone this repo. Follow the steps below to add the repository:

```
helm repo add kv2 https://code.benco.io/kubeview/deploy/helm
helm repo update
```

> You can use any repo name you like instead of `kv2`, but this is the recommended name for consistency.

Then you can install the chart using the following command:

```
helm install kubeview kv2/kubeview
```

It's _extremely_ unlikely that you will want to use the default values, so you should create a `values.yaml` file with your custom configuration. You can read the [chart readme](./kubeview/README.md) for more information on the available configuration options, or run `helm show values kv2/kubeview` to see the default values.

After creating your `values.yaml` file, you can install the chart with your custom values:

```
helm install kubeview kv2/kubeview -f values.yaml
```
