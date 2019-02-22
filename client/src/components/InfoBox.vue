<template>
  <div class="infobox" @click="$emit('hideInfoBox')">
    <b-card :title="metadata.name" :sub-title="nodeData.type">

      <div v-if="metadata && metadata.labels">
        <h5>Labels</h5>
        <ul>
          <li v-for="(label, key) of metadata.labels" :key="key"><b>{{key}}:</b> {{label}}</li>
        </ul>
      </div>

      <div v-if="status">
        <h5>Status</h5>
        <ul>
          <li v-for="(label, key) in status" :key="key"><b>{{key}}:</b> {{label}}</li>
        </ul>
      </div>

      <div v-if="specContainers">
        <h5>Containers</h5>
        <ul>
          <div v-for="container of specContainers" :key="container.name">
            <li><b>name:</b> {{container.name}}</li>
            <li><b>image:</b> {{container.image}}</li>
            <li v-for="(port, index) of container.ports" :key="index"><b>port:</b> {{port.containerPort}} ({{port.protocol}})</li>
          </div>
        </ul>
      </div>    

      <div v-if="specInitContainers">
        <h5>InitContainers</h5>
        <ul>
          <div v-for="container of specInitContainers" :key="container.name">
            <li><b>name:</b> {{container.name}}</li>
            <li><b>image:</b> {{container.image}}</li>
            <li v-for="(port, index) in container.ports" :key="index"><b>port:</b> {{port.containerPort}} ({{port.protocol}})</li>
          </div>
        </ul>
      </div>     

      <div v-if="specPorts">
        <h5>Ports</h5>
        <ul>
          <div v-for="(port, index) of specPorts" :key="`ports_${index}`">
            <li><b>{{port.name || "port"}}:</b> {{port.port}} &rarr; {{port.targetPort}} ({{port.protocol}})</li>
          </div>
        </ul>
      </div>     

      <div v-if="subsets">
        <h5>Endpoints</h5>
        <ul>
          <div v-for="(subset, index) of subsets" :key="`subsets_${index}`">
            <li v-for="address of subset.addresses" :key="address.ip"><b>{{address.ip}}</b></li>
          </div>
        </ul>
      </div>   

      <b-button @click="$emit('fullInfo', nodeData)" variant="info">Full Object Details</b-button>

    </b-card>
    
  </div>
</template>

<script>
export default {
  name: 'infobox',

  props: [ 'nodeData' ],


  computed: {
    metadata() {
      if(!checkNested(this.nodeData, 'sourceObj', 'metadata')) return false

      return this.nodeData.sourceObj.metadata
    },

    status() {
      if(!checkNested(this.nodeData, 'sourceObj', 'status')) return false
      let statusTemp = this.nodeData.sourceObj.status

      if(statusTemp.conditions) {
        let ready = statusTemp.conditions.find(c => c.type == 'Ready') 
        if(ready) statusTemp.ready = ready.status
        let available = statusTemp.conditions.find(c => c.type == 'Available') 
        if(available) statusTemp.available = available.status
      }
      delete statusTemp.containerStatuses
      delete statusTemp.initContainerStatuses
      delete statusTemp.conditions
      delete statusTemp.qosClass
      return statusTemp
    },

    specContainers() {
      if(!checkNested(this.nodeData, 'sourceObj', 'spec', 'containers')) return false

      let array = this.nodeData.sourceObj.spec.containers
      return array
    },

    specInitContainers() {
      if(!checkNested(this.nodeData, 'sourceObj', 'spec', 'initContainers')) return false

      let array = this.nodeData.sourceObj.spec.initContainers
      return array
    },  

    specPorts() {
      if(!checkNested(this.nodeData, 'sourceObj', 'spec', 'ports')) return false

      let array = this.nodeData.sourceObj.spec.ports
      return array
    },    

    subsets() {
      if(!checkNested(this.nodeData, 'sourceObj', 'subsets')) return false

      let array = this.nodeData.sourceObj.subsets
      return array
    }  
  }
}

function checkNested(obj /*, level1, level2, ... levelN*/) {
  var args = Array.prototype.slice.call(arguments, 1);

  for (var i = 0; i < args.length; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      return false;
    }
    obj = obj[args[i]];
  }
  
  return true;
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
    color: #5bc0de /* rgb(132, 190, 238) */
  }
</style>
