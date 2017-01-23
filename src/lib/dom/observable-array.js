import EE from '../drip/emitter'
import eq from '../lodash/isEqual'

export class ObservableArray extends Array {
  constructor (...v) {
    // apply(null, arguments)
    super(...v)
    // console.log('ObservableArray', v)
    // debugger
    EE(this)
    this.observable = 'array'
  }

  pop () {
    if (!this.length) return
    element = super.pop()
    this.emit('change', {
      type: 'pop',
      value: element
    })
    return element
  }

  push (...items) {
    if (!items.length) return this.length
    var result = super.push(...items)
    this.emit('change', {
      type: 'push',
      values: arguments
    })
    return result
  }

  reverse () {
    if (this.length <= 1) return this
    var tmp = Array.from(this)
    super.reverse()
    if (!isCopy.call(this, tmp)) this.emit('change', { type: 'reverse' })
    return this
  }

  shift () {
    if (!this.length) return
    var element = super.shift()
    this.emit('change', { type: 'shift', value: element })
    return element
  }

  sort (compare) {
    if (this.length <= 1) return this
    var tmp = Array.from(this)
    super.sort(compare)
    if (!isCopy.call(this, tmp)) {
      this.emit('change', {
        type: 'sort',
        compare: compare,
        orig: tmp,
      })
    }
    return this
  }

  // empty () {
  //   var len = this.length
  //   if (!len) return
  //   this.emit('change', { type: 'empty' })
  //   return this.splice(0, len)
  // }

  empty () {
    this.length = 0
    this.emit('change', { type: 'empty' })
    return this
  }

  // splice (start, deleteCount /*, …items*/) {
  splice (start, deleteCount, ...items) {
    var result, l = arguments.length
    if (!l || (l <= 2 && (+start >= this.length || +deleteCount <= 0))) return []
    result = super.splice(start, deleteCount, ...items)
    if ((!items && result.length) || !isCopy.call(items, result)) {
      this.emit('change', { type: 'splice', arguments: arguments, removed: result })
    }
    return result
  }

  unshift (item /*, …items*/) {
    var result
    if (!arguments.length) return this.length
    result = unshift.apply(this, arguments)
    this.emit('change', { type: 'unshift', values: arguments })
    return result
  }

  set (index, value) {
    var had, old, event
    index = index >>> 0
    if (this.hasOwnProperty(index)) {
      had = true
      old = this[index]
      if (eq(old, value)) return
    }
    this[index] = value
    event = { type: 'set', index: index }
    if (had) event.oldValue = old
    this.emit('change', event)
  }
}

export function isCopy (other) {
  var i, l = this.length
  // if (this == null || other == null) throw new TypeError("cannot use null values")
  if (l !== other.length) return false
  for (i = 0; i < l; ++i) {
    if (hasOwnProperty.call(this, i) !== hasOwnProperty.call(other, i) || !eq(this[i], other[i])) return false
  }
  return true
}

function d (fn) {
  return {
    configurable: true, enumerable: false, writable: true,
    value: fn
  }
}

export function ObservArray (_v) {
  var arr = _v && typeof _v.on === 'function' ? _v : new EE(_v || [])
  var proto = Object.getPrototypeOf(arr)

  var pop = proto.pop
  var push = proto.push
  var reverse = proto.reverse
  var shift = proto.shift
  var sort = proto.sort
  var splice = proto.splice
  var slice = proto.slice
  var unshift = proto.unshift

  Object.defineProperties(arr, {
    observable: d('array'),
    pop: d(function () {
      var element
      if (!this.length) return
      element = pop.call(this)
      this.emit('change', {
        type: 'pop',
        value: element
      })
      return element
    }),
    push: d(function (item /*, …items*/) {
      var result
      if (!arguments.length) return this.length
      result = push.apply(this, arguments)
      this.emit('change', {
        type: 'push',
        values: arguments
      })
      return result
    }),
    reverse: d(function () {
      var tmp
      if (this.length <= 1) return this
      tmp = Array.from(this)
      reverse.call(this)
      if (!isCopy.call(this, tmp)) this.emit('change', { type: 'reverse' })
      return this
    }),
    shift: d(function () {
      var element
      if (!this.length) return
      element = shift.call(this)
      this.emit('change', { type: 'shift', value: element })
      return element
    }),
    sort: d(function (compare) {
      var tmp
      if (this.length <= 1) return this
      tmp = Array.from(this)
      sort.call(this, compare)
      if (!isCopy.call(this, tmp)) {
        this.emit('change', {
          type: 'sort',
          compare: compare,
          orig: tmp,
        })
      }
      return this
    }),
    // empty: d(function () {
    //   var len = this.length
    //   if (!len) return
    //   return this.splice(0, len)
    // }),
    empty: d(function () {
      arr.length = 0
			this.emit('change', { type: 'empty' })
      return this
    }),
    splice: d(function (start, deleteCount /*, …items*/) {
      var result, l = arguments.length, items
      if (!l) return []
      if (l <= 2) {
        if (+start >= this.length) return []
        if (+deleteCount <= 0) return []
      } else {
        items = slice.call(arguments, 2)
      }
      result = splice.apply(this, arguments)
      if ((!items && result.length) || !isCopy.call(items, result)) {
        this.emit('change', { type: 'splice', arguments: arguments, removed: result })
      }
      return result
    }),
    unshift: d(function (item /*, …items*/) {
      var result
      if (!arguments.length) return this.length
      result = unshift.apply(this, arguments)
      this.emit('change', { type: 'unshift', values: arguments })
      return result
    }),
    set: d(function (index, value) {
      var had, old, event
      index = index >>> 0
      if (this.hasOwnProperty(index)) {
        had = true
        old = this[index]
        if (eq(old, value)) return
      }
      this[index] = value
      event = { type: 'set', index: index }
      if (had) event.oldValue = old
      this.emit('change', event)
    })
  })

  return arr
}

export default ObservArray
