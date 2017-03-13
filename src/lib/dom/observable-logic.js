import { value, transform } from '../dom/observable'

export const _not = (v) => !v
export function not (observable) {
  return transform(observable, _not)
}

// TODO: timeout returns an error
// TODO: strict option selection, else error

// observable prompter([msg, options,] responder_fn)
// responder_fn = (msg, options, response) - call response with the response (which will then be passed on to all listening)
// arg[0] = function: this function gets called with the response (returns: a fn to call to stop listening)
// arg[0] = undefined: returns: the last response
// arg[0,1] = message and options to ask the responder function
//
// example:
// let prompt = prompter((msg, options, response) => {
//   console.log(msg, '\n -', options.join('\n - '))
//   let answer = options[Math.floor(Math.random() * options.length)]
//   console.log(`answering: '${answer}' in 1s`)
//   setTimeout(() => { response(answer) }, 1000)
// })
// prompt((res, msg, options) => {
//   console.log(msg)
//   console.log('you selected:', res)
// })
// setTimeout(() => {
//   console.log('previous answer:', prompt())
//   prompt('favourite colour?', ['red', 'green', 'blue'])
// }, 0)
// setTimeout(() => {
//   console.log('previous answer:', prompt())
//   prompt('yo dawg, do you like prompters?', ['yes', 'no'])
// }, 2000)


export function prompter (msg, options, responder_fn) {
  var _val, __msg = msg, __options = options, listeners = []
  if (typeof msg === 'function') responder_fn = msg, __msg = null
  prompter.observable = 'prompt'
  return prompter

  function response (val) { all3(listeners, _val = val, __msg, __options) }
  function prompter (_msg, _options) {
    return (
      _msg === undefined ? _val                                                                  // get last response
    : typeof _msg !== 'function' ? responder_fn(__msg = _msg, __options = _options, response)    // send the responder_fn: the message, the options, and a chance to respond to it
    : (listeners.push(_msg),                                                                     // another listener
        (__msg && _options !== false ? all3(listeners, __msg, __options, response) : ''),        // call it with the previous response if one is given (if second arg isn't false)
        function () { remove(listeners, _msg) }                                                  // return an unlisten function
      )
    )
  }
}

//
// let respond = responder((result, msg, options) => {
//   console.log(msg)
//   console.log('you selected:', result)
// })
// respond((msg, options, response) => {
//   console.log(msg, '\n -', options.join('\n - '))
//   let answer = options[Math.floor(Math.random() * options.length)]
//   console.log(`answering: '${answer}' in 1s`)
//   setTimeout(() => { response(answer) }, 1000)
// })
// setTimeout(() => {
//   console.log('previous answer:', respond())
//   respond('favourite colour?', ['red', 'green', 'blue'])
// }, 0)
// setTimeout(() => {
//   console.log('previous answer:', respond())
//   respond('yo dawg, do you like prompters?', ['yes', 'no'])
// }, 2000)

// TODO: since multiple responses can be given, get all responses (one for each listener) before calling the result_fn (error on timeout)
//       - requires changing all3 to include the idx

export function responder (msg, options, result_fn) {
  var _res, __msg = msg, __options = options, listeners = []
  if (typeof msg === 'function') result_fn = msg, __msg = null
  responder.observable = 'respond'
  return responder

  function response (res) { result_fn(_res = res, __msg, __options) }
  function responder (_msg, _options) {
    return (
      _msg === undefined ? _res                                                                // getter
    : typeof _msg !== 'function' ? all3(listeners, __msg = _msg, __options = _options, response)  // all respond listeners get the response and the question
    : (listeners.push(_msg), (__msg ? all3(listeners, __msg, __options, response) : ''), function () {          // another listener (call it with the previous response if one is given)
        remove(listeners, _msg)
      })
    )
  }
}


function all3 (ary, v1, v2, v3) {
  for (var i = 0; i < ary.length; i++) ary[i](v1, v2, v3)
}

// TODO: combo_prompter (msg, timeout, options, callback) - where options is an array and one of the options has to be selected
