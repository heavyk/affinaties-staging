``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
``import { value, transform, compute } from '../lib/dom/observable'``
``import Sequence from '../lib/sound/Sequence'``
# ``import { ObservableArray, RenderingArray } from '../lib/dom/observable-array'``
# ``import xhr from '../lib/xhr'``
# ``import load_sdk from '../lib/load-sdk-h'``
# ``import { rand, rand2, randomId, randomEl, randomIds, randomPos, randomDate, randomCharactor, between, lipsum, word, obj } from '../lib/random'``

``import '../elements/poem-frame'``
``import '../elements/parallax-stars'``
``import '../elements/countdown-timer'``

``import { left_pad } from '../lib/utils'``

AudioCtx = AudioContext

AudioCtx::create-white-noise = (buffer-size = 4096) ->
  node = @create-script-processor buffer-size, 1, 1
  node.onaudioprocess = (e) !->
    output = e.output-buffer.get-channel-data 0
    for i til buffer-size
      output[i] = Math.random! * 2 - 1
  return node

AudioCtx::create-pink-noise = (buffer-size = 4096) ->
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

AudioCtx::create-brown-noise = (buffer-size = 4096) ->
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

AudioCtx::create-distortion = (k = 50, oversample = '4x') ->
  node = @create-wave-shaper!
  curve = new Float32Array n_samples = node.context.sample-rate
  for i til n_samples
    x = i * 2 / n_samples - 1
    curve[i] = (Math.PI + k) * x / (Math.PI + k * (Math.abs x))
  node.distortion = curve
  node.oversample = oversample
  return node


window.ac = new AudioCtx
# noise = ac.create-white-noise!
# distortion = ac.create-distortion 100
# noise.connect distortion
# distortion.connect ac.destination
# console.log \connected

# Saw Modulator
pink-noise = ac.create-pink-noise!
pink-gain = ac.create-gain!
pink-filter = ac.create-biquad-filter!
pink-gain.gain.value = 1000
pink-filter.frequency.value = 16.18
pink-noise.connect pink-filter
pink-filter.connect pink-gain

saw = ac.create-oscillator!
saw.type = \sawtooth
saw.frequency.value = 528
saw-distortion = ac.create-distortion 50
saw-filter = ac.create-biquad-filter!
saw-filter.Q.value = 2
saw-gain = ac.create-gain!
saw-gain.gain.value = 0

saw.start 0
# saw.connect saw-filter
saw.connect saw-distortion
saw-distortion.connect saw-filter
saw-filter.connect saw-gain
# saw-distortion.connect saw-gain
pink-gain.connect saw-filter.frequency
saw-gain.connect ac.destination

# Waves
brown-noise = ac.create-brown-noise 16384
brown-gain = ac.create-gain!
brown-gain.gain.value = 0.3
brown-noise.connect brown-gain

lfo = ac.create-oscillator!
lfo.frequency.value = 0.33
lfo-gain = ac.create-gain!
lfo-gain.gain.value = 0.1

lfo.start 0
lfo.connect lfo-gain
lfo-gain.connect brown-gain.gain

waves-gain = ac.create-gain!
waves-gain.gain.value = 0
brown-gain.connect waves-gain
waves-gain.connect ac.destination

# saw-gain.gain.value = 0.02
# waves-gain.gain.value = 0.3

tempo = 60
middleC = 444
start-time = ac.currentTime



# window.seq1 = new Sequence ac, { tempo, middleC, waveType: \sine } .notes [
#   'C4 q'
#   'D4 q'
#   'E4 q'
#   'F4 q'
#   'G4 q'
#   'A4 q'
#   'B4 q'
#   'C5 q'
#   'B4 q'
#   'A4 q'
#   'G4 q'
#   'F4 q'
#   'E4 q'
#   'D4 q'
# ] .play start-time

# window.seq2 = new Sequence ac, { tempo, middleC } .notes [
#   'C4 q'
#   'D4 q'
#   'E4 q'
#   'F4 q'
#   'G4 q'
#   'A4 q'
#   'B4 q'
#   'C5 q'
# ] .play start-time + (60 / tempo) * 16 # play 16 beats later

# lfo.connect seq1.gain

# TODO:
# - merge the start / stop buttons (if started, display stop, etc.)
# - play sound / notification at the end of the timer
# - get rid of Sequence and only add the option to give background noise
# - remove the stupid grid and just make it a single plugin element
#  -> when compiling it, include the css in the js file

const DEFAULT_CONFIG =
  base: '/plugin/meditator'

meditator = ({config, G, set_config, set_data}) ->
  # TODO: save this scope into the frame and let this be the bottom-most element
  {h, s} = G

  # transformers
  hhmmss = (v) -> left_pad v, 2

  h \poem-frame, {config.base}, (G) ->
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
          h \.container,
            h \h2, "articles"
            for id, article of articles
              h \.article-link,
                h \a href: "/article/#{id}", article.t
          # for t in [5,10,15,20]
          #   h \div,
          #     h \a href: "/timer/#{t}", "#{t} min"

      # update: (route) !->
      # leave: (route, next) !->

    '/parallax':
      enter: !->
        @section \content ({h}) ->
          h \parallax-stars {height: 800, density: 100},
            h \span "this is really somethin!!"

    '/timer/:min':
      enter: (route) ->
        ms = route.params.min * 60s * 1000ms
        @section \content, ({h}) ->
          h \.timer-frame,
            h \.countdown,
              timer =\
              window.timer =\
              h \countdown-timer, {duration: ms}, ({h}) ->
                # TODO: if hours, display them, otherwise do not.
                h \.time-display,
                  # h \span.hours, @attrx \hours, hhmmss
                  # ":"
                  h \span.minutes, @attrx \minutes, hhmmss
                  ":"
                  h \span.seconds, @attrx \seconds, hhmmss
                  # "."
                  # h \span.ms, @attrx \ms, hhmmss
            h \.buttons,
              h \button onclick: (-> timer.emit 'timer.add', -5*60*1000),
                "-5 min"
              h \button onclick: (-> timer.emit 'timer.start'),
                "start"
              h \button onclick: (-> timer.emit 'timer.stop'),
                "stop"
              h \button onclick: (-> timer.emit 'timer.set'), # no duration = previous duration
                "reset"
              h \button onclick: (-> timer.emit 'timer.add', 5*60*1000),
                "+5 min"


plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, meditator
