var pull = require('pull-stream/pull')
pull.drain = require('pull-stream/sinks/drain')
var Pause = require('pull-pause')
// var Obv = require('obv')

import Obv from '../dom/observable'

var next = 'undefined' === typeof setImmediate ? setTimeout : setImmediate
var buffer = Math.max(window.innerHeight * 2, 1000)


export default function Scroller (scroller, content, render, isPrepend, isSticky, cb) {
  assertScrollable(scroller)
  var obv = Obv()

  //if second argument is a function,
  //it means the scroller and content elements are the same.
  if ('function' === typeof content) {
    cb = isSticky
    isPrepend = render
    render = content
    content = scroller
  }

  if (!cb) cb = function (err) { if (err) throw err }

  scroller.addEventListener('scroll', scroll)
  var pause = Pause(function () {})
  var queue = []

  //apply some changes to the dom, but ensure that
  //`element` is at the same place on screen afterwards.

  function add () {
    if (queue.length) {
      var m = queue.shift()
      var r = render(m)
      append(scroller, content, r, isPrepend, isSticky)
      obv.set(queue.length)
    }
  }

  function scroll (ev) {
    if (isEnd(scroller, buffer, isPrepend) || !isFilled(content)) {
      add()
      pause.resume()
    }
  }

  pause.pause()

  //wait until the scroller has been added to the document
  next(function next () {
    if (scroller.parentElement) pause.resume()
    else                       setTimeout(next, 100)
  })

  var stream = pull(
    pause,
    pull.drain(function (e) {
      queue.push(e)
      obv.set(queue.length)

      if (scroller.scrollHeight < window.innerHeight)
        add()

      if (isVisible(content)) {
        if (isEnd(scroller, buffer, isPrepend))
          add()
      }

      if (queue.length > 5)
        pause.pause()

    }, function (err) {
      if (err) console.error(err)
      cb ? cb(err) : console.error(err)
    })
  )

  stream.visible = add
  stream.observ = obv
  return stream
}


function append (scroller, list, el, isPrepend, isSticky) {
  if (!el) return
  var s = scroller.scrollHeight
  var st = scroller.scrollTop
  if (isPrepend && list.firstChild)
    list.insertBefore(el, list.firstChild)
  else
    list.appendChild(el)

  //scroll down by the height of the thing added.
  //if it added to the top (in non-sticky mode)
  //or added it to the bottom (in sticky mode)
  if (isPrepend !== isSticky) {
    var d = (scroller.scrollHeight - s)
    var before = scroller.scrollTop
    //check whether the browser has moved the scrollTop for us.
    //if you add an element that is not scrolled into view
    //it no longer bumps the view down! but this check is still needed
    //for firefox.
    //this seems to be the behavior in recent chrome (also electron)
    if (st === scroller.scrollTop) {
      scroller.scrollTop = scroller.scrollTop + d
    }
  }
}




function assertScrollable (scroller) {
  var f = overflow(scroller)
  if (!/auto|scroll/.test(f))
    throw new Error('scroller.style.overflowY must be scroll or auto, was:' + f + '!')
}

function isEnd (scroller, buffer, isPrepend) {
  //if the element is hidden, don't read anything into it.
  return (isPrepend ? isTop : isBottom)(scroller, buffer)
}

function isFilled (content) {
  return (
    !isVisible(content)
    //check if the scroller is not visible.
    // && content.getBoundingClientRect().height == 0
    //and has children. if there are no children,
    //it might be size zero because it hasn't started yet.
    || content.children.length > 10
    //&& !isVisible(scroller)
  )
}

function isVisible (el) {
  var style = getComputedStyle(el)
  return style.visibility !== 'hidden'
}

// 'private' functions

function overflow (el) {
  return el.style.overflowY || el.style.overflow || (function () {
    var style = getComputedStyle(el)
    return style.overflowY || el.style.overflow
  })()
}

function isTop (scroller, buffer) {
  return scroller.scrollTop <= (buffer || 0)
}

function isBottom (scroller, buffer) {
  var rect = scroller.getBoundingClientRect()
  var topmax = scroller.scrollTopMax || (scroller.scrollHeight - rect.height)
  return scroller.scrollTop >= +((topmax) - (buffer || 0))
}
