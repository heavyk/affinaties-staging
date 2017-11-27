// knicked from from https://github.com/Rich-Harris/roadtrip
// based on v0.5.1
//  - allow for multiple router instantiation
//  - few changes to optimise for my setup
//  - if base is '/xxx', then: /xxx/my/route, /xxx/, and /xxx are all valid starting paths. previously, '/xxx/' (trailing slash) was invalid
//  - 404 route

import Route from './Route.js'
import { win, location, origin, basePath } from '../lib/dom/hyper-hermes'
import { noop, slasher, which } from '../lib/utils'
import isEqual from '../lib/isEqual'

const sameOrigin = (href) => typeof href === 'string' && href.indexOf(origin) === 0
const isSameRoute = (routeA, routeB, dataA, dataB) => routeA === routeB && (
    dataA.hash === dataB.hash &&
    isEqual(dataA.params, dataB.params) &&
    isEqual(dataA.query, dataB.query)
  )

export default class RoadTrip {
  constructor (base = '') {
    this.routes = []
    this.isTransitioning = null
    this.scrollHistory = {}
    this.currentData = {}
    this.currentRoute = {
      enter: () => Promise.resolve(),
      leave: () => Promise.resolve()
    }

    this.uniqueID =
    this.currentID = 1

    if (base[0] !== '/') throw new Error("base must begin with a '/'")
    var bl = base.length - 1
    this.base = base[bl] === '/' ? base.substr(0, bl) : base
  }

  add (path, options, ctx = this) {
    if (path == 404) this._404 = new Route(path, options, ctx)
    else this.routes.push(new Route(this.base + (path === '/' ? '' : path), options, ctx))
    return this
  }

  start (options = {}) {
    // TODO: maybe put a base detector here..
    // it would get basePath and then split it into segments.
    // first get the max segments length
    // next, for all routes which match
    // eg. if the current path is 4 segments long, and the longest route is 2 segments, then we can assume that for /xxx/xxx/yyy/yyy, /xxx/xxx is the base, and /yyy/yyy is the route (where /yyy/yyy matches one of the routes)

    const start_href = location.href
    const href = this.routes.some(route => route.matches(start_href)) ?
      start_href :
      options.fallback || this.base || '/'

    this.initial = true
    return this.goto(href, {
      replace: true,
      scrollX: win.scrollX,
      scrollY: win.scrollY
    })
  }

  goto (href, options = {}) {
    this.scrollHistory[this.currentID] = {
      x: win.scrollX,
      y: win.scrollY
    }

    if (href[0] === '/' && this.base && href.indexOf(this.base) !== 0) {
      href = this.base + href
    }

    let target
    const promise = new Promise((fulfil, reject) => {
      target = this._target = {
        href: slasher(href),
        scrollX: options.scrollX || 0,
        scrollY: options.scrollY || 0,
        options,
        fulfil,
        reject
      }
    })

    target.promise = promise

    // only if we're not transitioning, will we goto the target
    if (this.isTransitioning === null) this.goto_target(target)

    return promise
  }

  goto_target (target) {
    let currentData = this.currentData
    let currentRoute = this.currentRoute
    let newRoute
    let newData
    let promise

    if (target.options.code === 404) {
      if (newRoute = this._404) newData = newRoute.exec(target, this.initial, true)
      else console.error('404: route not found', target.href)
    } else {
      for (let route of this.routes) {
        if (newData = route.exec(target, this.initial)) {
          newRoute = route
          this.initial = false
          break
        }
      }

      // 404's don't replace state
      if (isSameRoute(newRoute, currentRoute, newData, currentData)) {
        target.options.replace = true
      }
    }

    if (!newRoute) {
      // this can only happen if a 404 is not defined
      return this.goto(this.base || '/')
    }

    this.scrollHistory[ this.currentID ] = {
      x: (currentData.scrollX = win.scrollX),
      y: (currentData.scrollY = win.scrollY)
    }

    this.isTransitioning = target

    promise =
      newRoute === currentRoute && typeof newRoute.update === 'function' ?
        newRoute.update(newData, currentData)
      : Promise.all([
        currentRoute.leave(currentData, newData),
        newRoute.beforeenter(newData, currentData)
      ]).then(() => {
        newRoute.enter(newData, currentData)
      })

    promise
      .then((val) => {
        this.currentRoute = newRoute
        this.currentData = newData
        this.isTransitioning = null

        // if the user navigated while the transition was taking
        // place, we need to do it all again
        if (this._target !== target) {
          this.goto_target(this._target)
          this._target.promise.then(target.fulfil, target.reject)
        } else {
          target.fulfil(val)
        }
      })
      .catch(target.reject)

    const { replace, invisible, code } = target.options

    if (target.popstate || invisible) return

    const uid = replace ? this.currentID : ++this.uniqueID
    win.history[ replace ? 'replaceState' : 'pushState' ]({ uid, code }, '', target.href)

    this.currentID = uid
    this.scrollHistory[ this.currentID ] = {
      x: target.scrollX,
      y: target.scrollY
    }

    return promise
  }

  // Adapted from https://github.com/visionmedia/page.js
  // MIT license https://github.com/visionmedia/page.js#license
  // further modification from https://github.com/Rich-Harris/roadtrip/blob/master/src/utils/watchLinks.js
  //  - added link detection in custom elements
  //  -
  watchLinks (container_el) {
    const click_handler = (event) => {
      let w = which(event)
      if (w !== 1 && w !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey) return
      if (event.defaultPrevented) return

      // ensure target is a link
      let el = event.composed ? event.composedPath()[0] : event.target
      while (el && el.nodeName !== 'A') {
        el = el.parentNode
      }

      if (!el || el.nodeName !== 'A') return

      // Ignore if tag has
      // 1. 'download' attribute
      // 2. rel='external' attribute
      if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return

      // ensure non-hash for the same path

      // Check for mailto: in the href
      if (~el.href.indexOf('mailto:')) return

      // check target
      if (el.target) return

      // x-origin
      if (!sameOrigin(el.href)) {
        console.warn('navigating outside of this origin. TODO: x-origin navigation function (which can do tracking or cancel the event)')
        return
      }

      // rebuild path
      let path = el.pathname + el.search + (el.hash || '')

      // strip leading '/[drive letter]:' on NW.js on Windows
      if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
        path = path.replace(/^\/[a-zA-Z]:\//, '/')
      }

      // same page
      var goto_path = path
      // when 404ing, it's also necessary to preventDefault to prevent navigation.
      const _goto = (path, options) => {
        // this is no longer possible starting with chrome 56
        // (all document level event listeners are considered passive by default)
        // https://www.chromestatus.com/feature/5093566007214080
        event.preventDefault()
        event.stopImmediatePropagation()
        return this.goto(path, options)
      }

      if (this.base) {
        if (path.indexOf(this.base) === 0) path = path.substr(this.base.length)
        if (goto_path === path) {
          path = this.base + path
          if (this.routes.some(route => route.matches(path))) goto_path = path
          else return _goto(path, {code: 404})
        }
      }

      // no match? allow navigation if this._404 isn't set
      if (!this.routes.some(route => route.matches(goto_path)) && !this._404) {
        return _goto(goto_path, {code: 404})
      }

      _goto(goto_path, {code: 200})
    }

    const popstate_handler = (event) => {
      const state = event.state
      if (!state) return // hashchange, or otherwise outside roadtrip's control
      const scroll = this.scrollHistory[ state.uid ]

      this._target = {
        href: location.href,
        scrollX: scroll.x || 0,
        scrollY: scroll.y || 0,
        popstate: true, // so we know not to manipulate the history
        options: state,
        fulfil: noop,
        reject: noop
      }

      this.goto_target(this._target)
      this.currentID = event.state.uid
    }

    // watch history & clicks
    // if chrome complains about document level listeners now being passive,
    // (and as a result, preventDefault no longer works so navigation takes place anyway...)
    // to fix this, pass `watchLinks` an element which frames your content

    if (!container_el) container_el = win
    container_el.addEventListener('click', click_handler, true)
    container_el.addEventListener('touchstart', click_handler, true)
    win.addEventListener('popstate', popstate_handler, {passive: true})

    // return a remove function
    return () => {
      container_el.removeEventListener('click', click_handler, true)
      container_el.removeEventListener('touchstart', click_handler, true)
      win.removeEventListener('popstate', popstate_handler, {passive: true})
    }
  }
}
