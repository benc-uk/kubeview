<template>
  <div id="mainview" ref="mainview">
  </div>
</template>

<script>
import apiMixin from "../mixins/api.js";
import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent';
cytoscape.use( coseBilkent );

// Urgh, gotta have this here, putting into data, causes weirdness
var cy

export default {
  name: 'Viewer',

  mixins: [ apiMixin ],
  
  props: [ 'namespace', 'action' ],

  data() {
    return {
      apiData: null,
    }
  },

  watch: {
    namespace: function () {
      this.refreshData()
    },

    action: function () {
      this.refreshData()
    }
  },

  methods: {
    refreshData() {
      cy.remove("*")
      
      this.apiGetDataForNamespace(this.namespace)
      .then(data => {
        this.apiData = data
        this.refreshNodes()
      })
    },

    addNode(id, label, img) {
      console.log(`### Adding ${img} ${label}`)
      cy.add({ data: { id: id, label: label, img: `img/res/${img}.svg` } })
    },

    addLink(sourceId, targetId, label = "") {
      cy.add({ data: { id: `${sourceId}__${targetId}`, label: label, source: sourceId, target: targetId } })
    },

    refreshNodes() {
      // Add replicasets
      for(let rs of this.apiData.replicasets) {
        let colour = 'green'
        if(rs.status.replicas != rs.status.readyReplicas) colour = 'red'
        this.addNode(rs.metadata.uid, rs.metadata.name, `rs-${colour}`)
      }

      // Add pods
      for(let pod of this.apiData.pods) {
        let colour = 'green'
        if(pod.status.phase == 'Pending') colour = 'grey'
        if(pod.status.phase == 'Failed' || pod.status.phase == 'Unknown' || pod.status.phase == 'CrashLoopBackOff') colour = 'red'
        this.addNode(pod.metadata.uid, pod.metadata.name, `pod-${colour}`) 
        for(let ownerRef of pod.metadata.ownerReferences || []) {
          if(ownerRef.kind != "ReplicaSet") continue
          this.addLink(pod.metadata.uid, ownerRef.uid)
        }  
      }

      // Add endpoints as services
      for(let ep of this.apiData.endpoints) {
        // Skip kubernetes service
        if(ep.metadata.name == 'kubernetes') continue

        let endpointId = `endpoint_${ep.metadata.name}`
        this.addNode(endpointId, ep.metadata.name, `svc`)
        
        for(let subset of ep.subsets || []) {
          for(let address of subset.addresses || []) {
            if(!address.targetRef) continue
            if(address.targetRef.kind != "Pod") continue
            this.addLink(endpointId, address.targetRef.uid)
          }
          for(let address of subset.notReadyAddresses || []) {
            if(!address.targetRef) continue
            if(address.targetRef.kind != "Pod") continue
            this.addLink(endpointId, address.targetRef.uid)
          }          
        }
      }

      // Add ingresses
      for(var ingress of this.apiData.ingresses) {
        this.addNode(ingress.metadata.uid, ingress.metadata.name, `ing`)

        // Find all external IPs of ingresses, and add them
        for(let lb of ingress.status.loadBalancer.ingress || []) {
          this.addNode(lb.ip, lb.ip, `ep`)
          this.addLink(ingress.metadata.uid, lb.ip)
        }

        for(let rule of ingress.spec.rules || []) {
          if(!rule.http.paths) continue
          for(let path of rule.http.paths || []) {
            let serviceName = path.backend.serviceName
            try { 
              this.addLink(ingress.metadata.uid, `endpoint_${serviceName}`) 
            } catch(e) {
              // eslint-disable-next-line
              console.log(`### Unable to link ingress to service from path rule, it might be svc doesn't exist yet`);
            }
          }
        }
      }

      this.relayout()
    },

    relayout() {
      cy.resize();
      cy.layout({name: 'cose-bilkent'}).run();
      cy.fit();
    }
  },

  mounted: function() {
    cy = cytoscape({ 
      container: this.$refs.mainview,
      wheelSensitivity: 0.15,
      maxZoom: 5,
      minZoom: 0.2,
      selectionType: 'single'
    })

    cy.style().selector('node').style({
      'background-opacity': 0,
      'label': 'data(label)',
      'background-fit': 'cover',
      'background-image': 'data(img)',
      'background-width': '90%',
      'background-height': '90%',
      'shape': 'roundrectangle',
      'width': '128',
      'height': '128',
      'border-width': '0',
      'font-size': '20%',
      'color': '#eee',
      'text-valign': 'bottom',
      'text-margin-y': '10vh',
      'text-outline-color': '#111',
      'text-outline-width': '4'
    });

    cy.style().selector('node:selected').style({
      'border-width': '4',
      'border-color': 'rgb(0, 120, 215)'
    });

    cy.style().selector('edge').style({
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'width': 6,
      'line-color': '#777',
      'arrow-scale': '1.5',
      'target-arrow-color': '#777'
    });

    this.refreshData()
  }

}
</script>

<style >
  #mainview {
    width: 100%;
    background-color: #333;
    height: calc(100% - 66px)
  }
</style>
