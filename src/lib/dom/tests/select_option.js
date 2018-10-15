import { panel_fixture } from '../testing'

function select_option ({G, C, h, t, c, v, m}) {
  var selected = v()

  return h('div.select_option',
    'selector: ',
    h('select.selector', {value: selected},
      h('option', {disabled: true, selected: true, value: ''}, 'please select...'),
      h('option', {value: 1}, 'one'),
      h('option', {value: 2}, 'two'),
      h('option', {value: 3}, 'three'),
      h('option', {value: 4}, 'four')
    ),
    h('input', {type: 'text', value: selected, placeholder: 'nothing selected yet...'}),
    h('.output',
      'selected: ',
      t(selected, (val) => val ? h('b', val) : h('i', '(none)'))
  )
}

panel_fixture(select_option, {}, {}, (panel) => {
  const sel = panel.find('.selector')
  const out = panel.find('.output')
  const txt = panel.find('input')

  panel.test("numbers are used as strings", (t) => {
    panel
      .click(sel, () => {
        t.equal(txt.value, '')
        t.equal(sel.value, '')
        t.equal(out.innerText, 'selected: ')
      })
      .type('[down]', () => {
        t.equal(txt.value, 'one')
        t.equal(sel.value, 1)
      })
    t.equal(st3.innerText, "testing and 1234 are not at the zoo")
  })
})
