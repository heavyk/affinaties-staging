import PoemBase from './poem-base'

import { value } from '../lib/dom/observable'
// import raf from '../lib/dom/request-animation-frame'

import { forEach } from '../lib/utils'
import { time_units, dt2units } from '../lib/format-dt'

export default class CountdownTimer extends PoemBase {
  constructor (opts, fn) {
    // debugger
    if (typeof opts === 'function') fn = opts, opts = {}
    super(opts || {}, (G) => {
      var self = this

      // private vars:
      var time_start = 0
      var time_end = 0
      var time_elapsed = 0
      var t_id
      var duration = opts.duration || 10*60*1000

      // attributes
      var time_vals = { ms: value(0) }
      var _fps = self.attr('fps', 20, true)
      var _duration = this.attr('duration', duration, true)
      forEach(time_units, (unit) => {
        var k = unit[0]
        self.attr(k, time_vals[k] = value(0))
      })
      self.attr('ms', time_vals.ms)

      const _update = (dt) => {
        forEach(dt2units(dt), (u) => {
          time_vals[u[0]](u[1])
        })
      }

      // events
      self.on('timer.set', (ms) => {
        _duration(duration = typeof ms === 'number' ? ms : ms != null ? ms.duration : (opts.duration || _duration()))
        _update(duration - time_elapsed)
      })

      self.on('timer.start', () => {
        // TODO: if fps > 10, always do a raf and then only call the update function if the time difference is more than the fps delta
        if (time_start > 0) return
        time_start = Date.now()
        time_end = time_start + duration - time_elapsed
        t_id = setInterval(() => {
          var dt = time_end - Date.now()
          if (dt < 0) dt = 0
          _update(dt)
          if (dt <= 0) this.emit('timer.end')
        }, (1000 / _fps()))
      })

      self.on('timer.add', (ms) => {
        _duration(duration = +(_duration() + (typeof ms === 'number' ? ms : ms != null ? ms.duration : 0)))
        time_end = time_start + duration - time_elapsed
        _update(duration - (time_start > 0 ? Date.now() - time_start : 0) - time_elapsed)
      })

      self.on('timer.stop', (evt) => {
        if (time_start > 0) {
          time_elapsed += Date.now() - time_start
          clearInterval(t_id)
          time_end = time_start = 0
        }
      })

      self.on('timer.end', () => {
        self.emit('timer.stop')
        time_elapsed = 0
        self.emit('timer.set')
      })

      this.emit('timer.set', duration)
      if (typeof fn == 'function') {
        var ctx = self.context(G)
        self.els(ctx.h('slot'))
        self.aC(fn.call(self, ctx))
      }
    })
  }
}

import { special_elements } from '../lib/dom/hyper-hermes'
special_elements.define('countdown-timer', CountdownTimer, ['opts = {}', 'function (G)'])
