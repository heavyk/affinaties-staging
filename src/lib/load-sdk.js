
const doc = document

export default function load_sdk (_id, v, cb) {
  if (typeof v === 'function') cb = v, v = null
  var js,
    s = 'script',
    id = _id+'-sdk',
    done = false,
    // fjs = doc.getElementsByTagName(s)[0],
    p = /^http:/.test(doc.location) ? 'http' : 'https'

  if (doc.getElementById(id)) cb()
  else {
    js = doc.createElement(s)
    js.id = id
    js.onload = js.onreadystatechange = function () {
      if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
        done = true
        cb(js)
      }
    }
    if (_id === 'tw') js.src = p + '://platform.twitter.com/widgets.js'
    else if (_id === 'fb') js.src = p + '://connect.facebook.net/' + (v || 'es_ES') + '/sdk.js'
    else if (_id === 'go') js.src = p + '://www.google.com/jsapi'
    else if (_id.substr(0, 3) === 'go:') js.src = p + '://www.google.com/uds/?file=' + _id.substr(3) + '&v=' + (v || 1)
    // fjs.parentNode.insertBefore(js, fjs)
    doc.getElementsByTagName('head')[0].appendChild(js)
  }
}
