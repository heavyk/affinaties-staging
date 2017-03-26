``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
# ``import h from '../lib/dom/hyper-hermes'``
# ``import load_sdk from '../lib/load-sdk-h'``
``import { s, h, doc, special_elements } from '../lib/dom/hyper-hermes'``
``import { ObservableArray, RenderingArray} from '../lib/dom/observable-array'``
``import { value, transform, compute, px, observable_property, bind1 } from '../lib/dom/observable'``
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
  var game
  # table.add-player 'kenny', 1000

  console.log 'table', table

  # table = new Table 50, 100, 4, 10, 100, 1000 # smallBlind, bigBlind, minPlayers, maxPlayers, minBuyIn, maxBuyIn
  pp = [
    my = table.add-player 'k-prime', 1000
    table.add-player 'bob', 1000
    table.add-player 'dylan', 1000
  ]
  # console.log \start, table.start-game!

  if p = table.players
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

  const TABLE_STROKE = 5.5
  const TABLE_STROKE2 = TABLE_STROKE * 2

  # table attributes
  playa-cards-width = value 30
  playa-cards-height = transform playa-cards-width, (w) -> w * 1.45
  playa-cards-margin = value 2
  playa-cards-count = value 2

  # game bindings
  _game =
    d_idx: value!
    sb_idx: value!
    bb_idx: value!
    cur: value!
    min: value!
    state: value!
    pot: value!

  middle-area-width = transform G.width, (v) -> (v / S1) * S2
  middle-area-height = transform G.height, (v) -> (v / S1) * S2
  middle-area-rx = transform middle-area-width, (v) -> v / 2
  middle-area-ry = transform middle-area-height, (v) -> v / 2
  middle-area-rxs = transform middle-area-rx, (v) -> v - TABLE_STROKE2 # because two half strokes always equals the total stroke
  middle-area-rys = transform middle-area-ry, (v) -> v - TABLE_STROKE2 # because two half strokes always equals the total stroke

  table-padding = transform middle-area-width, (v) -> v * 0.15
  playa-offset = transform middle-area-width, (v) -> v * 0.07
  bet-offset = transform middle-area-width, (v) -> -(v * 0.07)

  middle-area-card-margin = transform middle-area-width, (v) -> v * 0.025
  middle-area-card-width = compute [middle-area-width, middle-area-card-margin, table-padding], (w, m, p) -> ((w - p - p) / 5) - m
  middle-area-card-height = transform middle-area-card-width, (w) -> w * 1.45

  middle-area-space-width = transform middle-area-card-width, (w) -> w + 3 + 3
  middle-area-space-height = transform middle-area-card-height, (h) -> h + 3 + 3
  middle-area-space-margin = transform middle-area-card-margin, (m) -> m - 3 - 3

  table-margin-sides = transform G.width, (v) -> v / S1
  table-margin-top = transform G.height, (v) -> v / S3
  table-middle-x = compute [table-margin-sides, middle-area-rx], (tm, rx) -> tm + rx #- TABLE_PADDING
  table-middle-y = compute [table-margin-top, middle-area-ry], (tm, ry) -> tm + ry #- TABLE_PADDING

  playa-mid-w = compute [middle-area-rx, playa-offset], (w, p) -> w + p
  playa-mid-h = compute [middle-area-ry, playa-offset], (h, p) -> h + p

  bet-mid-w = compute [middle-area-rx, bet-offset], (w, b) -> w + b
  bet-mid-h = compute [middle-area-ry, bet-offset], (h, b) -> h + b

  pot-txt-x = transform middle-area-rx, (v) -> v
  pot-txt-y = compute [middle-area-ry, middle-area-space-height], (v, sh) -> v - (sh * 1.5)

  hand-pos-x = (i) ->
    compute [G.width, middle-area-card-width, i], (w, cw, i) -> (w * 0.49) - (cw / 2) + ((cw / 5) * i)
  hand-pos-y = (i) ->
    compute [G.height, middle-area-card-height], (h, ch) -> h - (ch * 0.2)

  card-pos-x = (i) ->
    compute [table-margin-sides, middle-area-card-width, middle-area-card-margin, table-padding, i], (tm, cw, cm, tp, i) -> TABLE_STROKE + tp + tm + (cw * i) + (cm * i) + 3
  card-pos-y = (i) ->
    compute [table-margin-top, middle-area-height, middle-area-card-height, table-padding, i], (tm, mh, ch, tp, i) -> TABLE_STROKE + tp + tm + ((mh - ch - tp - tp) / 2)

  space-pos-x = (i) ->
    compute [middle-area-space-width, middle-area-space-margin, table-padding], (cw, cm, tp) -> TABLE_STROKE + tp + (cw * i) + (cm * i) # - 3
  space-pos-y = (i) ->
    compute [middle-area-height, middle-area-space-height, table-padding], (mh, ch, tp) -> TABLE_STROKE + tp + ((mh - ch - tp - tp) / 2)

  playa-cards-pos-x = (i, playa-pos) ->
    compute [playa-cards-width, playa-cards-margin, playa-cards-count, playa-pos, i], (cw, cm, n, p, i) -> p.x + (cw * i) + (cm * i) - (((cw * n) + (cm * (n - 1))) / 2)
  playa-cards-pos-y = (n, playa-pos) ->
    compute [playa-pos, n], (p, n) -> p.y + 33

  first-playa-angle = 150 #200
  last-playa-angle = 390 #340
  max-playas = value 8
  num-playas = value 2

  table-pos = (i, mid-w, mid-h) ->
    compute [table-middle-x, table-middle-y, mid-w, mid-h, first-playa-angle, last-playa-angle, i, num-playas, max-playas], (mid-x, mid-y, mid-w, mid-h, a0, a1, i, n, m) ->
      max_arc = a1 - a0
      if n < 2
        angle = ((max_arc / 2) + a0)
      else
        min_arc = max_arc / 3
        # arc_inc = if m > n => (max_arc - min_arc) / n else 0
        arc_inc = (max_arc - min_arc) / n
        inc = (max_arc - arc_inc - arc_inc) / (n - 1)
        angle = (a0 + arc_inc + (i * inc))
      angle *= HALF_PI
      # TODO: move this to a lib function
      # http://stackoverflow.com/questions/39098308/how-to-use-two-coordinates-draw-an-ellipse-with-javascript
      cos = Math.cos angle
      sin = Math.sin angle
      a = x: mid-w, y: 0
      b = x: 0,     y: mid-h
      x = mid-x + (a.x * cos) + (b.x * sin)
      y = mid-y + (a.y * cos) + (b.y * sin)
      {x, y}

  cards_down = value true

  window.hand =\
  hand = new RenderingArray G, (id, idx, {h}) ->
    h \poke-her-card, id, { width: middle-area-card-width, x: (hand-pos-x idx), y: (hand-pos-y idx), down: cards_down }

  window.cards =\
  cards = new RenderingArray G, (id, idx, {h}) ->
    h \poke-her-card, id, { width: middle-area-card-width, x: (card-pos-x idx), y: (card-pos-y idx) }

  window.playaz =\
  playaz = new RenderingArray G, (d, idx, {h}) ->
    # do these need to save off functions?
    playa-pos = table-pos idx, playa-mid-w, playa-mid-h
    playa-x = transform playa-pos, (p) -> "#{p.x}px"
    playa-y = transform playa-pos, (p) -> "#{p.y}px"
    bet-pos = table-pos idx, bet-mid-w, bet-mid-h
    bet-x = transform bet-pos, (p) -> "#{p.x}px"
    bet-y = transform bet-pos, (p) -> "#{p.y}px"

    playa-cards = new RenderingArray G, d.cards, (id, idx, {h}) ->
      h \poke-her-card, id, { width: playa-cards-width, x: (playa-cards-pos-x idx, playa-pos), y: (playa-cards-pos-y idx, playa-pos) }

    # TODO: this becomes the foto
    h \div.playa style: {
      border: 'solid 1px #000'
      border-radius: '8px'
      # background: transform _game.cur, (v) -> if v is idx! => 'rgba(255,0,0,.2)' else ''
      background: compute [_game.cur, idx], (cur, idx) ->
        # debugger
        if cur is idx => 'rgba(255,0,0,.2)' else ''
      # border-radius: '50%'
      margin-top: '-30px'
      margin-left: '-30px'
      position: \fixed
      width: '60px'
      height: '60px'
      left: playa-x
      top: playa-y
    },
      h \div.name, d.name
      h \div.state, d.state
      h \div.chips, d.chips
      h \div.cards, playa-cards
      # h \div.bet, style: {
      #   border: 'solid 1px #000'
      #   background: '#f06'
      #   # border-radius: '8px'
      #   border-radius: '50%'
      #   margin-top: '-10px'
      #   margin-left: '-10px'
      #   position: \fixed
      #   width: '20px'
      #   height: '20px'
      #   left: bet-x
      #   top: bet-y
      # }

  window.betz =\
  betz = new RenderingArray G, (d, idx, {h}) ->
    # do these need to save off functions?
    bet-pos = table-pos idx, bet-mid-w, bet-mid-h
    bet-x = transform bet-pos, (p) -> "#{p.x}px"
    bet-y = transform bet-pos, (p) -> "#{p.y}px"

    # _if d, false, 'folded',
    #   _if d, true, 'all-in',
    #     d # TODO: some sort of visual representation of amnt of chips
    h \div.bet style: {
      border: 'solid 1px #000'
      background: '#f06'
      # border-radius: '8px'
      border-radius: '50%'
      margin-top: '-10px'
      margin-left: '-10px'
      position: \fixed
      width: '20px'
      height: '20px'
      left: bet-x
      top: bet-y
    }, transform d, (v) -> if v is false => 'X' else if v is true => 'all-in' else v

  # two things:
  # 1. RenderingArray should have a cleanup function (to clean up everything in the array)
  # 2. perhaps it may be a good idea to clean up obv_len when calling the above cleanup function

  playaz.obv_len num-playas
  # push existing people on to the table
  playaz.push.apply playaz, pp
  more_playaz = ['jack', 'jill', 'billy', 'jane', 'bonnie', 'clyde']

  ii = set-interval !->
    if p = more_playaz.shift!
      pp = table.add-player p, (700 + (Math.round Math.random! * 300))
      if typeof pp is \object
        console.log 'adding', p, pp
        playaz.push pp
      else
        console.log 'err:', p, pp
        more_playaz.unshift p
    else
      clear-interval ii
      game := window.game = table.start-game!
      cards.data game.board
      hand.data my.cards
      betz.data game.roundBets
      for k, obv of _game
        console.log 'binding', k
        bind1 obv, game[k]

      # TODO: add prompt interface
      # my.prompt.set_responder (msg, options, answer) ->
      #   alert msg
      # TODO: bind game obvs to table
  , 200

  G.E.frame.aC [

    s \svg width: middle-area-width, height: middle-area-height, s: {position: \fixed, left: table-margin-sides, top: table-margin-top},
      s \ellipse cx: middle-area-rx, cy: middle-area-ry, rx: middle-area-rxs, ry: middle-area-rys, fill: '#252', stroke: '#652507', 'stroke-width': TABLE_STROKE2
      # 5 card spaces in the middle
      for i til 5
        s \rect x: (space-pos-x i), y: (space-pos-y i), width: middle-area-space-width, height: middle-area-space-height, rx: 5, ry: 5, 'stroke-width': 0.5, stroke: '#fff', fill: 'none'

      s \text x: pot-txt-x, y: pot-txt-y,
        s \tspan 'Pot: '
        s \tspan _game.pot
        # s \tspan ->
        #   debugger
        #   _game.pot

    cards, hand, playaz, betz

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

plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, poke-her-starz
