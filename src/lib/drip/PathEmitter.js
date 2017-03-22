
import common from './common'
import concat from './concat'

export var PathEmitter = Base => class extends Base {
  setupEmitter (opts, _ctx) {
    opts = opts || {}
    let ctx = _ctx || this
    ctx._drip = {}
    ctx._drip.delimeter = opts.delimeter || '/'
    ctx._drip.wildcard = opts.wildcard || (opts.delimeter ? true : false)
    // if (_ctx) return mixin(_ctx)
    this.many = common.many
    this.once = common.once
  }

  on (ev, fn) {
    var map = this._events || (this._events = {})
    var evs = Array.isArray(ev) ? ev.slice(0) : ev.split(this._drip.delimeter)
    var store = this._events || (this._events = {})

    function iterate (events, map) {
      var event = events.shift()
      map[event] = map[event] || {}

      if (events.length) {
        iterate(events, map[event])
      } else {
        if (!map[event]._) map[event]._ = [ fn ]
        else map[event]._.push(fn)
      }
    }

    iterate(evs, store)
    return this
  }

  /**
   * ### .off ([event], [callback])
   *
   * Unbind `callback` function from `event`. If no function
   * is provided will unbind all callbacks from `event`. If
   * no event is provided, event store will be purged.
   *
   * ```js
   * emitter.off('event', callback)
   * emitter.off('event/nested', callback)
   * emitter.off([ 'event', 'nested' ], callback)
   * ```
   *
   * @param {String|Array} event _optional_
   * @param {Function} callback _optional_
   * @alias removeListener
   * @alias removeAllListeners
   * @name off
   * @api public
   */

  off (ev, fn) {
    var argc = arguments.length
    if (!this._events || argc === 0) {
      this._events = {}
      return this
    }

    function exists (obj) {
      for (var name in obj) {
        if (obj[name] && name != '_') return false
      }

      return true
    }

    function clean (event) {
      if (fn && 'function' === typeof fn) {
        for (var i = 0; i < event._.length; i++)
          if (fn == event._[i]) event._.splice(i, 1)
        if (event._.length === 0) event._ = null
        // if (event._ && event._.length == 1) event._ = event._[0]
      } else {
        event._ = null
      }

      if (!event._ && exists(event)) event = null
      return event
    }

    function iterate (events, map) {
      var event = events.shift()
      if (map[event] && map[event]._ && !events.length) map[event] = clean(map[event])
      if (map[event] && events.length) map[event] = iterate(events, map[event])
      if (!map[event] && exists(map)) map = null
      return map
    }

    var evs = Array.isArray(ev) ? ev.slice(0) : ev.split(this._drip.delimeter)

    if (evs.length === 1 && argc === 1) {
      if (this._events[ev]) this._events[ev]._ = null
      return this
    } else {
      this._events = iterate(evs, this._events)
    }

    return this
  }

  /**
   * ### .emit (event[, args], [...])
   *
   * Trigger `event`, passing any arguments to callback functions.
   *
   * ```js
   * emitter.emit('event', arg, ...)
   * emitter.emit('event/nested', arg, ...)
   * emitter.emit([ 'event', 'nested' ], arg, ...)
   * ```
   *
   * @param {String} event name
   * @param {Mixed} multiple parameters to pass to callback functions
   * @name emit
   * @api public
   */

  emit (ev, arg1, arg2) {
    var evs = Array.isArray(ev) ? ev.slice(0) : ev.split(this._drip.delimeter)
    var fns = this._events ? traverse(evs, this._events) : []
    var a

    if (!fns.length && evs.length === 1 && evs[0] === 'error') {
      throw arg1 || new Error('EnhancedEmitter "error" event without argument.')
    } else if (!fns.length) {
      return false
    }

    var argc = arguments.length
    for (var i = 0; i < fns.length; i++) {
      if (argc === 1) {
        fns[i].call(this)
      } else if (argc === 2) {
        fns[i].call(this, arg1)
      } else if (argc === 3) {
        fns[i].call(this, arg1, arg2)
      } else {
        if (!a) {
          a = Array(argc - 1)
          for (var i2 = 1; i2 < argc; i2++) {
            a[i2 - 1] = arguments[i2]
          }
        }

        fns[i].apply(this, a)
      }
    }

    return true
  }

  /**
   * ### .hasListener (ev[, function])
   *
   * Determine if an event has listeners. If a function
   * is proved will determine if that function is a
   * part of the listeners.
   *
   * @param {String|Array} event key to seach for
   * @param {Function} optional function to check
   * @returns {Boolean} found
   * @name hasListeners
   * @api public
   */

  hasListener (ev, fn) {
    if (!this._events) return false
    var evs = Array.isArray(ev) ? ev.slice(0) : ev.split(this._drip.delimeter)
    var fns = traverse(evs, this._events)
    if (fns.length === 0) return false
    return common.hasListener(fns, fn)
  }

  /**
   * ### .listeners (ev)
   *
   * Retrieve an array of all of the listners for speciific
   * event. Wildcard events will also be included.
   *
   * @param {String} event
   * @return {Array} callbacks
   * @name listeners
   * @api public
   */

  listeners (ev) {
    if (!this._events) return []
    var evs = Array.isArray(ev) ? ev.slice(0) : ev.split(this._drip.delimeter)
    var fns = traverse(evs, this._events)
    return fns
  }
}

/*!
 * Traverse through a wildcard event tree
 * and determine which callbacks match the
 * given lookup. Recursive. Returns array
 * of events at that level and all subsequent
 * levels.
 *
 * @param {Array} event lookup
 * @param {Object} events tree to search
 * @api private
 */

function traverse (events, map) {
  var event = events.shift()
  var fns = []
  var arr1, arr2, l, trav

  if (event !== '*' && map[event] && map[event]._ && !events.length) {
    if ('function' == typeof map[event]._) {
      fns.push(map[event]._)
    } else {
      fns = concat(fns, map[event]._)
    }
  }

  if (map['*'] && map['*']._ && !events.length) {
    if ('function' == typeof map['*']._) {
      fns.push(map['*']._)
    } else {
      fns = concat(fns, map['*']._)
    }
  }

  if (events.length && (map[event] || map['*'])) {
    l = events.length
    arr1 = Array(l)
    arr2 = Array(l)

    for (var i = 0; i < l; i++) {
      arr1[i] = events[i]
      arr2[i] = events[i]
    }

    if (map[event]) {
      trav = traverse(arr1, map[event])
      fns = concat(fns, trav)
    }

    if (map['*']) {
      trav = traverse(arr2, map['*'])
      fns = concat(fns, trav)
    }
  }

  return fns
}
