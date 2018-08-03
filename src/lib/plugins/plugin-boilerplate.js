import { mergeDeep, objJSON } from '../utils'

import { value, transform, compute, modify } from '../dom/observable'
import ResizeSensor from '../dom/resize-sensor'

import { h, s } from '../dom/hyper-hermes'
import { doc, body, win, IS_LOCAL, basePath } from '../dom/hyper-hermes'
import { new_context, el_context } from '../dom/hyper-hermes' // I think some cleanup is is order, lol
import { makeNode } from '../dom/hyper-hermes'

function pluginBoilerplate (frame, id, _config, _data, DEFAULT_CONFIG, _onload) {
  var tmp, mutationObserver, G, E, _width, _height, _dpr, set_data, set_config, args
  var C = mergeDeep({}, objJSON(_config), DEFAULT_CONFIG)

  if (IS_LOCAL) {
    tmp = body.style
    tmp.background = '#fff'
    tmp.fontFamily = 'Helvetica Neue,Helvetica,Arial,sans-serif'
    tmp.padding = tmp.margin = 0
  }

  if (!frame) {
    body.aC(frame = h('div#frame', {
      s: {
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        // width: '100%',
        // height: '100%',
        overflow: 'hidden'
      }
    }))
  }

  (mutationObserver = new MutationObserver(function (mutations) {
    var i, j, removed, len
    for (i = 0; i < mutations.length; ++i) {
      for (j = 0, len = (removed = mutations[i].removedNodes).length; j < len; ++j) {
        if (removed[j] === frame) frame.cleanup()
      }
    }
  })).observe(frame.parentNode, { childList: true })

  win.G = G = frame._G = new_context({h, s})
  G.E = E = { frame: frame, body: doc.body, win: win }

  // TODO: get device orientation
  // https://crosswalk-project.org/documentation/tutorials/screens.html
  // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Managing_screen_orientation
  // TODO: add device motion events
  // https://developers.google.com/web/fundamentals/native-hardware/device-orientation/
  tmp = screen.orientation
  tmp.onchange = function (e) { G.orientation((tmp = e.target).type.split('-').concat(tmp.angle)) }
  G.orientation = value(tmp.type.split('-').concat(tmp.angle))

  G.width = value(_width = frame.clientWidth || C.width || 300)
  G.height = value(_height = frame.clientHeight || C.height || 300)

  if ((_dpr = Math.round(win.devicePixelRatio || 1)) > 4) _dpr = 4
  G.dpr = value(_dpr)

  frame._id = id
  if (!(set_data = frame.set_data)) {
    set_data = frame.set_data = value()
  }

  ;(function (_cleanup) {
    frame.cleanup = () => {
      var p = frame.parentNode
      mutationObserver.disconnect()
      if (p) p.removeChild(frame)
      if (typeof _cleanup === 'function') _cleanup()
    }
  })(frame.cleanup)

  G.cleanupFuncs.push(frame.cleanup)

  if (!(set_config = frame.set_config)) {
    set_config = frame.set_config = value(C)
    set_config((C) => {
      var k, v, o
      console.log('setting config:', C)
      for (k in C) {
        v = C[k]
        if (typeof (o = G[k]) === 'undefined') {
          G[k] = value(v)
        } else {
          o(v)
        }
      }
    })
  }

  // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events
  // this is SUPER SLOW
  // instead, convert this to MutationObserver and don't listen to subtree modifications
  // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  // win.addEventListener('DOMNodeRemoved', (e) => {
  //   // TODO: make this passive??
  //   if (e.target === frame) frame.cleanup()
  // }, false)


  args = { C, G, set_config, set_data, v: value, t: transform, c: compute, m: modify}

  ;(function (onload) {
    function loader () {
      var e, i = 0, resize
      while (e = frame.childNodes[0]) frame.removeChild(e)
      if (_data) set_data(_data)

      while (e = body.childNodes[i])
        if (e.nodeName[0] === '#') body.removeChild(e)
        else i++

      // it would be really cool if this would work with generators, promises, async and normal functions
      // it wouldn't be difficult actually, just borrow some code from `co`
      // https://github.com/tj/co/blob/master/index.js
      if (typeof onload === 'function') {
        // e = makeNode(frame, onload.bind(e, args), h.cleanupFuncs)
        // frame.aC(e)
        if (e = onload(args)) {
          frame.aC(e)
        }
      }

      resize = new ResizeSensor(frame, () => {
        G.width(_width = frame.clientWidth)
        G.height(_height = frame.clientHeight)
      })
      h.cleanupFuncs.push(() => resize.detach())
    }

    if (doc.body) setTimeout(loader, 1)
    else win.addEventListener('DOMContentLoaded', loader, false)
  })(_onload)

  return args
}

// re-exported
export { doc, body, win, IS_LOCAL }
export { pluginBoilerplate }
export default pluginBoilerplate
