'use strict'

import { forEach } from './hyper-hermes'
import { define_value } from '../utils'
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


// bind a to b -- One Way Binding
export function bind1 (a, b) {
  a(b()); b(a)
}

//bind a to b and b to a -- Two Way Binding
export function bind2 (a, b) {
  b(a()); a(b); b(a)
}

//trigger all listeners
function emit (ary, val2, val) {
  for (var i = 0; i < ary.length; i++) ary[i](val, val2)
}

// remove a listener
function remove (ary, item) {
  var i = ary.indexOf(item)
  if (~i) setTimeout(function () { ary.splice(i, 1) }, 1)
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
  observable.set = function (val) {
    emit(listeners, _val, _val = val === undefined ? _val : val)
  }
  observable.observable = 'value'
  return observable

  function observable (val) {
    return (
      val === undefined ? _val                                                              // getter
    // : typeof val !== 'function' ? emit(listeners, _val, _val = val)                             // this is the old way.. it'll always emit, even if the value is the same
    : typeof val !== 'function' ? (!(_val === val) ? emit(listeners, _val, _val = val) : '') // setter (the new way - only sets if the value has changed)
    : (listeners.push(val), (_val === undefined ? _val : val(_val)), function () {          // listener
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
  var val = {}
  var keys = Array.isArray(_keys) ? _keys : Object.keys(initialValue)
  var props = { observable: define_value('object') }
  for (let k of keys) props[k] = { get: () => val[k] || (val[k] = value(initialValue[k])) }
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
    : (on(model, 'change:'+key, val), val(model.get(key)), function () {
        off(model, 'change:'+key, val)
      })
    )
  }
}

export function transform (in_observable, down, up) {
  if (typeof in_observable !== 'function')
    error('transform expects an observable')

  observable.observable = 'value'
  return observable

  function observable (val) {
    return (
      val === undefined ? down(in_observable())
    : typeof val !== 'function' ? in_observable((up || down)(val))
    : in_observable(function (_val) { val(down(_val)) })
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
  return function () {
    off(element, event, onEvent)
  }
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
    : (on(el, up_event, onUp), on(el, down_event || up_event, onDown), val(i), function () {
        off(el, up_event, onUp); off(el, down_event || up_event, onDown)
      })
    )
  }
}

export function error (message) {
  throw new Error(message)
}

export function compute (observables, compute) {
  var init = true
  var cur = new Array(observables.length)

  var v = value()

  forEach(observables, function (f, i) {
    if (typeof f === 'function') {
      cur[i] = f()
      f(function (val) {
        var prev = cur[i]
        cur[i] = val
        if (init === false && prev !== val) v(compute.apply(null, cur))
      })
    } else {
      cur[i] = f
    }
  })

  v(compute.apply(null, cur))
  init = false
  // I see no reason why this is needed. disabled until I find a use for it.
  // v(function () {
  //   compute.apply(null, cur)
  // })

  return v
}

export function boolean (observable, truthy, falsey) {
  return (
    transform(observable, function (val) {
      return val ? truthy : falsey
    }, function (val) {
      return val == truthy ? true : false
    })
  )
}

export function event (element, attr, event, truthy) {
  event = event || 'keyup'
  truthy = truthy || function (ev) { return ev.which === 13 && !ev.shiftKey }
  attr = attr || 'value'
  observable.observable = 'event'
  return observable

  function observable (val) {
    function listener (ev) { if (truthy(ev)) val(element[attr], ev) }
    return (
      val === undefined ? val
    : typeof val !== 'function' ? undefined //read only
    : (on(element, event, listener), function () {
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
