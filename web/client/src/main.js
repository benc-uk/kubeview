import Vue from 'vue'
import App from './App.vue'

// Use Vue Bootstrap and theme
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)
import 'bootswatch/dist/superhero/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

// Mount main top level 'App' component
new Vue({
  render: function (h) {
    return h(App)
  },
}).$mount('#app')
