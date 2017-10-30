import MixinEmitter from '../drip/MixinEmitter'
import { value, obv_obj, observable_property } from './observable'
import { new_context } from './hyper-hermes'
import eq from '../lodash/eq'
import invoke from '../lodash/invoke'
import set from '../lodash/set'

export class ObservableArray extends MixinEmitter(Array) {
  // this is so all derived objects are of type Array, instead of ObservableArray
  static get [Symbol.species]() { return Array }
  constructor (...v) {
    super(...v)
    this.observable = 'array'
    if (this._o_length) this._o_length(this.length)
    Object.defineProperty(this, 'obv_len', {
      configurable: true,
      get: () => this._o_length || (this._o_length = value(this.length))
    })
  }

  pop () {
    if (!this.length) return
    this.emit('change', { type: 'pop' })
    if (this._o_length) this._o_length(this.length - 1)
    return super.pop()
  }

  push (...items) {
    if (!items.length) return this.length
    this.emit('change', { type: 'push', values: items })
    if (this._o_length) this._o_length(this.length + items.length)
    return super.push(...items)
  }

  reverse () {
    if (this.length <= 1) return this
    this.emit('change', { type: 'reverse' })
    return super.reverse()
  }

  shift () {
    if (!this.length) return
    this.emit('change', { type: 'shift' })
    if (this._o_length) this._o_length(this.length - 1)
    return super.shift()
  }

  swap (from_idx, to_idx) {
    this.emit('change', {type: 'swap', from: from_idx, to: to_idx })
    var el = super.splice(from_idx, 1)
    super.splice(to_idx, 0, el[0])
  }

  sort (compare) {
    if (this.length <= 1) return this
    // the slowest sort method, however yields the least number of swaps
    // TODO: implement quiksort
    return this.selectionsort(compare)
  }

  selectionsort (compare) {
    var i = 0, j, k, a = this, l = a.length
    for (; i < l; i++) {
      // smallest index val
      k = i
      for (j = i+1; j < l; j++) {
        if (compare(a[j], a[k]) <= 0) k = j
      }

      if (k !== i) {
        this.emit('change', {type: 'swap', from: k, to: i })
        swap(a, i, k)
      }
    }

    return this
  }

  quiksort (comparefn) {
    throw new Error('not working at all... needs some swap function improvements')
    var InsertionSort = (a, from, to) => {
      for (var i = from + 1; i < to; i++) {
        var element = a[i]
        for (var j = i - 1; j >= from; j--) {
          var tmp = a[j]
          var order = comparefn(tmp, element)
          if (order > 0) {
            this.emit('change', {type: 'swap', from: j, to: j + 1 })
            a[j + 1] = tmp
          } else {
            break
          }
        }
        this.emit('change', {type: 'swap', from: i, to: j + 1 })
        a[j + 1] = element
      }
    }

    var QuickSort = (a, from, to) => {
      var third_index = 0
      while (true) {
        // Insertion sort is faster for short arrays.
        if (to - from <= 4) {
          InsertionSort(a, from, to)
          return
        }

        third_index = from + ((to - from) >> 1)

        // Find a pivot as the median of first, last and middle element.
        var v0 = a[from]
        var v1 = a[to - 1]
        var v2 = a[third_index]
        var c01 = comparefn(v0, v1)
        if (c01 > 0) {
          // v1 < v0, so swap them.
          this.emit('change', {type: 'swap', from: from, to: to - 1 })
          var tmp = v0
          v0 = v1
          v1 = tmp
        } // v0 <= v1.
        var c02 = comparefn(v0, v2)
        if (c02 >= 0) {
          // v2 <= v0 <= v1.
          this.emit('change', {type: 'swap', from: from, to: to - 1 })
          var tmp = v0
          v0 = v2
          v2 = v1
          v1 = tmp
        } else {
          // v0 <= v1 && v0 < v2
          var c12 = comparefn(v1, v2)
          if (c12 > 0) {
            // v0 <= v2 < v1
            var tmp = v1
            v1 = v2
            v2 = tmp
          }
        }
        // v0 <= v1 <= v2
        a[from] = v0
        a[to - 1] = v2
        var pivot = v1
        var low_end = from + 1 // Upper bound of elements lower than pivot.
        var high_start = to - 1 // Lower bound of elements greater than pivot.
        a[third_index] = a[low_end]
        a[low_end] = pivot

        // From low_end to i are elements equal to pivot.
        // From i to high_start are elements that haven't been compared yet.
        partition: for (var i = low_end + 1; i < high_start; i++) {
          var element = a[i]
          var order = comparefn(element, pivot)
          if (order < 0) {
            a[i] = a[low_end]
            a[low_end] = element
            low_end++
          } else if (order > 0) {
            do {
              high_start--
              if (high_start == i) break partition
              var top_elem = a[high_start]
              order = comparefn(top_elem, pivot)
            } while (order > 0)
            a[i] = a[high_start]
            a[high_start] = element
            if (order < 0) {
              element = a[i]
              a[i] = a[low_end]
              a[low_end] = element
              low_end++
            }
          }
        }
        if (to - high_start < low_end - from) {
          QuickSort(a, high_start, to)
          to = low_end
        } else {
          QuickSort(a, from, low_end)
          from = high_start
        }
      }
    }

    // start it off
    QuickSort(this, 0, this.length)
    return this
  }

  quiksort_old (compare) {
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

    _quikSort(this, 0, this.length - 1, 0, this.length - 1)
    return this
  }

  empty () {
    if (this.length > 0) {
      this.emit('change', { type: 'empty' })
      if (this._o_length) this._o_length(0)
      this.length = 0
    }
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
    if (this._o_length) this._o_length(this.length + 1)
    super.splice(idx, 0, val)
    return this
  }

  remove (idx) {
    if (typeof idx !== 'number') {
      var iidx = this.indexOf(idx)
      if (~iidx) idx = iidx
      else return this
    }
    this.emit('change', { type: 'remove', idx })
    if (this._o_length) this._o_length(this.length - 1)
    super.splice(idx, 1)
    return this
  }

  splice (idx, remove, ...add) {
    // TODO: fix this?? arguments?!?!?
    var l = arguments.length
    if (!l || (l <= 2 && (+idx >= this.length || +remove <= 0))) return []
    this.emit('change', { type: 'splice', idx, remove, add })
    if (this._o_length) this._o_length(this.length + add.length - remove)
    return super.splice(idx, remove, ...add)
  }

  unshift (...items) {
    if (!items.length) return this.length
    this.emit('change', { type: 'unshift', values: items })
    if (this._o_length) this._o_length(this.length + items.length)
    return super.unshift(...items)
  }

  set (idx, val) {
    idx = idx >>> 0
    // if (idx >= this.length) debugger // what should be done for sparse arrays?
    if (eq(this[idx], val)) return
    this.emit('change', { type: 'set', idx, val })
    this[idx] = val
    return this
  }

  setPath (idx, path, value) {
    var obj = this[idx]
    // in case it's an observable, no need to emit the event
    if (obj.observable === 'object') invoke(obj, path, value)
    else {
      set(obj, path, value)
      this.emit('change', { type: 'set', idx, val: obj })
    }
    return obj
  }
}

export function ObservableArrayApply (oarr, ...arr) {
  oarr.on('change', (e) => {
    var a, t
    switch (e.type) {
      case 'swap':
        for (a of arr) {
          t = a[e.to]
          a[e.to] = a[e.from]
          a[e.from] = t
        }
        break
      case 'move':
        for (a of arr) {
          t = a.splice(e.from, 1)
          a.splice(e.to, 0, t[0])
        }
        break
      case 'set':
        for (a of arr) a[e.idx] = e.val
        break
      case 'unshift':
        for (a of arr) a.unshift(...e.values)
        break
      case 'push':
        for (a of arr) a.push(...e.values)
        break
      case 'splice':
        for (a of arr) a.splice(e.idx, e.remove, ...e.add)
        break
      case 'remove':
        for (a of arr) a.splice(e.idx, 1)
        break
      case 'replace':
        for (a of arr) a.splice(e.idx, 1, e.val)
        break
      case 'insert':
        for (a of arr) a.splice(e.idx, 0, e.val)
        break
      case 'sort':
        for (a of arr) a.sort(e.compare)
        break
      case 'empty':
        for (a of arr) a.length = 0
        break
      // no args
      case 'pop':
      case 'reverse':
      case 'shift':
        for (a of arr) a[e.type]()
        break
    }
  })
}

function swap (o, to, from) {
  var t = o[to]
  o[to] = o[from]
  o[from] = t
}

export class RenderingArray extends ObservableArray {
  constructor (G, data, fn) {
    super()
    this.fn = typeof data === 'function' ? (fn = data) : fn
    var fl = this.fl = fn.length
    this.G = G
    this.d = data instanceof ObservableArray ? data : (data = new ObservableArray)
    // this should have cleanupFuncs in the context (which adds h/s cleanup to the list when it makes the context)
    G.h.cleanupFuncs.push(() => { this.cleanup() })

    // where we store the id/data which gets passed to the rendering function
    if (fl >= 1) this._d = []
    if (fl >= 2) this._ctx = []
    if (fl >= 3) this._idx = []

    // lastly, if data has length, then render and add each of them
    this.data(data)
  }

  data (data) {
    const onchange = this._onchange = (e) => {
      var v, t, i, j, len = this.length, fl = this.fl, type = e.type, a = this
      switch (type) {
        // TODO: in places where no swapping is done, just update this._d
        case 'swap':
          i = e.from
          j = e.to
          if (fl >= 1) swap(this._d, j, i)
          if (fl >= 2) swap(this._ctx, j, i)
          if (fl >= 3) {
            this._idx[i](j)
            this._idx[j](i)
            swap(this._idx, j, i)
          }
          swap(this, j, i)
          break
        case 'move':
          i = e.from
          j = e.to
          if (fl >= 1) v = this._d.splice(i, 1), this._d.splice(j, 0, v[0])
          if (fl >= 2) v = this._ctx.splice(i, 1), this._ctx.splice(j, 0, v[0])
          if (fl >= 3) {
            v = this._idx.splice(i, 1), this._idx.splice(j, 0, v[0])
            this._idx[i](j)
            this._idx[j](i)
          }
          v = super.splice(i, 1), super.splice(j, 0, v[0])
          break
        case 'set':
          i = e.idx, v = e.val
          super[i] = v
          if (fl >= 1) this._d[i].set(v)
          break
        case 'unshift':
          i = 0
          // make space in storage arrays by splicing in undefined values (to be filled in by fn_call)
          v = new Array(e.values.length)
          if (fl >= 1) this._d.splice(0, 0, ...v)
          if (fl >= 2) this._ctx.splice(0, 0, ...v)
          if (fl >= 3) this._idx.splice(0, 0, ...v)
          for (v of e.values) super.unshift(this.fn_call(v, i++))
          if (fl >= 3) for (; i < len; i++) this._idx[i](i)
          break
        case 'push':
          i = len + e.values.length
          t = []
          // make space in storage arrays
          if (fl >= 1) this._d.length = i
          if (fl >= 2) this._ctx.length = i
          if (fl >= 3) this._idx.length = i
          for (v of e.values) t.push(this.fn_call(v, len++))
          super.push(...t)
          break
        case 'splice':
          i = e.idx
          j = e.remove
          // make space in storage arrays by splicing in undefined values (to be filled in by fn_call)
          v = new Array(e.add.length)
          if (fl >= 1) this._d.splice(i, j, ...v)
          if (fl >= 2) t = this._ctx.splice(i, j, ...v)
          if (fl >= 3) this._idx.splice(i, j, ...v)
          // TODO: not sure if this is right, actually... perhaps I need to make the elements identifiable (so that the arrayFragment listener gets it right)
          for (v of t) v.cleanup()
          t = [] // temp array to save rendered elements
          len = i - j // reduce index by number of removes
          for (v of e.add) t.push(this.fn_call(v, len++))
          super.splice(i, j, ...t)
          if (fl >= 3) for (; i < len; i++) this._idx[i](i)
          break
        case 'remove':
          i = e.idx
          if (fl >= 1) this._d.splice(i, 1)
          if (fl >= 2) this._ctx.splice(i, 1)[0].cleanup()
          if (fl >= 3) this._idx.splice(i, 1)
          super.splice(i, 1)[0]
          if (fl >= 3) for (len--; i < len; i++) this._idx[i](i)
          break
        case 'replace':
        case 'insert':
          i = e.idx
          j = type === 'replace' ? 1 : 0
          if (fl >= 1) this._d.splice(i, j, null)
          if (fl >= 2) v = this._ctx.splice(i, j, null)
          if (fl >= 3) this._idx.splice(i, j, null)
          super.splice(i, j, this.fn_call(e.val, i))
          if (j > 0 && v[0]) v[0].cleanup()                        // replace: clean up old ctx
          else if (fl >= 3) for (; i <= len; i++) this._idx[i](i)   // insert: update the indexes
          break
        case 'sort':
          t = []
          let listen = (e) => { t.push(e) }
          this.d.on('change', listen)
          this.d.selectionsort(e.compare)
          this.d.off('change', listen)
          for (v of t) super.emit('change', v)
          break
        case 'empty':
          super.empty()
          if (fl >= 1) this._d.length = 0
          if (fl >= 2) { for (v of this._ctx) { v.cleanup() } this._ctx.length = 0 }
          if (fl >= 3) this._idx.length = 0
          break
        // no args
        case 'reverse':
          // reverse the indexes
          for (i = 0; i < len; i++) this._idx[i](len - i - 1)
          // set len to 0 so we don't cleanup() or shift the idx
          len = 0
          // nobreak
        case 'shift':
          if (len) for (i = 1; i < len; i++) this._idx[i](i - 1)
          // nobreak
        case 'pop':
          this._d[type]()
          if ((v = this._ctx[type]()) && len) v.cleanup()
          this._idx[type]()
          super[type]()
          break
      }
    }

    if (data instanceof ObservableArray) {
      var i = 0, len = data.length, _d = []
      // TODO: technically, I don't need to empty the array at all... just update the values of this._d for each one, then push on (or splice off) the difference

      // empty / cleanup the array
      if (this.length > 0) this.empty()

      if (len > 0) {
        for (; i < len; i++) _d.push(this.fn_call(data[i], i))
        super.push(..._d)
      }

      if (this._o_length) this._o_length(len)
      this.d.off('change', onchange)
      this.d = data
      Object.defineProperty(this, 'obv_len', { configurable: true, get: () => this.d.obv_len })
      data.on('change', onchange)
    }

    return this.d
  }

  fn_call (d, idx) {
    var fl = this.fl, fn = this.fn, ret
    if (fl === 0) return fn()
    else {
      var _d = this._d[idx] || (this._d[idx] = typeof d === 'object' ? obv_obj(d) : value(d))
      if (fl === 1) return fn(_d)
      else {
        var _ctx = this._ctx[idx] || (this._ctx[idx] = new_context(this.G))
        if (fl === 2) return fn(_d, _ctx)
        else { //if (fl === 3) {
          // TODO: check to see if this observable needs to be cleaned up (I don't think so, anyway, but maybe I'm wrong)
          var _idx = this._idx[idx] || (this._idx[idx] = value(idx))
          return fn(_d, _idx, _ctx)
        }
      }
    }
  }

  cleanup () {
    // clean up contexts (and remove any arrayFragment elements too)
    this._onchange({type: 'empty'})
    // stop listening to data changes (in case the data element is used in more than one place)
    this.d.off('change', this._onchange)
  }
}

let proto = RenderingArray.prototype
for (let p of ['swap','move','set','unshift','push','splice','remove','replace','insert','sort','empty','pop','reverse','shift', 'setPath'])
  proto[p] = function () { return this.d[p].apply(this.d, arguments) }

// ==========================================
// older, stinkier cacas (delete me)
// ==========================================

export function isCopy (other) {
  var i, l = this.length
  // if (this == null || other == null) throw new TypeError("cannot use null values")
  if (l !== other.length) return false
  for (i = 0; i < l; ++i) {
    if (hasOwnProperty.call(this, i) !== hasOwnProperty.call(other, i) || !eq(this[i], other[i])) return false
  }
  return true
}
