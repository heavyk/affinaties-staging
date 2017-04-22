import PoemBase from './poem-base'

import { value } from '../lib/dom/observable'


export default class PrompterTip extends PoemBase {
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
    var self = this
    var ctx = self._ctx = self.context()
    var h = ctx.h
    var tipW = self.attr('tip-w')
    var tipH = self.attr('tip-h')
    var answer = (a) => {
      if (!_answer(a)) self.close() // remove all elements if answer did not return truthy
    }
    var innerTip = self.fn(ctx, msg, options, answer)
    var inner, outer = h('.tooltip-outer', {s: {left: self.attr('x'), top: self.attr('y')}},
      h('.tooltip-arrow'),
      inner = h('.tooltip-inner', innerTip)
    )
    self.els(outer)
    setTimeout(() => {
      tipW(inner.clientWidth / 2)
      tipH(inner.clientHeight / 2)
      inner.style.visibility = 'visible'
      if (typeof options.onfocus === 'function') options.onfocus(inner)
    }, 0)
  }

  close () {
    var ctx = this._ctx
    if (ctx) ctx.cleanup()
    this.els()
  }
}

import { special_elements } from '../lib/dom/hyper-hermes'
special_elements['prompter-tip'] = 1 // fn:(G, msg, options, answer)
window.customElements.define('prompter-tip', PrompterTip)
