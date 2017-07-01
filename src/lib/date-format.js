/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

import { kind_of, left_pad as pad } from './utils'

const token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g
const timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g
const timezoneClip = /[^-+\dA-Z]/g

export default function dateFormat (date, mask, utc, gmt) {

  // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
  if (typeof(date) === 'string' && !mask) {
    mask = date
    date = new Date
  } else if (!((date = date || new Date) instanceof Date)) {
    date = new Date(date)
  }

  if (isNaN(date)) {
    return 'Invalid date'
  }

  mask = (dateFormat.masks[mask] || mask || dateFormat.masks['default']) + ''

  // Allow setting the utc/gmt argument via the mask
  var maskSlice = mask.slice(0, 4)
  if ((maskSlice === 'UTC:' && (utc = true)) || (maskSlice === 'GMT:' && (gmt = true))) mask = mask.slice(4)

  var _ = utc ? 'getUTC' : 'get'
  var o = utc ? 0 : date.getTimezoneOffset()
  var v = {
    d: () => date[_ + 'Date'](),
    D: () => date[_ + 'Day'](),
    m: () => date[_ + 'Month'](),
    y: () => date[_ + 'FullYear'](),
    H: () => date[_ + 'Hours'](),
    M: () => date[_ + 'Minutes'](),
    s: () => date[_ + 'Seconds'](),
    L: () => date[_ + 'Milliseconds'](),
    W: () => getWeek(date),
    N: () => getDayOfWeek(date),
  }
  var flags = {
    d: () => v.d(),
    dd: () => pad(v.d()),
    ddd: () => i18n.dayNames[v.D()],
    dddd: () => i18n.dayNames[v.D() + 7],
    m: () => v.m() + 1,
    mm: () => pad(v.m() + 1),
    mmm: () => i18n.monthNames[v.m()],
    mmmm: () => i18n.monthNames[v.m() + 12],
    yy: () => (v.y() + '').slice(2),
    yyyy: () => v.y(),
    h: () => v.H() % 12 || 12,
    hh: () => pad(v.H() % 12 || 12),
    H: () => v.H(),
    HH: () => pad(v.H()),
    M: () => v.M(),
    MM: () => pad(v.M()),
    s: () => v.s(),
    ss: () => pad(v.s()),
    l: () => pad(v.L(), 3),
    L: () => pad(Math.round(v.L() / 10)),
    t: () => v.H() < 12 ? 'a' : 'p',
    tt: () => v.H() < 12 ? 'am' : 'pm',
    T: () => v.H() < 12 ? 'A' : 'P',
    TT: () => v.H() < 12 ? 'AM' : 'PM',
    Z: () => gmt ? 'GMT' : utc ? 'UTC' : ((date+'').match(timezone) || ['']).pop().replace(timezoneClip, ''),
    o: () => (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
    S: () => ['th', 'st', 'nd', 'rd'][v.d() % 10 > 3 ? 0 : (v.d() % 100 - v.d() % 10 != 10) * v.d() % 10],
    W: () => v.W(),
    N: () => v.N(),
  }

  return mask.replace(token, (match) => {
    var fn = flags[match]
    return typeof fn === 'function' ? fn() : match.slice(1, match.length - 1)
  })
}

dateFormat.masks = {
  'default': 'ddd mmm dd yyyy HH:MM:ss',
  'shortDate': 'm/d/yy',
  'mediumDate': 'mmm d, yyyy',
  'longDate': 'mmmm d, yyyy',
  'fullDate': 'dddd, mmmm d, yyyy',
  'shortTime': 'h:MM TT',
  'mediumTime': 'h:MM:ss TT',
  'longTime': 'h:MM:ss TT Z',
  'isoDate': 'yyyy-mm-dd',
  'isoTime': 'HH:MM:ss',
  'isoDateTime': "yyyy-mm-dd'T'HH:MM:sso",
  'isoUtcDateTime': "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
  'expiresHeaderFormat': 'ddd, dd mmm yyyy HH:MM:ss Z'
}

// Internationalization strings
var i18n = dateFormat.i18n = {
  dayNames: [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ],
  monthNames: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ]
}

/**
 * Get the ISO 8601 week number
 * Based on comments from
 * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
 */
function getWeek (date) {
  // Remove time components of date
  var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  // Change date to Thursday same week
  targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3)

  // Take January 4th as it is always in week 1 (see ISO 8601)
  var firstThursday = new Date(targetThursday.getFullYear(), 0, 4)

  // Change date to Thursday same week
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3)

  // Check if daylight-saving-time-switch occured and correct for it
  var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset()
  targetThursday.setHours(targetThursday.getHours() - ds)

  // Number of weeks between target Thursday and first Thursday
  var weekDiff = (targetThursday - firstThursday) / (86400000 * 7)
  return 1 + Math.floor(weekDiff)
}

/**
 * Get ISO-8601 numeric representation of the day of the week
 * 1 (for Monday) through 7 (for Sunday)
 */
const getDayOfWeek = (date) => date.getDay() || 7
