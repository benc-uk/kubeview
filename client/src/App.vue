<template>
  <div class="app">
    <b-navbar toggleable="md" type="dark" variant="dark">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

      <b-navbar-brand class="logoText"><img src="./assets/logo.png" class="logo"> &nbsp;KubeView</b-navbar-brand>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <b-collapse is-nav id="nav_collapse">
        Namespace:&nbsp;&nbsp;<b-dropdown :text="namespace" variant="info">
        <b-dropdown-item @click="nsChange(ns.metadata.name)" v-for="ns in namespaces" :key="ns.metadata.uid" >{{ ns.metadata.name }}</b-dropdown-item></b-dropdown>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <b-navbar-nav >
          <b-button variant="light" @click="refresh()">Refresh</b-button> 
        </b-navbar-nav>
        
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input v-model="filter" @keyup.enter="filterUpdate()">&nbsp;&nbsp;
        <b-navbar-nav>
          <b-button variant="light" @click="filterUpdate()">Filter</b-button> &nbsp;
          <b-button variant="light" @click="filterClear()">Clear</b-button> 
        </b-navbar-nav>
      </b-collapse>

      <b-navbar-nav class="ml-auto">
        <b-button variant="success" v-b-modal.aboutModal>About</b-button>
      </b-navbar-nav>
    </b-navbar>

    <viewer :namespace="namespace" :action="action" :filter="filter"></viewer>

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
      action: "",
      filter: "",
      version: require('../package.json').version
    }
  },

  methods: {
    nsChange(ns) {
      this.namespace = ns
    },

    refresh() {
      this.action = `refresh_${Date.now()}`
    },

    filterUpdate() {
      this.action = `refresh_${Date.now()}`
    },

    filterClear() {
      this.filter = ""
      this.action = `refresh_${Date.now()}`
    }
  },

  mounted() {
    this.apiGetNamespaces()
    .then(data => this.namespaces = data)
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
</style>
