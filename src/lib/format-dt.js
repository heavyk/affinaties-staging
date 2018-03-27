import { forEach, sprintf } from '../lib/utils'

// @unfinished - locale configuration
// see moment and also: https://github.com/betsol/time-delta/blob/master/lib/time-delta.js

export const time_units = (() => {
  var divider = 1
  return [
    ['seconds', 1000],
    ['minutes',   60],
    ['hours',     60],
    ['days',      24],
    ['weeks',      7],
    ['months', 4.348], // 7 days/week * 4.348 weeks/month * 12 months/year = 365.232 (0.018 days off from julian year of 365.25)
    ['years',     12]
  ].map((unit) => {
    unit[1] = divider = divider * unit[1]
    return unit
  }).reverse()
})()

export function dt2unit (dt) {
  dt = Math.abs(dt)
  var u, v, i = 0
  for (; i < time_units.length; i++) {
    u = time_units[i]
    if ((v = Math.floor(dt / u[1])) > 0) return [u[0], v]
  }
}

export function dt2units (dt) {
  dt = Math.abs(dt)
  var results = []
  forEach(time_units, (unit) => {
    var divider = unit[1]
    var value = dt > 0 ? Math.floor(dt / divider) : 0
    var key = unit[0]
    dt -= value * divider
    results[key] = value
    if (value > 0) results.push([key, value])
  })
  results.ms = dt
  return results
}

export function format_dt (units) {
  if (typeof units === 'number') units = dt2units(units)
  var results = []
  forEach(time_units, ([k]) => {
    var v = units[k]
    if (v !== undefined) results.push([v, k])
  })
  return results
}

// make a simplified version of this:
// https://github.com/moment/moment/blob/master/src/lib/duration/humanize.js
var thresholds = {
  ss: 44,         // a few seconds to seconds
  s : 45,         // seconds to minute
  m : 45,         // minutes to hour
  h : 22,         // hours to day
  d : 26,         // days to month
  M : 11          // months to year
}

var locales = {
  en: {
    months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
    monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
    weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
    longDateFormat : {
      LT : 'h:mm A',
      LTS : 'h:mm:ss A',
      L : 'DD/MM/YYYY',
      LL : 'D MMMM YYYY',
      LLL : 'D MMMM YYYY h:mm A',
      LLLL : 'dddd, D MMMM YYYY h:mm A'
    },
    calendar : {
      sameDay : '[Today at] LT',
      nextDay : '[Tomorrow at] LT',
      nextWeek : 'dddd [at] LT',
      lastDay : '[Yesterday at] LT',
      lastWeek : '[Last] dddd [at] LT',
      sameElse : 'L'
    },
    relativeTime : {
      future : 'in %s',
      past : '%s ago',
      s : 'a few seconds',
      ss : '%d seconds',
      m : 'a minute',
      mm : '%d minutes',
      h : 'an hour',
      hh : '%d hours',
      d : 'a day',
      dd : '%d days',
      M : 'a month',
      MM : '%d months',
      y : 'a year',
      yy : '%d years'
    },
    dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
    ordinal : function (number) {
      var b = number % 10,
        output = (~~(number % 100 / 10) === 1) ? 'th' :
        (b === 1) ? 'st' :
        (b === 2) ? 'nd' :
        (b === 3) ? 'rd' : 'th'
      return number + output
    }
  }
}

export function dt2human (dt, locale) {
  return dt2units(dt).map(([k, v]) =>
    substitute_relative(
      k == 'seconds' ? (v <= 1 ? 's' : 'ss') :
      k == 'minutes' ? (v <= 1 ? 'm' : 'mm') :
      k == 'hours'   ? (v <= 1 ? 'h' : 'hh') :
      k == 'days'    ? (v <= 1 ? 'd' : 'dd') :
      k == 'months'  ? (v <= 1 ? 'M' : 'MM') :
      k == 'years'   ? (v <= 1 ? 'y' : 'yy') : '?'
      , v, true, true, locale
    )
  )
}

export function dt2relative (dt, without_suffix, locale) {
  var u = dt2unit(dt)
  var k = u[0], v = u[1]

  // @optimise: the 'k' condition can be simplified further (save a few bytes!)
  // also, it's backwards... look here:
  // https://github.com/moment/moment/blob/master/src/lib/duration/humanize.js
  // and, threshholds is handled incorrectly (cause of the non-fallthrough behaviour I want to have)
  k = k == 'seconds' && v <= thresholds.ss ? 's' :
      k == 'seconds' && v < thresholds.s   ? 'ss' :
      k == 'minutes' && v <= 1             ? 'm' :
      k == 'minutes' && v < thresholds.m   ? 'mm' :
      k == 'hours'   && v <= 1             ? 'h' :
      k == 'hours'   && v < thresholds.h   ? 'hh' :
      k == 'days'    && v <= 1             ? 'd' :
      k == 'days'    && v < thresholds.d   ? 'dd' :
      k == 'months'  && v <= 1             ? 'M' :
      k == 'months'  && v < thresholds.M   ? 'MM' :
      k == 'years'   && v <= 1             ? 'y' :
                                             'yy'

  return substitute_relative.call(null, k, v, without_suffix, +dt > 0, locale)
}

function substitute_relative (key, number, without_suffix, is_future, locale) {
  var L = locales[locale || 'en'] || locales.en
  var relativeTime = L.relativeTime
  var str
  return typeof relativeTime === 'function' ?
    relativeTime(number, without_suffix, key, is_future) :
    (str = sprintf(relativeTime[key], number)) && without_suffix ? str :
      sprintf(relativeTime[is_future ? 'future' : 'past'], str)
}

// withoutSuffix = omit the future/past 'in'/'ago' suffix
// function processRelativeTime(number, withoutSuffix, key, isFuture) {
//   var format = {
//     's': ['a few seconds', 'a few seconds ago'],
//     'ss': [number + ' seconds', number + ' seconds ago'],
//     'm': ['eka mintan', 'ek minute'],
//     'mm': [number + ' mintanim', number + ' mintam'],
//     'h': ['eka horan', 'ek hor'],
//     'hh': [number + ' horanim', number + ' hor'],
//     'd': ['eka disan', 'ek dis'],
//     'dd': [number + ' disanim', number + ' dis'],
//     'M': ['eka mhoinean', 'ek mhoino'],
//     'MM': [number + ' mhoineanim', number + ' mhoine'],
//     'y': ['eka vorsan', 'ek voros'],
//     'yy': [number + ' vorsanim', number + ' vorsam']
//   }
//
//   return withoutSuffix ? format[key][0] : format[key][1]
// }
