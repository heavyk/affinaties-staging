'use strict'

import { define_value, forEach } from '../utils'
// import isEqual from '../lodash/isEqual'

// knicked from: https://github.com/dominictarr/observable/blob/master/index.js
// mostly unmodified...
// * exported classes
// * remove utility functions (micro-optimization, reduces readability)
// * change from object traversal to arrays
//  * change all() from `for (var k in ary) ary[k](val)` -> `for (var i = 0; i < ary.length; i++) ary[i](val)`
//  * then, in remove() use `.splice` instead of `delete`. however, to avoid the case that a listener is removed inside of a listener, I instead splice inside of a setTimeout (crappy solution, I know...)
//  °-> this can potentially be improved. I'll have to look into it a bit better. perhaps using a `Map` or a linked list?
// * add .observable property to all returned functions (necessary for hyper-hermes to know that it's an observable instead of a context)
// * changed `value` to only propagate when the value has actually changed. to force all liseners to receive the current value, `call observable.set()` or `observable.set(observable())`
// (TODO) use isEqual function to compare values before setting the observable
// (TODO) add better documentation for each function
// (TODO) add a remove function to bind1, bind2
// (TODO) add int_value (which has math functions add, mul, etc.)


// bind a to b -- One Way Binding
export function bind1 (a, b) {
  a(b())
  return b(a)
}

//bind a to b and b to a -- Two Way Binding
export function bind2 (a, b) {
  b(a())
  var r0 = a(b), r1 = b(a)
  return () => { r0(); r1() } // remove function
}

//trigger all listeners
function emit (ary, val2, val) {
  for (var i = 0; i < ary.length; i++) ary[i](val, val2)
}

// remove a listener
export function remove (ary, item) {
  var i = ary.indexOf(item)
  if (~i) setTimeout(() => { ary.splice(i, 1) }, 1)
  // else debugger
}

// register a listener
export function on (emitter, event, listener, opts = false) {
  (emitter.on || emitter.addEventListener)
    .call(emitter, event, listener, opts)
}

// unregister a listener
export function off (emitter, event, listener, opts = false) {
  (emitter.removeListener || emitter.removeEventListener || emitter.off)
    .call(emitter, event, listener, opts)
}

// An observable that stores a value.
export function value (initialValue) {
  // if the value is already an observable, then just return it
  if (typeof initialValue === 'function' && initialValue.observable === 'value') return initialValue
  var _val = initialValue, listeners = []
  observable.set = (val) => emit(listeners, _val, _val = val === undefined ? _val : val)
  observable.observable = 'value'
  return observable

  function observable (val) {
    return (
      val === undefined ? _val                                                               // getter
    // : typeof val !== 'function' ? emit(listeners, _val, _val = val)                       // this is the old way.. it'll always emit, even if the value is the same
    : typeof val !== 'function' ? (!(_val === val) ? emit(listeners, _val, _val = val) : '') // setter (the new way - only sets if the value has changed)
    : (listeners.push(val), (_val === undefined ? _val : val(_val)), () => {                 // listener
        remove(listeners, val)
      })
    )
  }
}

// An observable that stores a number value.
export function number (initialValue) {
  // if the value is already an observable, then just return it
  if (typeof initialValue === 'function' && initialValue.observable === 'value') return initialValue
  var _val = initialValue, listeners = []
  observable.set = (val) => emit(listeners, _val, _val = val === undefined ? _val : val)
  observable.add = (val) => observable(_val + (typeof val === 'function' ? val() : val))
  observable.mul = (val) => observable(_val * (typeof val === 'function' ? val() : val))
  observable.observable = 'value'
  return observable

  function observable (val) {
    return (
      val === undefined ? _val                                                               // getter
    // : typeof val !== 'function' ? emit(listeners, _val, _val = val)                       // this is the old way.. it'll always emit, even if the value is the same
    : typeof val !== 'function' ? (!(_val === val) ? emit(listeners, _val, _val = val) : '') // setter (the new way - only sets if the value has changed)
    : (listeners.push(val), (_val === undefined ? _val : val(_val)), () => {                 // listener
        remove(listeners, val)
      })
    )
  }
}

// an observable object
export function object (initialValue, _keys) {
  // if the value is already an observable, then just return it
  if (initialValue && initialValue.observable === 'object') return initialValue

  var obj = {}
  var obvs = {}
  var keys = []
  for (let k of Array.isArray(_keys) ? _keys : Object.keys(initialValue)) {
    let v = initialValue[k]
    if (v !== undefined) {
      if (v.observable) obvs[k] = v
      keys.push(k)
    }
  }

  var props = {
    observable: define_value('object'),
    // TODO: implement get/set,on/off for compatibility with scuttlebutt?
    set: define_value((v) => {
      for (let k of keys) {
        if (obvs[k] && v[k]) obvs[k](v[k])
      }
    })
  }
  for (let k of keys) props[k] = { get: () => obvs[k] || (obvs[k] = value(initialValue[k])) }
  Object.defineProperties(obj, props)

  return obj
}

/*
##property
observe a property of an object, works with scuttlebutt.
could change this to work with backbone Model - but it would become ugly.
*/

export function property (model, key) {
  observable.observable = 'property'
  return observable

  function observable (val) {
    return (
      val === undefined ? model.get(key)
    : typeof val !== 'function' ? model.set(key, val)
    : (on(model, 'change:'+key, val), val(model.get(key)), () => {
        off(model, 'change:'+key, val)
      })
    )
  }
}

export function transform (obv, down, up) {
  if (typeof obv !== 'function')
    error('transform expects an observable')

  observable.observable = 'value'
  return observable

  function observable (val) {
    return (
      val === undefined ? down(obv())
    : typeof val !== 'function' ? obv((up || down)(val))
    : obv((_val) => { val(down(_val)) })
    )
  }
}

export function px (observable) {
  return transform(observable, (v) => v + 'px')
}

export function listen (element, event, attr, listener) {
  function onEvent () {
    listener(typeof attr === 'function' ? attr() : element[attr])
  }
  on(element, event, onEvent)
  onEvent()
  return () => { off(element, event, onEvent) }
}

//observe html element - aliased as `input`
export function attribute (element, _attr, _event) {
  var attr = _attr !== void 0 ? _attr : 'value'
  var event = _event !== void 0 ? _event : 'input'
  observable.observable = 'attribute'
  return observable

  function observable (val) {
    return (
      val === undefined ? element[attr]
    : typeof val !== 'function' ? element[attr] = val
    : listen(element, event, attr, val)
    )
  }
}

// observe a select element
export function select (element) {
  function _attr () {
    return element[element.selectedIndex].value
  }
  function _set(val) {
    for (var i = 0; i < element.options.length; i++) {
      if (element.options[i].value == val) element.selectedIndex = i
    }
  }
  observable.observable = 'select'
  return observable

  function observable (val) {
    return (
      val === undefined ? element.options[element.selectedIndex].value
    : typeof val !== 'function' ? _set(val)
    : listen(element, 'change', _attr, val)
    )
  }
}

//toggle based on an event, like mouseover, mouseout
export function toggle (el, up_event, down_event) {
  var i = false
  observable.observable = 'toggle'
  return observable

  function observable (val) {
    function onUp() {
      i || val(i = true)
    }
    function onDown () {
      i && val(i = false)
    }
    return (
      val === undefined ? i
    : typeof val !== 'function' ? undefined //read only
    : (on(el, up_event, onUp), on(el, down_event || up_event, onDown), val(i), () => {
        off(el, up_event, onUp); off(el, down_event || up_event, onDown)
      })
    )
  }
}

export function error (message) {
  throw new Error(message)
}

// TODO: I believe this needs a remove function which removes all listeners
//  (unfortunately, it requires the modification of value())
// TODO: now that I can remove the listeners to observables, figure out where this is actually useful
export function compute (observables, compute) {
  var init = 1, l = observables.length
  var cur = new Array(l)
  var listeners = [], removables = [], _val, f

  for (let i = 0; i < l; i++) {
    f = observables[i]
    if (typeof f === 'function') {
      removables.push(f((v) => {
        var prev = cur[i]
        cur[i] = v
        if (prev !== v && init === 0) observable(compute.apply(null, cur))
      }))
    } else {
      cur[i] = f
    }
  }

  _val = compute.apply(null, cur)
  observable.observable = 'value'
  init = 0

  return observable

  function observable (val) {
    return (
      val === undefined ? _val                                                               // getter
    : typeof val !== 'function' ? (!(_val === val) ? emit(listeners, _val, _val = val) : '') // setter (the new way - only sets if the value has changed)
    : (listeners.push(val), (_val === undefined ? _val : val(_val)), () => {                 // listener
        remove(listeners, val)
      })
    )
  }
}

export function boolean (observable, truthy, falsey) {
  return (
    transform(observable,
      (val) => val ? truthy : falsey,
      (val) => val == truthy ? true : false
    )
  )
}

export function event (element, attr, event, truthy) {
  event = event || 'keyup'
  truthy = truthy || ((ev) => ev.which === 13 && !ev.shiftKey)
  attr = attr || 'value'
  observable.observable = 'event'
  return observable

  function observable (val) {
    function listener (ev) { if (truthy(ev)) val(element[attr], ev) }
    return (
      val === undefined ? val
    : typeof val !== 'function' ? undefined //read only
    : (on(element, event, listener), () => {
        off(element, event, listener)
      })
    )
  }
}

export function observable_property (obj, key, o) {
  Object.defineProperty(obj, key, { set: (v) => { o(v) }, get: () => o() })
}

export function hover (e) { return toggle(e, 'mouseover', 'mouseout')}
export function touch (e) { return toggle(e, 'touchstart', 'touchend')}
export function mousedown (e) { return toggle(e, 'mousedown', 'mouseup')}
export function focus (e) { return toggle(e, 'focus', 'blur')}

export { attribute as input }

export default value
