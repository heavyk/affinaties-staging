import PoemBase from './poem-base'

import { value } from '../lib/dom/observable'
import raf from '../lib/dom/request-animation-frame'

import { forEach } from '../lib/utils'

// @unfinished - locale configuration
// see moment and also: https://github.com/betsol/time-delta/blob/master/lib/time-delta.js

const timeUnits = [
  ['seconds', 1000],
  ['minutes',   60],
  ['hours',     60],
  ['days',      24],
  ['weeks',      7],
  ['months',     4],
  ['years',     12]
]

function init () {
  var divider = 1
  forEach(timeUnits, (unit) => {
    unit[1] = divider = divider * unit[1]
  })
  timeUnits.reverse()
}

init()

function dt_units(dt) {
  var results = {}
  forEach(timeUnits, function (unit) {
    var divider = unit[1]
    var value = dt > 0 ? Math.floor(dt / divider) : 0
    dt -= value * divider
    results[unit[0]] = value
  })
  results.ms = dt
  return results
}

export default class CountdownTimer extends PoemBase {
  constructor (opts, fn) {
    // debugger
    if (typeof opts === 'function') fn = opts, opts = {}
    super(opts || {}, (G) => {
      var self = this

      // private vars:
      var time_start
      var time_end
      var t_id
      var duration = opts.duration || 10*60*1000

      // attributes
      var fps = self.attr('fps', 20)
      var _duration = self.attr('duration', duration)
      var _time_start = self.attr('time_start')
      var _time_end = self.attr('time_end')
      var _vals = { ms: value(0) }
      forEach(timeUnits, (unit) => {
        var k = unit[0]
        self.attr(k, _vals[k] = value(0))
      })
      self.attr('ms', _vals.ms)

      const _update = (dt) => {
        var du = dt_units(dt)
        for(var k in du) {
          _vals[k](du[k])
        }
      }

      // events
      self.on('timer.set', (ms) => {
        _duration(duration = typeof ms === 'number' ? ms : ms.duration || this.duration || _duration())
        _time_start(time_start = Date.now())
        _time_end(time_end = time_start + duration)
        _update(duration)
      })

      self.on('timer.start', () => {
        // TODO: if fps > 10, always do a raf and then only call the update function if the time difference is more than the fps delta
        t_id = setInterval(() => {
          var dt = time_end - Date.now()
          if (dt < 0) {
            clearInterval(t_id)
            dt = 0
          }

          _update(dt)
          if (dt <= 0) this.emit('timer.end')
        }, (1000 / fps()))
      })

      self.on('timer.stop', (evt) => {
        clearInterval(t_id)
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
special_elements.define('countdown-timer', CountdownTimer, ['opts', 'function (G)'])
