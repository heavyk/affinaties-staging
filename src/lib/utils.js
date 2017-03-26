
// micro-optimization: http://jsperf.com/for-vs-foreach/292
export function forEach (arr, fn) {
  for (var i = 0; i < arr.length; ++i) fn(arr[i], i)
}

export function forEachReverse (arr, fn) {
  for (var i = arr.length - 1; i >= 0; i--) fn(arr[i], i)
}

export function parents (el, name) {
  while (el && el.nodeName.toLowerCase() !== name) {
    el = el.parentNode
  }

  return el && el.nodeName.toLowerCase() === name
    ? el
    : null
}

export function isEmpty (value) {
  if (!value || typeof value !== 'object') {
    return !value
  }

  return !Object.keys(value).length
}

export function joinPaths (...parts) {
  return parts.join('/').replace(/\/+/g, '/')
}

export function parseHash (hash, keys) {
  try {
    var parsed = compact(JSON.parse(decodeURIComponent(hash.substr(2))))

    return keys
      ? pick(parsed, keys)
      : parsed
  } catch (e) {
    return {}
  }
}

export function parseJSON (string) {
  try {
    return JSON.parse(string)
  } catch (e) {
    return string || ''
  }
}

export function parseUri (uri) {
  var parts = uri.match(/^(?:([\w+.-]+):\/\/([^/]+))?([^?#]*)?(\?[^#]*)?(#.*)?/)

  return {
    protocol: parts[1] || '',
    host: parts[2] || '',
    path: parts[3] || '',
    qs: parts[4] || '',
    hash: parts[5] || ''
  }
}

export function parseQS (qs, keys) {
  var index = qs.indexOf('?')
  var parsed = {}

  if (index !== -1) {
    var pairs = qs.substr(index + 1).split('&')
    var pair = []

    for (var i = 0, c = pairs.length; i < c; i++) {
      pair = pairs[i].split('=')

      if ((!isEmpty(pair[1])) && (!isEmpty(parseJSON(pair[1])))) {
        parsed[decodeURIComponent(pair[0])] = parseJSON(decodeURIComponent(pair[1]))
      }
    }
  }

  return keys
    ? pick(parsed, keys)
    : parsed
}

export function pick (object, keys) {
  var data = {}

  if (typeof keys === 'function') {
    for (var x in object) {
      if (object.hasOwnProperty(x) && keys(object[x], x)) {
        data[x] = object[x]
      }
    }
  } else {
    for (var i = 0, c = keys.length; i < c; i++) {
      data[keys[i]] = object[keys[i]]
    }
  }

  return data
}

export function scrollTo (id) {
  if (!id) return
  var el = document.getElementById(id)

  if (el) {
    window.scrollBy(0, el.getBoundingClientRect().top)
  } else {
    window.scrollTo(0, 0)
  }
}

export function stringify (value) {
  if (!value || typeof value !== 'object') {
    return value
  }

  return JSON.stringify(value)
}

export function stringifyHash (data) {
  data = compact(data)

  return !isEmpty(data)
    ? '#!' + encodeURIComponent(stringify(data))
    : ''
}

export function stringifyQS (data) {
  var qs = ''

  for (var x in data) {
    if (data.hasOwnProperty(x) && !isEmpty(data[x])) {
      qs += '&' + encodeURIComponent(x) + '=' + encodeURIComponent(stringify(data[x]))
    }
  }

  return qs
    ? '?' + qs.substr(1)
    : ''
}

export function camelize (k) {
  return ~k.indexOf('-') ? k.replace(/-+(.)?/g, (tmp, c) => (c || '').toUpperCase()) : k
}

// I imagine that something better can be done than this...
export function define_getter (fn) {
  return {
    configurable: true, //enumerable: true,
    get: fn
  }
}

export function define_value (fn) {
  return {
    // configurable: true, writable: true,
    value: fn
  }
}
