//@ts-check

// ==========================================================================================
// Client-side configuration management for KubeView
// ==========================================================================================

/** @type {Config | null}*/
let config = null

/** @type {Config}*/
const defaultConfig = {
  debug: false,
  shortenNames: true,
  resFilter: [
    'Pod',
    'Deployment',
    'ReplicaSet',
    'StatefulSet',
    'DaemonSet',
    'Job',
    'CronJob',
    'Service',
    'Ingress',
    'ConfigMap',
    'Secret',
    'PersistentVolumeClaim',
  ],
}

/**
 * Gets the configuration object from local storage.
 * @returns {Config} The configuration object.
 */
export function getConfig() {
  if (config !== null) return config

  // Set the default client ID to a random value
  if (!localStorage.getItem('kubeviewConfig')) {
    localStorage.setItem('kubeviewConfig', JSON.stringify(defaultConfig))

    config = defaultConfig
    return config
  }

  // Get the config from local storage
  const cfg = JSON.parse(localStorage.getItem('kubeviewConfig') || 'null')
  config = cfg
  return config || defaultConfig
}

export function saveConfig(newConfig) {
  // Set the config in local storage
  localStorage.setItem('kubeviewConfig', JSON.stringify(newConfig))
  config = newConfig
}
