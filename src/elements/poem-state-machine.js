
import { value, transform, event, observable_property } from '../lib/dom/observable'
import { ObservableArray } from '../lib/dom/observable-array'
import { PathEmitter } from '../lib/drip/PathEmitter'
import { win, h, s, txt, arrayFragment } from '../lib/dom/hyper-hermes'
import { isNode, txt } from '../lib/dom/dom-base'
import { new_ctx } from '../lib/dom/hyper-ctx'

import { parseUri, parseQS, parseHash, parseJSON, camelize, define_getter } from '../lib/utils'
import { pathVars, pathToRegExp, pathToStrictRegExp } from '../lib/router-utils'

import { _observables } from './poem-base'

// TODO: emit state changes

export default class PoemStateMachine extends PathEmitter(HTMLElement) {
  disconnectedCallback () {
    var self = this
    var done = () => {
      if (self._els) self._els.empty(), self._els = null
      if (self._ctx) self._ctx.cleanup()
    }
    // TODO: save the state
    // TODO: maybe don't change the state, actually
    if (self.states.disconnected) self.now('disconnected').then(done, done)
    else done()
  }

  connectedCallback () {
    var self = this, fn = self.body
    if (typeof fn === 'function') {
      let p, pv, v, vars = [],
        map = self.map = [],
        regExp = self.regExp = [],
        states = self.states = fn.call(self, self.context())

      for (p in states) {
        pv = pathVars(p)
        // save the original path
        pv.path = p
        // if pathVars var doesn't exist in the vars array, add it
        for (v of pv) if (!~vars.indexOf(v)) vars.push(v)
        map.push(pv)
        regExp.push(pathToRegExp(p))
      }
    }
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
    var i, k, keys = typeof opts === 'object' ? Object.keys(opts) : []

    self.setupEmitter()
    self.body = fn
    self._opts = opts || {}

    for (i = 0; i < keys.length; i++) (function (k, v) {
      self[k] = v
      var o = observables[k] = v.observable ? v : value(v)
      observable_property(self, k, o)
    })(k = camelize(keys[i]), opts[k])

    _observables.set(self, observables)

    for (i = 0; i < keys.length; i++) (function (k) {
      observables[camelize(k)](function (v) {
        // console.log('new value', k, v)
        if (v != null) set_attr(self, k, v)
      })
    })(keys[i])
  }

  now (nextState) {
    if (nextState[0] !== '/') nextState = camelize(nextState)
    if (DEBUG && this.state) console.log(this.localName, this.state, '->', nextState)
    return new Promise((resolve, reject) => {
      var fn, data = {}, els, loading_els, state
      if (typeof this.state === 'string' && typeof (fn = this.states[this.state + '#exit']) === 'function') {
        if (DEBUG) console.log('exit state', this.state + '#exit')
        fn.call(this)
      }

      var unmapPath = (path) => {
        var data = {}, regExp = this.regExp, map = this.map
        var parsed, i, j, v
        for (j = 0; j < regExp.length; j++) {
          if (parsed = path.match(regExp[j])) {
            for (i = 0; i < map[j].length; i++)
              if (v = parsed[i + 1]) data[map[j][i]] = parseJSON(v)
            // set observables??
            // for (v in data) this.attr(v, data[v])
            return { path: map[j].path, data }
          }
        }

        return { path }
      }

      var put_els = (els) => {
        var i, j, k, e, shadow
        if (els == null) return
        if (!(shadow = this.shadow)) {
          shadow = this.shadow = this.attachShadow({mode: 'open'})
        }

        if (!this._els) {
          shadow.aC((this._els = new ObservableArray(...els)), this._ctx.h.cleanupFuncs)
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
            e = els[i]
            for (var j = 0; j < this._els.length; j++) {
              if (e === this._els[j]) {
                exists = true
                if (i !== j) {
                  if (~(k = this._els.indexOf(e)))
                    this._els.move(k, i)
                  else this._els.replace(j, e)
                  break
                } // else do nothing
              } else if (i === j) {
                exists = true
                if (~(k = this._els.indexOf(e)))
                  this._els.move(k, i)
                else this._els.replace(j, e)
              }
            }

            if (exists === false) {
              this._els.insert(i, e)
            }
          }
        }
      }

      var done = (els) => {
        put_els(Array.isArray(els) ? els : [ isNode(els) ? els : txt(els) ])
      }

      if (!(fn = this.states[nextState])) {
        state = unmapPath(nextState)
        fn = this.states[state.path]
        data = state.data
      }

      if (typeof fn === 'function') {
        this.state = nextState
        // DESIRE: create a new context for the duration of the state, if fn.length > 0
        // els = fn.call(this, state._ctx || (state._ctx = this.context()))
        if (els = fn.call(this, data)) {
          // if any transition state exists then
          if (typeof (fn = (state = this.states[nextState + '#loading'])) === 'function' && (loading_els = fn.call(this))) {
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
    var is_obv = typeof v === 'function' && v.observable
    var o = observables[kc]
    if (o && !is_obv) return o

    if (v != null) self[k] = is_obv ? v() : v
    o = observables[kc] = is_obv ? v : value(v)
    observable_property(self, kc, o)
    if (!hidden) o(function (v) {
      if (v != null) set_attr(self, k, v)
    })
    return o
  }

  attrx (k, fn) {
    return transform(typeof k === 'string' ? this.attr(k) : k, fn)
  }

  // observe (event, attr, fn) {
  //   cleanupFuncs.push(event(this, attr, event)(fn))
  // }

  style (txt) {
    var shadow = this.shadow
    var ctx = this.context()
    if (!shadow) {
      shadow = this.shadow = this.attachShadow({mode: 'open'})
    }
    shadow.appendChild(ctx.h('style', txt + ''))
  }

  context () {
    return this._ctx || (this._ctx = new_ctx({h, s}))
  }

  get observables () {
    return _observables.get(this)
  }

  set observables (v) {
    _observables.set(this, v)
  }
}

import { special_elements } from '../lib/dom/hyper-hermes'
special_elements.define('poem-state-machine', PoemStateMachine, ['opts', 'function (G)'])
