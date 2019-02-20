// Dotenv handy for local config & debugging
require('dotenv').config()

const K8sConfig = require('kubernetes-client').config
const Client = require('kubernetes-client').Client

// Core Express & logging stuff
var express = require('express')
var app = express()
var client = null;

// ===== API routes =====

app.use('/api/namespaces', async function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  
  try {
    const data = await client.api.v1.namespaces.get()
    res.send(data.body.items)
  } catch(e) {
    res.status(500).end(`Sorry, bad thing happened: ${e.toString()}`)
  }
})

app.use('/api/scrape/:ns', async function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");

  let ns = req.params.ns;

  let data = {}
  try {
    const services = await client.api.v1.namespaces(ns).services.get()
    const endpoints = await client.api.v1.namespaces(ns).endpoints.get()
    const pods = await client.api.v1.namespaces(ns).pods.get()
    const deployments = await client.apis.apps.v1.namespaces(ns).deployments.get()
    const replicasets = await client.apis.apps.v1.namespaces(ns).replicasets.get()
    const ingresses = await client.apis.extensions.v1beta1.namespaces(ns).ingresses.get()

    // Build response data and send
    data.services = services.body.items
    data.endpoints = endpoints.body.items
    data.ingresses = ingresses.body.items
    data.pods = pods.body.items
    data.deployments = deployments.body.items
    data.replicasets = replicasets.body.items
    res.send(data)

  } catch(e) {
    res.status(500).end(`Sorry, bad thing happened: ${e.toString()}`)
  }
})

app.use('/', async function(req, res, next) {
  res.send("Nothing to see, try the /api")
})

// ===== Start server =====

// Server port
const port = process.env.PORT || 3000;

var server = app.listen(port, async function () {
  console.log(`### Server listening on ${server.address().port}`)

  console.log(`### Connecting to Kubernetes API...`)
  try {
    const path = '/home/ben/.kube/config'
    const config = K8sConfig.fromKubeconfig(path)
    client = new Client({ config: config })
    await client.loadSpec()
    console.log(`### Connected to ${client.backend.requestOptions.baseUrl}`)
  } catch(e) {
    console.log(`### Error! ${e.toString()}`)
  }
});