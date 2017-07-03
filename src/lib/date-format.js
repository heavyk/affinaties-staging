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

// TODO: allow for moment locales to be used
// TODO: allow for moment formatting to be used in the masks (and this will make the library momentito) so it can be used as a drop-in replacement.

import { kind_of, compact, left_pad as pad } from './utils'

const token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g
const timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g
const timezoneClip = /[^-+\dA-Z]/g

var mask_cache = {}

var flags = {
  // if only the value (d) is output, then the transformation function can be omitted
  d_: 'd',
  // d: (_) => _,

  dd_: 'd',
  dd: (_) => pad(_),

  ddd_: 'D',
  ddd: (_) => i18n.dayNames[_],

  dddd_: 'D',
  dddd: (_) => i18n.dayNames[_ + 7],

  m_: 'm',
  m: (_) => _ + 1,

  mm_: 'm',
  mm: (_) => pad(_ + 1),

  mmm_: 'm',
  mmm: (_) => i18n.monthNames[_],

  mmmm_: 'm',
  mmmm: (_) => i18n.monthNames[_ + 12],

  yy_: 'y',
  yy: (_) => (_+'').slice(2),

  yyyy_: 'y',
  // yyyy: (_) => _,

  h_: 'H',
  h: (_) => _ % 12 || 12,

  hh_: 'H',
  hh: (_) => pad(_ % 12 || 12),

  H_: 'H',
  // H: (_) => _,

  HH_: 'H',
  HH: (_) => pad(_),

  M_: 'M',
  // M: (_) => _,

  MM_: 'M',
  MM: (_) => pad(_),

  s_: 's',
  // s: (_) => _,

  ss_: 's',
  ss: (_) => pad(_),

  l_: 'L',
  l: (_) => pad(_, 3),

  L_: 'L',
  L: (_) => pad(Math.round(_ / 10)),

  t_: 'H',
  t: (_) => _ < 12 ? 'a' : 'p',

  tt_: 'H',
  tt: (_) => _ < 12 ? 'am' : 'pm',

  T_: 'H',
  T: (_) => _ < 12 ? 'A' : 'P',

  TT_: 'H',
  TT: (_) => _ < 12 ? 'AM' : 'PM',

  o_: 'o',
  o: (_) => (_ > 0 ? '-' : '+') + pad(Math.floor(Math.abs(_) / 60) * 100 + Math.abs(_) % 60, 4),

  S_: 'd',
  S: (_) => ['th', 'st', 'nd', 'rd'][_ % 10 > 3 ? 0 : (_ % 100 - _ % 10 != 10) * _ % 10],

  Z_: '_',
  Z: (date) => gmt ? 'GMT' : utc ? 'UTC' : ((date+'').match(timezone) || ['']).pop().replace(timezoneClip, ''),

  W_: '_',
  W: (date) => getWeek(date),

  N_: '_',
  N: (date) => getDayOfWeek(date),
}

export default function dateFormat (date, mask, utc, gmt) {

  // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
  if (kind_of(date) === 'string' && !mask) {
    mask = date
    date = new Date
  } else if (!((date = date || new Date) instanceof Date)) {
    date = new Date(date)
  }

  if (isNaN(date)) {
    return 'Invalid date'
  }

  mask = (dateFormat.masks[mask] || mask || dateFormat.masks['default']) + ''

  var ret, c, _, v = {
    _:  () => date,
    o: () => utc ? 0 : date.getTimezoneOffset(),
    d: () => date[_ + 'Date'](),
    D: () => date[_ + 'Day'](),
    m: () => date[_ + 'Month'](),
    y: () => date[_ + 'FullYear'](),
    H: () => date[_ + 'Hours'](),
    M: () => date[_ + 'Minutes'](),
    s: () => date[_ + 'Seconds'](),
    L: () => date[_ + 'Milliseconds'](),
  }, maskSlice = mask.slice(0, 4)

  // Allow setting the utc/gmt argument via the mask
  if ((maskSlice === 'UTC:' && (utc = true)) || (maskSlice === 'GMT:' && (gmt = true))) mask = mask.slice(4)

  _ = utc ? 'getUTC' : 'get'

  if (c = mask_cache[mask]) {
    ret = ''
    for (var f, i = 0; i < c.length; i++) ret += typeof(f = c[i]) === 'function' ? typeof(f.v) === 'function' ? f(f.v()) : f() : f
    return ret
  }
  else c = []

  var tsi = -1, ts = mask.split(token)

  // OPTIMISED!! (LOL)
  return ret = mask.replace(token, (match, v1, v2, v3) => {
    var fn_v, fn = flags[match], is_fn
    is_fn = typeof fn === 'function'
    if ((fn_v = flags[match+'_']) && typeof(fn_v = v[fn_v]) === 'function') {
      if (is_fn) fn.v = fn_v
      else fn = fn_v, is_fn = true
    }

    ts[tsi += 2] = is_fn ? fn : fn = match.slice(1, match.length - 1)
    return is_fn ? fn(fn.v && fn.v()) : fn
  }), mask_cache[mask] = compact(ts), ret
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
