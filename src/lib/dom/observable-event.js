
import { is_obv, bind2 } from './observable'

// register a listener
export const on = (emitter, event, listener, opts = false) =>
  (emitter.on || emitter.addEventListener)
    .call(emitter, event, listener, opts)

// unregister a listener
export const off = (emitter, event, listener, opts = false) =>
  (emitter.off || emitter.removeListener || emitter.removeEventListener)
    .call(emitter, event, listener, opts)

export function listen (element, event, attr, listener, do_immediately) {
  let onEvent = (e) => { listener(typeof attr === 'function' ? attr() : attr ? element[attr] : e) }
  on(element, event, onEvent)
  do_immediately && attr && onEvent()
  return () => off(element, event, onEvent)
}

// observe any event, reading any attribute
export function obv_event (element, attr = 'value', event = 'keyup', event_filter) {
  event_filter = typeof event_filter === 'function' ? event_filter
    : ((ev) => ev.which === 13 && !ev.shiftKey)
  const listener = (ev) => event_filter(ev) ? (val(element[attr], ev), ev.preventDefault(), true) : false

  observable._obv = 'event'
  return observable

  function observable (val) {
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
export function attribute (element, attr = 'value', event = 'input') {
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
export function select (element, attr = 'value', event = 'change') {
  const get_attr = (idx = element.selectedIndex) => ~idx ? element.options[idx][attr] : null
  const set_attr = (val) => {
    var options = element.options, i = 0
    for (; i < options.length; i++) {
      if (options[i][attr] == val) {
        element.selectedIndex = i
        element.dispatchEvent(new Event(event))
        return get_attr(i)
      }
    }
  }

  observable._obv = 'select'
  return observable

  function observable (val, do_immediately) {
    return (
      val === undefined ? element.options[element.selectedIndex][attr]
    : typeof val !== 'function' ? set_attr(val)
    : listen(element, event, get_attr, val, do_immediately)
    )
  }
}

//toggle based on an event, like mouseover, mouseout
export function toggle (el, up_event, down_event) {
  var _val = false
  const onUp = () => _val || val.call(el, _val = true)
  const onDown = () => _val && val.call(el, _val = false)

  observable._obv = 'toggle'
  return observable

  function observable (val) {
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
      case 'select_label':
        s = select(e, 'label')
        cleanupFuncs.push(
          is_obv(v)
            ? bind2(s, v)
            : s(v)
        )
        break
      case 'select': // default setter: by value
      case 'select_value':
        s = select(e)
        cleanupFuncs.push(
          is_obv(v)
            ? bind2(s, v)
            : s(v)
        )
        break
      case 'boink':
        // do_boink was only called here:
        // do_boink.call(cleanupFuncs, e, v)
        // so, it got inlined...
        cleanupFuncs.push(
          listen(e, 'click', false, () => { is_obv(v) ? v(!v()) : v() }),
          listen(e, 'touchstart', false, (e) => { e && e.preventDefault(); is_obv(v) ? v(!v()) : v() })
        )
        break
      case 'press':
        // do_press was only called here:
        // do_press.call(cleanupFuncs, e, v)
        // so, it got inlined...
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
