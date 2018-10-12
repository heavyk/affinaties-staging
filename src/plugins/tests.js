import { pluginBoilerplate } from '../lib/plugins/plugin-boilerplate'
import { value, transform, compute, modify } from '../lib/dom/observable'

import { h as hh } from '../lib/dom/hyper-hermes'
import { body, doc } from '../lib/dom/dom-base'

import { getElementById } from '../lib/dom/dom-base'
import requestAnimationFrame from '../lib/dom/request-animation-frame'

import PromiseQueue from '../lib/promise-queue'

const qunit = require('qunit')
const syn = require('syn')

var _fixture = hh('div#qunit-fixture', {s: {visibility: 'hidden'}})

body.aC([ hh('div#qunit'), _fixture ])

qunit.module('testing tests module')

// a traditional test
qunit.test("setTimeout", t => {
  const done = t.async()
  setTimeout(() => {
    t.ok('yay')
    done()
  }, 10)
})

// a fixture test
function word_input ({G, C}) {
  const {h, t, c, v, m} = G
  var w1 = v(), w2 = v()

  return h('div.tpl_words',
    h('div.word-input',
      h('input', {type: 'text', value: w1, placeholder: 'type a name...', autofocus: true}),
      h('span', ' and '),
      h('input', {type: 'text', value: w2, placeholder: 'type a name...'})
    ),
    h('div#st1', h('b', w1), ' goes to the market'),
    h('div#st2', h('b', w2), ' stays home'),
    h('div#st3', h('b', w1), ' and ', h('b', w2), ' are not at the zoo')
  )
}

// test_fixture(testing_panel, C, D, (fixture) => {})
test_fixture(word_input, { lala: 1234 }, {}, (fixture) => {
  var input = fixture.get_all('input')
  const st3 = fixture.get('div#st3')

  fixture.test("input text into two boxes and concatenate the strings", (t) => {
    fixture
    .click(input[0])
    .type('sally', () => {
      t.equal(input[0].value, 'sally')
      t.equal(st3.innerText, "sally and  are not at the zoo")
    })
    .click(input[1])
    .type('jane', () => {
      t.equal(input[1].value, 'jane')
      t.equal(st3.innerText, "sally and jane are not at the zoo")
    })
  })

  fixture.test("clicking on input selects all text by default", (t) => {
    fixture
    .click(input[0])
    .type('\b', () => {
      t.equal(input[0].value, '')
    })
  })
})



qunit.start()

// ================================
// ================================
// ================================



class FixtureInteraction extends PromiseQueue {
  constructor (fn, el) {
    super()
    this.fn = fn
    this.el = this.fixture = el
  }

  get (sel) {
    return this.fixture.querySelector(sel)
  }

  get_all (sel) {
    return this.fixture.querySelectorAll(sel)
  }

  test (desc, test_fn) {
    this.add(() => new Promise((resolve) => {
      qunit.test(desc, t => {
        this.pause()
        const test_done = t.async()
        test_fn(t, this)
        this.then(test_done)
        this.resume()
      })
      resolve()
    }))
    return this
  }

  click (el, options) {
    this.add(() => {
      return new Promise((resolve) => {
        syn('_click', el, options, () => {
          this.el = el
          resolve()
        })
      })
    })
    return this
  }

  rclick (el, options) {
    this.add(() => {
      return new Promise((resolve) => {
        syn('_rightClick', el, options, () => {
          this.el = el
          resolve()
        })
      })
    })
    return this
  }

  dblclick (el, options) {
    this.add(() => {
      return new Promise((resolve) => {
        syn('_dblclick', el, options, () => {
          this.el = el
          resolve()
        })
      })
    })
    return this
  }

  // TODO
  // move (txt) {
  //   this.stack.push(new Promise((resolve) => {
  //     syn('_type', this.el, txt, resolve)
  //   }))
  // }
  //
  // TODO
  // drag (el, to) {
  //   this.stack.push(new Promise((resolve) => {
  //     syn('_type', this.el, txt, resolve)
  //   }))
  // }

  key (char, cb) {
    this.add(() => {
      return new Promise((resolve) => {
        syn('_key', this.el, char, resolve)
      })
    })
    return cb ? this.then(cb) : this
  }

  type (txt, cb) {
    this.add(() => {
      return new Promise((resolve) => {
        syn('_type', this.el, txt, resolve)
      })
    })
    return cb ? this.then(cb) : this
  }

  go (delay = 0, cb) {
    this.add(() => {
      return new Promise((resolve) => {
        if (delay === 0) requestAnimationFrame(resolve)
        else setTimeout(resolve, delay)
      })
    })
    return cb ? this.then(cb) : this
  }

  // parallel(fns, cb) {
  //   this.add(() => Promise.all(
  //     fns.map((fn) => new Promise((resolve) => { resolve(cb()) }))
  //   ))
  //   return cb ? this.then(cb) : this
  // }

  then (cb) {
    this.add(() => new Promise((resolve) => { resolve(cb()) }))
    return this
  }
}

function test_fixture (testing_panel, C = {}, D = {}, test_runner) {
  let beginner = ({G, C}) => {
    // temporary, for now...
    // this stupid shit is required because making contexts is super supid and needs to be rethought.
    // I need to provide a 'lib' to the plugin with the following (and other) important functions.
    // I also need a way to make a context. I think the best way will be to give the plugin the lib
    // and then let it make its own contexts how it pleases...
    G.t = transform
    G.v = value
    G.c = compute
    G.m = modify

    // this should only happen in production env, and it should report the error or something.
    // for now, it's bad because it doesn't pause the debugger
    try {
      return testing_panel({G, C, h: G.h})
    } catch (e) {
      console.error('error in the test panel:', e)
    }
  }

  let after_created = (frame) => {
    const fixture = new FixtureInteraction(testing_panel, frame)
    fixture.pause()
    qunit.module(testing_panel.name)
    test_runner(fixture)
    fixture.resume()
  }

  pluginBoilerplate(testing_panel.name, _fixture, C, D, {}, beginner, after_created)
}
