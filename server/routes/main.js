const express = require('express');
const routes = express.Router();

//
// Get all Namespaces
//
routes.get('/api/namespaces', async function(req, res, next) {
  let client = res.app.get('client')
  res.header("Access-Control-Allow-Origin", "*");
  
  try {
    const data = await client.api.v1.namespaces.get()
    res.send(data.body.items)
  } catch(e) {
    res.status(500).end(`Sorry, bad thing happened: ${e.toString()}`)
  }
})

//
// Main API scraper 
//
routes.get('/api/scrape/:ns', async function(req, res, next) {
  let client = res.app.get('client')
  res.header("Access-Control-Allow-Origin", "*");

  let ns = req.params.ns;

  let data = {}
  try {
    const services = await client.api.v1.namespaces(ns).services.get()
    const endpoints = await client.api.v1.namespaces(ns).endpoints.get()
    const ingresses = await client.apis.extensions.v1beta1.namespaces(ns).ingresses.get()
    const pods = await client.api.v1.namespaces(ns).pods.get()
    const deployments = await client.apis.apps.v1.namespaces(ns).deployments.get()
    const replicasets = await client.apis.apps.v1.namespaces(ns).replicasets.get()
    const daemonsets = await client.apis.apps.v1.namespaces(ns).daemonsets.get()
    const statefulsets = await client.apis.apps.v1.namespaces(ns).statefulsets.get()
    const persistentvolumeclaims = await client.api.v1.namespaces(ns).persistentvolumeclaims.get()
    const persistentvolumes = await client.api.v1.persistentvolumes.get()

    // Build response data and send
    data.services = services.body.items
    data.endpoints = endpoints.body.items
    data.ingresses = ingresses.body.items
    data.pods = pods.body.items
    data.deployments = deployments.body.items
    data.replicasets = replicasets.body.items
    data.daemonsets = daemonsets.body.items
    data.statefulsets = statefulsets.body.items
    data.persistentvolumeclaims = persistentvolumeclaims.body.items
    data.persistentvolumes = persistentvolumes.body.items
    res.send(data)

  } catch(e) {
    res.status(500).end(`Sorry, bad thing happened: ${e.toString()}`)
  }
})

module.exports = routes;