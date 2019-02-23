<template>
  <div id="viewwrap">
    <div id="mainview" ref="mainview"></div>

    <loading v-if="!apiData"></loading>

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
import VueTimers from 'vue-timers/mixin'
import cytoscape from 'cytoscape'

import coseBilkent from 'cytoscape-cose-bilkent';
cytoscape.use( coseBilkent );
import snapToGrid from 'cytoscape-snap-to-grid';
snapToGrid( cytoscape ); // register extension

// Urgh, gotta have this here, putting into data, causes weirdness
var cy

function hashStr(s) {
  var hash = 0, i, chr;
  if (s.length === 0) return hash;
  for (i = 0; i < s.length; i++) {
    chr   = s.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export default {
  name: 'viewer',

  mixins: [ apiMixin, VueTimers ],

  components: { 
    'infobox': InfoBox,
    'loading': Loading 
  },

  props: [ 'namespace', 'filter' ],

  data() {
    return {
      apiData: null,
      infoBoxData: null,
      fullInfoYaml: null,
      fullInfoTitle: "",
      apiDataHash: null,
      //timer: 0,
      refreshInterval: 10 * 1000
    }
  },

  timers: {
    refreshDataSoft: { time: 8000, autostart: true, repeat: true }
  },

  watch: {
    namespace() { this.refreshData(false) }, 
    //filter() { this.refreshData(true) }    
  },

  methods: {
    showFullInfo() {
      this.fullInfoYaml = yaml.safeDump(this.infoBoxData.sourceObj)
      this.fullInfoTitle = `${this.infoBoxData.type}: ${this.infoBoxData.sourceObj.metadata.name}`
      this.$refs.fullInfoModal.show()
    },

    refreshDataSoft() {
      this.refreshData(true)
    },

    refreshData(soft = false) {
      console.log(`### Refresing data...`);
      
      // Soft refresh is called by interval timer
      // Will not redraw/refresh nodes if no changes

      this.apiGetDataForNamespace(this.namespace)
      .then(newData => {
        // Try to detect topology changes
        let hash = this.calcHash(newData)
        let changed = false
        if(soft)
          changed = hash != this.apiDataHash
        else
          changed = true
        console.log(`### Changed ${changed} (was forced ${!soft})`);
        this.apiData = newData
        this.apiDataHash = hash

        if(changed) {
          //this.apiData = null
          cy.remove("*")
          this.infoBoxData = false          
          this.refreshNodes()
        } else {
          //try to detect status changes
          for(let pod of this.apiData.pods) {
            let status = this.calcStatus(pod)
            cy.$id(`Pod_${pod.metadata.name}`).data('status', status)
          }
          for(let rs of this.apiData.replicasets) {
            let status = this.calcStatus(rs)
            cy.$id(`ReplicaSet_${rs.metadata.name}`).data('status', status)
          }          
          for(let deploy of this.apiData.deployments) {
            let status = this.calcStatus(deploy)
            cy.$id(`Deployment_${deploy.metadata.name}`).data('status', status)
          }               
        }
      })
    },

    calcHash(data) {
      let hashString = ''
      for(let type in data) {
        for(let obj of data[type]) {
          hashString += obj.metadata.selfLink
        }
      }
      return hashStr(hashString)
    },

    calcStatus(node) {
      let status = 'grey'
      
      if(node.metadata.selfLink.startsWith(`/apis/apps/v1/namespaces/${this.namespace}/deployments/`)) {
        status = 'red'
        let cond = node.status.conditions.find(c => c.type == 'Available') || {}
        if(cond.status == "True") status = 'green'
      }
      if(node.metadata.selfLink.startsWith(`/apis/apps/v1/namespaces/${this.namespace}/replicasets/`)) {
        status = 'green'
        if(node.status.replicas != node.status.readyReplicas) status = 'red'
      }     
      if(node.metadata.selfLink.startsWith(`/api/v1/namespaces/${this.namespace}/pods/`)) {
        let cond = node.status.conditions.find(c => c.type == 'Ready') || {}
        if(cond.status == "True") status = 'green'
        if(node.status.phase == 'Failed' || node.status.phase == 'CrashLoopBackOff') status = 'red'
      }      
      return status
    },

    refreshNodes() {
      // Add deployments
      for(let deploy of this.apiData.deployments) {
        if(!this.filterShowNode(deploy)) continue

        this.addNode(deploy, 'Deployment', this.calcStatus(deploy))
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

        // let status = 'grey'
        // if(pod.status.phase == 'Failed' || pod.status.phase == 'CrashLoopBackOff') status = 'red'
        // let readyCond = pod.status.conditions.find(c => c.type == 'Ready') || {}
        // if(readyCond.status == "True") status = 'green'
        
        // Add pods to containing group (ReplicaSet, DaemonSet, StatefulSet) that 'owns' them
        let owner = pod.metadata.ownerReferences[0];
        let groupId = `grp_${owner.kind}_${owner.name}`
        this.addNode(pod, 'Pod', this.calcStatus(pod), groupId)

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
      this.showLoading = false;
      cy.resize();
      cy.layout({name: 'cose-bilkent', nodeRepulsion: 5000, nodeDimensionsIncludeLabels:true}).run();
      //cy.fit();
      cy.fit();
    },

    addNode(node, type, status = '', groupId = null) {
      try {
        let icon = 'default'
        
        if(type == "Deployment")            icon = 'deploy'
        if(type == "ReplicaSet")            icon = 'rs'
        if(type == "StatefulSet")           icon = 'sts'
        if(type == "DaemonSet")             icon = 'ds'
        if(type == "Pod")                   icon = 'pod'
        if(type == "Service")               icon = 'svc'
        if(type == "IP")                    icon = 'ip'
        if(type == "Ingress")               icon = 'ing'
        if(type == "PersistentVolumeClaim") icon = 'pvc'

        //console.log(`### Adding: ${node.metadata.name || node.metadata.selfLink}`);
        cy.add({ data: { id: `${type}_${node.metadata.name}`, label: node.metadata.name, icon: icon, sourceObj: node, type: type, parent: groupId, status: status } })
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

    cy.style().selector('node[icon]').style(require('../assets/styles/node.json'));
    cy.style().selector('node[icon]').style("background-image", function(ele) { 
      return ele.data('status') ? `img/res/${ele.data('icon')}-${ele.data('status')}.svg` : `img/res/${ele.data('icon')}.svg`
    })
    cy.style().selector('.grp').style(require('../assets/styles/grp.json'));
    cy.style().selector('edge').style(require('../assets/styles/edge.json'));
    cy.style().selector('node:selected').style({
      'border-width': '4',
      'border-color': 'rgb(0, 120, 215)'
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

    // Inital load
    this.refreshData()
    // if(this.timer)
    //   clearInterval(this.timer)
    // this.timer = setInterval(() => { this.refreshData(true) }, this.refreshInterval) //this.$refs.viewer.refreshData(true), )
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

  .slide-fade-enter-active {
    transition: all .3s ease;
  }
  .slide-fade-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }  
</style>
