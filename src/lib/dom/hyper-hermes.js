// hyper-hermes
// knicked from https://github.com/dominictarr/hyperscript
// many modifications...
// also took some inspiration from https://github.com/Raynos/mercury

// TODO: to make errors a bit more user-friedly, I began utilising the error function.
//       however, when building the plugin library, an errorless version should be created (to reduce size)
//       additionally, other things unnecessary (old/unused) things can be omitted as wel, for further savings.

import { is_obv } from './observable'
import { observe, add_event } from './observable-event'
import { define_prop, define_value, error } from '../utils'
import { new_ctx } from './hyper-ctx'

import { win, doc, customElements } from './dom-base'
import { isNode, txt, comment } from './dom-base'

// add your own (or utilise this to make your code smaller!)
export var short_attrs = { s: 'style', c: 'className', class: 'className', for: 'htmlFor' }

// can be used to save bytes:
// h(1,{value:11})
//     vs.
// h('input',{value:11})
// when common_tags = ['div','input']
//
// however, it's less efficient if either a class or id has to be specified:
// h(0,{c:'lala'})
//     vs.
// h('div.lala')
//
// this does not currently work (but it could):
// h('0.lala')
//     vs.
// h('div.lala')
//
// however this does:
// h(2)
// when common_tags = ['div','input','div.lala']
export var common_tags = []

function context (createElement) {
  var cleanupFuncs = []

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
                  else e.id = s
                }
              }
            }
          }
        }
      }

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
        for (k in l) set_attr(e, k, l[k], cleanupFuncs)
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

export function set_attr (e, key_, v, cleanupFuncs = []) {
  // convert short attributes to long versions. s -> style, c -> className
  var s, o, i, k = short_attrs[key_] || key_
  if (typeof v === 'function') {
    setTimeout(() => {
      if (k === 'boink') {
        observe.call(cleanupFuncs, e, {boink: v})
      } else if (k === 'press') {
        observe.call(cleanupFuncs, e, {press: v})
      } else if (k === 'hover') {
        observe.call(cleanupFuncs, e, {hover: v})
      } else if (k === 'focused') {
        observe.call(cleanupFuncs, e, {focus: v})
      } else if (k === 'selected') {
        observe.call(cleanupFuncs, e, {select: v})
      } else if (k === 'input') {
        observe.call(cleanupFuncs, e, {input: v})
      } else if (k.substr(0, 2) === 'on') {
        add_event.call(cleanupFuncs, e, k.substr(2), v, false)
      } else if (k.substr(0, 6) === 'before') {
        add_event.call(cleanupFuncs, e, k.substr(6), v, true)
      } else {
        // setAttribute was used here, primarily for svg support.
        // we may need to make a second version or something which works well with svg, perhaps instead using setAttributeNode
        // however, as mentioned in this article it may be desirable to use property access instead
        // https://stackoverflow.com/questions/22151560/what-is-happening-behind-setattribute-vs-attribute
        // observable (write-only) value
        if ((s = v()) != null) e[k] = s
        cleanupFuncs.push(v((v) => {
          set_attr(e, k, v, cleanupFuncs)
        }))
        s = e.nodeName
        s === "INPUT" && observe.call(cleanupFuncs, e, {input: v})
        s === "SELECT" && observe.call(cleanupFuncs, e, k === 'label' ? {select_label: v} : {select: v})
      }
    }, 0)
  } else {
    if (k === 'data') {
      if (typeof v === 'object')
        for(s in v) e.dataset[s] = v[s]
      else error('data property should be passed as an object')
    } else if (k === 'multiple') {
      e.multiple = !!v
    } else if (k === 'contenteditable') {
      e.contentEditable = !!v
    } else if (k === 'autofocus') {
      setTimeout(() => e.focus(), 10)
    } else if (k === 'autoselect') {
      setTimeout(() => {
        e.focus()
        var range = [v[0] || 0, v[1] || -1]
        e.setSelectionRange.apply(e, range)
      }, 10)
    } else if (k === 'selected') {
      e.defaultSelected = !!v
    } else if (k === 'checked') {
      e.defaultChecked = !!v
    } else if (k === 'value') {
      e.defaultValue = e.value = v
    } else if (k === 'for') {
      e.htmlFor = v
    } else if (k === 'class') {
      if (v) {
        o = e.classList
        if (Array.isArray(v)) for (s of v) s && o.add(s)
        else o.add(v)
      }
    } else if ((i  = (k === 'on')) || k === 'before') {
      // 'before' is used to denote the capture phase of event propagation
      // see: http://stackoverflow.com/a/10654134 to understand the capture / bubble phases
      // before: {click: (do) => something}
      if (typeof v === 'object') {
        for (s in v)
          if (typeof (o = v[s]) === 'function')
            add_event.call(cleanupFuncs, e, s, o, i ? false : true)
      }
    } else if (k === 'html') {
      e.innerHTML = v
    } else if (k === 'observe') {
      // I believe the set-timeout here is to allow the element time to be added to the dom.
      // it is likely that this is undesirable most of the time (because it can create a sense of a value 'popping' into the dom)
      // so, likely I'll want to move the whole thing out to a function which is called sometimes w/ set-timeout and sometimes not.
      setTimeout(observe.bind(cleanupFuncs, e, v), 0)
      // observe.call(cleanupFuncs, e, v)
    } else if (k === 'style') {
      if (typeof v === 'string') {
        e.style.cssText = v
      } else {
        set_style(e, v, cleanupFuncs)
      }
    } else if (~k.indexOf('-')) {
      // in weird cases with stuff like data- or other attrs containing hyphens, use setAttribute
      e.setAttribute(k, v)
    } else if (typeof v !== 'undefined') {
      // for namespaced attributes, such as xlink:href
      // (I'm really not aware of any others than xlink... PRs accepted!)
      // ref: http://stackoverflow.com/questions/7379319/how-to-use-creatensresolver-with-lookupnamespaceuri-directly
      // ref: https://developer.mozilla.org/en-US/docs/Web/API/Document/createNSResolver
      if (~(i = k.indexOf(':'))) {
        if (k.substr(0, i) === 'xlink') {
          e.setAttributeNS('http://www.w3.org/1999/xlink', k.substr(++i), v)
        } else {
          error('unknown namespace for attribute: ' + k)
        }
      } else {
        // this won't work for svgs. for example, s('rect', {cx: 5}) will fail, as cx is a read-only property
        // however, it is worth noting that setAttribute is about 30% slower than setting the property directly
        // https://jsperf.com/setattribute-vs-property-assignment/7
        // should check memory requirements, but because of the weirdness associated with mixing property and value,
        // it may be prudent to use property access unless it's a svg (or some other non-standard) context.
        e[k] = v
        // e.setAttribute(k, v)
      }
    }
  }
}

export function set_style (e, style, cleanupFuncs = []) {
  // if I use setProperty, then, 'borderRadius' will not work. (which is nice when using LiveScript, cause then the property does not need to be quoted)
  if (typeof style === 'object') {
    for (var s in style) ((s, v) => {
      if (typeof v === 'function') {
        // observable
        // e.style.setProperty(s, v())
        e.style[s] = v()
        cleanupFuncs.push(v((val) => {
          // console.log(e, 'style:', s, e.style[s], '->', val)
          // e.style.setProperty(s, val)
          e.style[s] = val
        }))
      } else {
        // e.style.setProperty(s, v)
        e.style[s] = v
      }
    })(s, style[s])
  } else {
    e.setAttribute('style', style)
  }
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
define_prop(special_elements, 'define', define_value((name, fn, args) => {
  // if (DEBUG) console.log('defining', name, args)
  customElements.define(name, fn)
  special_elements[name] = typeof args === 'number' ? args : Array.isArray(args) ? args.length : fn.length || 0
}))

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
