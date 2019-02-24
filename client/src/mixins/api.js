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
    
    apiGetNamespaces() {
      return fetch(`${API_ENDPOINT}/namespaces`)
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