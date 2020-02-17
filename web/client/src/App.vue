<template>
  <div class="app">
    <b-navbar toggleable="md" type="dark" variant="light">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand class="logoText">
        <img src="./assets/clvr-logo.svg" class="logo" width="112" height="28" /> &nbsp;labs
      </b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav>
          <b-form-input
            @change="changeNS"
            @blur="$event.target.value = namespace"
            @focus="$event.target.value = '';"
            list="ns-list"
            ref="ns"
            :text="namespace"
            :value="namespace"
          ></b-form-input>

          <datalist id="ns-list">
            <option v-for="ns in namespaces" :key="ns.metadata.uid">{{ ns.metadata.name }}</option>
          </datalist>
        </b-navbar-nav>

        <b-navbar-nav>
          <b-form-input
            v-model="filter"
            @keyup.enter="$refs.viewer.refreshData(false)"
            class="filterBox"
            placeholder="filter..."
          ></b-form-input>&nbsp;&nbsp;
          <b-button variant="primary" @click="$refs.viewer.refreshData(false)">Refresh</b-button>&nbsp;&nbsp;
        </b-navbar-nav>

        <b-navbar-nav>
          <b-dropdown split :text="autoRefreshText" split-variant="light" variant="primary">
            <b-dropdown-item @click="autoRefresh=0">Off</b-dropdown-item>
            <b-dropdown-item @click="autoRefresh=2">2 secs</b-dropdown-item>
            <b-dropdown-item @click="autoRefresh=5">5 secs</b-dropdown-item>
            <b-dropdown-item @click="autoRefresh=10">10 secs</b-dropdown-item>
            <b-dropdown-item @click="autoRefresh=15">15 secs</b-dropdown-item>
            <b-dropdown-item @click="autoRefresh=30">30 secs</b-dropdown-item>
            <b-dropdown-item @click="autoRefresh=60">60 secs</b-dropdown-item>
          </b-dropdown>
        </b-navbar-nav>

        <b-navbar-nav>
          <b-dropdown split :text="displayModeText" split-variant="light" variant="primary">
            <b-dropdown-item @click="displayMode=0">Deployment</b-dropdown-item>
            <b-dropdown-item @click="displayMode=1">Network</b-dropdown-item>
            <b-dropdown-item @click="displayMode=2">Mixed</b-dropdown-item>
          </b-dropdown>
        </b-navbar-nav>
      </b-collapse>

      <b-navbar-nav class="ml-auto">
        <b-button variant="primary" v-b-modal.aboutModal>About</b-button>
      </b-navbar-nav>
    </b-navbar>

    <viewer
      :namespace="namespace"
      :filter="filter"
      :autoRefresh="autoRefresh"
      :displayMode="displayMode"
      ref="viewer"
    ></viewer>

    <b-modal
      id="aboutModal"
      title="About"
      header-bg-variant="info"
      header-text-variant="dark"
      ok-only
    >
      <div class="text-center">
        <img src="./assets/clvr-logo.svg" width="250px" />
        <p>
          CLVR Kubernetes Visualization tool
          <br />Based on Kubeview by Ben Coleman
        </p>
        <b-button
          href="https://github.com/benc-uk/kubeview"
          target="_blank"
          variant="primary"
        >GitHub Project</b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import Viewer from "./components/Viewer.vue";
import apiMixin from "./mixins/api.js";

export default {
  mixins: [apiMixin],

  components: {
    Viewer
  },

  computed: {
    autoRefreshText() {
      return this.autoRefresh
        ? `Refresh: ${this.autoRefresh} secs`
        : "Refresh: Off";
    },
    displayModeText() {
      let mode = ["Deployment", "Network", "Mixed"];
      return `Mode: ${mode[this.displayMode]}`;
    }
  },

  data() {
    return {
      namespace: "default",
      namespaces: [],
      filter: "",
      version: require("../package.json").version,
      autoRefresh: -1,
      displayMode: 0
    };
  },

  methods: {
    changeNS: function(evt) {
      this.filter = "";
      this.namespace = evt;
      this.$refs.ns.blur();
    }
  },

  mounted() {
    this.apiGetNamespaces().then(data => {
      this.namespaces = data;
    });

    this.autoRefresh = 2;
    this.displayMode = 0;
  }
};
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
  font-size: 16px !important;
}
.filterBox {
  font-size: 120%;
  width: 100px;
}
</style>
