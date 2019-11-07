<template>
  <div id="viewwrap">
    <div id="mainview" ref="mainview"></div>

    <loading v-if="loading"></loading>

    <transition name="slide-fade">
      <infobox v-if="infoBoxData" :nodeData="infoBoxData" @hideInfoBox="infoBoxData = null" @fullInfo="showFullInfo"></infobox>
    </transition>

    <b-modal centered :title="fullInfoTitle" ref="fullInfoModal" ok-only scrollable size="lg" body-class="fullInfoBody">
      <pre>{{ fullInfoYaml }}</pre>
    </b-modal>

  </div>
</template>

<script>
import apiMixin from "../mixins/api.js"
import utils from "../mixins/utils.js"
import InfoBox from "./InfoBox"
import Loading from "./Loading"

import yaml from 'js-yaml'
import VueTimers from 'vue-timers/mixin'
import cytoscape from 'cytoscape'

// Urgh, gotta have this here, putting into data, causes weirdness
var cy

export default {
  mixins: [ apiMixin, utils, VueTimers ],

  components: { 
    'infobox': InfoBox,
    'loading': Loading 
  },

  props: [ 'namespace', 'filter', 'autoRefresh', 'rootType' ],

  data() {
    return {
      apiData: null,
      infoBoxData: null,
      fullInfoYaml: null,
      fullInfoTitle: "",
      loading: false
    }
  },

  // VueTimers mixin is pretty sweet
  timers: {
    timerRefresh: { time: 60000, autostart: false, repeat: true }
  },

  watch: {
    namespace() { 
      this.refreshData(false) 
    },

    autoRefresh() {
      this.$timer.stop('timerRefresh')
      if(this.autoRefresh > 0) {
        this.timers.timerRefresh.time = this.autoRefresh * 1000
        this.$timer.start('timerRefresh')
      }
    }
  },

  methods: {
    //
    // Display the detail info dialog with YAML version of the selected object
    //
    showFullInfo() {
      this.fullInfoYaml = yaml.safeDump(this.infoBoxData.sourceObj)
      this.fullInfoTitle = `${this.infoBoxData.type}: ${this.infoBoxData.sourceObj.metadata.name}`
      this.$refs.fullInfoModal.show()
    },

    //
    // Called by the auto refresh timer, invokes a 'soft' refresh 
    //
    timerRefresh() {
      this.refreshData(true)
    },

    //
    // Called to reload data from the API and display it
    //
    refreshData(soft = false) {
      // Soft refresh will not redraw/refresh nodes if no changes
      if(!soft) { 
        cy.remove("*")
        this.loading = true 
      }

      this.apiGetDataForNamespace(this.namespace)
      .then(newData => {
        if(!newData) return
        let changed = true
        if(soft) changed = this.detectChange(newData) 

        this.apiData = newData

        if(changed) {
          this.typeIndexes = []
          cy.remove("*")
          this.infoBoxData = false          
          this.refreshNodes()
        }

        this.loading = false
      })
    },

    //
    // On a soft refresh, this detects changes between old & new data
    //
    detectChange(data) {
      if(!this.apiData) return false

      // Scan new data, match with old objects and check resourceVersion changes
      for(let type in data) {
        for(let obj of data[type]) {
          // We have to skip these objects, the resourceVersion is constantly shifting 
          if(obj.metadata.selfLink == '/api/v1/namespaces/kube-system/endpoints/kube-controller-manager') continue
          if(obj.metadata.selfLink == '/api/v1/namespaces/kube-system/endpoints/kube-scheduler') continue

          let oldObj = this.apiData[type].find(o => o.metadata.uid == obj.metadata.uid)
          if(!oldObj || (oldObj.metadata.resourceVersion != obj.metadata.resourceVersion)) {
            return true
          }
        }
      }
      // Scan old data and look for missing objects, which means they are deleted
      for(let type in this.apiData) {
        for(let obj of this.apiData[type]) {
          let newObj = data[type].find(o => o.metadata.uid == obj.metadata.uid)
          if(!newObj) {
            return true
          }
        }
      }      
      return false
    },    

    //
    // Some objects are colour coded by status
    //
    calcStatus(kubeObj) {
      let status = 'grey'
      
      try {
        if(kubeObj.metadata.selfLink.startsWith(`/apis/apps/v1/namespaces/${this.namespace}/deployments/`)) {
          status = 'red'
          let cond = kubeObj.status.conditions.find(c => c.type == 'Available') || {}
          if(cond.status == "True") status = 'green'
        }

        if(kubeObj.metadata.selfLink.startsWith(`/apis/apps/v1/namespaces/${this.namespace}/replicasets/`) ||
          kubeObj.metadata.selfLink.startsWith(`/apis/apps/v1/namespaces/${this.namespace}/statefulsets/`)) {
          status = 'green'
          if(kubeObj.status.replicas != kubeObj.status.readyReplicas) status = 'red'
        }

        if(kubeObj.metadata.selfLink.startsWith(`/apis/apps/v1/namespaces/${this.namespace}/daemonsets/`)) {
          status = 'green'
          if(kubeObj.status.numberReady != kubeObj.status.desiredNumberScheduled) status = 'red'
        } 

        if(kubeObj.metadata.selfLink.startsWith(`/api/v1/namespaces/${this.namespace}/pods/`)) {
          let cond = {}
          if(kubeObj.status && kubeObj.status.conditions)
            cond = kubeObj.status.conditions.find(c => c.type == 'Ready')
          if(cond && cond.status == "True") status = 'green'
          if(kubeObj.status.phase == 'Failed' || kubeObj.status.phase == 'CrashLoopBackOff') status = 'red'
          if(kubeObj.status.phase == 'Succeeded') status = 'green'
        }
      } catch(err) {
        console.log(`### Problem with calcStatus for ${kubeObj.metadata.selfLink}`);  
      }

      return status
    },

    //
    // Convience method to add ReplicaSets / DaemonSets / StatefulSets
    //
    addSet(type, kubeObjs) {
      
      for(let obj of kubeObjs) {
        if(!this.filterShowNode(obj)) continue
        let objId = `${type}_${obj.metadata.name}`

        // This skips and hides sets without any replicas
        if(obj.status) {
          if(obj.status.replicas == 0 || obj.status.desiredNumberScheduled == 0) continue;
        }
        
        // Add special "group" node for the set
        this.addGroup(type, obj.metadata.name)
        // Add set node and link it to the group
        this.addNode(obj, type, this.calcStatus(obj))
        //this.addLink(`grp_ReplicaSet_${rs.metadata.name}`, rsId)

        // Find all owning deployments of this set (if any)
        for(let ownerRef of obj.metadata.ownerReferences || []) {
          // Skip owners that aren't deployments (like operators and custom objects)
          if(ownerRef.kind.toLowerCase() !== 'deployment') continue;
          
          // Link set up to the deployment
          this.addLink(objId, `${ownerRef.kind}_${ownerRef.name}`)
        }
      }
    },

    //
    // The core processing logic is here, add objects to layout
    //
    refreshNodes() {
      // Add deployments
      for(let deploy of this.apiData.deployments) {
        if(!this.filterShowNode(deploy)) continue

        this.addNode(deploy, 'Deployment', this.calcStatus(deploy))
      }

      // The 'sets' - ReplicaSets / DaemonSets / StatefulSets
      this.addSet('ReplicaSet', this.apiData.replicasets)
      this.addSet('StatefulSet', this.apiData.statefulsets)
      this.addSet('DaemonSet', this.apiData.daemonsets)

      // Add pods
      for(let pod of this.apiData.pods) {
        if(!this.filterShowNode(pod)) continue
        
        // Add pods to containing group (ReplicaSet, DaemonSet, StatefulSet) that 'owns' them
        if(pod.metadata.ownerReferences) {
          // Most pods have owning set (rs, ds, sts) so are in a group
          let owner = pod.metadata.ownerReferences[0];
          let groupId = `grp_${owner.kind}_${owner.name}`
          this.addNode(pod, 'Pod', this.calcStatus(pod), groupId)
        } else {
          // Naked pods don't go into groups
          this.addNode(pod, 'Pod', this.calcStatus(pod))
        }

        // Add PVCs linked to Pod
        for(let vol of pod.spec.volumes || []) {
          if(vol.persistentVolumeClaim) {
            let pvc = this.apiData.persistentvolumeclaims.find(p => p.metadata.name == vol.persistentVolumeClaim.claimName)
            this.addNode(pvc, 'PersistentVolumeClaim')
            this.addLink(`PersistentVolumeClaim_${vol.persistentVolumeClaim.claimName}`, `Pod_${pod.metadata.name}`)
          }
        }

        // Find all owning sets of this pod
        for(let ownerRef of pod.metadata.ownerReferences || []) {
          // Link pod up to the owning set/group
          this.addLink(`Pod_${pod.metadata.name}`, `${ownerRef.kind}_${ownerRef.name}`)
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
        // For this we create a pseudo-object
        for(let lb of svc.status.loadBalancer.ingress || []) {
          // Fake Kubernetes object to display the IP
          let ipObj = { metadata: { name: lb.ip} }
          this.addNode(ipObj, 'IP')
          this.addLink(`IP_${ipObj.metadata.name}`, `Service_${svc.metadata.name}`)
        }
      }

      // Add Ingresses and link to Services  
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

        // Ingresses joined to Services by the rules
        for(let rule of ingress.spec.rules || []) {
          if(!rule.http.paths) continue
          for(let path of rule.http.paths || []) {
            let serviceName = path.backend.serviceName
            //this.addLink(ingress.metadata.uid, `endpoint_${serviceName}`) 
            this.addLink(`Ingress_${ingress.metadata.name}`, `Service_${serviceName}`) 
          }
        }
      }      

      // Finially done! Call re-layout
      this.relayout()
    },

    //
    // Relayout nodes and display them 
    //
    relayout() {      
      cy.resize()
      
      // Use breadthfirst with Deployments or DaemonSets or StatefulSets at the root
      cy.layout({
        name: 'breadthfirst', 
        roots: cy.nodes(`[type = "Deployment"],[type = "DaemonSet"],[type = "StatefulSet"]`),
        nodeDimensionsIncludeLabels: true,
        spacingFactor: 1
      }).run()
    },

    //
    // Add node to the Cytoscape graph
    //
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

        // Trim long names for labels, and get pod's hashed generated name suffix
        let label = node.metadata.name.substr(0, 24)
        if(type == "Pod") {
          let podName = node.metadata.name.replace(node.metadata.generateName, '')        
          label = podName || node.status.podIP || ""
        }

        //console.log(`### Adding: ${type} -> ${node.metadata.name || node.metadata.selfLink}`);
        cy.add({ data: { id: `${type}_${node.metadata.name}`, label: label, icon: icon, sourceObj: node, 
                         type: type, parent: groupId, status: status, name: node.metadata.name } })
      } catch(e) {
        console.error(`### Unable to add node: ${node.metadata.name || node.metadata.selfLink}`);
      }
    },

    //
    // Link two nodes togther
    //
    addLink(sourceId, targetId) {
      try {
        // This is the syntax Cytoscape uses for creating links
        // 
        cy.add({ data: { id: `${sourceId}___${targetId}`, source: sourceId, target: targetId } })
      } catch(e) {
        console.error(`### Unable to add link: ${sourceId} to ${targetId}`);
      }      
    },

    //
    // A group is like a container, currently only used to hold Pods
    //
    addGroup(type, name) {
      try {
        cy.add({ classes:['grp'], data: { id: `grp_${type}_${name}`, label: name, name: name} })
      } catch(e) {
        console.error(`### Unable to add group: ${name}`);
      }      
    },

    //
    // Filter out nodes, called before adding/processing them
    //
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

  //
  // Init component and set things up
  //
  mounted: function() {
    // Create cytoscape, this bad boy is why we're here 
    cy = cytoscape({ 
      container: this.$refs.mainview,
      wheelSensitivity: 0.1,
      maxZoom: 5,
      minZoom: 0.2,
      selectionType: 'single'
    })

    // Styling cytoscape to look good, stylesheets are held as JSON external
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

    // Click/select event opens the infobox
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

    // Only sensible way I could find to hide the info box when unselecting
    cy.on('click tap', evt => {
      if(!evt.target.length && this.infoBoxData) {
        this.infoBoxData = false;
      }
    })

    // Inital load of everything ...
    this.refreshData()
  }
}
</script>

<style>
  #viewwrap {
    height: calc(100% - 67px)
  }

  /* Style the cytoscape canvas */
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
