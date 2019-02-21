<template>
  <div id="viewwrap">
    <div id="mainview" ref="mainview"></div>
    <transition name="slide-fade">
      <infobox v-if="infoBoxNode && infoBoxNode.metadata" :nodeData="infoBoxNode"></infobox>
    </transition>
  </div>
</template>

<script>
import apiMixin from "../mixins/api.js";
import InfoBox from "./InfoBox";

import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent';
cytoscape.use( coseBilkent );

// Urgh, gotta have this here, putting into data, causes weirdness
var cy

export default {
  name: 'viewer',

  mixins: [ apiMixin ],
  components: { 'infobox': InfoBox },
  props: [ 'namespace', 'action', 'filter' ],

  data() {
    return {
      apiData: null,
      infoBoxNode: null
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
      this.infoBoxNode = false;
      cy.remove("*")
      
      this.apiGetDataForNamespace(this.namespace)
      .then(data => {
        this.apiData = data
        this.refreshNodes()
      })
    },

    addNode(id, label, img, sourceObj) {
      console.log(`### Adding ${img} ${label}`)
      try {
        cy.add({ data: { id: id, label: label, img: `img/res/${img}.svg`, sourceObj: sourceObj } })
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

    addtoParent(id, parentId, label, img, sourceObj) {
      try {
        cy.add({ data: { id: id, label: label, img: `img/res/${img}.svg`, parent: parentId, sourceObj: sourceObj } })
      } catch(e) {
        // eslint-disable-next-line
        console.error(`### Unable to add node: ${img} ${label}`);
      }      
    },

    addGroup(id, label) {
      try {
        cy.add({ classes:['grp'], data: { id: id, label: label} })
      } catch(e) {
        // eslint-disable-next-line
        console.error(`### Unable to add group: ${label}`);
      }      
    },

    refreshNodes() {
      // Add deployments
      for(let deploy of this.apiData.deployments) {
        if(!this.filterShowNode(deploy)) continue

        let colour = 'green'
        let readyReplicas = deploy.status.readyReplicas || 0
        if(deploy.status.replicas != readyReplicas) colour = 'red'
        this.addNode(deploy.metadata.uid, deploy.metadata.name, `deploy-${colour}`, deploy)
      }

      // Add replicasets
      for(let rs of this.apiData.replicasets) {
        if(!this.filterShowNode(rs)) continue

        let colour = 'green'
        if(rs.status.replicas != rs.status.readyReplicas) colour = 'red'

        // Add special "group" node for the RS
        this.addGroup(`rsgroup_${rs.metadata.uid}`, rs.metadata.name)

        // Add RS node and link it to the group
        this.addNode(rs.metadata.uid, rs.metadata.name, `rs-${colour}`, rs)
        this.addLink(rs.metadata.uid, `rsgroup_${rs.metadata.uid}`)

        // Find all owning deployments of this RS
        for(let ownerRef of rs.metadata.ownerReferences || []) {
          if(ownerRef.kind != "Deployment") continue
          // Link rs group up to the deployment
          this.addLink(rs.metadata.uid, ownerRef.uid)
        }
      }

      // Add daemonsets
      for(let ds of this.apiData.daemonsets) {
        if(!this.filterShowNode(ds)) continue

        let colour = 'green'
        if(ds.status.numberReady != ds.status.desiredNumberScheduled) colour = 'red'

        // Add special "group" node for the DS
        this.addGroup(`dsgroup_${ds.metadata.uid}`, ds.metadata.name)

        // Add DS node and link it to the group
        this.addNode(ds.metadata.uid, ds.metadata.name, `ds`, ds)
        this.addLink(ds.metadata.uid, `dsgroup_${ds.metadata.uid}`)
      }

      // Add statefulsets
      for(let sts of this.apiData.statefulsets) {
        if(!this.filterShowNode(sts)) continue

        let colour = 'green'
        if(sts.status.replicas != sts.status.readyReplicas) colour = 'red'

        // Add special "group" node for the DS
        this.addGroup(`stsgroup_${sts.metadata.uid}`, sts.metadata.name)

        // Add DS node and link it to the group
        this.addNode(sts.metadata.uid, sts.metadata.name, `sts`, sts)
        this.addLink(sts.metadata.uid, `stsgroup_${sts.metadata.uid}`)
      }

      // And PVCs
      // for(let pvc of this.apiData.persistentvolumeclaims) {
      //   if(!this.filterShowNode(pvc)) continue

      //   this.addNode(pvc.metadata.uid, pvc.metadata.name, `pvc`, pvc)
      // }

      // Add pods
      for(let pod of this.apiData.pods) {
        if(!this.filterShowNode(pod)) continue

        let colour = 'grey'
        //if(pod.status.phase == 'Pending' || pod.status.phase == 'Unknown') colour = 'grey'
        if(pod.status.phase == 'Failed' || pod.status.phase == 'CrashLoopBackOff') colour = 'red'
        let readyCond = pod.status.conditions.find(c => c.type == 'Ready') || {}
        if(readyCond.status == "True") colour = 'green'
        
        // Add pods to containing group node for the RS they are in 
        let owner = pod.metadata.ownerReferences[0];
        let ownerId = ''
        if(owner.kind == "DaemonSet")
          ownerId= `dsgroup_${owner.uid}`
        else if(owner.kind == "StatefulSet")
          ownerId= `stsgroup_${owner.uid}`
        else
          ownerId= `rsgroup_${owner.uid}`

        this.addtoParent(pod.metadata.uid, ownerId, pod.metadata.name, `pod-${colour}`, pod)

        // for(let vols of pod.volumes || []) {
        //   if(vol.persistentVolumeClaim) {
        //     this.addLink(pod.metadata.uid, )
        //   }
        // }
      }

      // Add endpoints as services, 
      //  - Anyone else confused over the service vs endpoint thing?
      for(let ep of this.apiData.endpoints) {
        if(!this.filterShowNode(ep)) continue

        // Skip kubernetes service
        if(ep.metadata.name == 'kubernetes') continue

        let endpointId = `endpoint_${ep.metadata.name}`
        this.addNode(endpointId, ep.metadata.name, `svc`, ep)
        
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
          this.addNode(lb.ip, lb.ip, `ip`, lb)
          this.addLink(`endpoint_${svc.metadata.name}`, lb.ip)
        }
      }

      // Add ingresses
      for(var ingress of this.apiData.ingresses) {
        if(!this.filterShowNode(ingress)) continue

        this.addNode(ingress.metadata.uid, ingress.metadata.name, `ing`, ingress)

        // Find all external IPs of ingresses, and add them
        for(let lb of ingress.status.loadBalancer.ingress || []) {
          this.addNode(lb.ip, lb.ip, `ip`, lb)
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
      wheelSensitivity: 0.1,
      maxZoom: 5,
      minZoom: 0.2,
      selectionType: 'single'
    })

    cy.style().selector('node[img]').style({
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

    cy.style().selector('.grp').style({
      'background-opacity': 0.25,
      'background-color': '#000000',
      'shape': 'roundrectangle',
      'border-width': '6',
      'border-color': '#777'
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

    cy.on('select', evt => {
      // Only work with nodes
      if(evt.target.isNode()) {
        // Force selection of single nodes only
        if(cy.$('node:selected').length > 1) {
          cy.$('node:selected')[0].unselect();
        }
        
        this.infoBoxNode = evt.target.data('sourceObj')
      }
    })

    cy.on('click tap', evt => {
      // Only sensible way I could find to hide the info box when unselecting
      if(!evt.target.length && this.infoBoxNode) {
        this.infoBoxNode = false;
      }
    })

    this.refreshData()
  }

}
</script>

<style >
  #viewwrap {
    height: calc(100% - 67px)
  }
  #mainview {
    width: 100%;
    background-color: #333;
    height: 100%;
  }

  /* Enter and leave animations can use different */
  /* durations and timing functions.              */
  .slide-fade-enter-active {
    transition: all .3s ease;
  }
  .slide-fade-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-enter, .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */ {
    transform: translateY(20px);
    opacity: 0;
  }  
</style>
