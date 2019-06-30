import Vue from 'vue'
import App from './App.vue'

// Bootstrap and theme
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);
// Select Bootswatch Cosmo theme :)
import 'bootswatch/dist/superhero/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

new Vue({
  render: function (h) { return h(App) },
}).$mount('#app')
