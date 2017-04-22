import PoemBase from './poem-base'

export default class PrompterPanel extends PoemBase {
  constructor (fn) {
    super({}, (G) => {
      this.fn = fn
    })
  }

  prompt (msg, options, _answer) {
    var self = this
    var answer = (a) => {
      if (!_answer(a)) self.close() // remove all elements if answer did not return truthy
    }

    self.els(self.fn((self._ctx = self.context()), msg, options, answer))
  }

  close () {
    var ctx = this._ctx
    if (ctx) ctx.cleanup()
    this.els()
  }
}

import { special_elements } from '../lib/dom/hyper-hermes'
special_elements['prompter-panel'] = 1 // fn:(G, msg, options, answer)
window.customElements.define('prompter-panel', PrompterPanel)
