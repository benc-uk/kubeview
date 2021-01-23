// Allow for configurable API endpoint, in most cases this will be same domain `/api`
const API_ENDPOINT = process.env.VUE_APP_API_ENDPOINT

//
// API MIXIN SERVICE
// All API calls are here, see main.go for route details
//

export default {
  methods: {
    //
    // Main data scrape API call to `/api/scrape/{ns}`
    //
    apiGetDataForNamespace(ns) {
      return this._apiGet(`scrape/${ns}`)
    },

    //
    // Get list of all namespaces from `/api/namespaces`
    //
    apiGetNamespaces() {
      return this._apiGet('namespaces')
    },

    //
    // Get remote server config from `/api/config`
    //
    apiGetConfig() {
      return this._apiGet('config')
    },

    //
    // PRIVATE. Basic API GET call using fetch
    //
    async _apiGet(urlSuffix) {
      try {
        const resp = await fetch(`${API_ENDPOINT}/${urlSuffix}`)
        if (!resp.ok) {
          throw Error(resp.statusText)
        }
        return resp.json()
      } catch (err) {
        // eslint-disable-next-line
        console.log(`### ERROR! Failed to call API ${API_ENDPOINT}/${urlSuffix}, ${err}`)
      }
    },
  },
}
