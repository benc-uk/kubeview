
export default {
  methods: {
    apiGetDataForNamespace(ns) {
      return fetch(`http://localhost:3000/api/scrape/${ns}`)
      .then(resp => {
        return resp.json();
      })
      .catch(err => {
        // eslint-disable-next-line
        console.log(`### API Error! ${err}`);
      })
    },
    
    apiGetNamespaces() {
      return fetch(`http://localhost:3000/api/namespaces`)
      .then(resp => {
        return resp.json();
      })
      .catch(err => {
        // eslint-disable-next-line
        console.log(`### API Error! ${err}`);
      })
    }    
  }
}