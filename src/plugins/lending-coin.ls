``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
``import { value, transform, compute, _px, obv_obj } from '../lib/dom/observable'``
``import pullScroll from '../lib/pull-stream/scroller'``
``import { set_style, s, h } from '../lib/dom/hyper-hermes'``
``import dateFormat from '../lib/date-format'``
``import { compact, mergeDeep as merge } from '../lib/utils'``
``import { rand, rand2, randomId, randomEl, randomIds, randomPos, randomHex, randomCharactor, randomDate, inTime, between, lipsum, word, obj } from '../lib/random'``
``import round from '../lib/lodash/round'``
``import { int, hex } from '../lib/parse/number'``
``import hsl2rgb from '../lib/color/hsl2rgb'``
``import rgba2color from '../lib/color/rgba2color'``

``import '../elements/poem-frame'``
``import '../elements/positioned-element'``

# reference implementationz:
# - https://aragon.one/
# - https://www.grow.ly/es/proyecto/inicio?owner=False&favourite=False
# - https://github.com/dharmaprotocol/LoanStandard

# exchanges:
# - https://bitso.com/developers?javascript#private-rest-api

# import icons:
# - https://github.com/icons8/flat-color-icons
# - https://github.com/maxlibin/lite-flag-icon-css

pull = require 'pull-stream/pull'
pull-src-values = require 'pull-stream/sources/values'
pull-src-count = require 'pull-stream/sources/count'
pull-thru-map = require 'pull-stream/throughs/map'
pull-thru-filter = require 'pull-stream/throughs/filter'
pull-sink-collect = require 'pull-stream/sinks/collect'

Rpc = require \rpc-engine
require! \msgpack-lite

socket = new WebSocket 'ws://localhost:3000'
socket.binaryType = 'arraybuffer'

window.rpc = new Rpc {
  send: socket.send.bind socket
  # easier for debugging:
  serialize: JSON.stringify
  deserialize: JSON.parse
  # for better bandwidth usage:
  # serialize: msgpack-lite.encode
  # deserialize: msgpack-lite.decode
}

rpc.set-interface {
  browser-add: (a, b, cb) !->
    cb null, a + b
}

# TODO: implement backoff reconnection
socket.onopen = ->
  console.log 'open!'
socket.onclose = ->
  console.log 'close!'
socket.onmessage = (msg) !->
  # console.log 'got msg:', (msgpack-lite.decode new Uint8Array msg.data)
  rpc.receive msg.data
  # rpc.receive new Uint8Array msg.data



require! \currency-formatter
require! \genny
genny.ev = (gen) ->
  fn = genny gen
  return !->
    args = [].slice.call &
    args.push (err, res) !->
      if err => throw err
    fn.apply this, args

const NAMES = require '../../../data/names.json'

# Identicon-js = require \identicon.js

# lending crowd
# positive investment cloud

# first, implement contexts in a better way (eg. the root element (defined by the plugin-boilerplate) should define the context inside of this element -- and then all other children elements can use the root element as the prototype for the context - slowish, but still way faster than the alternatives I'm sure.)
# redo the layout with a fixed position layout: top, bottom, left, right
# item-element (width x height), (x, y)
#  -> content (overflow-y: auto)


# for some of these things that are unclear, perhaps they should be scheduled to be added in the future as features.
# for example, right now each project or usuario can only have one analyst. obviously, in the future, we'll need to expand that.

# for hub-e
# rating del proyecto tiene dos ratings, el del captador y el del prestatario. los prestatarios empezaran con un rating de 5 e irán subiendo según vallan pagando. si retrasan pagos bajaran de 5, si pagan bien subirán de 5. si no pagan pasan a 0. los captadores tendrán una evolución de su rating similar.

/*
# require! \truffle-contract
# Incrementer = require '../contracts/Incrementer.sol'
{ 'LoanList.sol:LoanList': LoanList, web3 } = require '../contracts/LoanList.sol'
window <<< { LoanList }

# web3 = new (Web3 = require 'web3')
# web3.set-provider new web3.providers.HttpProvider
accounts = web3.eth.accounts
# web3.set-provider (require 'ethereumjs-testrpc' .provider!)
# web3.eth.default-account = web3.eth.coinbase

window <<< { web3, Web3 }

watcher = LoanList.allEvents {}, genny.fn (err, ev, resume) ->*
# watcher = LoanList.allEvents!watch (err, ev) ->
  # debugger
  type = ev.event
  args = ev.args
  id = args.id.to-number!
  console.log 'LoanList event', type, id
  switch type
  | \Created =>
    console.log 'new loan created:', id, args.beneficiary, args.goal.to-number!
    timeout = 1000ms
    set-timeout !->
      genny.run (resume) ->*
        console.log \contribute, yield LoanList.contribute id, {from: accounts.4, value: 9000, gas: 110000}, resume!
    , timeout += 1000ms
    set-timeout !->
      genny.run (resume) ->*
        console.log \contribute, yield LoanList.contribute id, {from: accounts.2, value: 9000, gas: 110000}, resume!
    , timeout += 1000ms
    set-timeout !->
      genny.run (resume) ->*
        console.log \contribute, yield LoanList.contribute id, {from: accounts.3, value: 5000, gas: 110000}, resume!
    , timeout += 1000ms
  | \Contributed =>
    loan = yield LoanList.loans id, resume!
    contrib = args.amount.to-number!
    amount = loan.amount.to-number!
    goal = loan.goal.to-number!
    console.log args.funder, "contributed #{contrib} to loan(#id)." #, "loan status: #{amount} / #{goal}"
    if amount >= goal
      set-timeout !->
        genny.run (resume) ->*
          console.log \finalise, yield LoanList.finalise 0, {from: accounts.3, gas: 110000}, resume!
      , 1000ms
  | \Finalised =>
    console.log "loan(#id) finalised:", args.amount.to-number!

timeout = 3_000ms

set-timeout !->
  genny.run (resume) ->*
    console.log \create, yield LoanList.create accounts.0, 20000, {from: accounts.1, gas: 100000}, resume!
, timeout += 1000ms


*/

# var contract
# web3.eth.compile.solidity src, (err, compiled) !->
#   if err => return console.error err
  # code = compiled.code
  # abi = compiled.info.abiDefinition
  # console.log 'compiled code!'
  # Incrementer = truffle-contract {abi: compiled.info.abiDefinition, unlinked_binary: compiled.code}
  # Incrementer.set-provider new web3.providers.HttpProvider
  # Incrementer.new {from: web3.eth.default-account, gas: 0x100000} .then (incr) !->
  #   window.incr = incr
  #   incr.Incremented {filter: {odd: true}, from-block: 0}, (err, ev) !->
  #     if err => console.error \event, err
  #     else console.log \event, ev.args, ev.args.x.value-of!
  #
# web3.eth.get-balance web3.eth.default-account, (err, b) ->
#   console.log err, b.to-string!

# Incrementer = truffle-contract require '../contracts/Incrementer'
# Incrementer.set-provider new web3.providers.HttpProvider
# Incrementer.new {from: web3.eth.default-account, gas: 0x100000} .then (incr) !->
#   # debugger
#   # set-interval !->
#   #   incr.inc!
#   # , 1000
#   window.incr = incr
#   incr.Incremented {filter: {odd: true}, from-block: 0}, (err, x) !->
#     console.info \event, err, x
# Incrementer.deployed!.then (incrementer) !->
#     incrementer.Incremented {odd: true}, (err, x) !->
#       console.log "current count is:", x

# for testing:
# window <<< { rand, rand2, randomId, randomEl, randomIds, randomPos, randomHex, randomCharactor, randomDate, inTime, between, lipsum, word, obj }
# window <<< { date-format, currency-formatter }

const LOCALES = <[en-us en-gb es-es es-mx]>

const sectores_es = [
  'Agricultura'
  'Energia Renovable'
  'Artesanía, Arte y Diseño'
  'Fabricación'
  'Comercio'
  'Comunicación'
  'Educación'
  'Alimentación'
  'Hostelería'
  'Construcción'
  'Inmobiliario'
  'Tecnología'
  'Sanidad'
  'Transporte'
  'Turismo'
  'Marketing y Publicidad'
]

const concepto_es = [
  'Inversión en activo físico'
  'Consumo privado'
  'Inversión en circulante'
  'Investigación'
  'Refinanciación'
  'Inversión privada'
  'Estudios'
]

# each project is in a phase (pre-funding)
# need to determine the different phases that are possible as the project progresses over time

# 1. analysis / analasis?
#  - (se publica el proyecto) -
# 2. captacion / funding
#  - (se liberan los fondos al prestatario) -
# 3. repayment / repago
#  - (se liberan los fondos al inversionista) -
# 4. paid / pagado

# (analista mira solo al proyecto - no a la persona)
# poder financiario del prestatario (y del inversionista)

# every 30 days, you have to pay the interest.
# later, the amortization option is up to you:
# 1. amortize the principal over x time
# 2. repay as you obtain the funds
# 3. never pay at all (infinite debt)
# 4. repay all at the end

# --------------------

# var defaultRelativeTime = {
#     future : 'in %s',
#     past   : '%s ago',
#     s  : 'a few seconds',
#     ss : '%d seconds',
#     m  : 'a minute',
#     mm : '%d minutes',
#     h  : 'an hour',
#     hh : '%d hours',
#     d  : 'a day',
#     dd : '%d days',
#     M  : 'a month',
#     MM : '%d months',
#     y  : 'a year',
#     yy : '%d years'
# };
# var duration = createDuration(posNegDuration).abs();
# var seconds  = round(duration.as('s'));
# var minutes  = round(duration.as('m'));
# var hours    = round(duration.as('h'));
# var days     = round(duration.as('d'));
# var months   = round(duration.as('M'));
# var years    = round(duration.as('y'));
#
# var a = seconds <= thresholds.ss && ['s', seconds]  ||
#         seconds < thresholds.s   && ['ss', seconds] ||
#         minutes <= 1             && ['m']           ||
#         minutes < thresholds.m   && ['mm', minutes] ||
#         hours   <= 1             && ['h']           ||
#         hours   < thresholds.h   && ['hh', hours]   ||
#         days    <= 1             && ['d']           ||
#         days    < thresholds.d   && ['dd', days]    ||
#         months  <= 1             && ['M']           ||
#         months  < thresholds.M   && ['MM', months]  ||
#         years   <= 1             && ['y']           || ['yy', years];

# var thresholds = {
#     ss: 44,         // a few seconds to seconds
#     s : 45,         // seconds to minute
#     m : 45,         // minutes to hour
#     h : 22,         // hours to day
#     d : 26,         // days to month
#     M : 11          // months to year
# };


const DEFAULT_CONFIG =
  lala: 1155

# rendering functions
percent = (n) -> (Math.floor n * 100) + '%'
rating = (p, n = 10) -> (Math.floor p * n) + ' / ' + n
# day-month = (d) -> (moment d .format 'Do MMM')
day-month = (d) -> (date-format d, 'dS mmm')
user-link = (h, dd) ->
  h \a href: "/u/#{dd.id}", dd.name
days-remaining = (h, d) ->
  "#{Math.round Math.abs (d - Date.now!) / 1000ms / 60s / 60m / 24h} days"

positioned-el = (G, el) ->
  pos =
    x: value!
    y: value!
    w: value!
    h: value!
  set_style el, {
    position: \fixed
    top: transform pos.y, _px
    left: transform pos.x, _px
    right: compute [G.width, pos.x, pos.w], (W, x, w) -> "#{W - x - w}px"
    bottom: compute [G.height, pos.y, pos.h], (H, y, h) -> "#{H - y - h}px"
  }
  obv_obj pos


# # BENCHMARK
# require! \dateformat
# require! \moment
# window.Benchmark = require \benchmark
# Benchmark.support.browser = false # if it detects the browser, it tries to use amd.define instead of "new Function" - so it gets disabled
# set-timeout !->
#   window.suite = new Benchmark.Suite
#   suite
#     # .add \moment, !->
#     #   moment (randomDate!) .from-now!
#     .add \dateformat, !->
#       dateformat (randomDate!), 'dS mmm'
#     .add \date-format, !->
#       date-format (randomDate!), 'dS mmm'
#     .add \moment, !->
#       moment (randomDate!) .format 'Do MMM'
#     .on \cycle, (event) !->
#       console.log event.target+''
#     .on \complete !->
#       console.log "Fastest is: #{@filter 'fastest' .map 'name'}"
#     .run async: true
#   console.log 'running benchmark'
# , 500ms

foto-size = (size) ->
  if typeof size is \number => size
  else if size is \x => 1920
  else if size is \l => 1440
  else if size is \m => 720
  else if size is \s => 360
  else if size is \t => 240
  else if size is \a => 120
  else if size is \z => 49
  else if size is \y => 36
  else if size is \k => 28
  else 0

# window.Identicon =\
Identicon = (hash, opts = {}) ->
  # knicked from http://github.com/stewartlord/identicon.js
  # removed png rendering and implemented svg rendering as default
  opts = merge {
    background: [240, 240, 240, 255]
    margin:     0.08
    size:       foto-size (opts.size || 64)
    saturation: 0.7
    brightness: 0.5
    cells:      7
  }, opts

  n = opts.cells
  n2 = n*2
  n3 = n*3
  # in case there are not enough chars, duplicate
  while hash.length < n3
    hash += hash
  size = opts.size
  hue = (hex hash.substr -7) / 0xfffffff
  fg = rgba2color.apply null, hsl2rgb hue, opts.saturation, opts.brightness
  bg = rgba2color.apply null, opts.background
  base-margin = Math.floor size * opts.margin
  cell = Math.floor (size - (base-margin * 2)) / n
  x-cell = Math.floor (size - (base-margin * 2)) / 5
  margin = Math.floor (size - cell * n) / 2

  rects = []
  # the first 15 characters of the hash control the pixels (even/odd)
  # they are drawn down the middle first, then mirrored outwards
  for i til n3
    if ((hex hash.charAt i) % 2) is 0
      if i < n
        rects.push {x: 2 * x-cell + margin, y: i * cell + margin}
      else if i < n2
        rects.push {x: 1 * x-cell + margin, y: (i - n) * cell + margin}
        rects.push {x: 3 * x-cell + margin, y: (i - n) * cell + margin}
      else if i < n3
        rects.push {x: 0 * x-cell + margin, y: (i - n2) * cell + margin}
        rects.push {x: 4 * x-cell + margin, y: (i - n2) * cell + margin}

  # img =\
  s \svg width: size, height: size, style: {background-color: bg} xmlns: 'http://www.w3.org/2000/svg',
    s \g, style: {fill: fg, stroke: fg, stroke-width: size * 0.005},
      for rect in rects
        s \rect (merge {width: x-cell, height: cell}, rect)

  # h \img width: size, height: size, src: "data:image/svg+xml;base64,#{btoa img.outerHTML}"

foto_size = (size) ->
  switch size
  | \x => 1920
  | \l => 1440
  | \m => 720
  | \s => 360
  | \t => 240
  | \a => 120
  | \z => 49
  | \y => 36
  | \k => 28
  | _  => 0

foto = (h, opts = {}) ->
  # h \img width: 80 height: 80, src: "data:image/svg+xml;base64,#{Identicon dd.foto, margin: 0.05, size: 80 format: 'svg' .outerHTML}"
  size = foto_size opts.size
  px = value size
  src = value if opts.identicon => opts.src else "data:image/svg+xml;base64,#{Identicon opts.src, margin: 0.05, size, format: 'svg' .outerHTML}"
  h \img {src, width: px, height: px}

# PROYECTO
proyecto-list-item = (h, props = {}) -> (dd) ->
  if props.desc
    read-more = value!
    request-animation-frame !->
      # this is kind of inconvienient because the 'more' button will push everything downward just to display to 'more' button
      # ideally, it should not modify the height of the .proyecto element
      if desc.scrollHeight - 10 > desc.clientHeight => read-more false
  offered_percent = percent (Math.min dd.offered / dd.amount, 1)
  h \div.proyecto,
    if props.foto
      h \div.foto,
        h \a href: "/u/#{dd.creator}",
          # h \img width: 80 height: 80, src: "data:image/svg+xml;base64,#{Identicon dd.foto, margin: 0.05, size: 80 format: 'svg' .outerHTML}"
          Identicon dd.foto, size: 80, margin: 0.05
          # h \div USUARIOS[dd.creator].name
    h \div.title,
      h \a href: "/p/#{dd.id}", dd.title
    h \div.content,
      h \span.interest, dd.interest + '%'
      h \span.rating.captador-rating, (rating dd.captador_rating, 100)
      h \span.rating.analista-rating, (rating dd.analista_rating, 100)
      h \span.dat.days-remaining, days-remaining h, dd.ends
      # h \span.dat.offered-num, dd.offers + ' offers'
      # h \span.begins, day-month dd.begins
      h \span.dat.amount, currency-formatter.format dd.amount, locale: dd.locale
      # h \span.ends, day-month dd.ends
      h \div.status,
        h \span.offered, s: {width: offered_percent}
        h \span.percent, offered_percent
      if props.desc
        desc =\
        h \div.desc, dd.desc
        transform read-more, (v) ->
          if v isnt void
            desc.style.height = if v => desc.scrollHeight + 'px' else '20px'
            # desc.style.color = if v => '#333' else '#33f'
            h \div.read-more, {onclick: -> (read-more !read-more!)}, if v => "less" else "more"

proyecto-profile = (h) -> (dd) ->
  offer-scroller = h \div.offer-scroller, s: {overflow-y: 'auto'}
  pull (pull-src-values OFFERS),
    pull-thru-filter (d) -> d.proyecto_id is dd.id
    pull-scroll offer-scroller, offer-scroller, (offer-sm h), false, false, (err) !->
      console.log 'the end!', err
  offered_percent = percent (Math.min dd.offered / dd.amount, 1)
  h \div.proyecto,
    h \div.foto,
      h \a href: "/u/#{dd.creator}",
        Identicon dd.foto, {margin: 0.05, size: 80}
        # h \div USUARIOS[dd.creator].name
    h \div.title,
      h \a href: "/p/#{dd.id}", dd.title
    h \div.content,
      h \span.interest, dd.interest + '%'
      h \span.rating.captador-rating, (rating dd.captador_rating, 100)
      h \span.rating.analista-rating, (rating dd.analista_rating, 100)
      h \span.status,
        h \span.offered, s: {width: offered_percent}
        h \span.offered-num, offered_percent
        h \span.begins, day-month dd.begins
        h \span.amount, currency-formatter.format dd.amount, locale: dd.locale
        h \span.ends, day-month dd.ends
      h \div.desc-big, dd.desc
      h \div.offers, offer-scroller
    # h \pre, JSON.stringify dd, null 2

proyecto-sm = (h) -> (proyecto, size) ->
  h \.proyecto,
    h \.foto-o,
      foto h, {size, src: proyecto.foto}
      # identicon {size, src: proyecto.foto}

user-sm = (h) -> (user, size) ->
  h \.user,
    h \.foto-o,
      foto h, {size, src: user.foto}

offer-sm = (h) -> (offer) ->
  # proyecto = PROYECTOS[offer.proyecto_id]
  offerer = USUARIOS[offer.creator]
  h \div.offer,# {s: {background: "hsl(28, #{round (offer.interest / proyecto.interest) * 78}%, #{80 + round offer.amount / proyecto.amount * 30}%)"}}, # hsl(28, 78%, 91%) 70 - 91
    h \div.offerer,
      h \a href: "/u/#{offerer.id}", offerer.name
    h \div.amount, offer.amount, ' @ ', offer.interest, '%'
    h \div.when, day-month offer.created
    # h \pre, JSON.stringify offer, null 2

offer-lg = (h) -> (offer) ->
  proyecto = PROYECTOS[offer.proyecto_id]
  h \div.offer,# s: {background: "hsl(28, #{(proyecto.interest - offer.interest / proyecto.interest) * 78}%, 91%)"}, # hsl(28, 78%, 91%)
    h \div.proyecto-title,
      h \a href: "/p/#{proyecto.id}", proyecto.title
    h \div.amount, offer.amount, ' @ ', offer.interest, '%'
    h \div.when, day-month offer.created
    # h \pre, JSON.stringify offer, null 2
    # h \pre, JSON.stringify proyecto, null 2

lending-coin = ({config, G, set_config, set_data}) ->
  G.width (v, old_width) !-> console.log \width, old_width, '->', v

  # additional elements?
  # G.E.frame.aC []

  G.h \poem-frame, {base: '/plugin/lending-coin'}, (G) ->
    {h} = G

    # 'global' variables
    window.roadtrip = @roadtrip

    # starting elements
    @els [
      h \.nav,
        @section \nav, ({h}) ->
          return [
            h \.logo,
              h \a href: '/', "positive investment cloud"
            h \ul,
              h \li.profile,
                h \a href: '/me', "profile"
              h \li.proyectos,
                h \a href: '/me/proyectos', "proyectos"
              h \li.preferences,
                h \a href: '/preferences', "preferences"

            h \.session,
              transform SESSION, (s) ->
                if s
                  h \.ident,
                    Identicon s.foto, {size: 36, margin: 0.005}
                    h \h4 s.name
                else
                  h \.login, "login"
          ]
      h \.middle,
        @section \content
    ]

    # router
    404: (route, prev) !->
      @section \content, ({h}) ->
        h \div,
          h \div, "this is a 404!"
          h \div, "you tried to go to: ", route.pathname
          h \div, ' from ', prev.pathname

    '/':
      enter: (route, prev) !->
        @section \content, ({h}) ->
          request-animation-frame !->
            pull (pull-src-values PROYECTOS),
              # TODO: add filtering / ordering(?) to the main view
              # pull-thru-filter (d) -> d.creator is id
              pull-scroll proyecto-scroller, proyecto-scroller, (proyecto-list-item h, {+foto}), false, false, (err) !->
                console.log 'the end!', err
          proyecto-scroller = h \div.proyecto-scroller

      # update: (route) !->
      # leave: (route, next) !->

    # me
    '/me': (route) ->
      @section \content, ({h}) ->
        # if logged in, show profile, else show login
        if not sess = SESSION!
          h \h3 "you're not logged in"
        else if user = USUARIOS[id = sess.id]
          h \.profile,
            # h \h1, "I am beautiful. I am magical. I am me!"
            h \.foto, s: {
              grid-area: \foto
            }, user.foto
            h \.ident, s: {
              grid-area: \ident
            }, user.name
            h \.content, s: {
              grid-area: \content
            }, user.desc
            h \.actions, s: {
              grid-area: \actions
            }, h \ul,
                h \li, "follow"
                h \li, "analist rating"
                h \li, "follow"
        else
          console.error "user does not exist"
          h \h4, "user '#{id}' does not exist"

    # user profile
    '/u/:id':
      enter: (route) ->
        id = route.params.id
        if user = USUARIOS[id] => @section \content, ({h}) ->
          proyecto-scroller = h \div.proyecto-scroller, s: {overflow-y: 'auto'}
          pull (pull-src-values PROYECTOS),
            pull-thru-filter (d) -> d.creator is id
            pull-scroll proyecto-scroller, proyecto-scroller, (proyecto-sm h, {-foto}), false, false, (err) !->
              console.log 'the end!', err

          offer-scroller = h \div.offer-scroller, s: {overflow-y: 'auto'}
          pull (pull-src-values OFFERS),
            pull-thru-filter (d) -> d.creator is id
            pull-scroll offer-scroller, offer-scroller, (offer-lg h), false, false, (err) !->
              console.log 'the end!', err
          h \div.profile,
            h \div.ident,
              h \img width: 140 height: 140, src: "data:image/svg+xml;base64,#{Identicon id, margin: 0.05, size: 140 format: 'svg' .outerHTML}"
              h \h3, user.name
            h \div.proyectos, proyecto-scroller
            h \div.offers, offer-scroller
            if ddx = PROYECTOS_CAPTADOS[id]
              h \caja.proyectos-captados,
                for dd in ddx
                  (user-sm h) dd

            if ddx = GENTE_CAPTADA[id]
              h \caja.gente-captada,
                for dd in ddx
                  (user-sm h) dd

            if ddx = PROYECTOS_ANALIZADOS[id]
              h \caja.proyectos-analizados,
                for dd in ddx
                  (proyecto-sm h) dd

            if ddx = GENTE_ANALIZADA[id]
              h \caja.gente-analizada,
                for dd in ddx
                  (proyecto-sm h) dd

        else @roadtrip.goto '/'


    # proyecto profile
    '/p/:id':
      enter: (route) ->
        id = route.params.id
        if dd = PROYECTOS[id] => @section \content, ({h}) ->
          (proyecto-profile h) dd
        else @roadtrip.goto '/'









# ------------------------------------------------------------------------------------------
#                              GENERATE TEST DATA
# ------------------------------------------------------------------------------------------

create-test-user = ->
  USUARIOS.push user =\
  USUARIOS[id = random-hex 32] =
    id: id
    name: (random-el NAMES.female-names) + ' ' + (random-el NAMES.last-names .name)
    desc: (lipsum 20, 50)
    foto: (random-hex 32)
    created: (random-date 20)
    is_analyst: false
    captador: null # (random-id CAPTADOR_USUARIOS)
    captador_rating: (between 0.3, 1)
    analista: null # (random-id ANALISTA_USUSRIOS)
    analista_rating: (between 0.3, 1)
    # ...
  user

create-test-proyecto-oferta = (proyecto_id) ->
  proyecto = PROYECTOS[proyecto_id]

  OFFERS.push oferta =\
  OFFERS[id = random-hex 32] =
    id: id
    proyecto_id: proyecto_id
    creator: random-id USUARIOS
    created: random-date 10
    amount: round (rand2 proyecto.amount / 9), -2
    interest: round (rand2 proyecto.interest, proyecto.interest / 1.5)
    # ...
  oferta

create-test-proyecto = (creator_id) ->
  PROYECTOS.push proyecto =\
  PROYECTOS[id = random-hex 32] =
    id: id
    creator: creator_id
    title: (lipsum 3, 5)
    desc: (lipsum 20, 100)
    foto: random-hex 32
    created: random-date 20
    begins: random-date 10
    ends: random-date -20
    captador: null
    captador_rating: between 0.3, 1
    analista: null
    analista_rating: between 0.3, 1
    interest: round (between 6, 20), 0
    amount: round (between 1000, 100000), -2
    duration: in-time (round (between 20, 2000), -1)
    sector: null
    locale: random-el LOCALES
    repayment: 1
    concept: (lipsum 2, 10)
    offered: 0 # filled in automatically
    ofertas: 0 # filled in automatically

  pull (pull-src-count (n = rand 20, 2)),
    pull-thru-map -> create-test-proyecto-oferta id
    pull-sink-collect (err, arr) !->
      proyecto.offered = arr.reduce ((total, d) -> total + d.amount), 0
      proyecto.ofertas = arr.length
      console.log "generated #{proyecto.ofertas} ofertas :: offered #{percent proyecto.offered / proyecto.amount}"

  proyecto


# temporary database in memory (for testing obviously)
PROYECTOS = []
OFFERS = []
USUARIOS = []
CAPTADOR_PROYECTOS = []
CAPTADOR_USUARIOS = []
ANALISTA_PROYECTOS = []
ANALISTA_USUARIOS = []

# user lists
PROYECTOS_CAPTADOS = {}
GENTE_CAPTADA = {}
PROYECTOS_ANALIZADOS = {}
GENTE_ANALIZADA = {}

# TODO: move me into the plugin
SESSION = value!

require! \seedrandom
seedrandom 'lala', global: true

pull (pull-src-count (n = rand 1000, 100)),
  pull-thru-map ->
    user = create-test-user!

    # 10% chance the user will be an captador de proyectos
    if Math.random! < (10 / 100)
      CAPTADOR_PROYECTOS.push CAPTADOR_PROYECTOS[user.id] = user

    # 10% chance the user will be a captador de usuarios
    if Math.random! < (10 / 100)
      CAPTADOR_USUARIOS.push CAPTADOR_USUARIOS[user.id] = user

    # 10% chance the user will be an analista de proyectos
    if Math.random! < (10 / 100)
      ANALISTA_PROYECTOS.push ANALISTA_PROYECTOS[user.id] = user
      user.is_analyst = true

    # 10% chance the user will be a analista de usuarios
    if Math.random! < (10 / 100)
      ANALISTA_USUARIOS.push ANALISTA_USUARIOS[user.id] = user
      user.is_analyst = true

    # 10% chance the user will create a proyecto (and isn't an analista)
    if not user.is_analyst and Math.random! < (10 / 100)
      (create-test-proyecto user.id)

    user
  pull-sink-collect (err, arr) ->
    console.log "generated #{arr.length} users"

    me = create-test-user!
    me.name = 'awesomeness'

    # USUARIOS[me.id] = me
    set-timeout !->
      SESSION me
    , 1000ms

    for user, i in CAPTADOR_PROYECTOS
      list = []
      for _id in (random-ids PROYECTOS, (rand 40))
        unless (p = PROYECTOS[_id]).captador
          p.captador = user.id
          p.captador_rating = (round Math.random!, 2)
          list.push p
      if list.length => PROYECTOS_CAPTADOS[user.id] = list
      else CAPTADOR_PROYECTOS[i] = null

    for user, i in CAPTADOR_USUARIOS
      list = []
      for _id in (random-ids USUARIOS, (rand 40))
        unless (p = USUARIOS[_id]).captador
          p.captador = user.id
          p.captador_rating = (round Math.random!, 2)
          list.push p
      if list.length => GENTE_CAPTADA[user.id] = list
      else CAPTADOR_USUARIOS[i] = null

    for user, i in ANALISTA_PROYECTOS
      list = []
      for _id in (random-ids PROYECTOS, (rand 40))
        unless (p = PROYECTOS[_id]).analista
          p.analista = user.id
          # we could potentially let the user give the analista a rating as well
          p.analista_rating = (round Math.random!, 2)
          list.push p
      if list.length => PROYECTOS_ANALIZADOS[user.id] = list
      else ANALISTA_PROYECTOS[i] = null

    for user, i in ANALISTA_USUARIOS
      list = []
      for _id in (random-ids USUARIOS, (rand 40))
        unless (p = USUARIOS[_id]).analista
          p.analista = user.id
          # we could potentially let the user give the analista a rating as well
          p.analista_rating = (round Math.random!, 2)
          list.push p
      if list.length => GENTE_ANALIZADA[user.id] = list
      else ANALISTA_USUARIOS[i] = null

    # compact CAPTADOR_PROYECTOS
    # compact CAPTADOR_USUARIOS
    # compact ANALISTA_PROYECTOS
    # compact ANALISTA_USUARIOS

    console.log "#{CAPTADOR_PROYECTOS.length} -> #{compact CAPTADOR_PROYECTOS .length} captadores de proyectos"
    console.log "#{CAPTADOR_USUARIOS.length} -> #{compact CAPTADOR_USUARIOS .length} usuarios ha captado otros usuarios"
    console.log "#{ANALISTA_PROYECTOS.length} -> #{compact ANALISTA_PROYECTOS .length} analizadores de proyectos"
    console.log "#{ANALISTA_USUARIOS.length} -> #{compact ANALISTA_USUARIOS .length} usuarios ha analizado otros proyectos"

    # after building the test data, load the plugin
    plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, lending-coin

#
