<template>
  <!-- <div class="kubecost" @click="$emit('hideInfoBox')"> -->
    <div class="cloudwise">
    <b-card :title="metadata.name" :sub-title="nodeData.type">
      <h6 class="text-muted" v-if="metadata.creationTimestamp">&bull; Created: {{ utilsDateFromISO8601(metadata.creationTimestamp).toLocaleString() }}</h6>
      
      <div>
        <h5>Namespace Ratings</h5>
        <ul>
          <!-- <li v-for="(label, key) in status" :key="key"><b>{{key}}:</b> {{label}}</li> -->
          <li><b>Cost </b> $ 4.12/month</li>
          <li><b>Efficiency </b> 36%</li>
          <li><b>Health </b> 66%</li>
          <li><b>Security </b> 78 of 193 checks</li>

          </ul>
        <img src="https://chart.googleapis.com/chart?cht=p&chd=t:98,2&chs=230x100&chl=OK|FAIL&chco=00FF00,FF0000"/>
      </div>
      <!-- <b-button variant="primary" href="https://cloudwise.clvr.cloud" target="_blank">See CloudWise for more info</b-button> -->
      <b-button variant="primary" href="https://cloudwise.clvr.cloud" target="_blank">See CloudWise for more info</b-button>
    </b-card>
  </div>
</template>

<script>
import utils from "../mixins/utils.js"

export default {
  props: [ 'nodeData' ],

  mixins: [ utils ],

  computed: {
    metadata() {
      if(!this.utilsCheckNested(this.nodeData, 'sourceObj', 'metadata')) return false

      return this.nodeData.sourceObj.metadata
    },

    status() {
      if(!this.utilsCheckNested(this.nodeData, 'sourceObj', 'status')) return false
      let statusCopy = {}
      Object.assign(statusCopy, this.nodeData.sourceObj.status);

      // Conditions contains a LOT of info, this is probably the most important
      if(statusCopy.conditions) {
        let ready = statusCopy.conditions.find(c => c.type == 'Ready') 
        if(ready) statusCopy.ready = ready.status
        let available = statusCopy.conditions.find(c => c.type == 'Available') 
        if(available) statusCopy.available = available.status
      }

      
      if(Object.keys(statusCopy).length <= 0) return false
      return statusCopy
    },

    annotations() {
      if(!this.utilsCheckNested(this.nodeData, 'sourceObj', 'metadata', 'annotations')) return false
      let annoCopy = {}
      Object.assign(annoCopy, this.metadata.annotations);

      delete annoCopy['kubectl.kubernetes.io/last-applied-configuration']

      if(Object.keys(annoCopy).length <= 0) return false
      return annoCopy
    },

    specContainers() {
      if(!this.utilsCheckNested(this.nodeData, 'sourceObj', 'spec', 'containers')) return false

      let array = this.nodeData.sourceObj.spec.containers
      return array
    },

    specInitContainers() {
      if(!this.utilsCheckNested(this.nodeData, 'sourceObj', 'spec', 'initContainers')) return false

      let array = this.nodeData.sourceObj.spec.initContainers
      return array
    },  

    specPorts() {
      if(!this.utilsCheckNested(this.nodeData, 'sourceObj', 'spec', 'ports')) return false

      let array = this.nodeData.sourceObj.spec.ports
      return array
    },    

    subsets() {
      if(!this.utilsCheckNested(this.nodeData, 'sourceObj', 'subsets')) return false

      let array = this.nodeData.sourceObj.subsets
      return array
    }  
  }
}


</script>

<style scoped>
  .cloudwise {
    font-size: 90%;
    border: 1px solid rgb(0, 120, 215);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
    position: absolute;
    z-index: 8000;
    bottom: 20px;
    left: 20px;
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
    color: #5bc0de /* rgb(132, 190, 238) */
  }
</style>
