import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'
import { win } from '../lib/dom/hyper-hermes'
import { value, transform, compute, modify } from '../lib/dom/observable'
import { ObservableArray, RenderingArray } from '../lib/dom/observable-array'
// import RoadTrip from '../roadtrip/roadtrip.js'

win.plugger = (starting_panel, C = {}, D = {}) => {
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
  pluginBoilerplate(null, 'id', C, D, {}, beginner)
}

// consent is not imposing your will on someone and having them just, not resist.
// consent means the other person wants to be doing the thing that you're doing.
// -vox 2016

///*
function plugin_demo ({G, C}) {
  const {h, t, c, v, m} = G
  let lala = v(C.lala)
  let num = v(11)
  let sum = c([num, lala], (num, lala) => num + lala)
  let boinked = v(false)
  let pressed = v(false)
  let selected = v()
  let w1 = v()
  let w2 = v()
  let item_text = v()
  let my_list = new ObservableArray('one', 'two', 'three')
  win.list = my_list
  // TEMPORARY CACA: (lol)
  G.E.body.aC(h('style', `
    h1, h3 { text-align: center }
    h1 { color: #900 }
    h3 { color: #600 }
  `))
  let tpl_cod = () => h('div.tpl_cod',
    'condition (lala) is:', lala, ' + (num) = ', sum
  )
  let tpl_obv = ({num}) => h('div.tpl_obv',
    'num is:', num,
    h('div.click',
      h('button', {observe: {boink: m(num, num => num + 1)}}, 'num++'),
      h('button', {observe: {boink: m(num, num => num - 1)}}, 'num--')
    )
  )
  let tpl_boink = ({num}) => h('div.tpl_boink',
    h('div.boink',
      h('span', 'boinked: ', t(boinked, (v) => v ? 'YES!' : 'no...')),
      h('button', {observe: {boink: boinked}}, 'boink')
    ), h('div.press',
      h('span', 'pressed: ', t(pressed, (v) => v ? 'YES!' : 'no...')),
      h('button', {observe: {press: pressed}}, 'press me')
    )
  )
  let tpl_words = () => h('div.tpl_words',
    h('div.word-input',
      h('input', {type: 'text', value: w1, placeholder: 'type a name...'}),
      h('span', ' and '),
      h('input', {type: 'text', value: w2, placeholder: 'type a name...'})
    ),
    h('div', h('b', w1), ' goes to the market'),
    h('div', h('b', w2), ' stays home'),
    h('div', h('b', w1), ' and ', h('b', w2), ' are not at the zoo')
  )
  let tpl_select = () => h('div.tpl_select',
    'selector: ',
    h('select.selector', {value: selected},
      h('option', {disabled: true, selected: true, value: ''}, 'please select...'),
      h('option', {value: 1}, 'one'),
      h('option', {value: 2}, 'two'),
      h('option', {value: 3}, 'three'),
      h('option', {value: 4}, 'four')
    ),
    h('input', {type: 'text', value: selected, placeholder: 'nothing selected yet...'}),
    ' selected: ', h('b', selected)
  )
  let tpl_list = () => h('div.tpl_list',
    h('div.my-list', new RenderingArray(G, my_list, (it, idx, {h}) => {
      return h('div', 'item: ', it)
    })),
    h('div.list-input',
      h('input', {type: 'text', value: item_text, placeholder: 'add an item...', observe: {keyup: (val) => {
        my_list.push(item_text())
        item_text('')
      }}})
    )
  )

  return h('div',
    h('h1', 'simple plugin demo'),
    h('hr'),
    h('h3', 'conditions, numbers, and transformations'),
    tpl_cod(),
    tpl_obv({num}),
    h('hr'),
    h('h3', 'mouse / touch events'),
    tpl_boink({num}),
    h('hr'),
    h('h3', 'text input'),
    tpl_words(),
    h('hr'),
    h('h3', 'select boxes'),
    tpl_select(),
    h('hr'),
    h('h3', 'list types'),
    tpl_list()
  )
}

plugger(plugin_demo, {lala: 1234})

//*/
