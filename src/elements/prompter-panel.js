import PoemBase from './poem-base'

// import { touch, hover, mousedown } from '../../lib/dom/observable'
// import { _not } from '../../lib/dom/observable-logic'

// TODO: remove all non-observable params before passing it to the super
// const options = ['touchflip']

export default class PrompterPanel extends PoemBase {
  constructor (fn) {
    super({}, (G) => {
      this.fn = fn
      this.style(`
        .tooltip-arrow {
          position: absolute;
          top: -5px;
          left: 50%;
          width: 0;
          height: 0;
          margin-left: -5px;
          border: solid transparent;
          border-width: 0 5px 5px;
          border-bottom-color: #000;
        }
        .tooltip-inner {
          max-width: 200px;
          padding: 3px 8px;
          color: #fff;
          text-align: center;
          text-decoration: none;
          background-color: #000;
          border-radius: 4px;
          display: block;
          visibility: hidden;
        }
        .tooltip-outer {
          z-index: 100;
          position: fixed;
        }
      `)
    })
  }

  prompt (msg, options, _answer) {
    var ctx = this.context()
    var answer = (a) => {
      ctx.cleanup()
      if (!_answer(a)) this.els() // remove all elements if answer did not return truthy
    }
    this.els(this.fn(ctx, msg, options, answer))
  }

}

import { special_elements } from '../lib/dom/hyper-hermes'
special_elements['prompter-panel'] = 1 // fn:(G, msg, options, answer)
window.customElements.define('prompter-panel', PrompterPanel)
