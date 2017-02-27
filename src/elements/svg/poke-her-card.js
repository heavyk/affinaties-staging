import StateMachine from '../state-machine'

import { touch, hover } from '../../lib/dom/observable'

// import CARDS from '../../assets/playing-cards'
const CARDS = require('../assets/playing-cards')

class Card extends StateMachine {
  constructor (id, opts) {
    super(opts, (G) => {
      var svg = CARDS[this._id || id].call(this, G)
      // const _id = this.attr('card', this._id || id)
      const w = this.attr('width')
      const h = this.attr('height')
      const down = this.attr('down')
      w((v) => { h(v * 1.45) })
      h((v) => { w(v * 1 / 1.45) })

      // this.observe()
      // h.cleanupFuncs.push(
        // touch(svg)(this.attr('down'))
        // hover(svg)(this.attr('down'))
        // hover(svg)((v) => { console.log('down', v) })
      // )

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
    console.log('reset to id', id)
    super.reset()
  }

}


export default Card
