var offsets = {}

// populate the offset lookup (note distance from C, in semitones)
'B#-C|C#-Db|D|D#-Eb|E-Fb|E#-F|F#-Gb|G|G#-Ab|A|A#-Bb|B-Cb'
  .split('|').forEach((val, i) =>
    val.split('-').forEach((note) => offsets[note] = i)
  )

// convert a note name (e.g. 'A4') to a frequency (e.g. 440.00)
const getFrequency = (name, middleC) => {
  var couple = name.split(/(\d+)/),
    distance = offsets[couple[0]],
    octaveDiff = (couple[1] || 4) - 4, // 4 is the octive offset
    freq = middleC * Math.pow(Math.pow(2, 1/12), -9) * Math.pow(Math.pow(2, 1/12), distance)
  return freq * Math.pow(2, octaveDiff)
}

// convert a duration string (e.g. 'q') to a number (e.g. 1)
// also accepts numeric strings (e.g '0.125')
// and compund durations (e.g. 'es' for dotted-eight or eighth plus sixteenth)
const getDuration = (duration) =>
  /^[0-9.]+$/.test(duration) ? parseFloat(duration) :
    duration.toLowerCase().split('').reduce((prev, curr) =>
      prev + (curr === 'w' ? 4 : curr === 'h' ? 2 :
        curr === 'q' ? 1 : curr === 'e' ? 0.5 :
          curr === 's' ? 0.25 : 0)
    , 0)

/*
 * Note class
 *
 * new Note ('A4 q') === 440Hz, quarter note
 * new Note ('- e') === 0Hz (basically a rest), eigth note
 * new Note ('A4 es') === 440Hz, dotted eighth note (eighth + sixteenth)
 * new Note ('A4 0.0125') === 440Hz, 32nd note (or any arbitrary
 * divisor/multiple of 1 beat)
 *
 */

// create a new Note instance from a string
class Note {
  constructor (str, middleC = 440) {
    var couple = str.split(/\s+/)
    // frequency, in Hz
    this.frequency = getFrequency(couple[0], middleC) || 0
    // duration, as a ratio of 1 beat (quarter note = 1, half note = 0.5, etc.)
    this.duration = getDuration(couple[1]) || 0
  }
}

export default Note
