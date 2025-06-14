// Whoa wait, what is a TypeScript file doing in a JavaScript project?
// This is a workaround to allow TypeScript to understand the types used in the JavaScript code.
// VSCode will use this file to provide type checking & intellisense via JSDoc comments. Neat eh?

declare type ResNode = {
  data: {
    resource: boolean
    id: string
    label: string
    icon: string
    kind: string
    ip: string | null
  }
}

declare type Config = {
  debug: boolean
  shortenNames: boolean
  resFilter: string[]
}

// Represents a generic Kubernetes resource
// See all those `any` down there, yeah, I know, but I'm not mapping every single field of every single k8s resource
declare type Resource = {
  kind: string
  metadata: {
    uid: string
    name: string
    namespace: string
    creationTimestamp: string
    deletionTimestamp: string | null
    labels: Record<string, string>
    annotations: Record<string, string>
    ownerReferences: Array<{
      uid: string
    }>
  }
  spec: any
  status: any
  subsets?: any // Only on Endpoints
  endpoints?: any // Only on EndpointSlices
  data?: any // For Secret and ConfigMap
}

declare type PanelData = {
  id: string
  kind: string
  icon: string
  props: Record<string, string>
  containers: Record<string, any>
  labels: Record<string, string>
  annotations: Record<string, string>
}
