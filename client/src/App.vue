<template>
  <div class="app">
    <b-navbar toggleable="md" type="dark" variant="dark">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

      <b-navbar-brand class="logoText"><img src="./assets/logo.png" class="logo"> &nbsp;KubeView</b-navbar-brand>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <b-collapse is-nav id="nav_collapse">
        <b-dropdown :text="namespace" variant="light">
        <b-dropdown-item @click="namespace = ns.metadata.name" v-for="ns in namespaces" :key="ns.metadata.uid" >{{ ns.metadata.name }}</b-dropdown-item></b-dropdown>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <!-- <b-navbar-nav >
          <b-button variant="info" @click="refresh()">↻ Refresh</b-button> 
        </b-navbar-nav> -->
        
        <input v-model="filter" @keyup.enter="$refs.viewer.refreshData(false)" class="filterBox" placeholder="filter...">&nbsp;&nbsp;
        <b-navbar-nav>
          <b-button variant="info" @click="$refs.viewer.refreshData(false)">Filter</b-button> &nbsp;
          <b-button variant="info" @click="filter = ''; $refs.viewer.refreshData(false)">Clear</b-button> 
        </b-navbar-nav>
      </b-collapse>

      <b-navbar-nav class="ml-auto">
        <b-button variant="success" v-b-modal.aboutModal>About</b-button>
      </b-navbar-nav>
    </b-navbar>

    <viewer :namespace="namespace" :filter="filter" ref="viewer"></viewer>

    <b-modal id="aboutModal" title="About KubeView">
      <p>v{{ version }}</p>
      <p><a href="https://github.com/benc-uk/kubeview">https://github.com/benc-uk/kubeview</a></p>
      <p>Ben Coleman</p>
    </b-modal>
  </div>
</template>

<script>
import Viewer from './components/Viewer.vue'
import apiMixin from "./mixins/api.js";

export default {
  name: 'app',

  mixins: [ apiMixin ],

  components: {
    Viewer
  },

  data() {
    return {
      namespace: "default",
      namespaces: [],
      filter: "",
      version: require('../package.json').version
    }
  },

  // methods: {
  //   refresh(soft) {
  //     this.$refs.viewer.refreshData(soft)
  //   }
  // },

  mounted() {
    this.apiGetNamespaces()
    .then(data => {
      this.namespaces = data
    })
  }
}
</script>

<style>
  body, html, .app {
    margin: 0;
    padding: 0;
    height: 100%
  }
  .logo {
    height: 45px;
  }
  .logoText {
    font-size: 30px !important;
  }
  .filterBox {
    font-size: 120%;
    width: 100px;
  }
</style>
