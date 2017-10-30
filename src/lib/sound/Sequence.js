
// knicked from: https://github.com/kevincennis/TinyMusic
// * added adjustable middleC

import Note from './Note'

class Sequence {
  constructor (ac, opts = {}) {
    var v, k, filter, prev = this.gain = (this.ac = ac || new AudioContext()).createGain()
    opts = Object.assign({
      tempo: 120,
      middleC: 440,
      loop: true,
      smoothing: 0,
      staccato: 0,
      waveType: 'square',
      eq: {bass: 100, mid: 1000, treble: 2500}
    }, opts)

    // create gain and EQ nodes, then connect 'em
    if (v = opts.eq) {
      for (k in v) {
        filter = this[k] = this.ac.createBiquadFilter()
        filter.type = 'peaking'
        filter.frequency.value = v[k]
        prev.connect(prev = filter)
      }
      // don't add `eq` to `this`
      delete opts.eq
    }
    prev.connect(this.ac.destination)
    for (k in opts) this[k] = opts[k]
    this._notes = []
  }

  // accepts Note instances or strings (e.g. 'A4 e')
  notes (...notes) {
    for (var note of notes) {
      if (Array.isArray(note)) this.notes(...note)
      else this._notes.push(note instanceof Note ? note : new Note(note, this.middleC))
    }
    return this
  }

  // create a custom waveform as opposed to "sawtooth", "triangle", etc
  createCustomWave (real, imag) {
    // Wave type must be custom to apply period wave.
    this.waveType = 'custom'

    // Reset customWave
    this.customWave = [new Float32Array(real), new Float32Array(imag || real)]
  }

  // schedules this._notes[index] to play at the given time
  // returns an AudioContext timestamp of when the note will *end*
  scheduleNote (index, when) {
    var duration = 60 / this.tempo * this._notes[index].duration,
      cutoff = duration * (1 - (this.staccato || 0))

    this.osc.frequency.setValueAtTime(this._notes[index].frequency, when)

    if (this.smoothing && this._notes[index].frequency) {
      this.slide(index, when, cutoff)
    }

    this.osc.frequency.setValueAtTime(0, when + cutoff)
    return when + duration
  }

  // slide the note at <index> into the next note at the given time,
  // and apply staccato effect if needed
  slide (index, when, cutoff) {
    // next note
    var next = this._notes[index < this._notes.length - 1 ? index + 1 : 0]
    // how long do we wait before beginning the slide? (in seconds)
    var start = cutoff - Math.min(cutoff, 60 / this.tempo * this.smoothing)
    this.osc.frequency.setValueAtTime(this._notes[index].frequency, when + start)
    this.osc.frequency.linearRampToValueAtTime(next.frequency, when + cutoff)
    return this
  }

  // // set frequency at time
  // setFrequency (freq, when) {
  //   this.osc.frequency.setValueAtTime(freq, when)
  //   return this
  // }

  // // ramp to frequency at time
  // rampFrequency (freq, when) {
  //   this.osc.frequency.linearRampToValueAtTime(freq, when)
  //   return this
  // }

  // run through all notes in the sequence and schedule them
  play (when) {
    when = typeof when === 'number' ? when : this.ac.currentTime

    // recreate the oscillator node
    this.stop()
    this.osc = this.ac.createOscillator()

    // customWave should be an array of Float32Arrays. The more elements in
    // each Float32Array, the dirtier (saw-like) the wave is
    if (this.customWave) this.osc.setPeriodicWave(this.ac.createPeriodicWave(...this.customWave))
    else this.osc.type = this.waveType

    this.osc.connect(this.gain)
    this.osc.start(when)

    for (var i = 0; i < this._notes.length; i++) {
      when = this.scheduleNote(i, when)
    }

    this.osc.stop(when)
    this.osc.onended = this.loop ? this.play.bind(this, when) : null

    return this
  }

  // stop playback, null out the oscillator, cancel parameter automation
  stop () {
    if (this.osc) {
      this.osc.onended = null
      this.osc.disconnect()
      this.osc = null
    }
    return this
  }
}

export default Sequence
