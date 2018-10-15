import { panel_fixture } from '../testing'

function press_boink ({G, C}) {
  const {h, t, c, v, m} = G
  var boinked = v(false)
  var pressed = v(false)

  return h('div.press_boink',
    h('div.boink',
      h('h6', "boink!"),
      h('div.buttons',
        h('span', 'boinked: ', t(boinked, (v) => v ? 'YES!' : 'no...')),
        h('button', {observe: {boink: boinked}}, 'boink')
      )
    ),
    h('div.press',
      h('h6', "press!"),
      h('div.buttons',
        h('span', 'pressed: ', t(pressed, (v) => v ? 'YES!' : 'no...')),
        h('button', {observe: {press: pressed}}, 'press me')
      )
    ),
    h('div.boink-counter',
      h('h6', "boink counter"),
      h('div.buttons',
        h('button', {observe: {boink: m(num, num => num + 1)}}, 'num++'),
        h('span.count', 'free boinks:', num),
        h('button', {observe: {boink: m(num, num => num - 1)}}, 'num--')
      )
    )
  )

}
