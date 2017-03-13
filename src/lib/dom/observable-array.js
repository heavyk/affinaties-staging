import { MixinEmitter } from '../drip/emitter'
import { value, observable_property } from './observable'
import eq from '../lodash/isEqual'

export class ObservableArray extends MixinEmitter(Array) {
  // this is so all derived objects are of type Array, instead of ObservableArray
  static get [Symbol.species]() { return Array }
  constructor (...v) {
    super(...v)
    this.observable = 'array'
    if (this._o_length) this._o_length(this.length)
    Object.defineProperty(this, 'obv_len', {
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
    if (this._o_length) this._o_length(0)
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
    if (this._o_length) this._o_length(this.length + add.length - remove.length)
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
    if (eq(this[idx], val)) return
    this.emit('change', { type: 'set', idx, val })
    this[idx] = val
    return this
  }
}

// not yet decided on this one, because every time something is added, the function is called.
// so, that means I'll need to create a context for each function call so I can clean up the observables when the item is removed
// that brings me to another point which I'm not sure about: it may be a lot more efficient to convert hyper-hermes to store its context in `this` instead of a closure
// the advantage of that might be easier access to the context for better management of them
// ----
// in other news, I also need an easy way of making new G objects (probably make it into a class)... horray for class abuse!
// import { value } from './observable'

function ObservableArrayApply (oarr, ...arr) {
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

function context (G) {
  var ctx = {}
  Object.defineProperties(ctx, {
    h: define_getter(() => ctx._h || (ctx._h = G.h.context())),
    s: define_getter(() => ctx._s || (ctx._s = G.s.context())),
    cleanup: define_value(() => {
      if (ctx._h) ctx._h.cleanup()
      if (ctx._s) ctx._s.cleanup()
    })
  })
  return ctx
}

function swap (o, to, from) {
  var t = o[to]
  o[to] = o[from]
  o[from] = t
}
// const ObservableArray_props = ['swap', 'move', 'set', 'unshift', 'push', 'splice', 'remove', 'replace', 'insert', 'sort', 'empty', 'pop', 'reverse', 'shift']

export class RenderingArray extends ObservableArray {
  constructor (G, data, fn) {
    super()
    this.fn = typeof data === 'function' ? (fn = data) : fn
    var fl = this.fl = fn.length
    this.G = G
    this.d = data instanceof ObservableArray ? data : (data = new ObservableArray)

    // replicate behaviour of ObservableArray
    for (let p of ['swap','move','set','unshift','push','splice','remove','replace','insert','sort','empty','pop','reverse','shift'])
      this[p] = function () { this.d[p].apply(this.d, arguments) }

    // where we store the id/data which gets passed to the rendering function
    if (fl >= 1) this._d = []
    if (fl >= 2) this._ctx = []
    if (fl >= 3) this._idx = []

    this.d.on('change', (e) => {
      var v, l, len = this.length, fl = this.fl, type = e.type, a = this
      switch (type) {
        case 'swap':
          swap(this, e.to, e.from)
          if (fl >= 1) swap(this._d, e.to, e.from)
          if (fl >= 2) swap(this._ctx, e.to, e.from)
          if (fl >= 3) swap(this._idx, e.to, e.from)
          break
        case 'move':
          (v = super.splice(e.from, 1)) && super.splice(e.to, 0, v[0])
          // if (fl >= 1) v = this._d.splice(e.from, 1), this._d.splice(e.to, 0, v[0])
          // if (fl >= 2) v = this._ctx.splice(e.from, 1), this._ctx.splice(e.to, 0, v[0])
          // if (fl >= 3) v = this._idx.splice(e.from, 1), this._idx.splice(e.to, 0, v[0])
          break
        case 'set':
          super[e.idx] = e.val
          break
        case 'unshift':
          // TODO
          debugger
          // for (a of arr) a.unshift(...e.values)
          break
        case 'push':
          for (v of e.values) {
            l = len++
            // make space in storage arrays
            if (fl >= 1) this._d.length = len
            if (fl >= 2) this._ctx.length = len
            if (fl >= 3) this._idx.length = len
            super.push(this.fn_call(v, l))
          }
          break
        case 'splice':
          // for (a of arr) a.splice(e.idx, e.remove, ...e.add)
          // TODO
          debugger
          break
        case 'remove':
          // for (a of arr) a.splice(e.idx, 1)
          // TODO
          debugger
          break
        case 'replace':
        case 'insert':
          l = type === 'replace' ? 1 : 0
          if (fl >= 1) this._d.splice(e.idx, l, null)
          if (fl >= 2) this._ctx.splice(e.idx, l, null)
          if (fl >= 3) this._idx.splice(e.idx, l, null)
          super.splice(e.idx, l, this.fn_call(e.val, e.idx))
          break
        case 'sort':
          // TODO: this totally will not work. I don't think the compare function will work the same for _d, _idx, _ctx
          // I need to do quiksort and map the swap events. I think this will be a super.on('change', [save events into an array]), super.quiksort(e.compare), then replay the events on each of the arrays
          // super.sort(e.compare)
          // if (fl >= 1) this._d.sort(e.compare)
          // if (fl >= 2) this._ctx.sort(e.compare)
          // if (fl >= 3) this._idx.sort(e.compare)
          debugger
          break
        case 'empty':
          // TODO: proper cleanup
          super.empty()
          if (fl >= 1) this._d.length = 0
          if (fl >= 2) for (v of this._ctx) v.cleanup(), this._ctx.length = 0
          if (fl >= 3) this._idx.length = 0
          break
        // no args
        case 'pop':
        case 'shift':
          // TODO: lower the length and clean up the context
        case 'reverse':
          this._d[type]()
          this._ctx[type]().cleanup()
          // console.log('popped ctx', v)
          this._idx[type]()
          super[type]()
          // console.log('popped val', v)
          // debugger
          break
      }
    })

    // lastly, if data has length, then render and add each of them
    for (var i = 0; i < data.length; i++) {
      super.push(this.fn_call(data[i], i))
    }
  }

  data (data) {
    if (data instanceof ObservableArray) {
      // empty / cleanup the array
      if (this.length) this.empty()

      for (var i = 0; i < data.length; i++) {
        super.push(this.fn_call(data[i], i))
      }

      this.d = data
    }
    return this.d
  }

  fn_call (d, idx) {
    var fl = this.fl, fn = this.fn, ret
    if (fl === 0) return fn()
    else {
      var _d = this._d[idx] || (this._d[idx] = value(d))
      if (fl === 1) return fn(_d)
      else {
        var _ctx = this._ctx[idx] || (this._ctx[idx] = context(this.G))
        if (fl === 2) return fn(_d, _ctx)
        else { //if (fl === 3) {
          // TODO: check to see if this observable needs to be cleaned up (I don't think so, anyway, but maybe I'm wrong)
          var _idx = this._idx[idx] || (this._idx[idx] = value(idx))
          return fn(_d, _idx, _ctx)
        }
      }
    }
  }

  // OBSOLETE (see constructor): replicate behaviour of ObservableArray
  // swap () { this.d.swap.apply(this.d, arguments) }
  // move () { this.d.move.apply(this.d, arguments) }
  // set () { this.d.set.apply(this.d, arguments) }
  // unshift () { this.d.unshift.apply(this.d, arguments) }
  // push () { this.d.push.apply(this.d, arguments) }
  // splice () { this.d.splice.apply(this.d, arguments) }
  // remove () { this.d.remove.apply(this.d, arguments) }
  // replace () { this.d.replace.apply(this.d, arguments) }
  // insert () { this.d.insert.apply(this.d, arguments) }
  // sort () { this.d.sort.apply(this.d, arguments) }
  // empty () { this.d.empty.apply(this.d, arguments) }
  // pop () { this.d.pop.apply(this.d, arguments) }
  // reverse () { this.d.reverse.apply(this.d, arguments) }
  // shift () { this.d.shift.apply(this.d, arguments) }

}

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

function define_value (fn) {
  return {
    //configurable: true, enumerable: false, writable: true,
    value: fn
  }
}

function define_getter (fn) {
  return {
    configurable: true, enumerable: false,
    get: fn
  }
}

export default ObservArray
