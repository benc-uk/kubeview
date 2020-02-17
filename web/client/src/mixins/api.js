const API_ENDPOINT = process.env.VUE_APP_API_ENDPOINT

export default {
  methods: {
    apiGetDataForNamespace(ns) {
      return fetch(`${API_ENDPOINT}/scrape/${ns}`)
      .then(resp => {
        return resp.json();
      })
      .catch(err => {
        // eslint-disable-next-line
        console.log(`### API Error! ${err.toString()}`);
      })
    },

    apiDeletePodForNamespace(ns, pod) {
      return fetch(`${API_ENDPOINT}/deletePod/${ns}/${pod}`)
      .then(resp => {
        return resp.json();
      })
      .catch(err => {
        // eslint-disable-next-line
        console.log(`### API Error! ${err.toString()}`);
      })

    },

    apiGetPodLogs(ns, pod) {
      return fetch(`${API_ENDPOINT}/getPodLogs/${ns}/${pod}`)
      .then(resp => {
        return resp.json();
      })
      .catch(err => {
        // eslint-disable-next-line
        console.log(`### API Error! ${err.toString()}`);
      })

    },
    
    apiGetNamespaces() {
      return fetch(`${API_ENDPOINT}/namespaces`)
      .then(resp => {
        return resp.json();
      })
      .catch(err => {
        // eslint-disable-next-line
        console.log(`### API Error! ${err.toString()}`);
      })
    },

    apiGetKubecostData()
    {
      return fetch(`${API_ENDPOINT}/kubecost`)
      .then(resp => {
        return resp.json();
      })
      .catch(err => {
        // eslint-disable-next-line
        console.log(`### API Error! ${err.toString()}`);
      })
    }
  }
}
