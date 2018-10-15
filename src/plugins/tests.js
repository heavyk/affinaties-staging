import { qunit, panel_fixture } from '../lib/dom/testing'

qunit.module('random tests')

// a traditional test
qunit.test("setTimeout", t => {
  const done = t.async()
  setTimeout(() => {
    t.ok('yay')
    done()
  }, 10)
})

import '../lib/dom/tests/press_boink'
import '../lib/dom/tests/word_input'
