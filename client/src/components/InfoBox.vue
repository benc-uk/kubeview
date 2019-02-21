<template>
  <div class="infobox">
    <b-card :title="title" :sub-title="subTitle">

      <div v-if="nodeData.metadata && nodeData.metadata.labels">
        <h5>Labels</h5>
        <ul>
          <li v-for="(label, key) of nodeData.metadata.labels" :key="key"><b>{{key}}:</b> {{label}}</li>
        </ul>
      </div>

      <div v-if="statusDisplay">
        <h5>Status</h5>
        <ul>
          <li v-for="(label, key) in statusDisplay" :key="key"><b>{{key}}:</b> {{label}}</li>
        </ul>
      </div>

      <div v-if="nodeData.spec && nodeData.spec.containers">
        <h5>Containers</h5>
        <ul>
          <div v-for="container of nodeData.spec.containers" :key="container.name">
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
    statusDisplay() {
      let temp = this.nodeData.status || false
      delete temp.containerStatuses
      delete temp.conditions
      delete temp.qosClass
      return temp
    },

    title() {
      if(!this.nodeData.metadata) return ""
      return (this.nodeData.metadata.name || "")
    },
    subTitle() {
      if(!this.nodeData.metadata) return ""
      return (this.nodeData.metadata.selfLink || "")
    }    
  }
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
