``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
# ``import h from '../lib/dom/hyper-hermes'``
# ``import load_sdk from '../lib/load-sdk-h'``
``import { s, h, special_elements } from '../lib/dom/hyper-hermes'``
``import { ObservableArray, RenderingArray} from '../lib/dom/observable-array'``
``import { value, transform, compute, px, observable_property } from '../lib/dom/observable'``
``import polarToCartesian from '../lib/calc/polarToCartesian'``
# ``import xhr from '../lib/xhr'``
``import { Table, Player } from '../lib/game/texas-holdem'``
``import { holdem_table } from '../lib/game/texas-holdem-logic'``
``import { rankHandInt } from '../lib/game/rank-hand'``
# ``import { rand, rand2, randomId, randomEl, randomIds, randomPos, randomDate, randomCharactor, between, lipsum, word, obj } from '../lib/random'``

``import StateMachine from '../elements/state-machine'``
# ``import { Modal } from '../elements/state-machine'``
``import '../elements/svg/poke-her-card'``
# ``import '../elements/svg/poke-her-playa'``

# special_elements['poke-her-card'] = 2 # opts, fn
special_elements['poem-state-machine'] = 2 # opts, fn
window.custom-elements.define \poem-state-machine, StateMachine
# window.custom-elements.define \poem-modal, Modal
# window.custom-elements.define \poke-her-card, Card

const doc = document
const IS_LOCAL = ~doc.location.host.index-of 'localhost'

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
poke-her-starz = ({config, G, set_config, set_data}) ->
  window.G = G
  G.width (v, old_width) !-> console.log \width, old_width, '->', v
  # G.orientation (v) !-> console.log 'orientation', v

  table = holdem_table 50, 100, 4, 10, 100, 1000
  # table.add-player 'kenny', 1000

  console.log 'table', table

  table = new Table 50, 100, 4, 10, 100, 1000 # smallBlind, bigBlind, minPlayers, maxPlayers, minBuyIn, maxBuyIn
  table.add-player 'bob', 1000
  table.add-player 'jane', 1000
  table.add-player 'dylan', 1000
  table.add-player 'john', 1000
  table.start-game!

  p = table.players
  # deal
  p.0.Call!
  p.1.Call!
  p.2.Call!
  p.3.Call!

  # flop
  p.0.Call!
  p.1.Call!
  p.2.Call!
  p.3.Call!

  # turn
  p.1.Bet 2
  p.0.Bet 50
  p.2.Bet 50
  p.3.Call!
  # needed to finish the round because jane (p.1) only bet 2 which does not match the maxBet amount (50)
  p.1.Call!

  # river
  p.0.Call!
  p.1.Call!
  p.2.Call!
  p.3.Call!
  # showdown!!
  # show winners

  console.log table.game



  const S1 = 11
  const S2 = 9
  const S3 = 5
  const TABLE_PADDING = 50
  const TABLE_PADDING2 = TABLE_PADDING * 2
  const TABLE_STROKE = 5.5
  const TABLE_STROKE2 = TABLE_STROKE * 2

  middle-area-width = transform G.width, (v) -> 0 + ((v / S1) * S2)
  middle-area-height = transform G.height, (v) -> 0 + ((v / S1) * S2)
  middle-area-rx = transform middle-area-width, (v) -> v / 2
  middle-area-ry = transform middle-area-height, (v) -> v / 2
  middle-area-rxs = transform middle-area-rx, (v) -> v - TABLE_STROKE2 # because two half strokes always equals the total stroke
  middle-area-rys = transform middle-area-ry, (v) -> v - TABLE_STROKE2 # because two half strokes always equals the total stroke
  middle-area-card-margin = transform middle-area-width, (v) -> v * 0.025
  middle-area-card-width = compute [middle-area-width, middle-area-card-margin], (w, m) -> ((w - TABLE_PADDING2) / 5) - m
  middle-area-card-height = transform middle-area-card-width, (w) -> w * 1.45

  middle-area-space-width = transform middle-area-card-width, (w) -> w + 3 + 3
  middle-area-space-height = transform middle-area-card-height, (h) -> h + 3 + 3
  middle-area-space-margin = transform middle-area-card-margin, (m) -> m - 3 - 3

  table-margin-sides = transform G.width, (v) -> v / S1
  table-margin-top = transform G.height, (v) -> v / S3
  table-middle-x = compute [table-margin-sides, middle-area-rx], (tm, rx) -> tm + rx #- TABLE_PADDING
  table-middle-y = compute [table-margin-top, middle-area-ry], (tm, ry) -> tm + ry #- TABLE_PADDING

  mid-w = transform middle-area-width, (w) -> 60 + (w / 2)
  mid-h = transform middle-area-height, (h) -> 60 + (h / 2)

  hand-pos-x = (n) ->
    compute [G.width, middle-area-card-width, n], (w, cw, n) -> (w * 0.49) - (cw / 2) + ((cw / 5) * n)
  hand-pos-y = (n) ->
    compute [G.height, middle-area-card-height], (h, ch) -> h - (ch * 0.2)

  card-pos-x = (n) ->
    compute [table-margin-sides, middle-area-card-width, middle-area-card-margin, n], (tm, cw, cm, n) -> TABLE_STROKE + TABLE_PADDING + tm + (cw * n) + (cm * n) + 3
  card-pos-y = (n) ->
    compute [table-margin-top, middle-area-height, middle-area-card-height, n], (tm, mh, ch, n) -> TABLE_STROKE + TABLE_PADDING + tm + ((mh - ch - TABLE_PADDING2) / 2)

  space-pos-x = (n) ->
    compute [middle-area-space-width, middle-area-space-margin], (cw, cm) -> TABLE_STROKE + TABLE_PADDING + (cw * n) + (cm * n) # - 3
  space-pos-y = (n) ->
    compute [middle-area-height, middle-area-space-height], (mh, ch) -> TABLE_STROKE + TABLE_PADDING + ((mh - ch - TABLE_PADDING2) / 2)

  first-playa-angle = 150 #200
  last-playa-angle = 390 #340
  max-playas = value 8
  num-playas = value 2
  # angle-increment = compute [last-playa-angle, first-playa-angle, num-playas] (a1, a0, n) -> (a1 - a0) / (n - 1)

  playa-pos = (i) ->
    compute [table-middle-x, table-middle-y, mid-w, mid-h, first-playa-angle, last-playa-angle, i, num-playas, max-playas], (mid-x, mid-y, mid-w, mid-h, a0, a1, i, n, m) ->
      max_arc = a1 - a0
      min_arc = max_arc / 3
      arc_inc = if m > n => (max_arc - min_arc) / n else 0
      inc = (max_arc - arc_inc - arc_inc) / (n - 1)
      angle = (a0 + arc_inc + (i * inc)) * HALF_PI
      # TODO: move this to a lib function
      # http://stackoverflow.com/questions/39098308/how-to-use-two-coordinates-draw-an-ellipse-with-javascript
      a = x: mid-w, y: 0
      b = x: 0,     y: mid-h
      x = mid-x + (a.x * (Math.cos angle)) + (b.x * (Math.sin angle))
      y = mid-y + (a.y * (Math.cos angle)) + (b.y * (Math.sin angle))
      {x, y}

  cards_down = value true

  window.hand =\
  hand = new RenderingArray G, (id, idx, {h}) ->
    h \poke-her-card, id, { width: middle-area-card-width, x: (hand-pos-x idx), y: (hand-pos-y idx), down: cards_down }

  window.cards =\
  cards = new RenderingArray G, (id, idx, {h}) ->
    h \poke-her-card, id, { width: middle-area-card-width, x: (card-pos-x idx), y: (card-pos-y idx) }

  window.playaz =\
  playaz = new RenderingArray G, (id, idx, {h}) ->
    # do these need to save off functions?
    pos = playa-pos idx
    x = transform pos, (p) -> "#{p.x}px"
    y = transform pos, (p) -> "#{p.y}px"
    h \div style: {
      border: 'solid 1px #000'
      # border-radius: '8px'
      border-radius: '50%'
      margin-top: '-30px'
      margin-left: '-30px'
      position: \fixed
      width: '60px'
      height: '60px'
      left: x
      top: y
    }, id

  # two things:
  # 1. RenderingArray should have a cleanup function (to clean up everything in the array)
  # 2. perhaps it may be a good idea to clean up o_length when calling the above cleanup function
  # this needs fixing
  playaz.obv_len num-playas

  cards.push \AH, \2H, \3H #, \4H, \5H
  hand.push \AS, \AD
  playaz.push 'kenny', 'jenny'#, 'jack', 'jill', 'bob', 'jane', 'bonnie', 'clyde'
  more_playaz = ['jack', 'jill', 'bob', 'jane', 'bonnie', 'clyde']

  ii = set-interval !->
    if p = more_playaz.shift!
      console.log 'adding', p
      playaz.push p
    else clear-interval ii
  , 2000

  G.E.frame.aC [

    s \svg width: middle-area-width, height: middle-area-height, s: {position: \fixed, left: table-margin-sides, top: table-margin-top},
      s \ellipse cx: middle-area-rx, cy: middle-area-ry, rx: middle-area-rxs, ry: middle-area-rys, fill: '#252', stroke: '#652507', 'stroke-width': TABLE_STROKE2
      # 5 card spaces in the middle
      for i til 5
        s \rect x: (space-pos-x i), y: (space-pos-y i), width: middle-area-space-width, height: middle-area-space-height, rx: 5, ry: 5, 'stroke-width': 0.5, stroke: '#fff', fill: 'none'

    cards, hand, playaz

    window.machina =\
    h \poem-state-machine, {width: 40, active: false}, ({h}) ->
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

      '/table/:table': (id) ->
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

plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, poke-her-starz
