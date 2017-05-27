
import { value } from '../lib/dom/observable'
import { context } from '../lib/dom/observable-array'
import { MixinEmitter } from '../lib/drip/MixinEmitter'
import { win, basePath, comment } from '../lib/dom/hyper-hermes'

import RoadTrip from '../roadtrip/roadtrip'
import PoemBase from './poem-base'

export default class PoemFrame extends PoemBase {
  disconnectedCallback () {
    super.disconnectedCallback()
    if (this.roadtrip) this.roadtrip.unwatchLinks()
  }

  connectedCallback () {
    var states, s, self = this
    var fn = self.body
    var roadtrip = self.roadtrip
    if (typeof fn === 'function' && typeof (states = fn.call(self, self.context())) === 'object') {
      for (s in states) roadtrip.add(s, states[s], self)

      roadtrip.start().then((els) => {
        if (els && !self.shadow) self.els(els)
        roadtrip.unwatchLinks = roadtrip.watchLinks()
      })
    }
  }

  reset () {
    this.disconnectedCallback()
    this.connectedCallback()
  }

  constructor (opts, fn) {
    super(opts, fn)
    this.shadow = false
    this.roadtrip = new RoadTrip(opts.base || basePath)
  }

  section (name, fn) { // TODO: add options (eg. for transitions, slide-left, slide-right)
    let _obv = '_section_obv_' + name
    let el = this[_obv] || (this[_obv] = value())
    if (typeof fn === 'function') {
      let local_ctx = this.context('_section_ctx_' + name)
      this.context().h.cleanupFuncs.push(() => { local_ctx.cleanup() })
      el(fn.call(this, local_ctx))
    } else {
      el(comment('SECTION:' + name))
    }

    return el
  }
}

import { special_elements } from '../lib/dom/hyper-hermes'
special_elements.define('poem-frame', PoemFrame, 2) // id, opts
