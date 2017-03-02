import StateMachine from '../state-machine'

import { touch, hover, mousedown, _not } from '../../lib/dom/observable'

// import CARDS from '../../assets/playing-cards'
const CARDS = require('../assets/playing-cards')

class Card extends StateMachine {
  constructor (id, opts) {
    super(opts, (G) => {
      // this._id = typeof id === 'function' ? id() : id
      if (typeof id === 'function') {
        // `id` is an observable
        this._id = id()
        id((id) => { if (id !== this._id) this.reset(id) })
      }
      var svg = CARDS[this._id || id].call(this, G)
      // const _id = this.attr('card', this._id || id)

      // maintain aspect ratio
      const _w = this.attr('width')
      const _h = this.attr('height')
      _w((v) => { _h(v * 1.45) })
      _h((v) => { _w(v * 1 / 1.45) })

      // if the card is face down, then allow for mouse/touch to show the cards (eg. cards in your hand)
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
        // up: ()
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
