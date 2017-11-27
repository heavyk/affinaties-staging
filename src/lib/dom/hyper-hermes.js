// hyper-hermes
// knicked from https://github.com/dominictarr/hyperscript
// many modifications...
// also took some inspiration from https://github.com/Raynos/mercury

import { attribute, hover, focus, select, event, on, off } from './observable'
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

export const txt = (t) => doc.createTextNode(t)
export const comment = (t) => doc.createComment(t)

function context (createElement) {

  var cleanupFuncs = []

  const add_event = (e, event, listener, opts) => {
    on(e, event, listener, opts)
    cleanupFuncs.push(() => { off(e, event, listener, opts) })
  }


  function h(...args) {
    var e
    function item (l) {
      var r, s, i, o, k
      const parseClass = (string) => {
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

      if (l != null)
      if (typeof l === 'string') {
        if (!e) {
          parseClass(l)
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
            } else if (k.substr(0, 2) === 'imm') {
              add_event(e, k.substr(3), attr_val, true)
            } else {
              // observable
              if ((s = attr_val()) != null) e.setAttribute(k, s)
              if (typeof s === 'number' && isNaN(s)) debugger
              // console.log('set-attribute', k, s)
              cleanupFuncs.push(attr_val((v) => {
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
          } else if ((i = (k === 'on')) || k === 'imm') {
            // 'imm' is used to denote the capture phase of event propagation
            // see: http://stackoverflow.com/a/10654134 to understand the capture / bubble phases
            if (typeof attr_val === 'object') {
              for (s in attr_val)
                if (typeof (o = attr_val[s]) === 'function')
                  add_event(e, s, o, i ? false : true)
            }
          } else if (k === 'html') {
            e.innerHTML = attr_val
          // ------------------ testing ---------------
          } else if (k === 'observe') {
            setTimeout(((attr_val, e) => {
              for (s in attr_val) ((s, v) => {
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
                    if (!~s.indexOf('.')) {
                      if (typeof v !== 'function') debugger
                      cleanupFuncs.push(event(e, attr_val[s+'.attr'], attr_val[s+'.on'] || s, attr_val[s+'.event'])(v))
                    }
                }
              })(s, attr_val[s])
            }).bind(e, attr_val, e), 0)
          // ------------------ testing ---------------
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
  // var ctx = console.log(G, {
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

// export function context (G) {
//   var ctx = {_h: null, _s: null}
//   Object.defineProperties(ctx, {
//     h: define_getter(() => ctx._h || (ctx._h = G.h.context())),
//     s: define_getter(() => ctx._s || (ctx._s = G.s.context())),
//     parent: define_value(G),
//     cleanup: define_value(() => {
//       if (ctx._h) ctx._h.cleanup()
//       if (ctx._s) ctx._s.cleanup()
//     })
//   })
//   return Object.create(G, ctx)
//   return ctx
// }

// export CTX = {h, s, cleanupFuncs: []}

export const makeNode = (e, v, cleanupFuncs) => isNode(v) ? v
  : Array.isArray(v) ? arrayFragment(e, v, cleanupFuncs)
  : v == null ? comment('null') : txt(v)

export const obvNode = (e, v, cleanupFuncs = []) => {
  var r, o, i, nn
  if (typeof v === 'function') {
    i = v.observable === 'value' ? 1 : 0
    // var o = i ? v.call(e) : v.call(e, e) // call the observable / scope function
    // o = i ? undefined : v.call(e, e) // call the observable / scope function
    // if it returns anything, we'll append the value (node, array, observable, or some text)
    if (!i && (o = v.call(e, e)) && o !== undefined) {
      r = e.aC(o, cleanupFuncs)
    }
    if (i) { // it's an observable!
      // create a comment to be replaced by the value as soon as it comes
      r = e.aC(comment('obv'), cleanupFuncs)

      cleanupFuncs.push(v((val) => {
        // TODO: make this work with arrays (eg. obv can be called with an element or an array without a problem)
        if (Array.isArray(val)) error('obvs replacing arrays of elements will probably break stuff')
        // TODO: check observable-array cleanup
        nn = makeNode(e, val, cleanupFuncs)
        if (Array.isArray(r)) {
          // document fragment
          // TODO: in the case where r has previousSibling or nextSibling (an element before or after), then insertBefore should be used instead of appendChild
          //       for now though, this is ok
          for (val of r) e.removeChild(val)
          e.aC(nn)
        } else if (r.parentNode === e) {
          // TODO: in the case where val is an array, I don't think we cannot replaceChild. (check it)
          e.replaceChild(nn, r)
          // if (r.nodeName === "#document-fragment") debugger
        } else {
          error('obv unable to replace child node because parentNode is not correct')
        }
        r = Array.isArray(val) ? val : nn
      }))
    }
    r = makeNode(e, r, cleanupFuncs)
  } else {
    r = makeNode(e, v, cleanupFuncs)
  }
  return r
}

// shortcut to append multiple children (w/ cleanupFuncs)
Node.prototype.aC = function (v, cleanupFuncs) { return this.appendChild(obvNode(this, v, cleanupFuncs)) }
// shortcut to removeChild
Node.prototype.rC = function (child) { return this.removeChild(child) }
// shortcut to remove myself from the dom
Node.prototype.rm = function () { return this.parentNode.removeChild(this) }

export default h
