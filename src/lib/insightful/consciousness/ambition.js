'use strict'
// var inherits = require('util').inherits
// var Conductor = require('../conductor')
// var daFunk = require('da-funk')
var slice = [].slice

// import EventEmitter from '../../drip/emitter'
import EventEmitter from '../../drip/enhanced'

import assign from '../../lodash/assign'

class Ambition extends EventEmitter {
  constructor (topic, options) {
    super({delimeter: '/'})
    var self = this
    var type, args1


    // if (typeof options === 'object') { daFunk.extend(this, options) }
    if (typeof options === 'object') { assign(this, options) }
    if (self.insightQue === void 9) { self.insightQue = [] }
    // if (self.namespace === void 9) { self.namespace = name }
    if (self.states === void 9) { self.states = {} }
    if (self.startingState === void 9) { self.startingState = 'unsituated' }
    if (typeof self.eventListeners === 'object') {
      for (var i in self.eventListeners) {
        self.on(i, self.eventListeners[i])
      }
    }

    // self.dialog = archaicDialoger.get(topic)
    // self._debug = function () {
    //   return self.dialog._debug.bind(self.dialog)
    // }
    self.debug = require('debug')('ambition:' + (topic || (topic = Math.random().toString(32).substr(2))))
    self._debug = require('debug')('ambition:fsm:' + (topic || Math.random().toString(32).substr(2)))

    var init = function () {
      self.emit('created')
      if (!self.state && self.startingState !== false) {
        self._debug('starting-state: ' + self.startingState)
        self.now(self.startingState, topic, options)
      } else {
        self._debug('waiting to transition to %s', self.startingState)
      }
    }

    if ((type = typeof this.pregage) !== 'undefined') {
      args1 = slice.call(arguments, 1)
      if (type === 'function') {
        self._resolve(self.pregage.apply(self, args1), init)
      } else self._resolve(type, init)
    } else init.apply(this, arguments)
  }

  // emerge should contain a history item
  // it should be build to support forkdb type emergence
  // actually, this should be perhaps, "emanate"
  emerge (cb) {
    throw new Error('not implemented yet')
  }
  // emerge should be (state, cb) ->
  // it should wait for a state before emerging
  // this should give our progams a new sense of progress and improvement
  // emergence, if you will :)
  emerge (cb) {
    this._debug('emerge... %s', this._emerged)
    if (typeof cb === 'function') {
      if (this._emerged) {
        cb.call(this)
      } else {
        this.insightQue.push({
          type: 'emerge',
          notState: this.startingState,
          cb: cb
        })
      }
    }
    return this._emerged
  }

  // emit (event) {
  //   if (event === '55d0c2bb351ec3730040fe93.55aeb6cfca6f735e002aac24') debugger
  //   return super.emit.apply(this, arguments)
  // }

  // on (event) {
  //   if (event === '55d0c2bb351ec3730040fe93.55aeb6cfca6f735e002aac24') debugger
  //   return super.on.apply(this, arguments)
  // }

  reset () {
    this.state = void 9
    if (typeof this.pregage === 'function') {
      this.pregage.call(this)
    }
    if (this.startingState) {
      return this.soon(this.startingState)
    }
  }

  error (err) {
    var states, recovery
    states = this.states
    if (typeof (recovery = states[this.state].recovery) === 'function') {
      return recovery.call(this, err)
    }
    return this.emit('error', err)
  }

  respond (cmd) {
    var state, states, response, do_response, fn, p, obj
    var self = this
    var args = slice.call(arguments, 0)
    var responded = 0
    this._debug('response: ' + cmd + ' in ' + this.state)
    if (!this.exitStageLeft && (state = this.state)) {
      states = this.states
      response = cmd
      do_response = function (fn, response, path) {
        var args1, emitObj, ret
        args1 = args.slice(1)
        emitObj = {
          cmd: cmd,
          response: response,
          path: path,
          args: args1
        }
        self.emit.call(self, 'responding', emitObj)
        ret = fn.apply(self, response === '*' ? args : args1)
        self._debug('response(%s) called:ret (%s)', response, typeof ret === 'object'
          ? 'object'
          : typeof ret === 'string' && ret.length > 100 ? ret.substr(0, 97) + ' ...' : ret)
        emitObj.ret = ret
        self.emit.call(self, 'responded', emitObj)
        self.emit.call(self, 'responded:' + response, emitObj)
        if (self.insightQue.length) {
          self.followThrough('next-response')
        }
        responded++
      }
      if (typeof (fn = states[state][response]) === 'string') {
        response = fn
      }
      if (typeof (fn = states[state]['*']) === 'function') {
        do_response(fn, '*', '/states/' + state + '/' + response)
      }
      this._debug('response ' + response)
      if ((p = this.cmds) && typeof (fn = p[response]) === 'function') {
        do_response(fn, response, '/cmds/' + response)
      }
      if (typeof (fn = states[state][response]) === 'function') {
        do_response(fn, response, '/states/' + state + '/' + response)
      }
    }
    if (responded === 0) {
      this._debug("response: '" + cmd + "' next now (in state:" + this.state)
      obj = {
        type: 'next-now',
        cmd: cmd,
        args: args
      }
      return this.insightQue.push(obj)
    }
  }

  respondSoon () {
    var a = arguments
    var self = this
    process.nextTick(function () {
      return self.response.apply(self, a)
    })
  }

  soon () {
    var a = arguments
    var self = this
    // process.nextTick(function () {
    //   return self.now.apply(self, a)
    // })
    setTimeout(function () {
      self.now.apply(self, a)
    }, 100)
  }

  _resolve (it, cb) {
    var self = this
    var a = slice.call(arguments)
    var b
    var next = function () {
      if (arguments.length && typeof (b = arguments[0]) === 'object') {
        for(var k in b) {
          a[0][k] = b[k]
        }
      }
      process.nextTick(function () {
        cb.apply(self, a)
      })
    }
    ;(typeof it === 'object' ?
      (it instanceof Promise ?
        it : Array.isArray(it) ?
          Promise.settle(it) : Promise.props(it)).then(next)
      : typeof it === 'function' ? Promise.try(it).then(next) : next())
  }

  nowPrepared (lastState, nextState, prepared, args) {
    var self = this
    self._debug('post-now %s -> %s', lastState, nextState)
    self.emit.apply(self, ['state:' + nextState].concat(prepared).concat(args))
    self.emit.call(self, 'now', {
      from: lastState,
      to: nextState,
      prepared: prepared,
      args: args
    })
    if (self.insightQue.length) {
      self.followThrough.call(self, 'next-now')
      self.followThrough.call(self, 'deferred')
    }
    if (!self._emerged && nextState[0] === '/') {
      self._debug('initialzed! in %s', nextState)
      self.followThrough.call(self, 'emerge')
      self._emerged = nextState
    }
    self.inTransition = null
  }

  now (nextState) {
    var self = this
    var lastState, args1
    if (typeof nextState !== 'string') {
      nextState = nextState + ''
    }
    // disactivated because I don't remember how to transition out of a transition state
    // if (self.state && self.state[0] !== '/' && self.state !== self.startingState) {
    //   self._debug('WARNING ' + self.namespace + ' is trying to now while already in a now state: ' + self.state + ' -> ' + nextState)
    //   debugger
    //   return self.soon.apply(self, arguments)
    // }
    if (self.inTransition) {
      return self.soon.apply(self, arguments)
    }
    self._debug('[%s]{now}  -> %s', self.state, nextState)
    if (!self.exitStageLeft && nextState !== self.state) {
      args1 = slice.call(arguments, 1)
      if (self.states[nextState]) {
        self.inTransition = nextState
        self.priorState = self.state
        self.state = nextState
        if ((lastState = self.priorState)) {
          if (self.states[lastState] && self.states[lastState]['<']) {
            self.exitStageLeft = true
            self.states[lastState]['<'].apply(self, args1)
            self.exitStageLeft = false
          }
        }
        // I want to add a periodic table of symbols, to allow for structure to state entrance
        // eg. '>' is when entering. '>>' would run before the former
        // many possibilites to be explored ... etc.
        if (self.states[nextState]['>']) {
          // process.nextTick(function () {
            self._debug('[%s]{>}{:_resolve} %o', nextState, args1)
            self._resolve(self.states[nextState]['>'].apply(self, args1), function (prepared) {
              self._debug('[%s]{>}{_resolve:}', nextState)
              self.nowPrepared.call(self, lastState, nextState, prepared, args1)
            })
          // })
        } else {
          self.nowPrepared.call(self, lastState, nextState, prepared, args1)
        }
        if (self.insightQue.length && self.state[0] === '/') {
          self.followThrough.call(self, 'next-now')
          self.followThrough.call(self, 'deferred')
        }
      } else {
        self._debug('attempted to now to an invalid state: %s', nextState)
        self.emit.call(self, 'missing-state', {
          from: self.state,
          to: nextState,
          args: args1
        })
      }
    }
  }

  followThrough (type) {
    var self = this
    if (type === 'deferred' && (!this.state || (typeof this.state === 'string' && this.state[0] !== '/'))) {
      return
    }
    var filterFn = type === 'next-now'
      ? function (item) {
        return item.type === 'next-now'
      }
    : type === 'emerge'
      ? function (item, i) {
        return item.type === 'emerge' && (!self._emerged && item.notState !== self.state && self.state && self.state[0] === '/')
      }
    : type === 'deferred'
      ? function (item, i) {
        return item.type === 'deferred' && ((item.untilState && item.untilState === self.state) || (item.notState && item.notState !== self.state))
      }
    : function (item) {
      return item.type === 'next-response'
    }
    var toProcess = this.insightQue.filter(filterFn)
    if (toProcess.length) {
      this._debug('process-q:' + type + '(' + toProcess.length + ')')
    }

    toProcess.forEach(function (item) {
      var fn, i
      if (filterFn(item, i)) {
        fn = item.type === 'deferred' || item.type === 'emerge'
          ? item.cb
          : self.response
        fn.apply(self, item.args)
        i = self.insightQue.indexOf(item)
        self.insightQue.splice(i, 1)
      }
    })
  }

  clearQue (type, name) {
    if (!type) {
      this.insightQue = []
    } else {
      var filter
      if (type === 'next-now') {
        filter = function (evnt) {
          return evnt.type === 'next-now' && (name ? evnt.untilState === name : true)
        }
      } else if (type === 'next-response') {
        filter = function (evnt) {
          return evnt.type === 'next-response'
        }
      }
      this.insightQue = this.insightQue.filter(filter)
    }
  }

  until (stateName, cb) {
    var args, queued
    args = slice.call(arguments, 2)
    if (this.state === stateName) {
      return cb.apply(this, args)
    } else {
      queued = {
        type: 'deferred',
        untilState: stateName,
        cb: cb,
        args: args
      }
      return this.insightQue.push(queued)
    }
  }

  emitSoon () {
    var a
    var self = this
    a = arguments
    return process.nextTick(function () {
      return self.emit.apply(self, a)
    })
  }

}



// Ambition.prototype.emit =
// function Ambition$emit(insightName){
//   var args, doEmit
//   var self = this
//   if (this.muteEvents) {
//     return
//   }
//   args = arguments
//   this._debug("emit", insightName)
//   doEmit = function(){
//     var listeners, args1
//     if (self._debug.online) {
//       switch (insightName) {
//       case 'responding':
//         self._debug("responding: (%s:%s)", self.state, args[1].response)
//         break
//       case 'responded':
//         self._debug("responded: (%s:%s)", self.state, args[1].response)
//         break
//       case 'missing-state':
//         self._debug.error("bad now: (%s !-> %s)", args[1].state, args[1].attempted)
//         break
//       case 'now':
//         self._debug("now: (%s -> %s)", args[1].from, args[1].to)
//         break
//       default:
//         self._debug("emit: (%s): num args %s", insightName, args.length - 1)
//       }
//     }
//     if (listeners = self.insightListeners['*']) {
//       if (typeof listeners === 'function') {
//         listeners.apply(self, args)
//       } else {
//         _.each(self.insightListeners['*'], function(callback){
//           return callback.apply(this, args)
//         }, self)
//       }
//     }
//     if (listeners = self.insightListeners[insightName]) {
//       args1 = slice.call(args, 1)
//       if (typeof listeners === 'function') {
//         return listeners.apply(self, args1)
//       } else {
//         return _.each(listeners, function(callback){
//           return callback.apply(self, args1)
//         })
//       }
//     }
//   }
//   doEmit.call(this)
//   return this
// }

// Ambition.prototype.on =
// function Ambition$on(insightName, real_cb, callback){
//   var listeners
//   var self = this
//   if (typeof callback !== 'function') {
//     callback = real_cb
//     real_cb = void 9
//   }
//   listeners = this.insightListeners[insightName]
//   if (this.insightListeners === this.__proto__.insightListeners) {
//     this.insightListeners = _.cloneDeep(this.insightListeners)
//   }
//   if (!listeners) {
//     this.insightListeners[insightName] = []
//   }
//   if (typeof listeners === 'function') {
//     this.insightListeners[insightName] = [listeners]
//   }
//   this.insightListeners[insightName].push(callback)
//   if (insightName.substr(0, 6) === "state:" && this.state === insightName.substr(6)) {
//     process.nextTick(function(){
//       return callback.call(self)
//     })
//   }
//   return {
//     insightName: insightName,
//     callback: callback,
//     cb: real_cb,
//     off: function(){
//       return this.off(insightName, callback)
//     }
//   }
// }

// Ambition.prototype.once =
// function Ambition$once(insightName, callback){
//   var evt
//   var self = this
//   if (insightName === 'emerged') {
//     console.log("TODO")
//   } else {
//     evt = this.on(insightName, callback, function(){
//       evt.cb.apply(self, arguments)
//       process.nextTick(function(){
//         return evt.off(insightName, callback)
//       })
//     })
//   }
//   return this
// }

// Ambition.prototype.off =
// function Ambition$off(insightName, callback){
//   var i
//   if (!insightName) {
//     return this.insightListeners = {}
//   } else {
//     if (this.insightListeners[insightName]) {
//       if (callback) {
//         if (~(i = this.insightListeners[insightName].indexOf(callback))) {
//           return this.insightListeners[insightName].splice(i, 1)
//         }
//       } else {
//         return this.insightListeners[insightName] = []
//       }
//     }
//   }
// }


export default Ambition
