
import { is_obv } from './observable'

// register a listener
export const on = (emitter, event, listener, opts = false) =>
  (emitter.on || emitter.addEventListener)
    .call(emitter, event, listener, opts)

// unregister a listener
export const off = (emitter, event, listener, opts = false) =>
  (emitter.off || emitter.removeListener || emitter.removeEventListener)
    .call(emitter, event, listener, opts)

export function listen (element, event, attr, listener, do_immediately) {
  function onEvent (e) {
    listener(typeof attr === 'function' ? attr() : attr ? element[attr] : e)
  }
  on(element, event, onEvent)
  // TODO: test listen with do_immediately enabled for stuff like attributes and selects
  do_immediately && attr && onEvent()
  return () => off(element, event, onEvent)
}

// observe any event, reading any attribute
export function obv_event (element, attr, event, filter_event) {
  event = event || 'keyup'
  filter_event = typeof filter_event === 'function' ? filter_event
    : ((ev) => ev.which === 13 && !ev.shiftKey)
  attr = attr || 'value'
  observable._obv = 'event'
  return observable

  function observable (val) {
    const listener = (ev) => filter_event(ev) ? (val(element[attr], ev), ev.preventDefault(), true) : false
    return (
      val === undefined ? val
    : typeof val !== 'function' ? undefined //read only
    : (on(element, event, listener), () => {
        off(element, event, listener)
      })
    )
  }
}


//observe html element - aliased as `input`
export { attribute as input }
export function attribute (element, _attr, _event) {
  var attr = _attr !== void 0 ? _attr : 'value'
  var event = _event !== void 0 ? _event : 'input'
  observable._obv = 'attribute'
  return observable

  function observable (val, do_immediately) {
    return (
      val === undefined ? element[attr]
    : typeof val !== 'function' ? (element[attr] = val, element.dispatchEvent(new Event(event)), val)
    : listen(element, event, attr, val, do_immediately)
    )
  }
}

// observe a select element
export function select (element) {
  observable._obv = 'select'
  return observable

  function _attr () {
    var idx = element.selectedIndex
    return ~idx ? element.options[idx].value : null
  }
  function _set(val) {
    for (var i = 0; i < element.options.length; i++) {
      if (element.options[i].value == val) element.selectedIndex = i
    }
  }
  function observable (val, do_immediately) {
    return (
      val === undefined ? element.options[element.selectedIndex].value
    : typeof val !== 'function' ? _set(val)
    : listen(element, 'change', _attr, val, do_immediately)
    )
  }
}

//toggle based on an event, like mouseover, mouseout
export function toggle (el, up_event, down_event) {
  var _val = false
  observable._obv = 'toggle'
  return observable

  function observable (val) {
    function onUp() {
      _val || val.call(el, _val = true)
    }
    function onDown () {
      _val && val.call(el, _val = false)
    }
    return (
      val === undefined ? _val
    : typeof val !== 'function' ? undefined //read only
    : (on(el, up_event, onUp), on(el, down_event || up_event, onDown), () => {
        off(el, up_event, onUp); off(el, down_event || up_event, onDown)
      })
    )
  }
}

export function hover (e) { return toggle(e, 'mouseover', 'mouseout')}
export function touch (e) { return toggle(e, 'touchstart', 'touchend')}
export function mousedown (e) { return toggle(e, 'mousedown', 'mouseup')}
export function focus (e) { return toggle(e, 'focus', 'blur')}

// call like this `add_event.call(cleanupFuncs, el, listener, opts)`
// furthermore, it may be wise to make the `cleanupFuncs = this` for all these type of functions
export function add_event (e, event, listener, opts) {
  on(e, event, listener, opts)
  this.push(() => { off(e, event, listener, opts) })
}

// https://www.html5rocks.com/en/mobile/touchandmouse/
// https://www.html5rocks.com/en/mobile/touch/
// look into `passive: true` as a replacement for the `preventDefault` functionality.
export function do_boink (el, obv) {
  this.push(
    listen(el, 'click', false, () => { is_obv(obv) ? obv(!obv()) : obv() }),
    listen(el, 'touchstart', false, (e) => { e && e.preventDefault(); is_obv(obv) ? obv(!obv()) : obv() })
  )
}

export function do_press (el, obv, pressed = true, normal = false) {
  this.push(
    listen(el, 'mouseup', false, () => { obv(normal) }),
    listen(el, 'mousedown', false, () => { obv(pressed) }),
    listen(el, 'touchend', false, (e) => { e && e.preventDefault(); obv(normal) }),
    listen(el, 'touchstart', false, (e) => { e && e.preventDefault(); obv(pressed) })
  )
}

export function observe (e, observe_obj) {
  var s, cleanupFuncs = this
  for (s in observe_obj) ((s, v) => {
    // observable
    switch (s) {
      case 'input':
        cleanupFuncs.push(attribute(e, observe_obj[s+'.attr'], observe_obj[s+'.on'])(v))
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
        // do_boink is only called here:
        // do_boink.call(cleanupFuncs, e, v)
        // inlined...
        cleanupFuncs.push(
          listen(e, 'click', false, () => { is_obv(v) ? v(!v()) : v() }),
          listen(e, 'touchstart', false, (e) => { e && e.preventDefault(); is_obv(v) ? v(!v()) : v() })
        )
        break
      case 'press':
        // do_press is only called here:
        // do_press.call(cleanupFuncs, e, v)
        // inlined...
        cleanupFuncs.push(
          listen(e, 'mouseup', false, () => { v(false) }),
          listen(e, 'mousedown', false, () => { v(true) }),
          listen(e, 'touchend', false, (e) => { e && e.preventDefault(); v(false) }),
          listen(e, 'touchstart', false, (e) => { e && e.preventDefault(); v(true) })
        )
        break
      default:
      // case 'keyup':
      // case 'keydown':
      // case 'touchstart':
      // case 'touchend':
        if (!~s.indexOf('.')) {
          if (typeof v !== 'function') error('observer must be a function')
          // if (s === 'edit') debugger
          cleanupFuncs.push(obv_event(e, observe_obj[s+'.attr'], (observe_obj[s+'.event'] || s), observe_obj[s+'.valid'])(v))
          // if (s === 'edit') debugger
        }
    }
  })(s, observe_obj[s])
}
