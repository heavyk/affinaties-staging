import EE from '../drip/emitter'
import eq from '../lodash/isEqual'

export class ObservableArray extends Array {
  constructor (...v) {
    super(...v)
    // fix this by pre mixing in the EE proto, then calling EE.setupEmitter()
    EE(this)
    this.observable = 'array'
  }

  pop () {
    if (!this.length) return
    this.emit('change', { type: 'pop' })
    element = super.pop()
    return element
  }

  push (...items) {
    if (!items.length) return this.length
    this.emit('change', { type: 'push', values: items })
    var result = super.push(...items)
    return result
  }

  reverse () {
    if (this.length <= 1) return this
    for(var i = 0, l = +(this.length / 2); i < l; i++) {
      this.emit('change', {type: 'swap', from: i, to: this.length - i - 1 })
    }
    super.reverse()
    return this
  }

  shift () {
    if (!this.length) return
    this.emit('change', { type: 'shift', value: element })
    var element = super.shift()
    return element
  }

  sort (compare) {
    if (this.length <= 1) return this
    var tmp = Array.from(this)
    super.sort(compare)
    if (!isCopy.call(this, tmp)) {
      this.emit('change', { type: 'sort', compare: compare, orig: tmp })
    }
    return this
  }

  quiksort (compare) {
    // DJ quiksort :D
    // ripped from http://stackoverflow.com/questions/5185864/javascript-quicksort
    // slight speed tradeoff. another way: copy the array, use native sort, and compare the results to re-order the elements
    var _quikSort = (t, s, e, sp, ep) => {
      if (s >= e) return
      while (sp < ep && compare(t[sp], t[e]) < 0) sp++
      if (sp === e) _quikSort(t, s, e - 1, s, e - 1)
      else {
        while (compare(t[ep], t[e]) >= 0 && sp < ep) ep--
        var temp
        if (sp === ep) {
          this.emit('change', {type: 'swap', from: sp, to: e })
          temp = t[sp]
          t[sp] = t[e]
          t[e] = temp
          if (s !== sp) _quikSort(t, s, sp - 1, s, sp - 1)
          _quikSort(t, sp + 1, e, sp + 1, e)
        } else {
          this.emit('change', {type: 'swap', from: sp, to: ep })
          temp = t[sp]
          t[sp] = t[ep]
          t[ep] = temp
          _quikSort(t, s, e, sp + 1, ep)
        }
      }
    }

    _quikSort(this, 0, this.length-1, 0, this.length-1)
    return this
  }

  empty () {
    this.emit('change', { type: 'empty' })
    this.length = 0
    return this
  }

  replace (idx, val) {
    this.emit('change', { type: 'replace', val, idx, old: this[idx] })
    super.splice(idx, 1, val)
    return this
  }

  move (from_idx, to_idx) {
    this.emit('change', { type: 'move', from: from_idx, to: to_idx })
    var el = super.splice(from_idx, 1)
    super.splice(to_idx, 0, el[0])
    return this
  }

  insert (idx, val) {
    this.emit('change', { type: 'insert', val, idx })
    super.splice(idx, 0, val)
    return this
  }

  remove (idx) {
    this.emit('change', { type: 'remove', idx })
    super.splice(idx, 1)
    return this
  }

  splice (idx, remove, ...add) {
    var l = arguments.length
    if (!l || (l <= 2 && (+idx >= this.length || +remove <= 0))) return []
    this.emit('change', { type: 'splice', idx, remove, add })
    return super.splice(idx, remove, ...add)
  }

  unshift (...items) {
    if (!items.length) return this.length
    this.emit('change', { type: 'unshift', values: items })
    return unshift.apply(this, items)
  }

  set (idx, value) {
    idx = idx >>> 0
    if (eq(this[idx], value)) return
    this.emit('change', { type: 'set', idx, value })
    this[idx] = value
    return this
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
