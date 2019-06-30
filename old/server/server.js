// Dotenv handy for local config & debugging
require('dotenv').config()

// GoDaddy Kubernetes client
const k8sConfig = require('kubernetes-client/backends/request').config
const k8sClient = require('kubernetes-client').Client
const k8sRequest = require('kubernetes-client/backends/request')

// Core Express & logging stuff
var express = require('express')
var app = express()

// Serve static content from working directory ('.') by default
// - Optional parameter can specify different location, use when debugging & running locally
// - e.g. `node server.js ../client/dist/`
var staticContentDir = process.argv[2] || __dirname;
// resolve to an absolute path
staticContentDir = require('path').resolve(staticContentDir)
console.log(`### Content dir = '${staticContentDir}'`);
// Serve all static content (index.html, js, css, assets, etc.)
app.use('/', express.static(staticContentDir));

// ===== API routes =====
// Main routing and API hooks here
app.use(require('./routes/main'));

// Redirect all other requests to Vue.js app - i.e. index.html
// This allows us to do in-app, client side routing and deep linking 
// - see https://angular.io/guide/deployment#server-configuration
app.use('*', function(req, res) {
  res.sendFile(`${staticContentDir}/index.html`);
});

// ===== Start server =====

// Server port
const port = process.env.PORT || 3000;

var server = app.listen(port, async function () {
  console.log(`### Server listening on ${server.address().port}`)
  console.log(`### NODE_ENV is ${process.env.NODE_ENV}`)
  console.log(`### Connecting to Kubernetes API...`)
  try {
    var kubeConf;
    if(process.env.NODE_ENV == "production") {
      // Running inside K8S
      kubeConf = k8sConfig.getInCluster()
    } else {
      // Running local - use user's kubectl connection details
      kubeConf = k8sConfig.fromKubeconfig(`${process.env.HOME}/.kube/config`)
    }
    // let client = new k8sClient({ config: kubeConf })
    let client = new k8sClient({ backend: new k8sRequest(kubeConf) })
    await client.loadSpec()
    console.log(`### Connected to ${client.backend.requestOptions.baseUrl}`)

    // This is important, make client available app wide
    app.set('client', client);
  } catch(e) {
    console.log(`### Error! ${e.toString()}`)
  }
});