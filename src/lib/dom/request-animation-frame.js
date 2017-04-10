import { win } from './hyper-hermes'

var requestAnimationFrame = win.requestAnimationFrame ||
  win.mozRequestAnimationFrame ||
  win.webkitRequestAnimationFrame ||
    ((fn) => win.setTimeout(fn, 20))

export default requestAnimationFrame
