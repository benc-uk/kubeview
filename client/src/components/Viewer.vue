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
  
  props: [ 'namespace', 'action', 'filter' ],

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
      try {
        cy.add({ data: { id: id, label: label, img: `img/res/${img}.svg` } })
      } catch(e) {
        // eslint-disable-next-line
        console.error(`### Unable to add node: ${img} ${label}`);
      }
    },

    addLink(sourceId, targetId, label = "") {
      try {
        cy.add({ data: { id: `${sourceId}__${targetId}`, label: label, source: sourceId, target: targetId } })
      } catch(e) {
        // eslint-disable-next-line
        console.error(`### Unable to add link: ${sourceId} to ${targetId}`);
      }      
    },

    refreshNodes() {
      // Add deployments
      for(let deploy of this.apiData.deployments) {
        if(!this.filterShowNode(deploy)) continue

        let colour = 'green'
        let readyReplicas = deploy.status.readyReplicas || 0
        if(deploy.status.replicas != readyReplicas) colour = 'red'
        this.addNode(deploy.metadata.uid, deploy.metadata.name, `deploy-${colour}`)
      }

      // Add replicasets
      for(let rs of this.apiData.replicasets) {
        if(!this.filterShowNode(rs)) continue

        let colour = 'green'
        let readyReplicas = rs.status.readyReplicas || 0
        if(rs.status.replicas != readyReplicas) colour = 'red'
        this.addNode(rs.metadata.uid, rs.metadata.name, `rs-${colour}`)
        for(let ownerRef of rs.metadata.ownerReferences || []) {
          if(ownerRef.kind != "Deployment") continue
          this.addLink(rs.metadata.uid, ownerRef.uid)
        }          
      }

      // Add pods
      for(let pod of this.apiData.pods) {
        if(!this.filterShowNode(pod)) continue

        let colour = 'green'
        if(pod.status.phase == 'Pending' || pod.status.phase == 'Unknown') colour = 'grey'
        if(pod.status.phase == 'Failed' || pod.status.phase == 'CrashLoopBackOff') colour = 'red'
        let readyCond = pod.status.conditions.find(c => c.type == 'Ready') || {}
        if(readyCond.status != "True") colour = 'red'
        
        this.addNode(pod.metadata.uid, pod.metadata.name, `pod-${colour}`) 
        for(let ownerRef of pod.metadata.ownerReferences || []) {
          if(ownerRef.kind != "ReplicaSet") continue
          this.addLink(pod.metadata.uid, ownerRef.uid)
        }  
      }

      // Add endpoints as services, anyone else confused over the service vs endpoint thing?
      for(let ep of this.apiData.endpoints) {
        if(!this.filterShowNode(ep)) continue

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

      // We only loop over services to find ones with external lb address
      for(let svc of this.apiData.services) {
        if(!this.filterShowNode(svc)) continue

        // Find all external IPs of ingresses, and add them
        for(let lb of svc.status.loadBalancer.ingress || []) {
          this.addNode(lb.ip, lb.ip, `ip`)
          this.addLink(`endpoint_${svc.metadata.name}`, lb.ip)
        }
      }

      // Add ingresses
      for(var ingress of this.apiData.ingresses) {
        if(!this.filterShowNode(ingress)) continue

        this.addNode(ingress.metadata.uid, ingress.metadata.name, `ing`)

        // Find all external IPs of ingresses, and add them
        for(let lb of ingress.status.loadBalancer.ingress || []) {
          this.addNode(lb.ip, lb.ip, `ip`)
          this.addLink(ingress.metadata.uid, lb.ip)
        }

        for(let rule of ingress.spec.rules || []) {
          if(!rule.http.paths) continue
          for(let path of rule.http.paths || []) {
            let serviceName = path.backend.serviceName
            this.addLink(ingress.metadata.uid, `endpoint_${serviceName}`) 
          }
        }
      }

      this.relayout()
    },

    relayout() {
      cy.resize();
      cy.layout({name: 'cose-bilkent'}).run();
      cy.fit();
    },

    filterShowNode(node) {
      if(!this.filter || this.filter.length <= 0) return true

      let match = false
      if(node.metadata.name.includes(this.filter)) match = true
      for(let labelName in node.metadata.labels) {
        if(labelName.includes(this.filter)) match = true
        if(node.metadata.labels[labelName].includes(this.filter)) match = true
      }
      return match
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
