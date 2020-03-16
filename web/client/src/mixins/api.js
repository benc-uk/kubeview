const API_ENDPOINT = process.env.VUE_APP_API_ENDPOINT

export default {

  // !TODO! These probably could be consolidated into a single method

  methods: {
    apiGetDataForNamespace(ns) {
      return fetch(`${API_ENDPOINT}/scrape/${ns}`)
        .then((resp) => {
          if (!resp.ok) { throw Error(resp.statusText) }
          return resp.json()
        })
        .catch((err) => {
          // eslint-disable-next-line
          console.log(`### API ${API_ENDPOINT}/scrape/${ns} Error! ${err}`)
        })
    },

    apiGetNamespaces() {
      return fetch(`${API_ENDPOINT}/namespaces`)
        .then((resp) => {
          if (!resp.ok) { throw Error(resp.statusText) }
          return resp.json()
        })
        .catch((err) => {
        // eslint-disable-next-line
        console.log(`### API ${API_ENDPOINT}/namespaces Error! ${err}`)
        })
    },

    apiGetConfig() {
      return fetch(`${API_ENDPOINT}/config`)
        .then((resp) => {
          if (!resp.ok) { throw Error(resp.statusText) }
          return resp.json()
        })
        .catch(() => {
        // eslint-disable-next-line
        console.log(`### WARN! Failed to get config from ${API_ENDPOINT}/config, will fall back to defaults`)
        })
    }
  }
}