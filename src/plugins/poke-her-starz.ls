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
  const SPACE_MARGIN = 1
  const SPACE_MARGIN2 = SPACE_MARGIN * 2

  # table attributes
  playa-cards-width = value 30
  playa-cards-margin = value 2
  first-playa-angle = 150
  last-playa-angle = 390

  # attributes which should be determined by the game logic
  playa-cards-count = value 2
  num-spaces = value 5
  max-playas = value 8
  num-playas = value 2

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
  middle-area-cx = transform middle-area-width, (v) -> v / 2
  middle-area-cy = transform middle-area-height, (v) -> v / 2

  table-padding = transform middle-area-width, (v) -> v * 0.15
  table-margin-sides = transform G.width, (v) -> v / S1
  table-margin-top = transform G.height, (v) -> v / S3
  table-rx = transform middle-area-cx, (v) -> v - TABLE_STROKE2 # because two half strokes always equals the total stroke
  table-ry = transform middle-area-cy, (v) -> v - TABLE_STROKE2 # because two half strokes always equals the total stroke
  table-abs-cx = compute [table-margin-sides, middle-area-cx], (tm, cx) -> tm + cx
  table-abs-cy = compute [table-margin-top, middle-area-cy], (tm, cy) -> tm + cy

  board-cards-margin = transform middle-area-width, (v) -> v * 0.015
  board-cards-width = compute [middle-area-width, board-cards-margin, table-padding, num-spaces], (w, m, p, ns) -> ((w - p - p) / ns) - m
  board-cards-height = transform board-cards-width, (w) -> w * 1.45

  board-spaces-width = transform board-cards-width, (w) -> w + SPACE_MARGIN2
  board-spaces-height = transform board-cards-height, (h) -> h + SPACE_MARGIN2
  board-spaces-margin = transform board-cards-margin, (m) -> m - SPACE_MARGIN2

  playa-radius = transform middle-area-width, (v) -> v * 0.07
  playa-cx = compute [middle-area-cx, playa-radius], (w, p) -> w + p
  playa-cy = compute [middle-area-cy, playa-radius], (h, p) -> h + p

  button-radius = transform middle-area-width, (v) -> -(v * 0.02)
  button-cx = compute [middle-area-cx, button-radius], (w, b) -> w + b
  button-cy = compute [middle-area-cy, button-radius], (h, b) -> h + b

  bet-radius = transform middle-area-width, (v) -> -(v * 0.05)
  bet-cx = compute [middle-area-cx, bet-radius], (w, b) -> w + b
  bet-cy = compute [middle-area-cy, bet-radius], (h, b) -> h + b

  prev-bet-radius = transform middle-area-width, (v) -> -(v * 0.11)
  prev-bet-cx = compute [middle-area-cx, prev-bet-radius], (w, b) -> w + b
  prev-bet-cy = compute [middle-area-cy, prev-bet-radius], (h, b) -> h + b

  pot-txt-x = transform middle-area-cx, (v) -> v
  pot-txt-y = compute [middle-area-cy, board-spaces-height], (v, sh) -> v - (sh * 1.0)

  hand-pos-x = (i) ->
    compute [G.width, board-cards-width, i], (w, cw, i) -> (w * 0.49) - (cw / 2) + ((cw / 5) * i)
  hand-pos-y = (i) ->
    compute [G.height, board-cards-height], (h, ch) -> h - (ch * 0.2)

  card-pos-x = (i) ->
    compute [table-margin-sides, board-cards-width, board-cards-margin, table-padding, i], (tm, cw, cm, tp, i) -> TABLE_STROKE + tp + tm + (cw * i) + (cm * i) + SPACE_MARGIN
  card-pos-y = (i) ->
    compute [table-margin-top, middle-area-height, board-cards-height, table-padding, i], (tm, mh, ch, tp, i) -> TABLE_STROKE + tp + tm + ((mh - ch - tp - tp) / 2)

  space-pos-x = (i) ->
    compute [board-spaces-width, board-spaces-margin, table-padding], (bsw, bsm, tp) -> TABLE_STROKE + tp + (bsw * i) + (bsm * i)
  space-pos-y = (i) ->
    compute [middle-area-height, board-spaces-height, table-padding], (mh, ch, tp) -> TABLE_STROKE + tp + ((mh - ch - tp - tp) / 2)

  playa-cards-pos-x = (i, pos) ->
    compute [playa-cards-width, playa-cards-margin, playa-cards-count, pos, i], (cw, cm, n, p, i) -> p.x + (cw * i) + (cm * i) - (((cw * n) + (cm * (n - 1))) / 2)
  playa-cards-pos-y = (n, pos) ->
    compute [pos, n], (p, n) -> p.y + 33

  table-pos = (i, cx, cy, rel) ->
    compute [(if rel => middle-area-cx else table-abs-cx), (if rel => middle-area-cy else table-abs-cy), cx, cy, first-playa-angle, last-playa-angle, i, num-playas, max-playas],
    (abs-cx, abs-cy, cx, cy, a0, a1, i, n, m) ->
      if i ~= null => i = 0
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
      a = x: cx, y: 0
      b = x: 0,  y: cy
      x = abs-cx + (a.x * cos) + (b.x * sin)
      y = abs-cy + (a.y * cos) + (b.y * sin)
      {x, y}

  sb-btn-transform = transform (table-pos _game.sb_idx, button-cx, button-cy, true), (p) -> "translate(#{p.x} #{p.y}) scale(.7)"
  bb-btn-transform = transform (table-pos _game.bb_idx, button-cx, button-cy, true), (p) -> "translate(#{p.x} #{p.y}) scale(.7)"
  d-btn-transform = transform (table-pos _game.d_idx, button-cx, button-cy, true), (p) -> "translate(#{p.x} #{p.y}) scale(.7)"

  cards_down = value true

  window.hand =\
  hand = new RenderingArray G, (id, idx, {h}) ->
    h \poke-her-card, id, { width: board-cards-width, x: (hand-pos-x idx), y: (hand-pos-y idx), down: cards_down }

  window.cards =\
  cards = new RenderingArray G, (id, idx, {h}) ->
    h \poke-her-card, id, { width: board-cards-width, x: (card-pos-x idx), y: (card-pos-y idx) }

  window.playaz =\
  playaz = new RenderingArray G, (d, idx, {h}) ->
    # do these need to save off functions?
    pos = table-pos idx, playa-cx, playa-cy
    playa-cards = new RenderingArray G, d.cards, (id, idx, {h}) ->
      h \poke-her-card, id, { width: playa-cards-width, x: (playa-cards-pos-x idx, pos), y: (playa-cards-pos-y idx, pos) }

    # TODO: this becomes the foto
    h \div.playa style: {
      border: 'solid 1px #000'
      border-radius: '8px'
      background: compute [_game.cur, idx], (cur, idx) -> if cur is idx => 'rgba(255,0,0,.2)' else ''
      margin-top: '-30px'
      margin-left: '-30px'
      position: \fixed
      width: '60px'
      height: '60px'
      left: transform pos, (p) -> "#{p.x}px"
      top: transform pos, (p) -> "#{p.y}px"
    },
      h \div.name, d.name
      h \div.state, d.state
      h \div.chips, d.chips
      h \div.cards, playa-cards

  window.betz =\
  betz = new RenderingArray G, (d, idx, {h}) ->
    # do these need to save off functions?
    pos = table-pos idx, bet-cx, bet-cy

    # TODO: some sort of visual representation of amnt of chips
    h \div.bet style: {
      display: transform d, (v) -> if !v => 'none' else ''
      left: transform pos, (p) -> "#{p.x}px"
      top: transform pos, (p) -> "#{p.y}px"
    }, transform d, (v) -> if v is false => 'X' else if v is true => 'all-in' else v

  window.prev-betz =\
  prev-betz = new RenderingArray G, (d, idx, {h}) ->
    # do these need to save off functions?
    pos = table-pos idx, prev-bet-cx, prev-bet-cy

    # TODO: some sort of visual representation of amnt of chips
    h \div.prev-bet style: {
      left: transform pos, (p) -> "#{p.x}px"
      top: transform pos, (p) -> "#{p.y}px"
    }, d

  # two things:
  # 1. RenderingArray should have a cleanup function (to clean up everything in the array)
  # 2. perhaps it may be a good idea to clean up obv_len when calling the above cleanup function

  playaz.obv_len num-playas
  # push existing people on to the table
  playaz.push.apply playaz, pp
  more_playaz = ['jack', 'jill', 'billy', 'jane', 'bonnie', 'clyde']

  ii = set-interval !->
    if p = more_playaz.shift!
      pp = table.add-player p, 1000 #(700 + (Math.round Math.random! * 300))
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
      betz.data game.bets
      prev-betz.data game.prev-bets

      # TODO: add prompt interface
      # my.prompt.set_responder (msg, options, answer) ->
      #   alert msg

      # TODO: when game is over unbind the listeners
      # bind to game values
      unbind_game_obvs =\
      for k, obv of _game
        bind1 obv, game[k]

  , 200

  G.E.frame.aC [

    s \svg.table width: middle-area-width, height: middle-area-height, s: {position: \fixed, left: table-margin-sides, top: table-margin-top},
      s 'symbol#chip' viewBox: '0 0 42 42',
        s \circle cx: 21 cy: 21 r: 20.5 stroke: '#000' stroke-width: 1 fill: '#FFF'
        s \path fill: '#FF0000' stroke: '#231F20' stroke-miterlimit: 10 d: 'M20.813,41.506c-3,0.004-6.767-0.883-10-2.75L31.188,3.25c-3.234-1.867-6.377-2.753-10.377-2.75L20.813,41.506L20.813,41.506z M38.851,10.915c1.503,2.597,2.618,6.302,2.618,10.035L0.532,21.057c0,3.735,0.804,6.899,2.807,10.362L38.851,10.915L38.851,10.915z M3.339,10.589c1.497-2.6,4.148-5.418,7.381-7.284l20.561,35.398c3.234-1.867,5.573-4.146,7.57-7.611L3.339,10.589L3.339,10.589z'
        s \circle cx: 21 cy: 21 r: 15 stroke: '#000' stroke-width: 1 fill: '#FFF'

      # table area
      s \ellipse cx: middle-area-cx, cy: middle-area-cy, rx: table-rx, ry: table-ry, s: {fill: '#252', stroke: '#652507', stroke-width: TABLE_STROKE2}

      s \g.sb-btn transform: sb-btn-transform, style: {display: transform _game.sb_idx, ((v) -> if v ~= null => 'none' else '')},
        s \use 'xlink:href': '#chip', width: 42, height: 42, x: -21, y: -21, overflow: 'visible'

      s \g.bb-btn transform: bb-btn-transform, style: {display: transform _game.bb_idx, ((v) -> if v ~= null => 'none' else '')},
        s \use 'xlink:href': '#chip', width: 42, height: 42, x: -21, y: -21, overflow: 'visible'
        s \use 'xlink:href': '#chip', width: 42, height: 42, x: -21, y: -21, overflow: 'visible', transform: 'translate(9 5)'

      s \g.d-btn transform: d-btn-transform, style: {display: transform _game.d_idx, ((v) -> (console.log v); if v ~= null => 'none' else '')},
        s \circle cx: 0, cy: 0, r: 20.5, s: {fill: '#fff', stroke: '#231F20', stroke-miterlimit: 10}
        s \text x: 0, y: 0, s: {font-family: 'DejaVu Sans, sans-serif', font-weight: 'bold', font-size: 8}, 'DEALER'

      # 5 card spaces in the middle
      # TODO: turn this into a RenderingArray
      for i til num-spaces!
        s \rect x: (space-pos-x i), y: (space-pos-y i), width: board-spaces-width, height: board-spaces-height, rx: 5, ry: 5, s: {stroke-width: 0.5, stroke: '#fff', fill: 'none'}

      s \text.pot x: pot-txt-x, y: pot-txt-y,
        s \tspan 'Pot: '
        s \tspan _game.pot

    h \.cards cards
    h \.hand hand
    h \.playaz playaz
    h \.betz betz
    h \.prev-betz prev-betz

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
