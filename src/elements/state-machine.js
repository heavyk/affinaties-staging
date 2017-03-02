
import { value, transform, event, observable_property } from '../lib/dom/observable'
import { ObservableArray } from '../lib/dom/observable-array'
import { h, s, isNode, forEach, txt, arrayFragment } from '../lib/dom/hyper-hermes'
// import EventEmitter from '../../drip/enhanced'

var _observables = new WeakMap
// const DEFAULT_OPTS = { x: 0, y: 0 }

import common from '../lib/drip/common'
import concat from '../lib/drip/concat'

var PathEmitter = Base => class extends Base {
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

function d (fn) {
  return {
    configurable: true, enumerable: false,
    get: fn
  }
}

// TODO: move this (and other functions like it) into a lib file, to remove duplication
function camelize (k) {
  return ~k.indexOf('-') ? k.replace(/[-_]+(.)?/g, (tmp, c) => (c || '').toUpperCase()) : k
}

export default class StateMachine extends PathEmitter(HTMLElement) {
  disconnectedCallback () {
    var done = () => {
      if (this._els) this._els.empty(), this._els = null
      if (this._h) this._h = this._h.cleanup()
      if (this._s) this._s = this._s.cleanup()
    }
    // TODO: save the state
    if (this.states.disconnected) this.now('disconnected').then(done, done)
    else done()
  }

  connectedCallback () {
    var self = this, fn = this.body
    if (typeof fn === 'function') self.states = fn.call(self, self.context())
    // TODO: save the state (observables will retain their values until element is destroyed, I guess)
    self.now('/')
  }

  reset () {
    this.disconnectedCallback()
    this.connectedCallback()
  }

  constructor (opts, fn) {
    super()
    var observables = {}, self = this
    var i, k, keys = typeof opts === 'object' ? Object.keys(opts) : [] //.concat(StateMachine.observedAttributes)

    self.setupEmitter()
    self.body = fn
    self._opts = opts || {}

    for (i = 0; i < keys.length; i++) (function(k, v) {
      // console.log('observ:', k, v)
      self[k] = v
      var o = observables[k] = v.observable ? v : value(v)
      observable_property(self, k, o)
    })(k = camelize(keys[i]), opts[k])

    _observables.set(self, observables)

    for (i = 0; i < keys.length; i++) (function(k) {
      observables[camelize(k)](function (v) {
        // console.log('new value', k, v)
        // self[k] = v
        if (v != null) self.setAttribute(k, v)
      })
    })(keys[i])
  }

  now (nextState) {
    if (nextState[0] !== '/') nextState = camelize(nextState)
    console.log(this.localName, this.state, '->', nextState)
    return new Promise((resolve, reject) => {
      var fn, els, loading_els, state
      if (typeof this.state === 'string' && typeof (fn = this.states[this.state + '.exit']) === 'function') {
        console.log('exit state', this.state + '.exit')
        fn.call(this)
      }

      var put_els = (els) => {
        var i, j, k, shadow
        if (els == null) return
        if (!(shadow = this.shadow)) {
          shadow = this.shadow = this.attachShadow({mode: 'open'})
        }

        if (!this._els) {
          this._els = new ObservableArray(...els)
          shadow.appendChild(arrayFragment(shadow, this._els, this._ctx.h.cleanupFuncs))
        } else {
          // DESIRE: do some sort of intelligent dom diffing instead of this hack
          if (this._els.length !== els.length) for (j = 0; j < this._els.length; j++) {
            if (!~els.indexOf(this._els[j])) {
              this._els.remove(j)
            }
          }
          // TESTME - this should be tested throughly
          for (i = 0; i < els.length; i++) {
            var exists = false
            for (var j = 0; j < this._els.length; j++) {
              if (els[i] === this._els[j]) {
                exists = true
                if (i !== j) {
                  if (~(k = this._els.indexOf(els[i])))
                    this._els.move(k, i)
                  else this._els.replace(j, els[i])
                  break
                } // else do nothing
              } else if (i === j) {
                exists = true
                if (~(k = this._els.indexOf(els[i])))
                  this._els.move(k, i)
                else this._els.replace(j, els[i])
              }
            }

            if (exists === false) {
              this._els.insert(i, els[i])
            }
          }
        }
      }

      var done = (els) => {
        put_els(Array.isArray(els) ? els : [ isNode(els) ? els : txt(els) ])
      }

      if (typeof (fn = (state = this.states[nextState])) === 'function') {
        this.state = nextState
        // DESIRE: create a new context for the duration of the state, if fn.length > 0
        // els = fn.call(this, state._ctx || (state._ctx = this.context()))
        if (els = fn.call(this)) {
          // if any transition state exists then
          if (typeof (fn = (state = this.states[nextState + '.loading'])) === 'function' && (loading_els = fn.call(this))) {
            put_els(loading_els)
          }

          // resolve any promises returned before resolving the next state
          if (els) Promise.resolve(els).then(done).then(resolve)
          else resolve(this._els ? this._els.empty() : void 0)
        } else {
          resolve(els)
        }
      } else {
        console.error('state', nextState, 'does not exist')
        reject()
      }
    })
  }

  attr (k, v, hidden = false) {
    var self = this
    var observables = _observables.get(self)
    var kc = camelize(k)
    v = v !== undefined ? v : self._opts[kc]
    var o = observables[kc]
    if (o) return o

    if (v != null) self[k] = v
    o = observables[k] = typeof v === 'function' && v.observable ? v : value(v)
    observable_property(self, kc, o)
    if (!hidden) o(function (v) {
      console.log('attr', k, v)
      if (v != null) self.setAttribute(k, v)
    })
    return o
  }

  attr_transform (k, fn) {
    return transform(typeof k === 'string' ? this.attr(k) : k, fn)
  }

  observe (event, attr, fn) {
    cleanupFuncs.push(event(this, attr, event)(fn))
  }

  style (txt) {
    var shadow = this.shadow
    var ctx = this.context()
    if (!shadow) {
      shadow = this.shadow = this.attachShadow({mode: 'open'})
    }
    shadow.appendChild(ctx.h('style', txt + ''))
  }

  context () {
    var ctx, self = this
    return self._ctx || (Object.defineProperties((ctx = {}), {
      h: d(() => self._h || (self._h = h.context())),
      s: d(() => self._s || (self._s = s.context())),
    }), self._ctx = ctx)
  }

  get observables () {
    return _observables.get(this)
  }

  set observables (v) {
    _observables.set(this, v)
  }
}

export class Modal extends StateMachine {
  // static get
  constructor (opts, fn) {
    super(opts, fn)
  }
}
