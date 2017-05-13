``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
``import { value, transform, compute } from '../lib/dom/observable'``
# ``import { ObservableArray, RenderingArray} from '../lib/dom/observable-array'``
# ``import xhr from '../lib/xhr'``
# ``import load_sdk from '../lib/load-sdk-h'``
# ``import { rand, rand2, randomId, randomEl, randomIds, randomPos, randomDate, randomCharactor, between, lipsum, word, obj } from '../lib/random'``

``import '../elements/poem-frame'``

# TODO: add a mix task which automates this:
# $ mix plugin.new my-plugin

const DEFAULT_CONFIG =
  lala: 1155

plugin-template = ({config, G, set_config, set_data}) ->
  {h, s} = G
  G.width (v, old_width) !-> console.log \width, old_width, '->', v

  # additional elements?
  # G.E.frame.aC []

  h \poem-frame, {base: '/plugin/plugin-template'}, (G) ->
    {h} = G

    @els [
      h \.top,
        h \.logo,
          h \a href: '/', "logo"
      h \.middle,
        @section \content
      h \.side-bar,
        @section \side
    ]

    # router
    '/':
      enter: (route, prev) !->
        @section \content, ({h}) ->
          h \div "hello world"

      # update: (route) !->
      # leave: (route, next) !->

    '/content/:id':
      enter: (route) ->
        next_id = +route.params.id + 1
        @section \content, ({h}) ->
          h \div,
            h \a href: "/content/#{next_id}", "content: #{next_id}"


plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, plugin-template
