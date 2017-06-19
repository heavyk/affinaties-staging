``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
``import { value, transform, compute } from '../lib/dom/observable'``
``import { rand, rand2, randomId, randomEl, randomIds, randomPos, randomHex, randomCharactor, randomDate, inTime, between, lipsum, word, obj } from '../lib/random'``
``import round from '../lib/lodash/round'``

``import '../elements/poem-frame'``

# reference implementationz:
# - https://aragon.one/
# - https://www.grow.ly/es/proyecto/inicio?owner=False&favourite=False
# - https://github.com/dharmaprotocol/LoanStandard

# exchanges:
# - https://bitso.com/developers?javascript#private-rest-api

# import icons:
# - https://github.com/icons8/flat-color-icons
# - https://github.com/maxlibin/lite-flag-icon-css

require! \pull-scroll
require! \pull-stream

require! \currency-formatter
require! \moment

const NAMES = require '../../../data/names.json'

Identicon = require \identicon.js
# web3 = new (Web3 = require 'web3')
# web3.set-provider new web3.providers.HttpProvider 'http://localhost:8545'
# # web3.set-provider (require 'ethereumjs-testrpc' .provider!)
# # web3.eth.default-account = web3.eth.coinbase
# web3.eth.default-account = "0x3992df320f500a183e2855be3222f4ba7a5c218a"
# web3.eth.priv-key = "9054f3a7c330fa53ad4c116511443f3ac62773cc110dd97fed01cadbc6be27f6"
#
#
# require! \truffle-contract
#
# web3.eth.get-balance web3.eth.default-account, (err, b) ->
#   console.log err, b.to-string!
#
# Incrementer = truffle-contract require '../contracts/Incrementer'
# lala = web3.eth.contract Incrementer.abi
# lala.new {data: Incrementer.binary, gas: 101000}, (err, c) !->
#   console.log \contract, err, c
# Incrementer.set-provider new web3.providers.HttpProvider 'http://localhost:8545'
# Incrementer.new from: web3.eth.default-account .then (incr) !->
#   debugger
# Incrementer.deployed!.then (incrementer) !->
#     incrementer.Incremented {odd: true}, (err, x) !->
#       console.log "current count is:", x

# for testing:
window <<< { rand, rand2, randomId, randomEl, randomIds, randomPos, randomHex, randomCharactor, randomDate, inTime, between, lipsum, word, obj }
window <<< { moment, currency-formatter }
# window <<< { web3, Web3, Incrementer }

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

# every 30 days, you have to pay the interest.
# later, the amortization option is up to you:
# 1. amortize the principal over x time
# 2. repay as you obtain the funds
# 3. never pay at all (infinite debt)

# const repayment_es = [
#   ''
# ]


const DEFAULT_CONFIG =
  lala: 1155

# rendering functions
percent = (n) -> (Math.floor n * 100) + '%'
rating = (p, n = 10) -> (Math.floor p * n) + ' / ' + n
day_month = (d) -> (moment d .format 'Do MMM')
user_link = (h, dd) ->
  h \a href: "/u/#{dd.id}", dd.name


# LOAN
loan-sm = (h, no_foto) -> (dd) ->
  read-more = value!
  offered_percent = percent (Math.min dd.offered / dd.amount, 1)
  request-animation-frame !->
    # this is kind of inconvienient because the 'more' button will push everything downward just to display to 'more' button
    # ideally, it should not modify the height of the .loan element
    if desc.scrollHeight - 10 > desc.clientHeight => read-more false
  h \div.loan,
    unless no_foto
      h \div.foto,
        h \a href: "/u/#{dd.creator}",
          h \img width: 80 height: 80, src: "data:image/svg+xml;base64,#{new Identicon dd.foto, margin: 0.05, size: 80 format: 'svg'}"
          # h \div USERS[dd.creator].name
    h \div.title,
      h \a href: "/p/#{dd.id}", dd.title
    h \div.content,
      h \span.interest, dd.interest + '%'
      h \span.rating.captador-rating, (rating dd.captador_rating, 100)
      h \span.rating.analyst-rating, (rating dd.analyst_rating, 100)
      h \span.status,
        h \span.offered, s: {width: offered_percent}
        h \span.offered-num, dd.offers + ' offers / ' + offered_percent
        h \span.begins, day_month dd.begins
        h \span.amount, currency-formatter.format dd.amount, locale: dd.locale
        h \span.ends, day_month dd.ends
      desc =\
      h \div.desc, dd.desc
      transform read-more, (v) ->
        if v isnt void
          desc.style.height = if v => desc.scrollHeight + 'px' else '20px'
          # desc.style.color = if v => '#333' else '#33f'
          h \div.read-more, {onclick: -> (read-more !read-more!)}, if v => "less" else "more"

loan-lg = (h) -> (dd) ->
  offer-scroller = h \div.offer-scroller, s: {overflow-y: 'auto'}
  pull-stream (pull-stream.values OFFERS),
    pull-stream.filter (d) -> d.loan_id is dd.id
    pull-scroll offer-scroller, offer-scroller, (offer-sm h), false, false, (err) !->
      console.log 'the end!', err
  offered_percent = percent (Math.min dd.offered / dd.amount, 1)
  h \div.loan,
    h \div.foto,
      h \a href: "/u/#{dd.creator}",
        h \img width: 80 height: 80, src: "data:image/svg+xml;base64,#{new Identicon dd.foto, margin: 0.05, size: 80 format: 'svg'}"
        # h \div USERS[dd.creator].name
    h \div.title,
      h \a href: "/p/#{dd.id}", dd.title
    h \div.content,
      h \span.interest, dd.interest + '%'
      h \span.rating.captador-rating, (rating dd.captador_rating, 100)
      h \span.rating.analyst-rating, (rating dd.analyst_rating, 100)
      h \span.status,
        h \span.offered, s: {width: offered_percent}
        h \span.offered-num, offered_percent
        h \span.begins, day_month dd.begins
        h \span.amount, currency-formatter.format dd.amount, locale: dd.locale
        h \span.ends, day_month dd.ends
      h \div.desc-big, dd.desc
      h \div.offers, offer-scroller
    # h \pre, JSON.stringify dd, null 2

offer-sm = (h) -> (offer) ->
  # loan = LOANS[offer.loan_id]
  offerer = USERS[offer.creator]
  h \div.offer,# {s: {background: "hsl(28, #{round (offer.interest / loan.interest) * 78}%, #{80 + round offer.amount / loan.amount * 30}%)"}}, # hsl(28, 78%, 91%) 70 - 91
    h \div.offerer,
      h \a href: "/u/#{offerer.id}", offerer.name
    h \div.amount, offer.amount, ' @ ', offer.interest, '%'
    h \div.when, day_month offer.created
    # h \pre, JSON.stringify offer, null 2

offer-lg = (h) -> (offer) ->
  loan = LOANS[offer.loan_id]
  h \div.offer,# s: {background: "hsl(28, #{(loan.interest - offer.interest / loan.interest) * 78}%, 91%)"}, # hsl(28, 78%, 91%)
    h \div.loan-title,
      h \a href: "/p/#{loan.id}", loan.title
    h \div.amount, offer.amount, ' @ ', offer.interest, '%'
    h \div.when, day_month offer.created
    # h \pre, JSON.stringify offer, null 2
    # h \pre, JSON.stringify loan, null 2

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
      h \.top,
        h \.logo,
          h \a href: '/',
            # h \img width: 120 height: 60, src: "data:image/svg+xml;base64,#{new Identicon (random-hex 16), margin: 0, size: 120 format: 'svg'}"
            "LendingCoin"
      h \.middle,
        @section \content
      h \.side-bar,
        @section \side, ({h}) ->
          h \ul,
            h \li.profile,
              h \a href: '/me', "profile"
            h \li.loans,
              h \a href: '/me/loans', "loans"
            # h \li.projects, "projects"
            h \li.preferences,
              h \a href: '/preferences', "preferences"
    ]

    # router
    '/':
      enter: (route, prev) !->
        @section \content, ({h}) ->
          loan-scroller = h \div.loan-scroller, s: {overflow-y: 'auto'}
          pull-stream (pull-stream.values LOANS),
            # TODO: add filtering / ordering(?) to the main view
            # pull-stream.filter (d) -> d.creator is id
            pull-scroll loan-scroller, loan-scroller, (loan-sm h), false, false, (err) !->
              console.log 'the end!', err
          h \div.main-page, loan-scroller

      # update: (route) !->
      # leave: (route, next) !->

    # me
    '/me':
      enter: (route) ->
        # if logged in, show profile, else show login
        @section \content, ({h}) ->
          h \h1, "I am beautiful. I am magical. I am me!"

    # user profile
    '/u/:id':
      enter: (route) ->
        id = route.params.id
        if user = USERS[id] => @section \content, ({h}) ->
          loan-scroller = h \div.loan-scroller, s: {overflow-y: 'auto'}
          pull-stream (pull-stream.values LOANS),
            pull-stream.filter (d) -> d.creator is id
            pull-scroll loan-scroller, loan-scroller, (loan-sm h, false), false, false, (err) !->
              console.log 'the end!', err

          offer-scroller = h \div.offer-scroller, s: {overflow-y: 'auto'}
          pull-stream (pull-stream.values OFFERS),
            pull-stream.filter (d) -> d.creator is id
            pull-scroll offer-scroller, offer-scroller, (offer-lg h), false, false, (err) !->
              console.log 'the end!', err
          h \div.profile,
            h \div.ident,
              h \img width: 140 height: 140, src: "data:image/svg+xml;base64,#{new Identicon id, margin: 0.05, size: 140 format: 'svg'}"
              h \h3, user.name
            h \div.loans, loan-scroller
            h \div.offers, offer-scroller
        else @roadtrip.goto '/'


    # loan profile
    '/p/:id':
      enter: (route) ->
        id = route.params.id
        if dd = LOANS[id] => @section \content, ({h}) ->
          (loan-lg h) dd
        else @roadtrip.goto '/'



# ------------------------------------------------------------------------------------------
#                              GENERATE TEST DATA
# ------------------------------------------------------------------------------------------

create-test-user = ->
  USERS.push user =\
  USERS[id = random-hex 32] =
    id: id
    name: (random-el NAMES.female-names) + ' ' + (random-el NAMES.last-names .name)
    # ...
  user

create-test-loan-offer = (loan_id) ->
  loan = LOANS[loan_id]

  OFFERS.push offer =\
  OFFERS[id = random-hex 32] =
    id: id
    loan_id: loan_id
    creator: random-id USERS
    created: random-date 10
    amount: round (rand2 loan.amount / 9), -2
    interest: round (rand2 loan.interest, loan.interest / 1.5)
    # ...
  offer

create-test-loan = (creator_id) ->
  LOANS.push loan =\
  LOANS[id = random-hex 32] =
    id: id
    creator: creator_id
    title: (lipsum 3, 5)
    desc: (lipsum 20, 100)
    foto: random-hex 32
    created: random-date 20
    begins: random-date -20
    ends: random-date -60
    captador: null
    captador_rating: between 0.3, 1
    analyst: null
    analyst_rating: between 0.3, 1
    interest: round (between 6, 20), 0
    amount: round (between 1000, 100000), -2
    duration: in-time (round (between 20, 2000), -1)
    sector: null
    locale: random-el LOCALES
    repayment: 1
    concept: (lipsum 2, 10)
    offered: 0 # filled in automatically
    offers: 0 # filled in automatically

  pull-stream (pull-stream.count (n = rand 20, 2)),
    pull-stream.map -> create-test-loan-offer id
    pull-stream.collect (err, arr) !->
      loan.offered = arr.reduce ((total, d) -> total + d.amount), 0
      loan.offers = arr.length
      console.log "generated #{loan.offers} offers :: offered #{percent loan.offered / loan.amount}"

  loan


# temporary database in memory (for testing obviously)
LOANS = []
OFFERS = []
USERS = []

require! \seedrandom
seedrandom 'lala', global: true

USERS.push me =
  id: random-hex 32
  name: 'awesomeness'
  # ...

USERS[me.id] = me

pull-stream (pull-stream.count (n = rand 1000, 100)),
  pull-stream.map -> create-test-user!
  pull-stream.collect (err, arr) ->
    console.log "generated #{arr.length} users"
    for user in arr
      # 10% chance the user will create a loan
      if Math.random! < 0.1 => create-test-loan user.id

    # after building the test data, load the plugin
    plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, lending-coin

#
