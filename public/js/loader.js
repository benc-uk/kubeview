// ================================================================
// Small JavaScript loader for dynamic HTML components & fragments
// ================================================================

const PATH = 'public/fragments'

window.addEventListener('DOMContentLoaded', () => {
  // Find all divs with data-fragment attribute and load their HTML content
  document.querySelectorAll('div[data-fragment]').forEach(async (el) => {
    const frag = el.getAttribute('data-fragment')
    if (frag) {
      const res = await fetch(`${PATH}/${frag}.html`)
      if (!res.ok) {
        console.error(`Failed to load HTML fragment: ${frag}`, res.statusText)
        return
      }
      const html = await res.text()
      el.innerHTML = html
    }
  })
})
