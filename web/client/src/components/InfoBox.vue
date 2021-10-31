<template>
  <div class="infobox" @click="$emit('hide-info-box')">
    <b-card :title="metadata.name" :sub-title="nodeData.type">
      <h6 v-if="metadata.creationTimestamp" class="text-muted">
        &bull; Created: {{ utilsDateFromISO8601(metadata.creationTimestamp).toLocaleString() }}
      </h6>
      <div v-if="metadata && metadata.labels">
        <h5>Labels</h5>
        <ul>
          <li v-for="(label, key) of metadata.labels" :key="key">
            <b>{{ key }}:</b>
            {{ label }}
          </li>
        </ul>
      </div>

      <div v-if="annotations">
        <h5>Annotations</h5>
        <ul>
          <li v-for="(label, key) of annotations" :key="key">
            <b>{{ key }}:</b>
            {{ label }}
          </li>
        </ul>
      </div>

      <div v-if="status">
        <h5>Status</h5>
        <ul>
          <li v-for="(label, key) in status" :key="key">
            <b>{{ key }}:</b>
            {{ label }}
          </li>
        </ul>
      </div>

      <div v-if="specContainers">
        <h5>Containers</h5>
        <ul>
          <div v-for="container of specContainers" :key="container.name">
            <li>
              <b>name:</b>
              {{ container.name }}
            </li>
            <li>
              <b>image:</b>
              {{ container.image }}
            </li>
            <li v-for="(port, index) of container.ports" :key="index">
              <b>port:</b>
              {{ port.containerPort }} ({{ port.protocol }})
            </li>
          </div>
        </ul>
      </div>

      <div v-if="specInitContainers">
        <h5>InitContainers</h5>
        <ul>
          <div v-for="container of specInitContainers" :key="container.name">
            <li>
              <b>name:</b>
              {{ container.name }}
            </li>
            <li>
              <b>image:</b>
              {{ container.image }}
            </li>
            <li v-for="(port, index) in container.ports" :key="index">
              <b>port:</b>
              {{ port.containerPort }} ({{ port.protocol }})
            </li>
          </div>
        </ul>
      </div>

      <div v-if="specPorts">
        <h5>Ports</h5>
        <ul>
          <div v-for="(port, index) of specPorts" :key="`ports_${index}`">
            <li>
              <b>{{ port.name || 'port' }}:</b>
              {{ port.port }} &rarr; {{ port.targetPort }} ({{ port.protocol }})
            </li>
          </div>
        </ul>
      </div>

      <div v-if="objectData">
        <h5>Data</h5>
        <ul>
          <div v-for="(data, index) of objectData" :key="`data_${index}`">
            <li>{{ data }}</li>
          </div>
        </ul>
      </div>

      <div v-if="subsets">
        <h5>Endpoints</h5>
        <ul>
          <div v-for="(subset, index) of subsets" :key="`subsets_${index}`">
            <li v-for="address of subset.addresses" :key="address.ip">
              <b>{{ address.ip }}</b>
            </li>
            <li v-for="address of subset.notReadyAddresses" :key="address.ip">
              <b>{{ address.ip }} (Not Ready)</b>
            </li>
          </div>
        </ul>
      </div>

      <b-button variant="info" @click="$emit('show-full-info', nodeData)"> Full Object Details </b-button>
    </b-card>
  </div>
</template>

<script>
import utils from '../mixins/utils.js'

export default {
  mixins: [utils],
  props: {
    nodeData: {
      type: Object,
      required: true,
    },
  },

  computed: {
    metadata() {
      if (!this.utilsCheckNested(this.nodeData, 'sourceObj', 'metadata')) {
        return false
      }

      return this.nodeData.sourceObj.metadata
    },

    status() {
      if (!this.utilsCheckNested(this.nodeData, 'sourceObj', 'status')) {
        return false
      }
      let statusCopy = {}
      Object.assign(statusCopy, this.nodeData.sourceObj.status)

      // Conditions contains a LOT of info, this is probably the most important
      if (statusCopy.conditions) {
        let ready = statusCopy.conditions.find((c) => c.type == 'Ready')
        if (ready) {
          statusCopy.ready = ready.status
        }
        let available = statusCopy.conditions.find((c) => c.type == 'Available')
        if (available) {
          statusCopy.available = available.status
        }
      }

      // Fiddly ingress stuff
      if (this.utilsCheckNested(statusCopy, 'loadBalancer', 'ingress')) {
        statusCopy.loadBalancerIPs = ''
        for (let ingress of statusCopy.loadBalancer.ingress) {
          if (ingress.ip && ingress.ip.length > 0) {
            statusCopy.loadBalancerIPs += ingress.ip.toString() + ' '
          }
        }
      }

      delete statusCopy.loadBalancer
      delete statusCopy.containerStatuses
      delete statusCopy.initContainerStatuses
      delete statusCopy.conditions
      delete statusCopy.qosClass

      if (Object.keys(statusCopy).length <= 0) {
        return false
      }
      return statusCopy
    },

    annotations() {
      if (!this.utilsCheckNested(this.nodeData, 'sourceObj', 'metadata', 'annotations')) {
        return false
      }
      let annoCopy = {}
      Object.assign(annoCopy, this.metadata.annotations)

      delete annoCopy['kubectl.kubernetes.io/last-applied-configuration']

      if (Object.keys(annoCopy).length <= 0) {
        return false
      }
      return annoCopy
    },

    objectData() {
      if (!this.utilsCheckNested(this.nodeData, 'sourceObj', 'data')) {
        return false
      }

      let dataKeys = Object.keys(this.nodeData.sourceObj.data)
      return dataKeys
    },

    specContainers() {
      if (!this.utilsCheckNested(this.nodeData, 'sourceObj', 'spec', 'containers')) {
        return false
      }

      let array = this.nodeData.sourceObj.spec.containers
      return array
    },

    specInitContainers() {
      if (!this.utilsCheckNested(this.nodeData, 'sourceObj', 'spec', 'initContainers')) {
        return false
      }

      let array = this.nodeData.sourceObj.spec.initContainers
      return array
    },

    specPorts() {
      if (!this.utilsCheckNested(this.nodeData, 'sourceObj', 'spec', 'ports')) {
        return false
      }

      let array = this.nodeData.sourceObj.spec.ports
      return array
    },

    subsets() {
      if (!this.utilsCheckNested(this.nodeData, 'sourceObj', 'subsets')) {
        return false
      }

      let array = this.nodeData.sourceObj.subsets
      return array
    },
  },
}
</script>

<style scoped>
.infobox {
  font-size: 90%;
  border: 1px solid rgb(0, 120, 215);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
  position: absolute;
  z-index: 8000;
  bottom: 20px;
  right: 20px;
  padding: 0px !important;
  word-wrap: break-word;
  font-size: 105%;
  max-width: 90%;
  overflow: hidden;
}
li {
  font-size: 90%;
}
b {
  color: #5bc0de;
}
</style>
