
import { value, transform, event, observable_property } from '../lib/dom/observable'
import { ObservableArray, context } from '../lib/dom/observable-array'
import { PathEmitter } from '../lib/drip/PathEmitter'
import { h, s, isNode, txt, arrayFragment } from '../lib/dom/hyper-hermes'

import { parseUri, parseQS, parseHash, parseJSON, camelize, define_getter } from '../lib/utils'
import { pathVars, pathToRegExp, pathToStrictRegExp } from '../lib/router-utils'

const basePath = window.location.pathname
// var path = '/table/:table?/:somethin?'
// var tester = parseUri('/table/1234/lala')
// console.log(pathVars(path), pathToRegExp(path).test(tester.path), pathToStrictRegExp(path).test(tester.path))
// console.log(pathVars(path), tester.path.match(pathToRegExp(path)), tester.path.match(pathToStrictRegExp(path)))

const _observables = new WeakMap

window.camelize = camelize

export default class StateMachine extends PathEmitter(HTMLElement) {
  disconnectedCallback () {
    var done = () => {
      if (this._els) this._els.empty(), this._els = null
      if (this._h) this._h = this._h.cleanup()
      if (this._s) this._s = this._s.cleanup()
    }
    // TODO: save the state
    // TODO: maybe don't change the state, actually
    if (this.states.disconnected) this.now('disconnected').then(done, done)
    else done()
  }

  connectedCallback () {
    var self = this, fn = this.body
    if (typeof fn === 'function') {
      let p, pv, v, vars = [],
        map = this.map = [],
        regExp = this.regExp = [],
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
      var fn, data = {}, els, loading_els, state
      if (typeof this.state === 'string' && typeof (fn = this.states[this.state + '#exit']) === 'function') {
        console.log('exit state', this.state + '#exit')
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
    var o = observables[kc]
    if (o) return o

    if (v != null) self[k] = v
    o = observables[k] = typeof v === 'function' && v.observable ? v : value(v)
    observable_property(self, kc, o)
    if (!hidden) o(function (v) {
      // console.log('attr', k, v)
      if (v != null) self.setAttribute(k, v)
    })
    return o
  }

  attr_transform (k, fn) {
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
    // TODO: context should be a function which is created at a lower level somewhere... (also use it in the plugin-boilerplate)
    return this._ctx || (this._ctx = context({h, s}))
    // var ctx, self = this
    // return self._ctx || (Object.defineProperties((ctx = {}), {
    //   h: define_getter(() => self._h || (self._h = h.context())),
    //   s: define_getter(() => self._s || (self._s = s.context())),
    // }), self._ctx = ctx)
  }

  get observables () {
    return _observables.get(this)
  }

  set observables (v) {
    _observables.set(this, v)
  }
}
