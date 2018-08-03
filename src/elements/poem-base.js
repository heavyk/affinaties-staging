
import { value, transform, event, observable_property } from '../lib/dom/observable'
import { ObservableArray } from '../lib/dom/observable-array'
import { MixinEmitter } from '../lib/drip/MixinEmitter'
// TODO: remove h, s (should be retreived from the context)
import { h, s, isNode, txt, set_style } from '../lib/dom/hyper-hermes'
import { new_context, el_context } from '../lib/dom/hyper-hermes'

import { parseUri, parseQS, parseHash, parseJSON, camelize, define_getter } from '../lib/utils'
import { pathVars, pathToRegExp, pathToStrictRegExp } from '../lib/router-utils'

export const _observables = new WeakMap

export default class PoemBase extends MixinEmitter(HTMLElement) {
  disconnectedCallback () {
    var self = this
    if (self._els) self._els.empty(), self._els = null
    if (self._ctx) self._ctx = self._ctx.cleanup()
  }

  connectedCallback () {
    var e, self = this, fn = self.body
    if (typeof fn === 'function' && (e = fn.call(self, self.context()))) self.els(e)
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

    for (i = 0; i < keys.length; i++) ((k, v) => {
      self[k] = v
      var o = observables[k] = v.observable ? v : value(v)
      observable_property(self, k, o)
    })(k = camelize(keys[i]), opts[k])

    _observables.set(self, observables)

    for (i = 0; i < keys.length; i++) ((k) => {
      observables[camelize(k)](function (v) {
        if (v != null) self.setAttribute(k, v)
      })
    })(keys[i])
  }

  els (els) {
    var i, j, k, e, self = this, shadow = self.shadow

    var empty_shadow = () => { if (e = shadow.lastChild) do { if (!e.__s) shadow.removeChild(e) } while (e = e.previousSibling) }

    if (els == null) return shadow ? empty_shadow() : null
    if (!shadow) shadow = self.shadow = shadow === false ? self : self.attachShadow({mode: 'open'})

    var put_els = (els) => {
      if (!self._els) {
        shadow.aC((self._els = new ObservableArray(...els)), self._ctx.h.cleanupFuncs)
      } else {
        // DESIRE: do some sort of intelligent dom diffing instead of this hack
        if (self._els.length !== els.length) for (j = 0; j < self._els.length; j++) {
          if (!~els.indexOf(self._els[j])) {
            self._els.remove(j)
          }
        }
        // TESTME - this should be tested throughly
        for (i = 0; i < els.length; i++) {
          var exists = false
          e = els[i]
          for (var j = 0; j < self._els.length; j++) {
            if (e === self._els[j]) {
              exists = true
              if (i !== j) {
                if (~(k = self._els.indexOf(e)))
                  self._els.move(k, i)
                else self._els.replace(j, e)
                break
              } // else do nothing
            } else if (i === j) {
              exists = true
              if (~(k = self._els.indexOf(e)))
                self._els.move(k, i)
              else self._els.replace(j, e)
            }
          }

          if (exists === false) {
            self._els.insert(i, e)
          }
        }
      }
    }

    if (self._els || (k = Array.isArray(els))) put_els(k ? els : [ isNode(els) ? els : txt(els) ])
    else empty_shadow(), shadow.aC(els, self._ctx.h.cleanupFuncs)
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
      if (v != null) self.setAttribute(k, v)
    })
    return o
  }

  attrx (k, fn) {
    return transform(typeof k === 'string' ? this.attr(k) : k, fn)
  }

  // observe (event, attr, fn) {
  //   cleanupFuncs.push(event(this, attr, event)(fn))
  // }

  get style () {
    return super.style
  }

  set style (txt) {
    var self = this
    if (typeof txt === 'object') {
      if (!self.context().cleanupFuncs) debugger
      return set_style(self, txt, self.context().cleanupFuncs)
    }
    var shadow = self.shadow
    var e = ~txt.indexOf('://') ? h('link', {href: txt}) : h('style', txt)
    if (!shadow) shadow = self.shadow = shadow === false ? self : self.attachShadow({mode: 'open'})
    e.__s = 1 // set this, so the node won't be removed when the shadow is emptied (stupid hack... obviously)
    shadow.appendChild(e)
  }

  context (ns = '_ctx') {
    var ctx
    return this[ns] || (this[ns] = ctx = new_context({h, s}), h.cleanupFuncs.push(() => { ctx.cleanup() }), ctx)
  }

  get observables () {
    return _observables.get(this)
  }

  // set observables (v) {
  //   _observables.set(this, v)
  // }
}
