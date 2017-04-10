
import { value, transform, event, observable_property } from '../lib/dom/observable'
import { ObservableArray, context } from '../lib/dom/observable-array'
import { MixinEmitter } from '../lib/drip/MixinEmitter'
// TODO: remove h, s (should be retreived from the context)
import { h, s, isNode, txt, arrayFragment } from '../lib/dom/hyper-hermes'

import { parseUri, parseQS, parseHash, parseJSON, camelize, define_getter } from '../lib/utils'
import { pathVars, pathToRegExp, pathToStrictRegExp } from '../lib/router-utils'

// TODO: remove state-machine stuff (move the put_els fn into a class function)

const _observables = new WeakMap

export default class PoemBase extends MixinEmitter(HTMLElement) {
  disconnectedCallback () {
    if (this._els) this._els.empty(), this._els = null
    // TODO: this should be just this._ctx.cleanup()
    if (this._h) this._h = this._h.cleanup()
    if (this._s) this._s = this._s.cleanup()
  }

  connectedCallback () {
    var self = this, fn = self.body, els
    if (typeof fn === 'function') this.els = fn.call(self, self.context())
  }

  reset () {
    this.disconnectedCallback()
    this.connectedCallback()
  }

  constructor (opts, fn) {
    super()
    var observables = {}, self = this
    var i, k, keys = typeof opts === 'object' ? Object.keys(opts) : []

    self.body = fn
    self._opts = opts || {}

    for (i = 0; i < keys.length; i++) (function(k, v) {
      self[k] = v
      var o = observables[k] = v.observable ? v : value(v)
      observable_property(self, k, o)
    })(k = camelize(keys[i]), opts[k])

    _observables.set(self, observables)

    for (i = 0; i < keys.length; i++) (function(k) {
      observables[camelize(k)](function (v) {
        if (v != null) self.setAttribute(k, v)
      })
    })(keys[i])
  }

  set els (els) {
    var i, j, k, e, shadow = this.shadow

    var empty_shadow = () => { while (e = shadow.lastChild) shadow.removeChild(e) }

    if (els == null) return shadow ? empty_shadow() : null
    if (!shadow) shadow = this.shadow = this.attachShadow({mode: 'open'})

    var put_els = (els) => {
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

    // put_els(Array.isArray(els) ? els : [ isNode(els) ? els : txt(els) ])
    if (this._els || (k = Array.isArray(els))) put_els(k ? els : [ isNode(els) ? els : txt(els) ])
    else empty_shadow(), shadow.aC(els)
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
    return this._ctx || (this._ctx = context({h, s}))
  }

  get observables () {
    return _observables.get(this)
  }

  set observables (v) {
    _observables.set(this, v)
  }
}
