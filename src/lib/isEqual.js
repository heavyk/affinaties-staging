// knicked from: https://github.com/thlorenz/deep-is

// TODO: move these to lib/utils
const pSlice = Array.prototype.slice

const isArguments = (object) =>
  Object.prototype.toString.call(object) == '[object Arguments]'

const isNumberNaN = (value) =>
  // NaN === NaN -> false
  typeof value == 'number' && value !== value

const areZerosEqual = (zeroA, zeroB) =>
  // (1 / +0|0) -> Infinity, but (1 / -0) -> -Infinity and (Infinity !== -Infinity)
  (1 / zeroA) === (1 / zeroB)

const deepEqual = (actual, expected) =>
  // enforce Object.is +0 !== -0
  actual === 0 && expected === 0 ?
    areZerosEqual(actual, expected) :

  // 7.1. All identical values are equivalent, as determined by ===.
  actual === expected ?
    true :

  // date == date
  actual instanceof Date && expected instanceof Date ?
    actual.getTime() === expected.getTime() :

  // NaN == NaN
  isNumberNaN(actual) ?
    isNumberNaN(expected) :

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  typeof actual != 'object' && typeof expected != 'object' ?
    actual == expected :

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
    objEquiv(actual, expected)

function objEquiv (a, b) {
  // null or an identical 'prototype' property.
  if (a == null || b == null || a.prototype !== b.prototype) return false

  // ~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false
    }
    a = pSlice.call(a)
    b = pSlice.call(b)
    return deepEqual(a, b)
  }
  try {
    var ka = Object.keys(a),
      kb = Object.keys(b),
      key, i
  } catch (e) { // happens when one is a string literal and the other isn't
    return false
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false
  // the same set of keys (although not necessarily the same order),
  ka.sort()
  kb.sort()
  // ~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false
  }
  // equivalent values for every corresponding key, and
  // ~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i]
    if (!deepEqual(a[key], b[key])) return false
  }
  return true
}

export default deepEqual
