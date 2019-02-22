<template>
  <div class="infobox">
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

      <div v-if="containers">
        <h5>Containers</h5>
        <ul>
          <div v-for="container of containers" :key="container.name">
            <li><b>name:</b> {{container.name}}</li>
            <li><b>image:</b> {{container.image}}</li>
            <li v-for="port of container.ports" :key="port.containerPort"><b>port:</b> {{port.containerPort}}</li>
          </div>
        </ul>
      </div>         
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
      delete statusTemp.conditions
      delete statusTemp.qosClass
      return statusTemp
    },

    containers() {
      if(!checkNested(this.nodeData, 'sourceObj', 'spec', 'containers')) return false

      let containers = this.nodeData.sourceObj.spec.containers
      return containers
    },
    
    // title() {
    //   if(!this.metaData) return ""
    //   return (this.metaData.name || "")
    // },
    
    // subTitle() {
    //   if(!this.nodeData.metadata) return ""
    //   return (this.nodeData.metadata.selfLink || "")
    // }    
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
  border: 1px solid rgb(0,120,215);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.6); /*6px 6px 5px rgba(0,0,0,0.3);*/
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
  color:rgb(132, 190, 238)
}
</style>
