import { error } from '../../lib/utils'
import PromiseQueue from '../../lib/promise-queue'

import pluginBoilerplate from '../../lib/plugins/plugin-boilerplate'
import { h as hh } from '../../lib/dom/hyper-hermes'
import { doc, body } from '../../lib/dom/dom-base'
import { value, transform, compute, modify } from '../../lib/dom/observable'
import { attribute } from '../../lib/dom/observable-event'
import requestAnimationFrame from '../../lib/dom/request-animation-frame'

// YUCK! someday remove (and use simulant) or improve syn
const syn = require('syn')
const qunit = require('qunit')

// TESTING INTERFACE
var fixtures = {} // global reference to each fixture's FixtureInteraction instance

// WRITING JS LIKE THIS, IS SO UGLY!
// ideally, something much more Ractive would be a lot easier to read.
// perhaps, I think maybe the ractive parser could come to see some use soon :)
var _show_fixture = hh('input#show-fixture', {type: 'checkbox'})
var _swapper = hh('div#fixture-swap', {s: {color: '#09a0ff', position: 'fixed', top: '10px', right: '10px'}},
  _show_fixture, hh('label', {for: 'show-fixture'}, 'Show Fixture')
)

// TODO: show test steps
// - restart a test, stopping before a step executes
// - execution speed: should delay ms before continuing to the next one... (slider)
// ------------------------
// [<] [≠] [>]     •---|--•
// ------------------------
// [        prev -2       ]
// [        prev -1       ]
// [     current test     ]
// [        next +1       ]
// [        next +2       ]
// ======(expandable)======

var _show_fixture_checked = attribute(_show_fixture, 'checked')
// qunit clones the fixture and remakes it when beginning the tests.
// we prefer to do this ourselves, considering one of the tested features is the cleanup action.
// as a result, the specific id, `qunit-fixture` cannot be used
// var qunit_fixture = hh('div#qunit-fixture', 'unused')
var _fixture = hh('div#fixturez', {s: {visibility: transform(_show_fixture_checked, (val) => val ? 'visible' : 'hidden'), opacity: transform(_show_fixture_checked, (val) => val ? 1 : 0)}})

var _output = hh('div#qunit', {s: {visibility: transform(_show_fixture_checked, (val) => val ? 'hidden' : 'visible')}})

body.aC([ _output, _fixture, _swapper ])

// it would be really cool to be able to replay and step through the tests

qunit.begin((details) => {
  _show_fixture_checked(true)
})

qunit.done(({ failed, passed, total, runtime }) => {
  console.log(failed, passed, total, runtime)
  if (failed > 0) console.log("TODO! show a quick failure message")
  else _show_fixture_checked(false)
})

qunit.on('testEnd', (test) => {
  if (test.status === 'failed') {
    console.log('failed:', test)
    // const done = qunit.async()

    // show the error panel thingie
    // add resume button with `once` on the listener.
  } else {
    console.log('passed:', test)
  }
})

qunit.start()


// ===========
// ===========
// ===========

export { qunit, syn }


export class FixtureInteraction extends PromiseQueue {
  constructor (fn, el) {
    super()
    this.fn = fn
    this.el = this.fixture = el
  }

  find (sel) {
    if (!this.testing) error("find / find_all only work inside of a test")
    return this.el.querySelector(sel)
  }

  find_all (sel) {
    if (!this.testing) error("find / find_all only work inside of a test")
    return this.el.querySelectorAll(sel)
  }

  blur (cb) {
    this.add(() => new Promise((resolve) => {
      var input = hh('input')
      body.aC(input)
      input.focus()
      body.rC(input)
      resolve()
    }))
    return cb ? this.then(cb) : this
  }

  test (desc, test_fn) {
    this.add(() => new Promise((resolve) => {
      qunit.test(desc, t => {
        this.testing = desc
        this.pause()
        const test_done = t.async()
        // TODO: instantiate the panel in the frame
        test_fn(t)
        this.then(() => { test_done(); this.testing = null })
        this.resume()
      })
      resolve()
    }))
    return this
  }

  click (el, options, cb) {
    this.add(() => new Promise((resolve) => {
      syn('_click', el, options, () => {
        this.el = el
        resolve()
      })
    }))
    return (typeof options === 'function' ? cb = options : cb) ? this.then(cb) : this
  }

  rclick (el, options, cb) {
    this.add(() => {
      return new Promise((resolve) => {
        syn('_rightClick', el, options, () => {
          this.el = el
          resolve()
        })
      })
    })
    return (typeof options === 'function' ? cb = options : cb) ? this.then(cb) : this
  }

  dblclick (el, options, cb) {
    this.add(() => {
      return new Promise((resolve) => {
        syn('_dblclick', el, options, () => {
          this.el = el
          resolve()
        })
      })
    })
    return (typeof options === 'function' ? cb = options : cb) ? this.then(cb) : this
  }

  // TODO
  // move_cursor (from, to, duration) {
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

export function panel_fixture (testing_panel, C = {}, D = {}, test_runner) {
  const name = testing_panel.name
  if (!name) error("cannot determine the name of the panel. please use a named function")

  let beginner = ({G, C}) => {
    // DUPLICATED CODE... plugin-boilerplate already does this
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
    if (fixtures[name]) error(`fixture with name (${name}) has already been defined. please use a unique name.`)
    const fixture = new FixtureInteraction(testing_panel, frame)
    fixtures[name] = fixture
    fixture.pause()
    qunit.module(name)
    test_runner(fixture)
    fixture.resume()
  }

  pluginBoilerplate(name, _fixture, C, D, {}, beginner, after_created)
}
