import { panel_fixture } from '../testing'

function word_input ({G, C}) {
  const {h, t, c, v, m} = G // this line should go away. instead, it'll all be passed in on the main args, like so:
  var w1 = v(), w2 = v()

  return h('div.word_input',
    h('div.word-input',
      h('input', {type: 'text', value: w1, placeholder: 'type a name...'}),
      h('span', ' and '),
      h('input', {type: 'text', value: w2, placeholder: 'type a name...'})
    ),
    h('div#st1', h('b', w1), ' goes to the market'),
    h('div#st2', h('b', w2), ' stays home'),
    h('div#st3', h('b', w1), ' and ', h('b', w2), ' are not at the zoo')
  )
}

// TODO
// function word_input_preinit ({G, C, D}) {
//   const {h, t, c, v, m} = G
//
//   return h('div.word_input',
//     h('div.word-input',
//       h('input', {type: 'text', value: D.w1, placeholder: 'type a name...'}),
//       h('span', ' and '),
//       h('input', {type: 'text', value: D.w2, placeholder: 'type a name...'})
//     ),
//     h('div#st1', h('b', D.w1), ' goes to the market'),
//     h('div#st2', h('b', D.w2), ' stays home'),
//     h('div#st3', h('b', D.w1), ' and ', h('b', D.w2), ' are not at the zoo')
//   )
// }
//
// // TODO: get preinitialised input working:
// panel_fixture(word_input_preinit, { w1: 'testing', w2: 1234 }, {}, (panel) => {
//   const st3 = panel.find('div#st3')
//
//   panel.test("numbers are used as strings", (t) => {
//     t.equal(st3.innerText, "testing and 1234 are not at the zoo")
//   })
// })

panel_fixture(word_input, {}, {}, (panel) => {
  panel.test("input text into two boxes and concatenate the strings", (t) => {
    const input = panel.find_all('input')
    const st3 = panel.find('div#st3')

    panel
    .blur()
    .click(input[0])
    .type('sally', () => {
      t.equal(input[0].value, 'sally')
      t.equal(st3.innerText, "sally and are not at the zoo")
    })
    .click(input[1])
    .type('jane', () => {
      t.equal(input[1].value, 'jane')
      t.equal(st3.innerText, "sally and jane are not at the zoo")
    })
  })

  panel.test("clicking on input selects all text by default", (t) => {
    const input = panel.find('input')
    // input.value = 'test'
    t.ok(input)
    debugger

    panel
    .click(input)
    .type('test')
    .blur()
    .click(input)
    .type('\b', () => {
      t.equal(input.value, '')
    })
  })
})
