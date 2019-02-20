<template>
  <div class="hello">
    <cytoscape :config="config" style="width: 100%; height: 600px">
      <cy-element v-for="e in elements" :key="`${e.data.id}`" :definition="e" />
    </cytoscape>
  </div>
</template>

<script>
const config = {
  // elements: [
  //   { // node a
  //     data: { id: 'a' }
  //   }, { // node b
  //     data: { id: 'b' }
  //   }, { // edge ab
  //     data: { id: 'ab', source: 'a', target: 'b' }
  //   }
  // ],
  style: [
    {
      selector: 'node',
      style: {
        'background-color': '#00ff00',
        'label': 'data(id)'
      }
    }, {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle'
      }
    }
  ],
  layout: {
    name: 'breadthfirst'
  }
}

export default {
  name: 'HelloWorld',

  data() {
    return {
      config: config,
      elements: [
        { data: {id: 'a'} },
        { data: {id: 'b'} },
        { data: {id: 'c'} },

        { data: { id: 'ab', source: 'a', target: 'b' } },
        { data: { id: 'ac', source: 'a', target: 'c' } }
      ]
    }
  }
}
</script>

<style scoped>

</style>
