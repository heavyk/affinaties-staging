// hyper-hermes
// knicked from https://github.com/dominictarr/hyperscript
// many modifications...
// also took some inspiration from https://github.com/Raynos/mercury

import { attribute, hover, focus, select, event, on, off, listen, is_obv } from './observable'
import { define_getter, define_value, error } from '../utils'

export const win = window
export const doc = win.document
export const body = doc.body
export const location = doc.location
export const IS_LOCAL = ~location.host.indexOf('localhost')
export const basePath = location.pathname
export const origin = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')

/*
TODO ITEMS:
 * convert to short function syntax (and perhaps use this)
 * experiment with the idea of making the h function's context be attached to `this` - that way I could move contexts around and stuff
 * extract out the attribute setting function and make it available to the attribute observable so setting attributes will work properyly for shortcut syntax
 * test all the observable-array events to make sure there's no element smashing
*/

// add your own (or utilise this to make your code smaller!)
export var short_attrs = { s: 'style', c: 'class' }
export var common_tags = []

export const txt = (t) => doc.createTextNode(t)
export const comment = (t) => doc.createComment(t)

function context (createElement) {

  var cleanupFuncs = []

  // here's an idea: set cleanupFuncs as `this` in the function, and move these to another file
  // then, call like this `add_event.call(cleanupFuncs, el, listener, opts)`
  // furthermore, it may be wise to make the `cleanupFuncs = this` for all these type of functions
  const add_event = (e, event, listener, opts) => {
    on(e, event, listener, opts)
    cleanupFuncs.push(() => { off(e, event, listener, opts) })
  },
  // https://www.html5rocks.com/en/mobile/touchandmouse/
  // https://www.html5rocks.com/en/mobile/touch/
  // look into `passive: true` as a replacement for the `preventDefault` functionality.
  do_boink = (el, obv) => {
    cleanupFuncs.push(
      listen(el, 'click', false, () => { is_obv(obv) ? obv(!obv()) : obv() }),
      listen(el, 'touchstart', false, (e) => { e && e.preventDefault(); is_obv(obv) ? obv(!obv()) : obv() })
    )
  },
  do_press = (el, obv, pressed = true, normal = false) => {
    cleanupFuncs.push(
      listen(el, 'mouseup', false, () => { obv(normal) }),
      listen(el, 'mousedown', false, () => { obv(pressed) }),
      listen(el, 'touchend', false, (e) => { e && e.preventDefault(); obv(normal) }),
      listen(el, 'touchstart', false, (e) => { e && e.preventDefault(); obv(pressed) })
    )
  }


  function h(...args) {
    var e
    function item (l) {
      var r, s, i, o, k
      const parseSelector = (string) => {
        var v, m = string.split(/([\.#]?[a-zA-Z0-9_:-]+)/)
        if (/^\.|#/.test(m[1])) e = createElement('div')
        for (v of m) {
          if (typeof v === 'string' && (i = v.length)) {
            if (!e) {
              e = createElement(v, args)
            } else {
              if ((k = v[0]) === '.' || k === '#') {
                if (s = v.substring(1, i)) {
                  if (k === '.') e.classList.add(s)
                  else e.setAttribute('id', s)
                }
              }
            }
          }
        }
      }

      // enable a byte saving optimisation:
      // h(1,{value:11})
      //     vs.
      // h('input',{value:11})
      // when common_tags = ['div','input']
      //
      // however, it's less efficient if either a class or id is specified:
      // h(0,{c:'lala'})
      //     vs.
      // h('div.lala')
      //
      // though, maybe this idea can be further expanded to:
      // h('0.lala')
      //     vs.
      // h('div.lala')
      //     or,
      // h(2)
      // when common_tags = ['div','input','div.lala']

      if (!e && typeof l === 'number' && l < common_tags.length) e = parseSelector(common_tags[l])

      if (l != null)
      if (typeof l === 'string') {
        if (!e) {
          parseSelector(l)
        } else {
          e.aC(r = txt(l))
        }
      } else if (typeof l === 'number'
        || typeof l === 'boolean'
        || l instanceof Date
        || l instanceof RegExp ) {
          e.aC(r = txt(l.toString()))
      } else if (Array.isArray(l)) {
        e.aC(l, cleanupFuncs)
      } else if (isNode(l) || l instanceof win.Text) {
        e.aC(r = l)
      } else if (typeof l === 'object') {
        for (k in l) ((attr_val, _key) => {
          // convert short attributes to long versions. s -> style, c -> className
          var k = short_attrs[_key] || _key
          if (typeof attr_val === 'function') {
            // TODO: not sure which one is faster: regex or substr test
            // if (/^on\w+/.test(k)) {
            if (k.substr(0, 2) === 'on') {
              add_event(e, k.substr(2), attr_val, false)
            } else if (k.substr(0, 6) === 'before') {
              add_event(e, k.substr(6), attr_val, true)
            } else {
              // observable write-only value
              if ((s = attr_val()) != null) e.setAttribute(k, s)
              cleanupFuncs.push(attr_val((v) => {
                if (v != null) e.setAttribute(k, v)
              }))
              // to update the observable in real-time, one must listen to the events.
              // however, it changes -- for example, for input boxes, it's onkeyup.
              // for option boxes, it's onchange... etc.
              // there may be another solution though:
              // a mutation observer could be used to pick up changes in real-time
              // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationObserverInit
              // ----
              // cleanupFuncs.push(() => {
              //   var observer = new MutationObserver((mutations) => {
              //     for (var m of mutations)
              //       if (m.attributeName === k)
              //         attr_value(e[k])
              //   })
              //   observer.observe(e, {attributes: true, attributeFilter: [k]})
              //   return () => observer.disconnect()
              // }())
            }
          } else if (k === 'data') {
            for(s in attr_val) e.dataset[s] = attr_val[s]
          } else if (k === 'for') {
            e.htmlFor = attr_val
          } else if (k === 'class' && attr_val) {
            o = e.classList
            if (Array.isArray(attr_val)) for (s of attr_val) if (s) o.add(s)
            else o.add(attr_val)
          } else if ((i = (k === 'on')) || k === 'before') {
            // 'before' is used to denote the capture phase of event propagation
            // see: http://stackoverflow.com/a/10654134 to understand the capture / bubble phases
            // before: {click: (do) => something}
            if (typeof attr_val === 'object') {
              for (s in attr_val)
                if (typeof (o = attr_val[s]) === 'function')
                  add_event(e, s, o, i ? false : true)
            }
          } else if (k === 'html') {
            e.innerHTML = attr_val
          } else if (k === 'observe') {
            // I believe the set-timeout here is to allow the element time to be added to the dom.
            // it is likely that this is undesirable most of the time (because it can create a sense of a value 'popping' into the dom)
            // so, likely I'll want to move the whole thing out to a function which is called sometimes w/ set-timeout and sometimes not.
            setTimeout(((obj, e) => {
              for (s in obj) ((s, v) => {
                // observable
                switch (s) {
                  case 'input':
                    cleanupFuncs.push(attribute(e, obj[s+'.attr'], obj[s+'.on'])(v))
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
                    cleanupFuncs.push(do_boink(e, v))
                    break
                  case 'press':
                    cleanupFuncs.push(do_press(e, v))
                    break
                  default:
                  // case 'keyup':
                  // case 'keydown':
                  // case 'touchstart':
                  // case 'touchend':
                    if (!~s.indexOf('.')) {
                      if (typeof v !== 'function') error('observer must be a function')
                      cleanupFuncs.push(event(e, obj[s+'.attr'], obj[s+'.on'] || s, obj[s+'.event'])(v))
                    }
                }
              })(s, attr_val[s])
            }).bind(e, attr_val, e), 0)
          } else if (k === 'style') {
            if (typeof attr_val === 'string') {
              e.style.cssText = attr_val
            } else {
              set_style(e, attr_val, cleanupFuncs)
            }
          // no longer necessary because the setAttribute is always used (e[k] is no longer set directly)
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
              } else {
                console.error('unknown namespace for attribute:', k)
              }
            // } else if (k === 'src' && e.tagName === 'IMG' && ~attr_val.indexOf('holder.js')) {
            //   e.dataset.src = attr_val
            //   console.log('you are using holder ... fix this')
            //   // setTimeout(function () {
            //   //   require('holderjs').run({images: e})
            //   // },0)
            } else {
              // this won't work for svgs. for example, s('rect', {cx: 5}) will fail, as cx is a read-only property
              // e[k] = attr_val
              // console.log('set-attribute', k, attr_val)
              e.setAttribute(k, attr_val)
            }
          }
        })(l[k], k)
      } else if (typeof l === 'function') {
        r = obvNode(e, l, cleanupFuncs)
      }

      return r
    }

    while (args.length) {
      item(args.shift())
    }

    return e
  }

  h.cleanupFuncs = cleanupFuncs
  h.cleanup = () => {
    for (var i = 0; i < cleanupFuncs.length; i++) {
      cleanupFuncs[i]()
    }
  }

  return h
}

export function set_style (e, style, cleanupFuncs = []) {
  // if I use setProperty, then, 'borderRadius' will not work. (which is nice when using LiveScript, cause then the property does not need to be quoted)
  for (var s in style) ((s, v) => {
    if (typeof v === 'function') {
      // observable
      // e.style.setProperty(s, v())
      e.style[s] = v()
      cleanupFuncs.push(v((val) => {
        // e.style.setProperty(s, val)
        e.style[s] = val
      }))
    } else {
      // e.style.setProperty(s, v)
      e.style[s] = v
    }
  })(s, style[s])
}

export function isNode (el) {
  return el && el.nodeType
}

export function isText (el) {
  return el && el.nodeType == 3
}

export function arrayFragment (e, arr, cleanupFuncs) {
  var v, frag = doc.createDocumentFragment()
  var activeElement = (el) => el === (e.activeElement || doc.activeElement)
  // function deepActiveElement() {
  //   let a = doc.activeElement
  //   while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement
  //   return a
  // }

  // append nodes to the fragment, with parent node as e
  for (v of arr) frag.aC(makeNode(e, v, cleanupFuncs))

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
Object.defineProperty(special_elements, 'define', {value: (name, fn, args) => {
  // if (DEBUG) console.log('defining', name, args)
  win.customElements.define(name, fn)
  special_elements[name] = typeof args === 'number' ? args : Array.isArray(args) ? args.length : fn.length || 0
}})

export var h = new_dom_context(1)
export function new_dom_context (no_cleanup) {
  // TODO: turn this into ctx = new Context ((el, args) => { ... })
  //  -- and, turn the context fn into a class??
  var ctx = context((el, args) => {
    var i

    return !~el.indexOf('-') ? doc.createElement(el)
      : (i = special_elements[el]) !== undefined ? new (customElements.get(el))(...args.splice(0, i))
      : new (customElements.get(el))
  })

  if (!no_cleanup) h.cleanupFuncs.push(() => ctx.cleanup())
  ctx.context = new_dom_context
  return ctx
}

export var s = new_svg_context(1)
export function new_svg_context (no_cleanup) {
  var ctx = context((el) => doc.createElementNS('http://www.w3.org/2000/svg', el))

  if (!no_cleanup) s.cleanupFuncs.push(() => ctx.cleanup())
  ctx.context = new_svg_context
  return ctx
}

export function el_context (el) {
  var ctx
  while ((ctx = el._G) === undefined && (el = el.parentNode) != null) {}
  return ctx
}

export function global_context () {
  return new_context({h, s})
}

export function new_context (G = global_context()) {
  var cleanupFuncs = []
  var ctx = Object.create(G, {
    _h: define_value(null, true),
    _s: define_value(null, true),
    h: define_getter(() => ctx._h || (ctx._h = G.h.context())),
    s: define_getter(() => ctx._s || (ctx._s = G.s.context())),
    cleanupFuncs: define_value(cleanupFuncs),
    parent: define_value(G),
    cleanup: define_value((f) => {
      while (f = cleanupFuncs.pop()) f()
      if (ctx._h) ctx._h.cleanup()
      if (ctx._s) ctx._s.cleanup()
    })
  })
  return ctx
}

export const makeNode = (e, v, cleanupFuncs) => isNode(v) ? v
  : Array.isArray(v) ? arrayFragment(e, v, cleanupFuncs)
  : typeof v === 'function' ? (
    is_obv(v) ? obvNode(e, v, cleanupFuncs) : (() => {
      while (typeof v === 'function') v = v.call(e, e)
      return makeNode(e, v, cleanupFuncs)
    })()
  )
  : v == null ? comment('null') : txt(v)

export const obvNode = (e, v, cleanupFuncs = []) => {
  var r, o, nn, clean = [], placeholder
  if (typeof v === 'function') {
    if (is_obv(v)) {
      // observable
      e.aC(r = comment('obv value'))
      e.aC(placeholder = comment('obv bottom'))
      cleanupFuncs.push(v((val) => {
        nn = makeNode(e, val, cleanupFuncs)
        if (Array.isArray(r)) {
          for (val of r) e.rC(val)
        } else if (r) {
          if (r.parentNode === e) e.rC(r)
          // this should never really happen. probably some better way to report the error should be in order.
          else error('obv unable to replace child node because parentNode has changed')
        }

        e.iB(nn, placeholder)
        r = Array.isArray(val) ? val : nn
      }), () => { e.rC(placeholder) })
    } else {
      // normal function
      o = makeNode(e, v, cleanupFuncs)
      if (o != null) r = e.aC(o, cleanupFuncs)
    }
    r = makeNode(e, r, cleanupFuncs)
  } else {
    r = makeNode(e, v, cleanupFuncs)
  }
  return r
}

// shortcut to append multiple children (w/ cleanupFuncs)
Node.prototype.iB = function (el, ref, cleanupFuncs) { return this.insertBefore(obvNode(this, el, cleanupFuncs), ref) }
// shortcut to append multiple children (w/ cleanupFuncs)
Node.prototype.aC = function (el, cleanupFuncs) { return this.appendChild(obvNode(this, el, cleanupFuncs)) }
// shortcut to removeChild
Node.prototype.rC = function (child) { return this.removeChild(child) }
// shortcut to remove myself from the dom
Node.prototype.rm = function () { return this.parentNode.removeChild(this) }

export default h
