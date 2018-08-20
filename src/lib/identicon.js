import { mergeDeep, forEach } from '../lib/utils'
import hsl2rgb from '../lib/color/hsl2rgb'
import rgba2color from '../lib/color/rgba2color'
import { hex } from '../lib/parse/number'
import { h, s } from '../lib/dom/hyper-hermes'

// knicked from http://github.com/stewartlord/identicon.js
// removed png rendering and implemented svg rendering as default

export function identicon (hash, opts = {}) {
  opts = mergeDeep({
    background: [240, 240, 240, 255],
    margin: 0.08,
    size: 64,
    saturation: 0.7,
    brightness: 0.5,
    cells: 7
  }, opts)

  var n = opts.cells
  var n2 = n * 2
  var n3 = n * 3
  while (hash.length < n3) hash += hash
  var size = opts.size
  var hue = hex(hash.substr(-7)) / 0xfffffff
  var fg = rgba2color.apply(null, hsl2rgb(hue, opts.saturation, opts.brightness))
  var bg = rgba2color.apply(null, opts.background)
  var baseMargin = Math.floor(size * opts.margin)
  var cell = Math.floor((size - baseMargin * 2) / n)
  var xCell = Math.floor((size - baseMargin * 2) / 5)
  var margin = Math.floor((size - cell * n) / 2)
  var rects = []

  for (var i = 0; i < n3; ++i) {
    if (hex(hash.charAt(i)) % 2 === 0) {
      if (i < n) {
        rects.push({ x: 2 * xCell + margin, y: i * cell + margin })
      } else if (i < n2) {
        rects.push({ x: 1 * xCell + margin, y: (i - n) * cell + margin },
                   { x: 3 * xCell + margin, y: (i - n) * cell + margin })
      } else if (i < n3) {
        rects.push({ x: 0 * xCell + margin, y: (i - n2) * cell + margin },
                   { x: 4 * xCell + margin, y: (i - n2) * cell + margin })
      }
    }
  }

  return
    // h('img', {width: size, height: size, src: 'data:image/svg+xml;base64,' + btoa(
    s('svg', { width: size, height: size, style: { backgroundColor: bg }},
      s('g', {style: { fill: fg, stroke: fg, strokeWidth: size * 0.005 }},
        forEach(rects, (rect) => s('rect', mergeDeep({width: xCell, height: cell}, rect)))
      )
    )
    // .outerHTML)})
}
