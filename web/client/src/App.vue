<template>
  <div class="app">
    <b-navbar toggleable="md" type="dark" variant="dark">
      <b-navbar-toggle target="nav_collapse" />

      <b-navbar-brand class="logoText"> <img src="./assets/logo.png" class="logo" /> &nbsp;KubeView </b-navbar-brand>

      <b-collapse id="nav_collapse" is-nav>
        <b-navbar-nav>
          <b-form-input
            v-if="changeNamespace"
            ref="ns"
            list="ns-list"
            :text="namespace"
            :value="namespace"
            @change="changeNS"
            @blur="$event.target.value = namespace"
            @focus="$event.target.value = ''"
          />

          <datalist id="ns-list">
            <option v-for="ns in namespaces" :key="ns.metadata.uid">
              {{ ns.metadata.name }}
            </option>
          </datalist>
        </b-navbar-nav>

        <div style="width: 0.2rem" />

        <b-navbar-nav>
          <b-form-input v-model="filter" class="filterBox" placeholder="filter..." @keyup.enter="$refs.viewer.refreshData(false)" />&nbsp;&nbsp;
          <div style="width: 0.3rem" />
          <b-button variant="info" @click="$refs.viewer.refreshData(false)"> Refresh </b-button>
        </b-navbar-nav>

        <b-navbar-nav>
          <b-dropdown split :text="autoRefreshText" split-variant="light" variant="info">
            <b-dropdown-item @click="autoRefresh = 0"> Off </b-dropdown-item>
            <b-dropdown-item @click="autoRefresh = 5"> 5 secs </b-dropdown-item>
            <b-dropdown-item @click="autoRefresh = 10"> 10 secs </b-dropdown-item>
            <b-dropdown-item @click="autoRefresh = 15"> 15 secs </b-dropdown-item>
            <b-dropdown-item @click="autoRefresh = 30"> 30 secs </b-dropdown-item>
            <b-dropdown-item @click="autoRefresh = 60"> 60 secs </b-dropdown-item>
          </b-dropdown>
        </b-navbar-nav>
      </b-collapse>

      <b-navbar-nav class="ml-auto">
        <b-button v-b-modal.aboutModal variant="success">About</b-button>
      </b-navbar-nav>
    </b-navbar>

    <viewer ref="viewer" :namespace="namespace" :filter="filter" :auto-refresh="autoRefresh" />

    <b-modal id="aboutModal" title="About KubeView" header-bg-variant="info" header-text-variant="dark" ok-only>
      <div class="text-center">
        <img src="./assets/logo.png" width="100" />
        <p>v{{ version }} - Ben Coleman</p>
        <b-button href="https://github.com/benc-uk/kubeview" target="_blank" variant="success">GitHub Project</b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import Viewer from './components/Viewer.vue'
import apiMixin from './mixins/api.js'

export default {
  components: {
    Viewer,
  },
  mixins: [apiMixin],

  data() {
    return {
      namespace: '', // Selected namespace
      changeNamespace: true, // Can user change namespace and picker shown?
      namespaces: [], // List of all namespaces (if changeNamespace == true)
      filter: '', // Filter to be applied to node names
      version: require('../package.json').version,
      autoRefresh: -1,
    }
  },

  computed: {
    autoRefreshText() {
      return this.autoRefresh ? `Auto Refresh: ${this.autoRefresh} secs` : 'Auto Refresh: Off'
    },
  },

  async mounted() {
    let conf
    conf = await this.apiGetConfig()

    this.namespace = 'default'
    this.autoRefresh = 10

    if (conf && conf.NamespaceScope) {
      // Asterisk is default behaviour meaning users can pick any NS
      // Any other value here limits the NS to that string value
      if (conf.NamespaceScope !== '*') {
        this.namespace = conf.NamespaceScope
        this.changeNamespace = false
      }
    }

    if (this.changeNamespace) {
      this.namespaces = await this.apiGetNamespaces()
    }
  },

  methods: {
    changeNS: function (evt) {
      this.filter = ''
      this.namespace = evt
      this.$refs.ns.blur()
    },
  },
}
</script>

<style>
body,
html,
.app {
  margin: 0;
  padding: 0;
  height: 100%;
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
