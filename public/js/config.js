//@ts-check
/// <reference path="./types/custom.d.ts" />

// ==========================================================================================
// Client-side configuration management for KubeView using local storage
// ==========================================================================================

/** @type {Config | null}*/
let config = null

/** @type {Config}*/
const defaultConfig = {
  debug: false,
  shortenNames: true,
  spacing: 100,
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
    // 'ConfigMap',
    // 'Secret',
    // 'PersistentVolumeClaim',
    // 'HorizontalPodAutoscaler',
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

export async function saveConfig(newConfig) {
  // Weird bug where spacing is a string instead of a number
  newConfig.spacing = parseInt(newConfig.spacing) || 100

  // Set the config in local storage
  localStorage.setItem('kubeviewConfig', JSON.stringify(newConfig))
  config = newConfig
}
