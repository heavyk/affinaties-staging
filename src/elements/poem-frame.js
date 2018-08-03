
import { value } from '../lib/dom/observable'
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
        roadtrip.unwatchLinks = roadtrip.watchLinks(self)
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
    let section_name = '_section_' + name
    let el = this[section_name] || (this[section_name] = value())
    if (typeof fn === 'function') {
      let local_ctx = this.context(section_name + '_ctx')
      this.context().h.cleanupFuncs.push(() => { local_ctx.cleanup() })
      el(fn.call(this, local_ctx))
    } else {
      el(comment('SECTION:' + name))
    }

    return el
  }
}

import { special_elements } from '../lib/dom/hyper-hermes'
special_elements.define('poem-frame', PoemFrame, ['opts', 'function (G)'])
