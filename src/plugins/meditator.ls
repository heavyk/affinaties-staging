``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
``import { value, transform, compute } from '../lib/dom/observable'``
# ``import { ObservableArray, RenderingArray} from '../lib/dom/observable-array'``
# ``import xhr from '../lib/xhr'``
# ``import load_sdk from '../lib/load-sdk-h'``
# ``import { rand, rand2, randomId, randomEl, randomIds, randomPos, randomDate, randomCharactor, between, lipsum, word, obj } from '../lib/random'``

``import '../elements/poem-frame'``

AudioContext::create-white-noise = (buffer-size = 4096) ->
  node = @create-script-processor buffer-size, 1, 1
  node.onaudioprocess = (e) !->
    output = e.output-buffer.get-channel-data 0
    for i til buffer-size
      output[i] = Math.random! * 2 - 1
  return node

AudioContext::create-pink-noise = (buffer-size = 4096) ->
  node = @create-script-processor buffer-size, 1, 1
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0
  node.onaudioprocess = (e) !->
    output = e.output-buffer.get-channel-data 0
    for i til buffer-size
      white = Math.random! * 2 - 1
      b0 := 0.99886 * b0 + white * 0.0555179
      b1 := 0.99332 * b1 + white * 0.0750759
      b2 := 0.96900 * b2 + white * 0.1538520
      b3 := 0.86650 * b3 + white * 0.3104856
      b4 := 0.55000 * b4 + white * 0.5329522
      b5 := -0.7616 * b5 - white * 0.0168980
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
      output[i] *= 0.11 # (roughly) compensate for gain
      b6 := white * 0.115926
  return node

AudioContext::create-brown-noise = (buffer-size = 4096) ->
  node = @create-script-processor buffer-size, 1, 1
  last = 0
  node.onaudioprocess = (e) !->
    output = e.output-buffer.get-channel-data 0
    for i til buffer-size
      white = Math.random! * 2 - 1
      output[i] = (last + (0.02 * white)) / 1.02
      last := output[i]
      output[i] *= 3.5 # (roughly) compensate for gain
  return node

AudioContext::create-distortion = (k = 50, oversample = '4x') ->
  node = @create-wave-shaper!
  curve = new Float32Array n_samples = node.context.sample-rate
  for i til n_samples
    x = i * 2 / n_samples - 1
    curve[i] = (Math.PI + k) * x / (Math.PI + k * (Math.abs x))
  node.distortion = curve
  node.oversample = oversample
  return node


ctx = new AudioContext
# noise = ctx.create-white-noise!
# distortion = ctx.create-distortion 100
# noise.connect distortion
# distortion.connect ctx.destination
# console.log \connected

# Saw Modulator
pink-noise = ctx.create-pink-noise!
pink-gain = ctx.create-gain!
pink-filter = ctx.create-biquad-filter!
pink-gain.gain.value = 1000
pink-filter.frequency.value = 16.18
pink-noise.connect pink-filter
pink-filter.connect pink-gain

saw = ctx.create-oscillator!
saw.type = \sawtooth
saw.frequency.value = 528
saw-distortion = ctx.create-distortion 50
saw-filter = ctx.create-biquad-filter!
saw-filter.Q.value = 2
saw-gain = ctx.create-gain!
saw-gain.gain.value = 0

saw.start 0
# saw.connect saw-filter
saw.connect saw-distortion
saw-distortion.connect saw-filter
saw-filter.connect saw-gain
# saw-distortion.connect saw-gain
pink-gain.connect saw-filter.frequency
saw-gain.connect ctx.destination

# Waves
brown-noise = ctx.create-brown-noise 16384
brown-gain = ctx.create-gain!
brown-gain.gain.value = 0.3
brown-noise.connect brown-gain

lfo = ctx.create-oscillator!
lfo.frequency.value = 0.33
lfo-gain = ctx.create-gain!
lfo-gain.gain.value = 0.1

lfo.start 0
lfo.connect lfo-gain
lfo-gain.connect brown-gain.gain

waves-gain = ctx.create-gain!
waves-gain.gain.value = 0
brown-gain.connect waves-gain
waves-gain.connect ctx.destination

# saw-gain.gain.value = 0.02
# waves-gain.gain.value = 0.3


const DEFAULT_CONFIG =
  lala: 1155

meditator = ({config, G, set_config, set_data}) ->
  {h, s} = G
  G.width (v, old_width) !-> console.log \width, old_width, '->', v

  # additional elements?
  # G.E.frame.aC []

  h \poem-frame, {base: '/plugin/meditator'}, (G) ->
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


plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, meditator
