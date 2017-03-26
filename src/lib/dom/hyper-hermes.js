// hyper-hermes
// knicked from https://github.com/dominictarr/hyperscript
// many modifications...
// also took some inspiration from https://github.com/Raynos/mercury

import { attribute, hover, focus, select, event, on, off } from './observable'

export const doc = window.document
export const body = doc.body
export const IS_LOCAL = ~doc.location.host.indexOf('localhost')

/*
TODO ITEMS:
 * convert to short function syntax (and perhaps use this)
 * experiment with the idea of making the h function's context be attached to `this` - that way I could move contexts around and stuff
 * extract out the attribute setting function and make it available to the attribute observable so setting attributes will work properyly for shortcut syntax
 * test all the observable-array events to make sure there's no element smashing
*/

// add your own (or utilise this to make your code smaller!)
export var short_attrs = { s: 'style', c: 'class' }

export function txt (t) {
  return doc.createTextNode(t)
}

function context (createElement) {

  var cleanupFuncs = []

  function add_event (e, event, listener, opts) {
    on(e, event, listener, opts)
    cleanupFuncs.push(() => { off(e, event, listener, opts) })
  }


  function h() {
    var args = [].slice.call(arguments), e = null
    function item (l) {
      var r, s, i, o, k
      function parseClass (string) {
        var v, m = string.split(/([\.#]?[a-zA-Z0-9_:-]+)/)
        if (/^\.|#/.test(m[1])) e = createElement('div')
        for (v of m) {
          if (typeof v === 'string' && (i = v.length)) {
            if (!e) {
              e = createElement(v, args)
            } else {
              s = v.substring(1, i)
              if (v[0] === '.') {
                e.classList.add(s)
              } else if (v[0] === '#') {
                e.setAttribute('id', s)
              }
            }
          }
        }
      }

      if (l != null)
      if (typeof l === 'string') {
        if (!e) {
          parseClass(l)
        } else {
          e.appendChild(r = txt(l))
        }
      } else if (typeof l === 'number'
        || typeof l === 'boolean'
        || l instanceof Date
        || l instanceof RegExp ) {
          e.appendChild(r = txt(l.toString()))
      } else if (Array.isArray(l)) {
        e.aC(l, cleanupFuncs)
      } else if (isNode(l) || l instanceof window.Text) {
        e.appendChild(r = l)
      } else if (typeof l === 'object') {
        for (k in l) (function (attr_val, _key) {
          // convert short attributes to long versions. s -> style, c -> className
          var k = short_attrs[_key] || _key
          if (typeof attr_val === 'function') {
            // TODO: not sure which one is faster: regex or substr test
            // if (/^on\w+/.test(k)) {
            if (k.substr(0, 2) === 'on') {
              add_event(e, k.substr(2), attr_val, false)
            } else {
              // observable
              if ((s = attr_val()) != null) e.setAttribute(k, s)
              // console.log('set-attribute', k, s)
              cleanupFuncs.push(attr_val(function (v) {
                if (v != null) e.setAttribute(k, v)
                // console.log('set attribute', k, '->', v)
              }))
            }
          } else if (k === 'data') {
            for(s in attr_val) e.dataset[s] = attr_val[s]
          } else if (k === 'for') {
            e.htmlFor = attr_val
          } else if (k === 'class' && attr_val) {
            o = e.classList
            if (Array.isArray(attr_val)) for (s of attr_val) if (s) o.add(s)
            else o.add(attr_val)
          } else if (k === 'on') {
            if (typeof attr_val === 'object') {
              for (s in attr_val)
                if (typeof (o = attr_val[s]) === 'function')
                  add_event(e, s, o, false)
            }
          } else if (k === 'capture') {
            if (typeof attr_val === 'object') {
              for (s in attr_val)
                if (typeof (o = attr_val[s]) === 'function')
                  add_event(e, s, o, true)
            }
          } else if (k === 'html') {
            e.innerHTML = attr_val
          // ------------------ testing ---------------
          } else if (k === 'observe') {
            setTimeout((function (attr_val, e) {
              for (s in attr_val) (function (s, v) {
                // observable
                switch (s) {
                  case 'input':
                    cleanupFuncs.push(attribute(e, attr_val[s+'.attr'], attr_val[s+'.on'])(v))
                    break
                  case 'hover':
                    cleanupFuncs.push(hover(e)(v))
                    break
                  case 'focus':
                    cleanupFuncs.push(focus(e)(v))
                    break
                  case 'select':
                    cleanupFuncs.push(select(e)(v))
                    break
                  case 'boink':
                    // cleanupFuncs.push(select(e)(v))
                    console.log('TODO: mouse/touch events')
                    debugger
                    break
                  default:
                  // case 'keyup':
                  // case 'keydown':
                  // case 'touchstart':
                  // case 'touchend':
                    cleanupFuncs.push(event(e, attr_val[s+'.attr'], attr_val[s+'.on'] || s, attr_val[s+'.event'])(v))
                }
              })(s, attr_val[s])
            }).bind(e, attr_val, e), 0)
          // ------------------ testing ---------------
          } else if (k === 'style') {
            if (typeof attr_val === 'string') {
              e.style.cssText = attr_val
            } else {
              // if I use setProperty, then, 'borderRadius' will not work. (which is nice when using LiveScript, cause then the property does not need to be quoted)
              for (s in attr_val) (function (s, v) {
                if (typeof v === 'function') {
                  // observable
                  // e.style.setProperty(s, v())
                  e.style[s] = v()
                  cleanupFuncs.push(v(function (val) {
                    // e.style.setProperty(s, val)
                    e.style[s] = val
                  }))
                } else {
                  // e.style.setProperty(s, attr_val[s])
                  e.style[s] = attr_val[s]
                }
              })(s, attr_val[s])
            }
          // not necessary because the following clause will work just fine (e[k] is no longer set derectly)
          // } else if (k.substr(0, 5) === "data-") {
          //   e.setAttribute(k, attr_val)
          } else if (typeof attr_val !== 'undefined') {
            // for namespaced attributes, such as xlink:href
            // (I'm really not aware of any others than xlink... PRs accepted!)
            // ref: http://stackoverflow.com/questions/7379319/how-to-use-creatensresolver-with-lookupnamespaceuri-directly
            // ref: https://developer.mozilla.org/en-US/docs/Web/API/Document/createNSResolver
            if (~(i = k.indexOf(':'))) {
              if (k.substr(0, i) === 'xlink') {
                e.setAttributeNS('http://www.w3.org/1999/xlink', k.substr(++i), attr_val)
              }
            // } else if (k === 'src' && e.tagName === 'IMG' && ~attr_val.indexOf('holder.js')) {
            //   e.dataset.src = attr_val
            //   console.log('you are using holder ... fix this')
            //   // setTimeout(function () {
            //   //   require('holderjs').run({images: e})
            //   // },0)
            } else {
              // e[k] = attr_val
              // console.log('set-attribute', k, attr_val)
              e.setAttribute(k, attr_val)
            }
          }
        })(l[k], k)
      } else if (typeof l === 'function') {
        r = obvNode.call(e, l, cleanupFuncs)
      }

      return r
    }
    while (args.length) {
      item(args.shift())
    }

    return e
  }

  h.cleanupFuncs = cleanupFuncs
  h.cleanup = function () {
    for (var i = 0; i < cleanupFuncs.length; i++) {
      cleanupFuncs[i]()
    }
  }

  return h
}

export function isNode (el) {
  return el && el.nodeType
}

export function isText (el) {
  return el && el.nodeType == 3
}

export function arrayFragment (e, arr, cleanupFuncs) {
  var v, frag = doc.createDocumentFragment()
  var activeElement = (o) => o === (e.activeElement || doc.activeElement)

  // append nodes to the fragment, with parent node as e
  for (v of arr) frag.appendChild(makeNode.call(e, v, cleanupFuncs))

  if (arr.observable === 'array') {
    // TODO: add a comment to know where the array begins and ends (a la angular)
    function onchange (ev) {
      var i, j, o, oo
      switch (ev.type) {
      case 'unshift':
        for (i = ev.values.length - 1; i >= 0; i--)
          e.insertBefore(isNode(o = ev.values[i]) ? o : txt(o), arr[0])
        break
      case 'push':
        for (i = 0; i < ev.values.length; i++)
          e.insertBefore(isNode(o = ev.values[i]) ? o : txt(o), arr[arr.length + ev.values.length - i - 1])
        break
      case 'pop':
        e.removeChild(arr[arr.length-1])
        break
      case 'shift':
        e.removeChild(arr[0])
        break
      case 'splice':
        j = ev.idx
        if (ev.remove) for (i = 0; i < ev.remove; i++)
          e.removeChild(arr[j + i])
        if (ev.add) for (i = 0; i < ev.add.length; i++)
          e.insertBefore(isNode(o = ev.add[i]) ? o : txt(o), arr[j])
        break
      case 'sort':
        // technically no longer used, but still exists mainly for comparison purposes
        // although less element swaps are done, with quiksort, it may be taxing on paint performance...
        // looking into it eventually :)
        for (i = 0, oo = ev.orig; i < arr.length; i++) {
          o = arr[i]
          if (i !== (j = oo.indexOf(o))) {
            if (activeElement(o) || o.focused === 1) i = 1
            e.removeChild(o)
            e.insertBefore(o, arr[i - 1])
            if (i === 1) o.focus(), o.focused = 0
          }
        }
        break
      case 'replace':
        o = ev.val
        oo = ev.old
        if (activeElement(o) || o.focused === 1) i = 1
        if (activeElement(oo)) oo.focused = 1
        e.replaceChild(o, oo)
        if (i === 1) o.focus(), o.focused = 0
        break
      case 'insert':
        e.insertBefore(ev.val, arr[ev.idx])
        break
      case 'reverse':
        for (i = 0, j = +(arr.length / 2); i < j; i++)
          arr.emit('change', {type: 'swap', from: i, to: arr.length - i - 1 })
        break
      case 'move':
        o = arr[ev.from]
        if (activeElement(o)) i = 1
        e.insertBefore(o, arr[ev.to])
        if (i === 1) o.focus()
        break
      case 'swap':
        ev.j = h('div.swap', o = {s: {display: 'none'}})
        ev.k = h('div.swap', o)
        oo = arr[ev.from]
        o = arr[ev.to]
        if (activeElement(o)) i = 1
        else if (activeElement(oo)) i = 2
        e.replaceChild(ev.j, oo)
        e.replaceChild(ev.k, o)
        e.replaceChild(o, ev.j)
        e.replaceChild(oo, ev.k)
        if (i === 1) o.focus()
        else if (i === 2) oo.focus()
        break
      case 'remove':
        e.removeChild(arr[ev.idx])
        break
      case 'set':
        e.replaceChild(ev.val, arr[ev.idx])
        break
      case 'empty':
        for (i = 0; i < arr.length; i++)
          e.removeChild(arr[i])
        break
      default:
        console.log('unknown event', ev)
      }
    }

    arr.on('change', onchange)
    cleanupFuncs.push(() => { arr.off('change', onchange) })
  }
  return frag
}

export function offsetOf (child) {
  var i = 0
  while ((child = child.previousSibling) != null) i++
  return i
}

export var special_elements = {}

export function dom_context () {
  return context(function (el, args) {
    var i

    return !~el.indexOf('-') ? doc.createElement(el)
      : (i = special_elements[el]) !== undefined ? new (customElements.get(el))(...args.splice(0, i || 2)) // 2 is default? I can't think of a good reason why it shouldn't be 1 or 0 ...
      : new (customElements.get(el))
  })
}

export var h = dom_context()
h.context = dom_context

export function svg_context () {
  return context(function (el) {
    return doc.createElementNS('http://www.w3.org/2000/svg', el)
  })
}

export var s = svg_context()
s.context = svg_context

export function makeNode (v, cleanupFuncs) {
  return isNode(v) ? v
    : Array.isArray(v) ? arrayFragment(this, v, cleanupFuncs)
    : txt(v)
}

export function obvNode (v, cleanupFuncs = []) {
  var r, e = this
  if (typeof v === 'function') {
    var i = v.observable && v.observable === 'value' ? 1 : 0
    var o = i ? v.call(e) : v.call(e, e) // call the observable / scope function
    // if it returns anything, we'll append the value (node, array, observable, or some text)
    if (o !== undefined) {
      r = e.aC(o, cleanupFuncs)
    }
    if (i) { // it's an observable!
      // if the observable does not yet have a value, create a comment to be replaced by the value as soon as it comes
      if (!r) r = e.aC(doc.createComment('obv'), cleanupFuncs)

      // TODO: allow for an observable-array implementation
      cleanupFuncs.push(v((val) => {
        // TODO: check observable-array cleanup
        if (r.parentElement === e) {
          val = makeNode.call(e, val, cleanupFuncs)
          e.replaceChild(val, r), r = val
        } else {
          // shouldn't happen, but maybe if removing the node from the dom, this could happen.
          // prolly will want to remove itself from the listeners
          // o = v, o()
          debugger
        }
      }))
    }
    r = makeNode.call(e, r, cleanupFuncs)
  } else {
    r = makeNode.call(e, v, cleanupFuncs)
  }
  return r
}

// shortcut to append multiple children (w/ cleanupFuncs)
HTMLElement.prototype.aC =
SVGElement.prototype.aC =
function (v, cleanupFuncs) {
  return this.appendChild(obvNode.call(this, v, cleanupFuncs))
}

export default h
