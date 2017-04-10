import { win } from './hyper-hermes'

var requestAnimationFrame = win.requestAnimationFrame ||
  win.mozRequestAnimationFrame ||
  win.webkitRequestAnimationFrame || (function () {
   /* rAF shim. Gist: https://gist.github.com/julianshapiro/9497513 */
   var timeLast = 0
   return function (callback) {
     var timeCurrent = (new Date()).getTime(),
       timeDelta

     /* Dynamically set delay on a per-tick basis to match 60fps. */
     /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
     timeDelta = Math.max(0, 16 - (timeCurrent - timeLast))
     timeLast = timeCurrent + timeDelta

     return setTimeout(function () { callback(timeCurrent + timeDelta); }, timeDelta)
   }
 })()

export default requestAnimationFrame
