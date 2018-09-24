'use strict'

import { define_value, forEach, error } from '../utils'

// knicked from: https://github.com/dominictarr/observable/blob/master/index.js
// mostly unmodified...
// * exported classes
// * remove utility functions (micro-optimization, reduces readability)
// * change from object traversal to arrays
//  * change all() from `for (var k in ary) ary[k](val)` -> `for (var i = 0; i < ary.length; i++) ary[i](val)`
//  * then, in remove() use `.splice` instead of `delete`. however, to avoid the case that a listener is removed from inside of a listener, the value is set to null and only compacted after 10 listeners have been removed
// * add `.observable` property to all returned functions (necessary for hyper-hermes to know that it's an observable instead of a context)
// * changed `value` to only propagate when the value has actually changed. to force all liseners to receive the current value, `call observable.set()` or `observable.set(observable())`
// * changed `.observable` property name to `._obv`
// (TODO) use isEqual function to compare values before setting the observable (this may not be necessary actually because objects should not really be going into observables)
// (TODO) add better documentation for each function

export function ensure_obv (obv) {
  if (typeof obv !== 'function' || typeof obv._obv !== 'string')
    error('expected an observable')
}


// one-way binding: bind lhs to rhs -- starting with the rhs value
export function bind1 (l, r) {
  l(r())
  return r(l)
}

// two-way binding: bind lhs to rhs and rhs to lhs -- starting with the rhs value
export function bind2 (l, r) {
  l(r())
  var remove_l = l(r), remove_r = r(l)
  return () => { remove_l(); remove_r() }
}

//trigger all listeners
function emit (ary, val2, val) {
  for (var fn, c = 0, i = 0; i < ary.length; i++)
    if (fn = ary[i]) fn(val, val2)
    else c++

  if (c > 10) setTimeout(compactor, 1, ary)
}

function compactor (ary) {
  var i = -1,
      len = ary.length,
      count = 0

  while (++i < len) {
    while (ary[i + count] === null) count++
    if (count > 0) {
      ary.splice(i, count)
      count = 0
    }
  }
}

// remove a listener
export function remove (ary, item) {
  var i = ary.indexOf(item)
  if (~i) ary[i] = null // in the compactor function, we explicitly check to see if it's null.
}

// An observable that stores a value.
export function value (initialValue) {
  // if the value is already an observable, then just return it
  if (typeof initialValue === 'function' && initialValue._obv === 'value') return initialValue
  var _val = initialValue, listeners = []
  observable.set = (val) => emit(listeners, _val, _val = val === undefined ? _val : val)
  observable.once = (fn, imm) => {
    var remove = observable((val, prev) => {
      fn(val, prev)
      remove()
    }, imm)
    return remove
  }
  observable._obv = 'value'
  return observable

  function observable (val, imm) {
    return (
      val === undefined ? _val                                                               // getter
    : typeof val !== 'function' ? (_val === val ? void 0 : emit(listeners, _val, _val = val), val) // setter only sets if the value has changed (won't work for byref things like objects or arrays)
    : (listeners.push(val), (_val === undefined || imm === false ? _val : val(_val)), () => {                 // listener
        remove(listeners, val)
      })
    )
  }
}

// An observable that stores a number value.
export function number (initialValue) {
  // if the value is already an observable, then just return it
  if (typeof initialValue === 'function' && initialValue._obv === 'value') return initialValue
  var _val = initialValue, listeners = []
  // TODO: it would probably be better to figure out a way to make these a part of the prototype (or figure out some weird way where a function can be a class)
  observable.set = (val) => emit(listeners, _val, _val = val === undefined ? _val : val)
  observable.add = (val) => observable(_val + (typeof val === 'function' ? val() : val))
  observable.mul = (val) => observable(_val * (typeof val === 'function' ? val() : val))
  observable._obv = 'value'
  return observable

  function observable (val, imm) {
    return (
      val === undefined ? _val                                                               // getter
    : typeof val !== 'function' ? (_val === val ? void 0 : emit(listeners, _val, _val = val), val) // setter only sets if the value has changed (won't work for byref things like objects or arrays)
    : (listeners.push(val), (_val === undefined || imm === false ? _val : val(_val)), () => {                 // listener
        remove(listeners, val)
      })
    )
  }
}

// an observable object
export function obv_obj (initialValue, _keys) {
  // if the value is already an observable, then just return it
  if (initialValue && initialValue._obv === 'object') return initialValue

  var obj = {}
  var obvs = {}
  var keys = []
  var props = {
    observable: define_value('object'),
    // TODO: implement get/set,on/off for compatibility with scuttlebutt?
    set: define_value((v) => {
      for (let k of keys) {
        if (obvs[k] && v[k]) obvs[k](v[k])
      }
    })
  }

  for (let k of Array.isArray(_keys) ? _keys : Object.keys(initialValue)) {
    let _obv, v = initialValue[k]
    if (v !== undefined) {
      if (v._obv === 'value') obvs[k] = v, keys.push(k)
      else if (v._obv) props[k] = define_value(v)
      else keys.push(k)
    }
  }

  for (let k of keys) props[k] = {
    get: () => (obvs[k] || (obvs[k] = value(initialValue[k])))(),
    set: (v) => obvs[k](v)
  }
  Object.defineProperties(obj, props)

  return obj
}

/*
##property
observe a property of an object, works with scuttlebutt.
could change this to work with backbone Model - but it would become ugly.
*/

export function property (model, key) {
  observable._obv = 'property'
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
  ensure_obv(obv)

  observable._obv = 'value'
  return observable

  function observable (val, imm) {
    return (
      val === undefined ? down(obv())
    : typeof val !== 'function' ? obv((up || down)(val))
    : obv((_val, old) => { val(down(_val, old)) }, imm)
    )
  }
}

export function modify (obv, fn = (v) => !v) {
  ensure_obv(obv)
  return (evt) => obv(fn(obv(), evt))
}

export var _px = (v) => typeof v === 'string' && ~v.indexOf('px') ? v : v + 'px'
export var px = (observable) => transform(observable, _px)


// transform an array of obvs
export function compute (observables, compute_fn) {
  var is_init = true, l = observables.length
  var cur = new Array(l)
  var listeners = [], removables = [], _val, fn

  for (let i = 0; i < l; i++) {
    fn = observables[i]
    if (typeof fn === 'function') {
      removables.push(fn((v) => {
        var prev = cur[i]
        cur[i] = v
        if (prev !== v && is_init === false) observable(compute_fn.apply(null, cur))
      }))
    } else {
      // items in the observable array can also be literals
      cur[i] = fn
    }
  }

  _val = compute_fn.apply(null, cur)
  observable._obv = 'value'
  is_init = false

  return observable

  function observable (val, imm) {
    return (
      val === undefined ? _val                                                               // getter
    : typeof val !== 'function' ? (_val === val ? void 0 : emit(listeners, _val, _val = val), val) // setter (the new way - only sets if the value has changed)
    : (listeners.push(val), (_val === undefined || imm === false ? _val : val(_val)), () => {                 // listener
        remove(listeners, val)
        for (fn of removables) _val()
      })
    )
  }
}

export function boolean (obv, truthy, falsey) {
  return (
    transform(obv,
      (val) => val ? truthy : falsey,
      (val) => val == truthy ? true : false
    )
  )
}

export function event (element, attr, event, truthy) {
  event = event || 'keyup'
  truthy = truthy || ((ev) => ev.which === 13 && !ev.shiftKey)
  attr = attr || 'value'
  observable._obv = 'event'
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

export function is_obv (obv, type = null) {
  return typeof obv === 'function' && ((!type && obv._obv) || obv._obv === type)
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
