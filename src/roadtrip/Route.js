import { h } from '../lib/dom/hyper-hermes'
import { slasher } from '../lib/utils'

const a = h('a')
const QUERYPAIR_REGEX = /^([\w\-]+)(?:=([^&]*))?$/
const HANDLERS = [ 'beforeenter', 'enter', 'leave', 'update' ]

class RouteData {
  constructor ({ route, pathname, params, query, hash, scrollX, scrollY, isInitial }) {
    this._route = route
    this.pathname = pathname
    this.params = params
    this.query = query
    this.hash = hash
    this.isInitial = isInitial
    this.scrollX = scrollX
    this.scrollY = scrollY
  }

  matches (href) {
    return this._route.matches(href)
  }
}


export default class Route {
  constructor (path, options, ctx) {
    this.path = path
    this.ctx = ctx || this

    if (typeof options === 'function') {
      options = { enter: options }
    }

    for (let handler of HANDLERS) {
      // only set the update function if we're given it
      if (handler !== 'update' || typeof options[handler] === 'function') {
        this[handler] = (route, other) => {
          let value, fn

          if (typeof (fn = options[handler]) === 'function') {
            value = fn.call(this.ctx, route, other)
          }

          return Promise.resolve(value)
        }
      }
    }
  }

  set path (_path) {
    var path = slasher(_path, 1)
    this._path = path
    this.segments = path.split('/')
  }

  get path () {
    return this._path
  }

  matches (href) {
    a.href = href
    return segmentsMatch(slasher(a.pathname, 1).split('/'), this.segments)
  }

  exec (target, isInitial) {
    a.href = target.href

    const pathname = slasher(a.pathname, 1)
    const segments = pathname.split('/')
    const _segments = this.segments

    if (segments.length !== _segments.length) {
      return false
    }

    const params = {}

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const toMatch = _segments[i]

      if (toMatch[0] === ':') {
        params[ toMatch.slice(1) ] = segment
      } else if (segment !== toMatch) {
        return false
      }
    }

    const query = {}
    const queryPairs = a.search.slice(1).split('&')

    for (let i = 0; i < queryPairs.length; i++) {
      const match = QUERYPAIR_REGEX.exec(queryPairs[i])

      if (match) {
        const key = match[1]
        const value = decodeURIComponent(match[2])

        if (query.hasOwnProperty(key)) {
          if (!Array.isArray(query[key])) {
            query[key] = [ query[key] ]
          }

          query[key].push(value)
        } else {
          query[key] = value
        }
      }
    }

    return new RouteData({
      route: this,
      isInitial,
      pathname,
      params,
      query,
      hash: a.hash.slice(1),
      scrollX: target.scrollX,
      scrollY: target.scrollY
    })
  }
}

function segmentsMatch (a, b) {
  if (a.length !== b.length) return

  let i = a.length
  while (i--) {
    if ((a[i] !== b[i]) && (b[i][0] !== ':')) {
      return false
    }
  }

  return true
}
