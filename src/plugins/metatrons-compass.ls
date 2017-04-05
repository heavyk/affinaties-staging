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

# palabras:
# membership --> clout
# pertenecia --> palanca

# TODO: otro plugin: playaz-club
metatrons-compass = ({config, G, set_config, set_data}) ->
  {h, s} = window.G = G
  G.width (v, old_width) !-> console.log \width, old_width, '->', v
  # G.orientation (v) !-> console.log 'orientation', v


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
      if i < 6 => circles.push {x: cx + x, y: cy + y, r: _r}
      if num_between > 0
        if last_x isnt null
          for j from 1 to num_between
            t = j / (num_between+1)
            xx = (1 - t) * last_x + t * x
            yy = (1 - t) * last_y + t * y
            circles.push {x: cx + xx, y: cy + yy, r, fill: 'rgba(120,60,60,.5)'}
            circles.push {x: cx + xx, y: cy + yy, r: _r, fill: 'rgba(120,60,60,.5)'}
        last_x = x
        last_y = y

  G.E.frame.aC [

    s \svg.grid width: G.width, height: G.height, s: {background: '#333'}, #, s: {position: \fixed, left: table-margin-sides, top: table-margin-top},
      s \g.circles, circles

    window.machina =\
    h \poem-state-machine, {width: 40, active: false}, (G) ->
      {h} = G
      # o = @observables
      # style
      @style '''
      :host {
        color: #f00;
        position: absolute;
      }
      '''

      # attrs:
      # width = @attr \width, 40
      height = @attr \height, 40
      img-height = @attr \img-height, 40#, true

      # computed:
      search-width = compute [G.width], (w) -> w / 3
      search-left = compute [G.width], (w) -> w / 3

      # components:
      common-div = h \div.common, "common div"
      search-box = h \input.search-box.a-05,
        type: \text
        placeholder: 'search...'
        style:
          opacity: 0.4
          position: \fixed
          width: px search-width
          left: px search-left
        observe:
          input: (v) !->
            console.log \observed.input, v
          focus: (v) !->
            search-box.style.top = "#{if v => 0 else -10}px"
            search-box.style.opacity = if v => 1 else 0.4
          keyup: (v) !->
            console.log 'send it!!', v
          # 'keyup.event': (ev) -> ev.which is 13 and not ev.shift-key

      # h \img.avatar,
      #   src: 'https://secure.gravatar.com/avatar/4e9e35e45c14daca038165a11cde7464'
      #   style:
      #     position: \absolute
      #     width: img_width |> px
      #     height: img_height |> px
      #     top: img_padding |> px
      #     left: top_right |> px
      arr = []

      # states:
      '/': ->
        # splash screen + menu
        # logo + slogan
        h \div "poke her starz"

      '/table/:id/lala': ({id}) ->
        h \div, "table: #{id}"

      '/tables': ->
        tables = new RenderingArray G, (id, idx, {h}) ->

        h \div "tables:"

      disconnected: !->
        console.log \disconnected!


    # h \div.top-bar.col-12, ->
    #   img_width = value 40
    #   img_height = value 40
    #   img_padding = value 5
    #   border_width = compute [img_width, img_padding], (w, ib) -> w + (ib)
    #   top_right = compute [G.width, img_width, img_padding], (w, iw, ip) -> w - iw - ip
    #   bar_height = compute [img_height, img_padding], (h, p) -> h + (2 * p)
    #
    #
    #   return [
    #     # search-box
    #     h \img.avatar,
    #       src: 'https://secure.gravatar.com/avatar/4e9e35e45c14daca038165a11cde7464'
    #       style:
    #         position: \fixed
    #         width: img_width |> px
    #         height: img_height |> px
    #         top: img_padding |> px
    #         left: top_right |> px
    #   ]
    #   # h \g.opus-list, ->
    #   #   console.log \opus
    #   #   window.rects = rects = new ObservArray
    #   #   for v in abstract_art.value
    #   #     width = v.thumbnail.width
    #   #     height = v.thumbnail.height
    #   #     # rect = new Rect
    #   #     # console.log v.name
    #   #     # console.log v.accent-color, width, height
    #   #     r = new CustomRect {width, height}
    #   #     # r = h \custom-rect {width, height}
    #   #     rects.push r
    #   #
    #   #   # for r in rects
    #   #   #   console.log \rect, r.x, r.y
    #   #   pack rects, in-place: true
    #   #   # for r in rects
    #   #   #   console.log \rect, r.x, r.y, r.width, r.height
    #   #   return rects
    #   # h \div.some-list, ->

    ]
    #</svg>

plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, metatrons-compass
