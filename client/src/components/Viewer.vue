<template>
  <div id="viewwrap">
    <div id="mainview" ref="mainview"></div>

    <loading v-if="!apiData" ><h1>Loading...</h1></loading>

    <transition name="slide-fade">
      <infobox v-if="infoBoxData" :nodeData="infoBoxData" @hideInfoBox="infoBoxData = null" @fullInfo="showFullInfo"></infobox>
    </transition>

    <b-modal centered :title="fullInfoTitle" ref="fullInfoModal" ok-only scrollable size="lg" body-class="fullInfoBody">
      <pre>{{ fullInfoYaml }}</pre>
    </b-modal>

  </div>
</template>

<script>
import apiMixin from "../mixins/api.js";
import InfoBox from "./InfoBox";
import Loading from "./Loading";

import yaml from 'js-yaml';

import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent';
cytoscape.use( coseBilkent );

// const jquery = require('jquery');
// const gridGuide = require('cytoscape-grid-guide');
// gridGuide( cytoscape, jquery );
import snapToGrid from 'cytoscape-snap-to-grid';
snapToGrid( cytoscape ); // register extension

// Urgh, gotta have this here, putting into data, causes weirdness
var cy

export default {
  name: 'viewer',

  mixins: [ apiMixin ],

  components: { 
    'infobox': InfoBox,
    'loading': Loading 
  },

  props: [ 'namespace', 'action', 'filter' ],

  data() {
    return {
      apiData: null,
      infoBoxData: null,
      fullInfoYaml: null,
      fullInfoTitle: ""
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
    showFullInfo() {
      this.fullInfoYaml = yaml.safeDump(this.infoBoxData.sourceObj)
      this.fullInfoTitle = `${this.infoBoxData.type}: ${this.infoBoxData.sourceObj.metadata.name}`
      this.$refs.fullInfoModal.show()
    },

    refreshData() {
      this.apiData = null
      this.infoBoxData = false
      cy.remove("*")
      
      this.apiGetDataForNamespace(this.namespace)
      .then(data => {
        this.apiData = data
        this.refreshNodes()
      })
    },

    addNode(node, type, status, groupId = null) {
      try {
        let img = 'default'
        
        if(type == "Deployment")            img = 'deploy'
        if(type == "ReplicaSet")            img = 'rs'
        if(type == "StatefulSet")           img = 'sts'
        if(type == "DaemonSet")             img = 'ds'
        if(type == "Pod")                   img = 'pod'
        if(type == "Service")               img = 'svc'
        if(type == "IP")                    img = 'ip'
        if(type == "Ingress")               img = 'ing'
        if(type == "PersistentVolumeClaim") img = 'pvc'

        if(status) img += `-${status}`

        console.log(`### Adding: ${node.metadata.name || node.metadata.selfLink}`);
        cy.add({ data: { id: `${type}_${node.metadata.name}`, label: node.metadata.name, img: `img/res/${img}.svg`, sourceObj: node, type: type, parent: groupId } })
      } catch(e) {
        // eslint-disable-next-line
        console.error(`### Unable to add node: ${node.metadata.name || node.metadata.selfLink}`);
      }
    },

    addLink(sourceId, targetId) {
      try {
        cy.add({ data: { id: `${sourceId}___${targetId}`, source: sourceId, target: targetId } })
      } catch(e) {
        // eslint-disable-next-line
        console.error(`### Unable to add link: ${sourceId} to ${targetId}`);
      }      
    },

    addGroup(type, name) {
      try {
        cy.add({ classes:['grp'], data: { id: `grp_${type}_${name}`, label: name} })
      } catch(e) {
        // eslint-disable-next-line
        console.error(`### Unable to add group: ${name}`);
      }      
    },

    refreshNodes() {
      // Add deployments
      for(let deploy of this.apiData.deployments) {
        if(!this.filterShowNode(deploy)) continue

        let status = 'green'
        let readyReplicas = deploy.status.readyReplicas || 0
        if(deploy.status.replicas != readyReplicas) status = 'red'
        this.addNode(deploy, 'Deployment', status)
      }

      // Add replicasets
      for(let rs of this.apiData.replicasets) {
        if(!this.filterShowNode(rs)) continue
        let rsId = `ReplicaSet_${rs.metadata.name}`

        let status = 'green'
        if(rs.status.replicas != rs.status.readyReplicas) status = 'red'

        // Add special "group" node for the RS
        this.addGroup('ReplicaSet', rs.metadata.name)

        // Add RS node and link it to the group
        this.addNode(rs, 'ReplicaSet', status)
        this.addLink(rsId, `grp_ReplicaSet_${rs.metadata.name}`)

        // Find all owning deployments of this RS
        for(let ownerRef of rs.metadata.ownerReferences || []) {
          // Link rs up to the deployment
          this.addLink(`${ownerRef.kind}_${ownerRef.name}`, rsId)
        }
      }

      // Add statefulsets
      for(let sts of this.apiData.statefulsets) {
        if(!this.filterShowNode(sts)) continue
        let stsId = `StatefulSet_${sts.metadata.name}`

        let status = 'green'
        if(sts.status.replicas != sts.status.readyReplicas) status = 'red'

        // Add special "group" node for the statefulset
        this.addGroup('StatefulSet', sts.metadata.name)

        // Add statefulset node and link it to the group
        this.addNode(sts, 'StatefulSet', status)
        this.addLink(stsId, `grp_StatefulSet_${sts.metadata.name}`)

        // Find all owning deployments of this statefulset
        for(let ownerRef of sts.metadata.ownerReferences || []) {
          // Link rs up to the deployment
          this.addLink(`${ownerRef.kind}_${ownerRef.name}`, stsId)
        }
      }

      // Add daemonsets
      for(let ds of this.apiData.daemonsets) {
        if(!this.filterShowNode(ds)) continue
        let dsId = `DaemonSet_${ds.metadata.name}`

        let status = 'green'
        if(ds.status.numberReady != ds.status.desiredNumberScheduled) status = 'red'

        // Add special "group" node for the statefulset
        this.addGroup('DaemonSet', ds.metadata.name)

        // Add statefulset node and link it to the group
        this.addNode(ds, 'DaemonSet', status)
        this.addLink(dsId, `grp_DaemonSet_${ds.metadata.name}`)

        // Find all owning deployments of this statefulset
        for(let ownerRef of ds.metadata.ownerReferences || []) {
          // Link rs up to the deployment
          this.addLink(`${ownerRef.kind}_${ownerRef.name}`, dsId)
        }
      }

      // And PVCs
      for(let pvc of this.apiData.persistentvolumeclaims) {
        if(!this.filterShowNode(pvc)) continue

        let status = 'grey'
        if(pvc.status.phase == 'Bound') status = 'green'
        this.addNode(pvc, 'PersistentVolumeClaim', status)
      }

      // Add pods
      for(let pod of this.apiData.pods) {
        if(!this.filterShowNode(pod)) continue

        let status = 'grey'
        if(pod.status.phase == 'Failed' || pod.status.phase == 'CrashLoopBackOff') status = 'red'
        let readyCond = pod.status.conditions.find(c => c.type == 'Ready') || {}
        if(readyCond.status == "True") status = 'green'
        
        // Add pods to containing group (ReplicaSet, DaemonSet, StatefulSet) that 'owns' them
        let owner = pod.metadata.ownerReferences[0];
        let groupId = `grp_${owner.kind}_${owner.name}`
        this.addNode(pod, 'Pod', status, groupId)

        for(let vol of pod.spec.volumes || []) {
          if(vol.persistentVolumeClaim) {
            this.addLink(`PersistentVolumeClaim_${vol.persistentVolumeClaim.claimName}`, `Pod_${pod.metadata.name}`)
          }
        }
      }

      // Find all services, we pull in info from the endpoint with matching name
      // Basicaly merge the service and endpoint objects together
      for(let svc of this.apiData.services) {
        if(!this.filterShowNode(svc)) continue
        let serviceId = `Service_${svc.metadata.name}`

        if(svc.metadata.name == 'kubernetes') continue

        // Find matching endpoint, and merge subsets into service 
        let ep = this.apiData.endpoints.find(ep => ep.metadata.name == svc.metadata.name)
        if(ep) {
          svc.subsets = ep.subsets
        }

        this.addNode(svc, 'Service')

        for(let subset of svc.subsets || []) {
          let addresses = (subset.addresses || []).concat(subset.notReadyAddresses || [])
          for(let address of addresses || []) {
            if(!address.targetRef) continue
            if(address.targetRef.kind != "Pod") continue
            this.addLink(serviceId, `Pod_${address.targetRef.name}`)
          }        
        }
        
        // Find all external IPs of service, and add them
        for(let lb of svc.status.loadBalancer.ingress || []) {
          // Fake Kubernetes object to display the IP
          let ipObj = { metadata: { name: lb.ip} }
          this.addNode(ipObj, 'IP')
          this.addLink(`IP_${ipObj.metadata.name}`, `Service_${svc.metadata.name}`)
        }
      }

      // Add ingresses and link to services 
      for(var ingress of this.apiData.ingresses) {
        if(!this.filterShowNode(ingress)) continue

        this.addNode(ingress, 'Ingress')

        // Find all external IPs of ingresses, and add them
        for(let lb of ingress.status.loadBalancer.ingress || []) {
          // Fake Kubernetes object to display the IP
          let ipObj = { metadata: { name: lb.ip} }
          this.addNode(ipObj, 'IP')
          this.addLink(`IP_${ipObj.metadata.name}`, `Ingress_${ingress.metadata.name}`)          
        }

        for(let rule of ingress.spec.rules || []) {
          if(!rule.http.paths) continue
          for(let path of rule.http.paths || []) {
            let serviceName = path.backend.serviceName
            //this.addLink(ingress.metadata.uid, `endpoint_${serviceName}`) 
            this.addLink(`Service_${serviceName}`, `Ingress_${ingress.metadata.name}`) 
          }
        }
      }      

      this.relayout()
    },

    relayout() {
      cy.resize();
      cy.layout({name: 'cose-bilkent', nodeRepulsion: 5000, nodeDimensionsIncludeLabels:true}).run();
      //cy.fit();
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

    cy.snapToGrid({gridSpacing: 64})

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
        
        if(evt.target.hasClass('grp'))
          return false
        
        this.infoBoxData = evt.target.data()
      }
    })

    cy.on('click tap', evt => {
      // Only sensible way I could find to hide the info box when unselecting
      if(!evt.target.length && this.infoBoxData) {
        this.infoBoxData = false;
      }
    })

    // let gridOptions = {
    //   gridSpacing: 64,
    //   snapToGridOnRelease: true,
    //   snapToGridDuringDrag: true,
    //   //distributionGuidelines: true
    // }
    // cy.gridGuide(gridOptions)

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
    box-shadow: inset 0 0 20px #000000;
  }

  .fullInfoBody {
    color: #28c8e4;
    background-color: #111;
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
