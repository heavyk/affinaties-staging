
import { is_obv } from './observable'

// register a listener
export const on = (emitter, event, listener, opts = false) =>
  (emitter.on || emitter.addEventListener)
    .call(emitter, event, listener, opts)

// unregister a listener
export const off = (emitter, event, listener, opts = false) =>
  (emitter.off || emitter.removeListener || emitter.removeEventListener)
    .call(emitter, event, listener, opts)

export function listen (element, event, attr, listener) {
  function onEvent (e) {
    listener(typeof attr === 'function' ? attr() : attr ? element[attr] : e)
  }
  on(element, event, onEvent)
  // TODO: I realllllly need testing on this libary to guarantee intended functionality...
  // I don't know why onEvent is called when listening. I think it's to automatically automatically give the listener its value
  attr && onEvent()
  return () => off(element, event, onEvent)
}

//observe html element - aliased as `input`
export function attribute (element, _attr, _event) {
  var attr = _attr !== void 0 ? _attr : 'value'
  var event = _event !== void 0 ? _event : 'input'
  observable._obv = 'attribute'
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
    var idx = element.selectedIndex
    return ~idx ? element.options[idx].value : null
  }
  function _set(val) {
    for (var i = 0; i < element.options.length; i++) {
      if (element.options[i].value == val) element.selectedIndex = i
    }
  }
  observable._obv = 'select'
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
  var _val = false
  observable._obv = 'toggle'
  return observable

  function observable (val) {
    function onUp() {
      _val || val(i = true)
    }
    function onDown () {
      _val && val(i = false)
    }
    return (
      val === undefined ? _val
    : typeof val !== 'function' ? undefined //read only
    : (on(el, up_event, onUp), on(el, down_event || up_event, onDown), val(i), () => {
        off(el, up_event, onUp); off(el, down_event || up_event, onDown)
      })
    )
  }
}

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
          cleanupFuncs.push(event(e, obj[s+'.attr'], obj[s+'.on'] || s, obj[s+'.event'])(v))
        }
    }
  })(s, observe_obj[s])
}
