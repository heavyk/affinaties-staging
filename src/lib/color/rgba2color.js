
export default function rgba2color (r, g, b, a) {
  var values = [r, g, b].map(Math.round)
  return (a >= 0 && a <= 255 ? 'rgba(' + values.concat(a / 255).join(',') : 'rgb(' + values.join(',')) + ')'
}
