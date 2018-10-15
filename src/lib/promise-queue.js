// knicked from https://github.com/chenzhihao/easy-promise-queue

export default class PromiseQueue {
  constructor (concurrency = 1) {
    this._queue = []
    this._pause = false

    if (concurrency < 1) {
      throw new TypeError('Expected `concurrency` to be an integer which is bigger than 0')
    }

    this._ongoingCount = 0
    this._concurrency = concurrency
    this._resolveEmpty = () => {}
  }

  _next () {
    if (this._pause) return

    this._ongoingCount--

    if (this._queue.length > 0) {
      this._queue.shift()()
    } else {
      this._resolveEmpty()
    }
  }

  pause () {
    this._pause = true
  }

  resume () {
    this._pause = false
    this._next()
  }

  add (fn) {
    if (Array.isArray(fn) && fn.every((f) => typeof f === 'function')) {
      return fn.length > 1
        ? this.add(fn.shift()).add(fn)
        : this.add(fn[0])
    } else if (typeof fn === 'function') {
      new Promise((resolve, reject) => {
        const run = () => {
          this._ongoingCount++
          fn().then(
            val => {
              resolve(val)
              this._next()
            },
            err => {
              reject(err)
              this._next()
            }
          )
        }

        if (this._ongoingCount < this._concurrency && !this._pause) {
          run()
        } else {
          this._queue.push(run)
        }
      })
      return this
    } else {
      throw new TypeError('Expected `arg` in add(arg) must be a function which return a Promise, or an array of function which return a Promise')
    }
  }

  // Promises which are not ready yet to run in the queue.
  get waitingCount () {
    return this._queue.length
  }

  // Promises which are running but not done.
  get ongoingCount () {
    return this._ongoingCount
  }
}
