import PoemBase from '../poem-base'

import { touch, hover, mousedown } from '../../lib/dom/observable'
import { _not } from '../../lib/dom/observable-logic'
import { extract_opts_val } from '../../lib/utils'

// use `require` instead of import, to allow for bundle partitioning
const CARDS = require('../assets/playing-cards')

// TODO: remove all non-observable params before passing it to the super
const options = ['touchflip']

export default class Card extends PoemBase {
  constructor (id, opts = {}) {
    var touchflip = extract_opts_val(opts, 'touchflip')
    super(opts, (G) => {
      if (typeof id === 'function') {
        // `id` is an observable
        this._id = id()
        id((id) => { if (id !== this._id) this.reset(id) })
      } else if (id != null) {
        this._id = id
      }

      var svg = CARDS[this._id].call(this, G)
      var style = this.style
      this.style = `
      :host {
        contain: layout style size;
      }`

      // maintain aspect ratio
      const _w = this.attr('width')
      const _h = this.attr('height')
      _w((v) => { style.width = v + 'px'; _h(v * 1.45) })
      _h((v) => { style.height = v + 'px'; _w(v * 1 / 1.45) })

      // if the card is face down, then allow for mouse/touch to show the cards (eg. cards in your hand)
      if (touchflip) {
        const down = this.attr('down')
        G.h.cleanupFuncs.push(
          touch(svg)(this.attrx(down, _not)),
          mousedown(svg)(this.attrx(down, _not))
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
special_elements.define('poke-her-card', Card, ['id', 'opts'])
