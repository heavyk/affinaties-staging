/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */

import requestAnimationFrame from './request-animation-frame'
import { h } from './hyper-hermes'
import { getStyleProperty } from './dom-base'


/**
 * Iterate over each of the provided element(s).
 *
 * @param {HTMLElement|HTMLElement[]} elements
 * @param {Function}                  callback
 */
function forEachElement (elements, callback) {
  // var elementsType = Object.prototype.toString.call(elements)
  // var isCollectionTyped = ('[object Array]' === elementsType
  //   || ('[object NodeList]' === elementsType)
  //   || ('[object HTMLCollection]' === elementsType)
  //   || ('[object Object]' === elementsType)
  //   || ('undefined' !== typeof jQuery && elements instanceof jQuery) // jquery
  //   || ('undefined' !== typeof Elements && elements instanceof Elements) // mootools
  // )
  var i = 0, j = elements.length
  // if (isCollectionTyped) {
  if (typeof j === 'number') {
    for (; i < j; i++) callback(elements[i])
  } else {
    callback(elements)
  }
}

/**
 * Class for dimension change detection.
 *
 * @param {Element|Element[]|Elements|jQuery} element
 * @param {Function} callback
 *
 * @constructor
 */
var ResizeSensor = function (element, callback) {
  /**
   *
   * @constructor
   */
  function EventQueue () {
    var q = []
    this.add = function (ev) {
      q.push(ev)
    }

    var i, j
    this.call = function () {
      for (i = 0, j = q.length; i < j; i++) {
        q[i].call()
      }
    }

    this.remove = function (ev) {
      var newQueue = []
      for (i = 0, j = q.length; i < j; i++) {
        if (q[i] !== ev) newQueue.push(q[i])
      }
      q = newQueue
    }

    this.length = function () {
      return q.length
    }
  }


  /**
   *
   * @param {HTMLElement} element
   * @param {Function}    resized
   */
  function attachResizeEvent (element, resized) {
    if (element.resizedAttached) {
      element.resizedAttached.add(resized)
      return
    }

    element.resizedAttached = new EventQueue()
    element.resizedAttached.add(resized)

    var expand, expandChild, shrink
    var style = 'position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;z-index:-1;visibility:hidden'
    var styleChild = 'position:absolute;left:0;top:0;transition:0s'
    element.resizeSensor = h('.resize-sensor', {s: style},
      expand =
      h('.resize-sensor-expand', {s: style},
        expandChild =
        h('div', {s: styleChild})
      ),
      shrink =
      h('.resize-sensor-shrink', {s: style},
        h('div', {s: styleChild + ';width:200%;height:200%'})
      )
    )
    // element.resizeSensor = document.createElement('div')
    // element.resizeSensor.className = 'resize-sensor'
    // var style = 'position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;z-index:-1;visibility:hidden'
    // var styleChild = 'position:absolute;left:0;top:0;transition:0s'
    //
    // element.resizeSensor.style.cssText = style
    // element.resizeSensor.innerHTML =
    //   '<div class="resize-sensor-expand" style="' + style + '">' +
    //   '<div style="' + styleChild + '"></div>' +
    //   '</div>' +
    //   '<div class="resize-sensor-shrink" style="' + style + '">' +
    //   '<div style="' + styleChild + ' width: 200%; height: 200%"></div>' +
    //   '</div>'
    element.appendChild(element.resizeSensor)

    if (getStyleProperty(element, 'position') == 'static') {
      element.style.position = 'relative'
    }

    // var expand = element.resizeSensor.childNodes[0]
    // var expandChild = expand.childNodes[0]
    // var shrink = element.resizeSensor.childNodes[1]
    var dirty, rafId, newWidth, newHeight
    var lastWidth = element.offsetWidth
    var lastHeight = element.offsetHeight

    var reset = function () {
      expandChild.style.width = '100000px'
      expandChild.style.height = '100000px'

      expand.scrollLeft = 100000
      expand.scrollTop = 100000

      shrink.scrollLeft = 100000
      shrink.scrollTop = 100000
    }

    reset()

    var onResized = function () {
      rafId = 0

      if (!dirty) return

      lastWidth = newWidth
      lastHeight = newHeight

      if (element.resizedAttached) {
        element.resizedAttached.call()
      }
    }

    var onScroll = function () {
      newWidth = element.offsetWidth
      newHeight = element.offsetHeight
      dirty = newWidth != lastWidth || newHeight != lastHeight

      if (dirty && !rafId) {
        rafId = requestAnimationFrame(onResized)
      }

      reset()
    }

    expand.addEventListener('scroll', onScroll)
    shrink.addEventListener('scroll', onScroll)
  }

  forEachElement(element, function (elem) {
    attachResizeEvent(elem, callback)
  })

  this.detach = function (ev) {
    ResizeSensor.detach(element, ev)
  }
}

ResizeSensor.detach = function (element, ev) {
  forEachElement(element, function (elem) {
    if (elem.resizedAttached && typeof ev == 'function') {
      elem.resizedAttached.remove(ev)
      if (elem.resizedAttached.length()) return
    }
    if (elem.resizeSensor) {
      if (elem.contains(elem.resizeSensor)) {
        elem.removeChild(elem.resizeSensor)
      }
      delete elem.resizeSensor
      delete elem.resizedAttached
    }
  })
}

export default ResizeSensor
