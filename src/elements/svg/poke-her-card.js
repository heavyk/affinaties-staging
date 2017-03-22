import StateMachine from '../state-machine'

import { touch, hover, mousedown } from '../../lib/dom/observable'
import { _not } from '../../lib/dom/observable-logic'

// use `require` instead of import, to allow for bundle partitioning
const CARDS = require('../assets/playing-cards')

class Card extends StateMachine {
  constructor (id, opts) {
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
      // I don't like that it's only bound if the bound value is true... there should be another way of determining if the cards can be flipped
      const down = this.attr('down')
      if (down()) {
        G.h.cleanupFuncs.push(
          touch(svg)(this.attr_transform(down, _not)),
          mousedown(svg)(this.attr_transform(down, _not))
        )
      }

      return {
        '/': () => {
          return svg
        },
      }
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

export default Card
