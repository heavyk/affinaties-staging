``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
``import h from '../lib/dom/hyper-hermes'``
``import { s } from '../lib/dom/hyper-hermes'``
``import ObservArray from '../lib/dom/observable-array'``
``import { value, input, attribute, transform, compute } from '../lib/dom/observable'``
# ``import xhr from '../lib/xhr'``
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

  # body.append-child s \style '''
  #   '''
# /onload


const LALA = 1111

meatr = ({config, G, set_config, set_data}) ->
  onload! # this is just a function that has the stuff needed for the loading

  G.E.frame.append-child \
    s \svg, width: G.width, height: G.height, ->
      # in1 = attribute \
      #   in2 = h \input, type: \text, placeholder: 'enter some text'
      # in1 (v) !->
      #   console.log \input, v
      img_width = value 60
      img_height = value 60
      img_padding = value 5
      # img_border = value 5
      border_width = compute [img_width, img_padding], (w, ib) -> w + (ib)
      top_right = compute [G.width, img_width, img_padding], (w, iw, ip) -> w - iw - ip
      return
        * s \g.top-bar, ->
          * s \rect width: G.width, height: 70, fill: '#f44'
          * s \image,
              'xlink:href': 'https://secure.gravatar.com/avatar/89c1e54a9703125168e40d22316d2b49?s=200&r=pg&d=https%3A%2F%2Fdeveloper.cdn.mozilla.net%2Fmedia%2Fimg%2Favatar.png'
              width: img_width
              height: img_height
              y: img_border
              x: top_right

        # * s \foreignObject width: 200, height: 200,
        #     h \p, s: 'width: 100px', "some more text...???"
        #     in2
        #     transform in1, (v) -> "input: #{v}"
    #</svg>

plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, meatr
