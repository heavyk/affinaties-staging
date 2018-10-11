
import { h } from './dom/hyper-hermes'
import { doc } from './dom/dom-base'

function load_sdk (_id, v, cb) {
  if (typeof v === 'function') cb = v, v = null
  var js,
    s = 'script',
    id = _id+'-sdk',
    done = false,
    p = /^http:/.test(doc.location) ? 'http' : 'https',
    is_google_loader = _id.substr(0, 3) === 'go:',
    append = (js) => { doc.getElementsByTagName('head')[0].appendChild(js) }

  if (doc.getElementById(id)) cb()
  else {
    js = h(s, {id: id, src: (_id === 'tw') ? p + '://platform.twitter.com/widgets.js'
      : (_id === 'fb') ? p + '://connect.facebook.net/' + (v || 'es_ES') + '/sdk.js'
      : (_id === 'go') ? p + '://www.google.com/jsapi'
      : (is_google_loader) ? p + '://www.google.com/uds/?file=' + _id.substr(3) + '&v=' + (v || 1) : null })

    if (is_google_loader) {
      load_sdk('go', () => {
        is_google_loader = google.loader.writeLoadTag
        is_google_loader.i = 0
        google.loader.writeLoadTag = (type, url) => {
          var el = type === 'css' ?
            h('link', {type: 'text/css', rel: 'stylesheet', href: url})
            : h(type, {type: 'text/javascript', src: url})
          el.onload = el.onreadystatechange = function () {
            var readyState = this.readyState
            if (--is_google_loader.i === 0 && (!readyState || readyState === 'loaded' || readyState === 'complete')) cb(js)
          }
          is_google_loader.i++
          append(el)
        }
      })
    }
    js.onload = js.onreadystatechange = function () {
      var readyState = this.readyState
      if (!is_google_loader && !done && (!readyState || readyState === 'loaded' || readyState === 'complete')) {
        done = true
        cb(js)
      }
    }

    append(js)
  }
}

export default load_sdk
