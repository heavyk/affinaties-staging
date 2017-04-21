import PoemBase from '../poem-base'

import { touch, hover, mousedown } from '../../lib/dom/observable'
import { _not } from '../../lib/dom/observable-logic'

// use `require` instead of import, to allow for bundle partitioning
const CARDS = require('../assets/playing-cards')

// TODO: remove all non-observable params before passing it to the super
const options = ['touchflip']

export default class Card extends PoemBase {
  constructor (id, opts = {}) {
    var touchflip
    if (touchflip = opts.touchflip) delete opts.touchflip
    super(opts, (G) => {
      if (typeof id === 'function') {
        // `id` is an observable
        this._id = id()
        id((id) => { if (id !== this._id) this.reset(id) })
      } else if (id != null) {
        this._id = id
      }

      var svg = CARDS[this._id].call(this, G)

      // maintain aspect ratio
      const _w = this.attr('width')
      const _h = this.attr('height')
      _w((v) => { _h(v * 1.45) })
      _h((v) => { _w(v * 1 / 1.45) })

      // if the card is face down, then allow for mouse/touch to show the cards (eg. cards in your hand)
      if (touchflip) {
        const down = this.attr('down')
        G.h.cleanupFuncs.push(
          touch(svg)(this.attr_transform(down, _not)),
          mousedown(svg)(this.attr_transform(down, _not))
        )
      }

      return svg
    })
  }

  reset (id) {
    this._id = id
    super.reset()
  }

}

import { special_elements } from '../../lib/dom/hyper-hermes'
special_elements['poke-her-card'] = 2 // id, opts
window.customElements.define('poke-her-card', Card)
