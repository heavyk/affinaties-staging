// commonly used globals exported (to save a few bytes)
export const win = window
export const doc = win.document
export const body = doc.body
export const getComputedStyle = win.getComputedStyle
export const customElements = win.customElements
export const location = doc.location
export const IS_LOCAL = ~location.host.indexOf('localhost')
export const basePath = location.pathname
export const origin = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')

// shortcut document creation functions
export const txt = (t) => doc.createTextNode(t)
export const comment = (t) => doc.createComment(t)

export const isNode = (el) => el && el.nodeType
export const isText = (el) => el && el.nodeType == 3
export const getElementById = (el) => typeof el === 'string' ? doc.getElementById(el) : el

export function scrollTo (id_or_el) {
  var el = typeof id_or_el === 'string' ? doc.getElementById(id_or_el) : id_or_el

  return !el ? null : isNode(el)
    ? win.scrollBy(0, el.getBoundingClientRect().top)
    : win.scrollTo(0, 0)
}

export function getStyleProperty (element, prop) {
  var st = element.currentStyle
  return st ? st[prop]
    : getComputedStyle ? getComputedStyle(element, null).getPropertyValue(prop)
    : element.style[prop]
}
