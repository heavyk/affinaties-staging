import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'
import { value, transform, compute, modify } from '../lib/dom/observable'
import requestAnimationFrame from '../lib/dom/request-animation-frame'

import '../elements/poem-frame'

function plugger (starting_panel, C = {}, D = {}) {
  let beginner = ({G, C}) => {
    // this stupid shit is required because making contexts is super supid and needs to be rethought.
    // I need to provide a 'lib' to the plugin with the following (and other) important functions.
    // I also need a way to make a context. I think the best way will be to give the plugin the lib
    // and then let it make its own contexts how it pleases...
    G.t = transform
    G.v = value
    G.c = compute
    G.m = modify
    return starting_panel({G, C})
  }
  pluginBoilerplate(null, 'id', C, D, {}, beginner) // doesn't work with generators...
  // pluginBoilerplate(null, 'id', C, D, {}, starting_panel)
}

function callback ({G, C}) {
  return h('poem-frame', {base: C.base}, router)
}

function button_adder ({G, C}) {
  const {h, t, v} = G
  // var/cod is retrieved from the C.
  // const {cod} = C
  let num = v(11)
  let tpl_cod = () => h('div', 'condition is:', cod)
  let tpl_obv = ({num}) => h('div', 'num is:', num)
  let tpl_boink = ({num}) => h('div',
    h('button', {onclick: modify(num, num => num + 1)}, 'num++'),
    h('button', {onclick: modify(num, num => num - 1)}, 'num--')
    // h('button', {onclick: () => num(num() + 1)}, 'num++'),
    // h('button', {onclick: () => num(num() - 1)}, 'num--')
  )
  // ...
  let el = h('div',
    h('h1', 'button adder!'),
    tpl_obv({num}),
    tpl_boink({num})
  )
  return el
}
//
// export function (router, main) {
//   return {
//
//   }
// }

// testing to make sure it works...
// now, we need something like button_adder to be made by elixir
plugger(button_adder)

// export default plugger
