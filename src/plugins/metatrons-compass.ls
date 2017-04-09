``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
# ``import load_sdk from '../lib/load-sdk-h'``
``import { doc, special_elements } from '../lib/dom/hyper-hermes'``
``import { ObservableArray, RenderingArray} from '../lib/dom/observable-array'``
``import { value, transform, compute, px, observable_property, bind1 } from '../lib/dom/observable'``
``import polarToCartesian from '../lib/calc/polarToCartesian'``
# ``import xhr from '../lib/xhr'``
# ``import { rand, rand2, randomId, randomEl, randomIds, randomPos, randomDate, randomCharactor, between, lipsum, word, obj } from '../lib/random'``

``import StateMachine from '../elements/state-machine'``

# special_elements['poke-her-card'] = 2 # opts, fn
special_elements['poem-state-machine'] = 2 # opts, fn
window.custom-elements.define \poem-state-machine, StateMachine
# window.custom-elements.define \poem-modal, Modal
# window.custom-elements.define \poke-her-card, Card

const HALF_PI = Math.PI / 180
const DEFAULT_CONFIG =
  lala: 1155

foto_size = (size) ->
  _px = 0
  switch size
  | \x => _px = 1920
  | \l => _px = 1440
  | \m => _px = 720
  | \s => _px = 360
  | \t => _px = 240
  | \a => _px = 120
  | \z => _px = 49
  | \y => _px = 36
  | \k => _px = 28
  _px

foto = ({h}, opts = {}) ->
  px = value (foto_size opts.size)
  src = value opts.src
  h \img {src, width: px, height: px}


metatrons-compass = ({config, G, set_config, set_data}) ->
  {h, s} = window.G = G
  G.width (v, old_width) !-> console.log \width, old_width, '->', v

  # move to a two-stage model where:
  # 1. the number of circles necessary to implement the layers count is added
  # 2. the positions/sizes of the circles are updated afterward (according to the width/height of the window)

  # next:
  # 1. allow for shapes to be drawn on the circles (eg. metatron's cube, tree of life, etc.)
  # 2. give the plugin a small interface to modify the layer count, colors, etc.

  window.circles =\
  circles = new RenderingArray G, (d, idx, {s}) ->
    s \circle cx: d.x, cy: d.y, r: d.r, style: {
      stroke-width: 1
      stroke: '#fff'
      fill: d.fill or \none
    }

  cx = G.width! / 2
  cy = G.height! / 2
  r = 60
  _r = r / 2
  r2 = r * 2
  layers = 3
  for layer til layers
    n = if layer > 0 => 7 else 1
    inc = 360 / 6
    r2 = r * layer * 2
    last_x = last_y = null
    num_between = layer - 1
    for i til n
      x = r2 * Math.sin (i*inc) * HALF_PI
      y = r2 * Math.cos (i*inc) * HALF_PI
      if i < 6 => circles.push {x: cx + x, y: cy + y, r}
      # if i < 6 => circles.push {x: cx + x, y: cy + y, r: _r}
      if num_between > 0
        if last_x isnt null
          for j from 1 to num_between
            t = j / (num_between+1)
            # fast ???
            # v0 + t * (v1 - v0)
            xx = last_x + t * (x - last_x)
            yy = last_y + t * (y - last_y)

            # precise
            # (1 - t) * v0 + t * v1
            xx = (1 - t) * last_x + t * x
            yy = (1 - t) * last_y + t * y
            circles.push {x: cx + xx, y: cy + yy, r, fill: 'rgba(120,60,60,.5)'}
            # circles.push {x: cx + xx, y: cy + yy, r: _r, fill: 'rgba(120,60,60,.5)'}
        last_x = x
        last_y = y

  G.E.frame.aC [
    s \svg.grid width: G.width, height: G.height, s: {background: '#333'}, #, s: {position: \fixed, left: table-margin-sides, top: table-margin-top},
      s \g.circles, circles
  ]

plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, metatrons-compass
