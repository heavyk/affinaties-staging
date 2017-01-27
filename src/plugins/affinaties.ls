``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
``import h from '../lib/dom/hyper-hermes'``
``import load_sdk from '../lib/load-sdk-h'``
``import { s } from '../lib/dom/hyper-hermes'``
``import ObservArray from '../lib/dom/observable-array'``
``import { value, input, attribute, transform, compute } from '../lib/dom/observable'``
``import xhr from '../lib/xhr'``
# ``import Packer from '../lib/packery/Packer'``
# ``import Rect from '../lib/packery/Rect'``
# ``import Ambition from '../lib/insightful/consciousness/ambition'``
``import CustomRect from '../elements/svg/custom-rect'``
``import PoemFrame from '../elements/poem-frame'``
# ``import animate from '../lib/velocity/velocity'``


const doc = document
const IS_LOCAL = ~doc.location.host.index-of 'localhost'

const DEFAULT_CONFIG =
  lala: 1155

onload = !->
  body = doc.body

  # TODO: add a reset stylesheet
  body.append-child h \style '''
    #T {
      position:absolute;
      display:block;
    }
    #Tcont {
      display:block;
      padding: 2px 12px 3px 7px;
      margin:5px;
      background:#666;
      color:#fff;
      border: solid 1px #ccc;
      border-radius: 12px;
    }
    '''

  body.append-child s \style '''
    rect.outer {}
    '''
# /onload

# class TestRect extends SVGGElement
#   # (topic, options) ->
#   (opts = {}) ->
#     super!
#
#     v-width = value 200
#     v-height = value 200
#
#     # for k, v of opts
#     this <<< opts
#     shadow = @attach-shadow mode: \open
#     for e in [
#       s \rect.outer width: v-width, height: v-height, rx: 20, ry: 20, stroke: '#444', fill: '#933' #v-bg
#       s \foreignObject width: v-width, height: v-height,
#         h \p, s: 'width: 100px', "some more text...???"
#         # in2
#         # transform in1, (v) -> "input: #{v}"
#     ] => shadow.append-child e

window.custom-elements.define \poem-frame, PoemFrame
window.custom-elements.define \custom-rect, CustomRect

pack = require \bin-pack

const abstract_art = require '../lib/test_data/bing/abstract_art.json'

affinaties = ({config, G, set_config, set_data}) ->
  onload! # this is just a function that has the stuff needed for the loading

  # doc-write = doc.write.bind doc
  # doc.write = (v) ->
  #   console.log \write, v
  #   unless v => return

  # xhr url: 'https://www.google.es/search?site=&tbm=isch&source=hp&biw=2556&bih=1343&q=lala&oq=lala', (d) !->
  #   debugger

  # bing image search:
  # 7f259562ece04183bfeead39c7da90ab

  # google custom search api key:
  # AIzaSyB0VbPwvZrvtGg6fURfz1aDGtLGadiEJ6c
  # load_sdk 'go', !->
  # load_sdk 'go:search', 1, (e) !->
    # image-searcher = new google.search.ImageSearch
    # function oncomplete
    #   console.log "search complete", image-searcher.results
    # image-searcher.set-search-complete-callback null, oncomplete, null
    # image-searcher.execute "chorradas"
    # google.search.Search.getBranding 'branding'

  G.E.frame.append-child \
    # s \svg, width: G.width, height: G.height, ->
    h \poem-frame, width: G.width, height: G.height, ->
      in1 = attribute \
        in2 = h \input, type: \text, placeholder: 'enter some text'
      in1 (v) !->
        console.log \input, v

      v-width = value 200
      v-height = value 200
      v-opinion = value {
        # creator:
        type: 'A'
        value: 1
        # v0: 0
        # v1: 0
        # v2: 0
        # v3: 0
      }

      v-bg = transform v-opinion, (d) ->
        if !d => '#333'
        else if d.type is 'A' => '#f33'
        else if d.type is 'C' => '#33f'
        else '#fff'

      return [
        h \g.top-bar ->
          console.log 'top bar'
          img_width = value 40
          img_height = value 40
          img_padding = value 5
          img_border = value 5
          border_width = compute [img_width, img_padding], (w, ib) -> w + (ib)
          top_right = compute [G.width, img_width, img_padding], (w, iw, ip) -> w - iw - ip
          bar_height = compute [img_height, img_padding], (h, p) -> h + (2 * p)

          return [
            h \rect width: G.width, height: bar_height, fill: '#f44'
            h \img,
              href: 'https://secure.gravatar.com/avatar/4e9e35e45c14daca038165a11cde7464'
              width: img_width
              height: img_height
              y: img_border
              x: top_right
          ]

        h \g.opus-list, ->
          console.log \opus
          window.rects = rects = new ObservArray
          for v in abstract_art.value
            width = v.thumbnail.width
            height = v.thumbnail.height
            # rect = new Rect
            # console.log v.name
            # console.log v.accent-color, width, height
            r = new CustomRect {width, height}
            # r = h \custom-rect {width, height}
            rects.push r

          # for r in rects
          #   console.log \rect, r.x, r.y
          pack rects, in-place: true
          # for r in rects
          #   console.log \rect, r.x, r.y, r.width, r.height
          return rects
      ]
    #</svg>

plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, affinaties
