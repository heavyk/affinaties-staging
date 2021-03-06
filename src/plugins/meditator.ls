``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
``import { value, transform, compute } from '../lib/dom/observable'``
``import Sequence from '../lib/sound/Sequence'``
# ``import { ObservableArray, RenderingArray } from '../lib/dom/observable-array'``
# ``import xhr from '../lib/xhr'``
# ``import load_sdk from '../lib/load-sdk-h'``
# ``import { rand, rand2, randomId, randomEl, randomIds, randomPos, randomDate, randomCharactor, between, lipsum, word, obj } from '../lib/random'``
``import { rand } from '../lib/random'``

``import '../elements/poem-frame'``
# ``import '../elements/parallax-stars'``
# ``import '../elements/countdown-timer'``

``import { left_pad } from '../lib/utils'``
``import { dt2human, format_dt } from '../lib/format-dt'``

``import pullScroll from '../lib/pull-stream/scroller'``
pull = require 'pull-stream/pull'
pull-src-values = require 'pull-stream/sources/values'

AudioCtx = AudioContext

raf = requestAnimationFrame

# AudioCtx.audioWorklet.addModule 'modules/bypassFilter.js'

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

# use pulses to find frequency
# limits:
# l ear: 14300 saw, 14400 sine
# r ear: 13200 saw, 13500 sine

# sightly more irritating: 13400 12300
# make the freq some sort of octave or some meaningful multiple of the other

# window.ac = new AudioCtx sample-rate: 96000, latency-hint: \playback
window.ac = new AudioCtx latency-hint: \playback
# noise = ac.create-white-noise!
# distortion = ac.create-distortion 100
# noise.connect distortion
# distortion.connect ac.destination
# console.log \connected

# Saw Modulator
# pink-noise = ac.create-pink-noise!
# pink-gain = ac.create-gain!
# pink-filter = ac.create-biquad-filter!
# pink-gain.gain.value = 1000
# pink-filter.frequency.value = 16.18
# pink-noise.connect pink-filter
# pink-filter.connect pink-gain
#
# saw = ac.create-oscillator!
# saw.type = \sawtooth
# saw.frequency.value = 528
# saw-distortion = ac.create-distortion 50
# saw-filter = ac.create-biquad-filter!
# saw-filter.Q.value = 2
# saw-gain = ac.create-gain!
# saw-gain.gain.value = 0
#
# saw.start 0
# # saw.connect saw-filter
# saw.connect saw-distortion
# saw-distortion.connect saw-filter
# saw-filter.connect saw-gain
# # saw-distortion.connect saw-gain
# pink-gain.connect saw-filter.frequency
# saw-gain.connect ac.destination
#
# # Waves
# brown-noise = ac.create-brown-noise 16384
# brown-gain = ac.create-gain!
# brown-gain.gain.value = 0.3
# brown-noise.connect brown-gain
#
# lfo = ac.create-oscillator!
# lfo.frequency.value = 0.33
# lfo-gain = ac.create-gain!
# lfo-gain.gain.value = 0.1
#
# lfo.start 0
# lfo.connect lfo-gain
# lfo-gain.connect brown-gain.gain
#
# waves-gain = ac.create-gain!
# waves-gain.gain.value = 0
# brown-gain.connect waves-gain
# waves-gain.connect ac.destination
#
# # saw-gain.gain.value = 0.02
# # waves-gain.gain.value = 0.3
#
# tempo = 60
# middleC = 444
# start-time = ac.currentTime
#
# multi = ac.create-constant-source!
# multi.offset.value = 10
#
# osc = ac.create-oscillator!
# osc.type = \sine
# osc.frequency.value = 432
# osc-gain = ac.create-gain!
# osc-gain.gain.value = 100
# osc.connect ac.destination
# # osc.connect osc-gain
# osc-gain.connect ac.destination
# # osc.start 0
# console.log 'started!!', osc.frequency

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

# longer intervals
# use target for forwards and ramp for backwards
# occasional blips

linear_curve = (start, end, steps = 128) ->
  dt = end - start
  vs = new Float32Array steps
  for i til steps
    vs[i] = start + (dt * (i / steps))
  vs

f_expand = (o, ms_min, ms_max, f, f_lr, f_lr_min, f_lr_max) ->
  ms = rand ms_max, ms_min
  mid = f_lr / 2
  mult = 20
  if o.forward
    f-l = f + (mid * mult)
    f-r = f - (mid * mult)
  else
    f-l = f - (mid * mult)
    f-r = f + (mid * mult)
  tc = ms / 500

  # reset the frequency down to the minimum one
  if f_lr is f_lr_min
    # tc = 0.1
    ms = 100

  t = ac.currentTime
  tt = t + (ms / 1000)

  # o.L.frequency.exponentialRampToValueAtTime f-l, t
  # o.R.frequency.exponentialRampToValueAtTime f-r, t
  o.L.frequency.setTargetAtTime f-l, t, tc
  o.R.frequency.setTargetAtTime f-r, t, tc

  next_f_lr = ((f_lr_max - f_lr_min) / 2) + f_lr
  console.log "#{if o.forward => '->' else '<-'} in #{(ms / 1000).toFixed 1}s #{f_lr.toFixed 2} -> #{next_f_lr.toFixed 2} (#{(f_lr / (f_lr_max - f_lr_min)).toFixed 2}) {#{tc}}"
  if next_f_lr > f_lr_max
    # console.info "maxed out:", next_f_lr, '>', f_lr_max
    next_f_lr = f_lr_min
    o.forward = !o.forward
    # ms = 100

  o.timeout = set-timeout !->
    # raf !->
    f_expand o, ms_min, ms_max, f, next_f_lr, f_lr_min, f_lr_max
  , ms

f_expand_better = (o, ms_min, ms_max, f, f_lr, f_lr_min, f_lr_max) ->
  ms = rand ms_max, ms_min
  mid = f_lr / 2
  mult = 1
  if o.forward
    f-l = f + (mid * mult)
    f-r = f - (mid * mult)
  else
    f-l = f - (mid * mult)
    f-r = f + (mid * mult)

  # reset the frequency down to the minimum one
  # if f_lr is f_lr_min
  #   # tc = 0.1
  #   ms = 100

  # interpolate between the now and the future value (for now, linearly)
  t = ac.currentTime
  duration = ms / 1000
  tt = t + duration

  o.L.frequency.setValueCurveAtTime (curve-l = linear_curve o.f-l, f-l), t, duration
  o.R.frequency.setValueCurveAtTime (curve-r = linear_curve o.f-r, f-r), t, duration

  console.log "curve-l:", (curve-l.slice 0, 10 .join ' ')
  console.log "curve-r:", (curve-r.slice 0, 10 .join ' ')

  # save frequency values into osc
  o.f-l = f-l
  o.f-r = f-r
  o.f_lr = f_lr

  next_f_lr = ((f_lr_max - f_lr_min) / 2) + f_lr
  console.log "#{if o.forward => '->' else '<-'} #{(ms / 1000).toFixed 1}s #{f_lr.toFixed 2} -> #{next_f_lr.toFixed 2} (#{(f_lr / (f_lr_max - f_lr_min)).toFixed 2})"
  if next_f_lr > f_lr_max
    next_f_lr = f_lr_min
    o.forward = !o.forward
    # ms = 100

  o.timeout = set-timeout !->
    # raf !->
    f_expand o, ms_min, ms_max, f, next_f_lr, f_lr_min, f_lr_max
  , ms




f_animate = (o, ms_min, ms_max, f_min, f_max, f_lr_min, f_lr_max) ->
  ms = rand ms_max, ms_min
  f = rand f_max, f_min
  f_lr = rand f_lr_max, f_lr_min
  # console.log "ms: #{ms} (#{ms_min}/#{ms_max}) f: #{f} (#{f_min}/#{f_max}) f_lr: #{f_lr} (#{f_lr_min}/#{f_lr_max})"
  # console.log "ms: #{ms}ms f: #{o.f} -> #{f} (#{f_min}/#{f_max}) f_lr: #{o.f_lr} -> #{f_lr} (#{f_lr_min}/#{f_lr_max})"
  # console.log "#{o.i}: #{ms / 1000}s f_lr: #{o.f_lr} -> #{f_lr} (#{f_lr_min}/#{f_lr_max}) tc: #{ms/1000}"
  mid = f_lr / 2
  if o.forward = !!!o.forward
    f-l = f + mid
    f-r = f - mid
    # console.log 'forward'
  else
    f-l = f - mid
    f-r = f + mid
    # console.log 'backward'
  tc = ms / 1000
  t = ac.currentTime + tc
  # instead we're going to calculate and set the target, so that we decay into (but never quite reach) the new value
  # we also need some way of animating the whole unit instead of just the individual parts to give the feeling of a big transition
  # instead of a bunch of random transitions... maybe each "part" can have different time constants.
  # console.log "#{o.i}L: #{o.L.frequency.value.toFixed 1} -> #{f-l.toFixed 1}"
  # console.log "#{o.i}R: #{o.R.frequency.value.toFixed 1} -> #{f-r.toFixed 1} tc: #{tc}"
  o.L.frequency.setTargetAtTime f-l, 0, tc
  o.R.frequency.setTargetAtTime f-r, 0, tc
  # o.L.frequency.exponentialRampToValueAtTime f-l, t
  # o.R.frequency.exponentialRampToValueAtTime f-r, t
  o.timeout = set-timeout !->
    # raf ->
    f_animate o, ms_min, ms_max, f_min, f_max, f_lr_min, f_lr_max
  , ms+ms

f_osc = (f = 432, f_lr = 20, qv = 0.9, f-type = \triangle) ->
  mid = f_lr / 2
  f-l = f + mid
  f-r = f - mid

  merger = ac.create-channel-merger 2
  osc-l = ac.create-oscillator!
  osc-l.type = f-type
  osc-l.frequency.setValueAtTime f-l, ac.currentTime
  osc-l.connect merger, 0, 0

  osc-r = ac.create-oscillator!
  osc-r.type = f-type
  osc-r.frequency.setValueAtTime f-r, ac.currentTime
  osc-r.connect merger, 0, 1

  gain = ac.create-gain!
  gain.gain.setValueAtTime qv, ac.currentTime
  merger.connect gain

  # buffer-size = 4096
  # noise = ac.create-script-processor buffer-size, 2, 2
  # prints = 40
  # b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0
  # noise.onaudioprocess = (e) !->
  #   out-l = e.output-buffer.get-channel-data 0
  #   out-r = e.output-buffer.get-channel-data 1
  #   for i til buffer-size
  #     white = Math.random! * 2 - 1
  #     b0 := 0.99886 * b0 + white * 0.0555179
  #     b1 := 0.99332 * b1 + white * 0.0750759
  #     b2 := 0.96900 * b2 + white * 0.1538520
  #     b3 := 0.86650 * b3 + white * 0.3104856
  #     b4 := 0.55000 * b4 + white * 0.5329522
  #     b5 := -0.7616 * b5 - white * 0.0168980
  #     l-gain = (1 - (Math.abs out-l[i])) * 0.9
  #     r-gain = (1 - (Math.abs out-r[i])) * 0.9
  #     gain = Math.min l-gain, r-gain, 0.9 # 0.11 # (roughly) compensate for gain
  #     # if --prints > 0 then console.log l-gain, gain, r-gain
  #     out = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362)
  #     out-l[i] += out * gain
  #     out-r[i] += -out * gain
  #     b6 := white * 0.115926

  # merger.connect noise
  # noise.connect gain
  # console.log "connected"

  {L: osc-l, R: osc-r, Q: gain, f, f_lr, f-l, f-r}

freq = (f, oct) -> f * Math.pow 2, oct

# TODO:
# - make a list element which accepts an ObservableArray or a stream
#  -> multi-selection? and active, selected, and other status (eg. completed)
#  -> it'd be cool if this were draggable and stuff
# - merge the start / stop buttons (if started, display stop, etc.)
#  -> need a status on the timer for running
# - play sound / notification at the end of the timer
# - get rid of Sequence and only add the option to give background noise
# - remove the stupid grid and just make it a single plugin element
#  -> when compiling it, include the css in the js file

start-freqi = ({C, G, set_config, set_data}) !->
  {h} = G
  # f = 432
  # f = 12300
  # f = 8900

  # todo?: put subliminal messages into it :)
  # TODO: make freq function: f, octave
  # TODO: pass this an array of obvs

  # f = freq 1000 / 9, 4 # 555.55 Hz, up 4 octaves
  # osc = [
  #   # f_osc f, (100/9), (1/9), \triangle
  #   # f_osc f, (200/9), (2/9), \triangle
  #   # f_osc f+f, (300/9), (3/9), \triangle
  #   # f_osc f+f, (400/9), (4/9), \triangle
  #   # f_osc f+f+f, (500/9), (5/9), \triangle
  #   # f_osc f+f, (600/9), (4/9), \triangle
  #   # f_osc f+f, (700/9), (3/9), \triangle
  #   # f_osc f, (800/9), (2/9), \triangle
  #   # f_osc f, (900/9), (1/9), \triangle
  #   # ---------
  #   # f_osc f, (100/9), (5/9), \triangle
  #   # f_osc f, (200/9), (4/9), \triangle
  #   # f_osc f+f, (300/9), (3/9), \triangle
  #   # f_osc f+f, (400/9), (2/9), \triangle
  #   # f_osc f+f+f, (500/9), (1/9), \triangle
  #   # f_osc f+f, (600/9), (2/9), \triangle
  #   # f_osc f+f, (700/9), (3/9), \triangle
  #   # f_osc f, (800/9), (4/9), \triangle
  #   # f_osc f, (900/9), (5/9), \triangle
  #   # ---------
  # ]

  f = freq (1000/9), 6 # 111.11 Hz, up 7 octaves
  f2 = freq 432, 5 # 432 Hz, up 5 octaves
  console.log "f: #{f} f2: #{f2}"

  # osc_stable = [
  #   # f_osc f, (432/8), (4/5)#, \sine
  #   # f_osc f, (432/4), (3/5)#, \sine
  #   f_osc f, (432/2), (2/5)#, \sine
  #   f_osc f, (432/1), (1/5)#, \sine
  # ]

  # osc_moving = [
  #   f_osc f2, (432/8), (1/20)#, \sine
  #   f_osc f2, (432/4), (2/20)#, \sine
  #   # f_osc f2, (432/2), (3/20)#, \sine
  #   # f_osc f2, (432/1), (4/20)#, \sine
  # ]
  osc_stable = [
    # f_osc f, (432/8), (4/5)#, \sine
    # f_osc f, (432/4), (3/5)#, \sine
    f_osc f, (400/9), (1/7)#, \sine
    f_osc f, (300/9), (1/7)#, \sine
    f_osc f, (200/9), (1/7)#, \sine
    f_osc f, (100/9), (1/7)#, \sine
  ]

  osc_moving = [
    # f_osc f, (432/8), (1/20)#, \sine
    # f_osc f, (400/9), (1/5)#, \sine
    # f_osc f, (300/9), (1/5)#, \sine
    # f_osc f, (200/9), (1/5)#, \sine
    f_osc f, 50, 0.7
    # f_osc f, 40, 0.7
    # f_osc f, 30, 0.7
  ]

  window.osc = \
  osc = osc_stable ++ osc_moving

  # also disabled the f_expand setTimeout below. in favour of just displaying the volume log
  for o in osc
    o.Q.connect ac.destination

  for o in osc
    o.L.start ac.currentTime
    o.R.start ac.currentTime

  # for visaualisation of freqs, check this out:
  # https://hoch.github.io/canopy/

  # set-interval !->
  #   for o, i in osc
  #     l = o.L.frequency.value
  #     r = o.R.frequency.value
  #     console.log "#{i}: f: #{f.toFixed 1} L: #{(l - f).toFixed 1} R: #{(r - f).toFixed 1}"
  # , 5000

  # VERY_FIRST: convert from an array to an object with each property a device
  # SECOND_FIRST: make a BinauralOscillatorNode which can be used like this (custom AudioParam is just a GainNode::gain)
  #               see: http://sebpiq.github.io/AudioParam/test/js/AudioParam-latest.js
  # LATER: different state templates, and allow for randomisation and animation between them
  #        these "keyframes" could be defined as indexed properties 'osc1.frequency', target_value, time_const
  # IDEA: try a shepherd tone constantly rising / falling
  # IDEA: modulate the wave with noise

  # target calculation:
  # % @ t :: 1 - (1 / e^(t * tc))

  n = 20times
  t = 100ms
  f = 432
  f-l = f + 72
  f-r = f - 72
  tc = 30/8
  tt = ac.currentTime + 0.5# + 2
  # o.L.frequency.cancelScheduledValues ac.currentTime
  # o.R.frequency.cancelScheduledValues ac.currentTime
  # o.L.frequency.setTargetAtTime f-l, tt, tc
  # o.R.frequency.setTargetAtTime f-r, tt, tc
  # o.L.frequency.exponentialRampToValueAtTime f-l, tt
  # o.R.frequency.exponentialRampToValueAtTime f-r, tt
  # o.L.frequency.linearRampToValueAtTime f-l, tt
  # o.R.frequency.linearRampToValueAtTime f-r, tt
  # adjust = !->
  #   o = osc_moving.0
  #   # show_freqs o, (tt - ac.currentTime).toFixed 2
  #   if n-- > 0 => set-timeout adjust, t
  # set-timeout adjust, 10

  # disabled in favour of doing a volume log here, and use ffox for now
  # set-timeout !->
  #   for o, i in osc_moving
  #     o.i = i
  #     f = o.f
  #     f_lr = o.f_lr
  #     f_lr_m = o.f_lr / 4
  #     # f_m = f / 8
  #     # f_min = Math.round f - f_m
  #     # f_max = Math.round f + f_m
  #     # f_lr_min = Math.round f_lr - f_lr_m
  #     # f_lr_max = Math.round f_lr + f_lr_m
  #     f_lr_min = Math.round f_lr - f_lr_m
  #     f_lr_max = Math.round f_lr + f_lr_m
  #     # f_animate o, 100000, 200000, f_min, f_max, f_lr_min, f_lr_max
  #     f_expand o, 5000, 5000, f, f+50, 10, 100
  # , 0


  G.E.frame.aC [
    h \div.volume "sys: ", (sys_volume = value " ? "), " - media: ", (media_volume = value " ? ")
    volume_log = h \div.volume-log {style: overflow-y: 'scroll', height: '100%'}
  ]

  document.add-event-listener \deviceready, !->
    set-interval !->
      # desired_vol = 95 + (Math.round Math.random! * 4)
      sys_vol = media_vol = null
      print_volume = (type, v) !->
        if sys_vol isnt null and media_vol isnt null
          volume_log.aC h \div, "#{Date.now!} - #{media_vol}/#{sys_vol} -> #{vol}"
      do_sys_volume = (v) !-> sys_volume "#{sys_vol := v}%"; print_volume!
      do_media_volume = (v) !-> media_volume "#{media_vol := v}%"; print_volume \media, v
      window.androidVolume.getSystem do_sys_volume
      window.androidVolume.getMusic do_media_volume

      # now set:
      window.androidVolume.setSystem 100, false, do_sys_volume, (err) !-> sys_volume "error: #{err}"
      window.androidVolume.setMusic 100, false, do_media_volume, (err) !-> media_volume "error: #{err}"
    , 1000ms

const DEFAULT_CONFIG =
  base: '/plugin/meditator'
/*
meditator = ({C, G, set_config, set_data}) ->
  # TODO: save this scope into the frame and let this be the bottom-most element
  {h, s} = G

  const LC = C.locale

  # transformers
  hhmmss = (v) -> left_pad v, 2

  program-entry = (h) -> (d) ->
    h \.program-entry,
      h \span.title d.title
      " :: "
      h \span.duration dt2human d.duration, LC

  h \poem-frame, {C.base}, (G) ->
    {h} = G

    frame = this
    volume = value '...'

    # set-interval !->
    #   vol = 95 + (Math.round Math.random! * 5)
    #   volume "#{vol}%"
    # , 1000ms

    @els [
      h \.top,
        h \.logo,
          h \a href: '/', "logo"
      h \.middle,
        @section \content
      h \.side-bar,
        h \div.volume, "volume: ", volume
        @section \side
    ]

    # router
    '/':
      enter: (route, prev) !->
        window.route = route
        @section \content, ({h}) ->
          h \div,
            h \a href: '/binaural', 'start binaral 1'

      # update: (route) !->
      # leave: (route, next) !->

    '/binaural': do ->
      # TODO: it would be really nice to have some sort of "tracks" layout...
      #   like, a RenderingArray with a whole bunch of oscillators, their
      #   settings and all merged

      enter: (route) !->
        # this should actually be button activated
        # TODO: this should recreate the nodes every time the sound begins play

        start-freqi!

        @section \content ({h}) ->
          h \div,
            h \button "cancel", onclick: !->
              o.L.frequency.cancelAndHoldAtTime ac.currentTime
              o.R.frequency.cancelAndHoldAtTime ac.currentTime


      leave: !->
        for o in osc
          o.Q.disconnect!
          if o.timeout isnt void
            clearTimeout o.timeout



    '/parallax':
      enter: !->
        @section \content ({h}) ->
          h \parallax-stars {height: 800, density: 100},
            h \span "this is really somethin!!"

    '/timer/:min':
      enter: (route) ->
        ms = route.params.min * 60s * 1000ms
        program =
          * type: \countdown, duration: 20s * 1000ms, title: "programming time"
          * type: \countdown, duration: 5s * 1000ms, title: "break time"
          ...

        # @incomplete - put all of this into a custom element (with the up-down scrollers and everything)
        #             - also, make the component accept ObservableArray, ObservableWindow, pull-scroll-windowed
        program-scroller = h \div.program-scroller, s: {overflow-y: 'auto'}

        # the down-scroller
        pull-src-values program
        |> pull-scroll program-scroller, program-scroller, (program-entry h), false, false, (err) !->
          console.log 'the end!', err

        # the up-scroller
        pull-src-values program
        |> pull-scroll program-scroller, program-scroller, (program-entry h), true, false, (err) !->
          console.log 'the end!', err

        @section \content, ({h}) ->
          h \.timer-frame,
            # TODO: this should essentially be hyper-scroller thing
            # h \timer-program, {program},
            timer =\
            window.timer =\
            h \countdown-timer, {duration: ms}, ({h}) ->
              # TODO: make this function the default in the custom element
              hrs = @attr \hours
              h \.time-display,
                transform hrs, (v) -> if v > 0
                  h \span.hours, hrs
                h \span.minutes, @attrx \minutes, hhmmss
                h \span.seconds, @attrx \seconds, hhmmss
                transform (@attr 'show_ms'), (v) ~> if v
                  h \span.ms, @attrx \ms, (v) -> left_pad v, 3
            program-scroller
            h \.buttons,
              # TODO: make a timer-buttons component which interfaces with the timer (for a proof of concept of plugin ineteraction)
              h \button onclick: (-> timer.emit 'timer.add', -5*60*1000),
                "-5 min"
              h \button onclick: (-> timer.emit 'timer.start'),
                "start"
              h \button onclick: (-> timer.emit 'timer.stop'),
                "stop"
              h \button onclick: (-> timer.emit 'timer.end'),
                "reset"
              h \button onclick: (-> timer.emit 'timer.add', 5*60*1000),
                "+5 min"
*/

# plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, meditator
plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, start-freqi
