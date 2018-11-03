import { error, __debug } from '../utils'
import { define_getter, define_value } from '../utils'
import { random_id } from '../utils'
import { h, s } from './hyper-hermes'

// I'm not sure this is the best way to do this...

const global_ctx = () => new_ctx({h, s}, 'global')

export function el_ctx (el) {
  var ctx
  while ((ctx = el._G) === undefined && (el = el.parentNode) != null) {}
  return ctx
}

export function new_ctx (G = global_ctx(), name = random_id()) {
  var cleanupFuncs = []
  var sub = []
  var cleaned = false
  var ctx = Object.create(G, {
    _ns: define_value(name),
    _ctx: define_value(sub),
    _h: define_value(null, true),
    _s: define_value(null, true),
    h: define_getter(() => ctx._h || (ctx._h = G.h.context())),
    s: define_getter(() => ctx._s || (ctx._s = G.s.context())),
    cleanupFuncs: define_value(cleanupFuncs),
    parent: define_value(G),
    cleanup: define_value((f) => {
      while (f = sub.pop()) f.cleanup()
      while (f = cleanupFuncs.pop()) f()
      if (ctx._h) ctx._h.cleanup()
      if (ctx._s) ctx._s.cleanup()
    })
  })

  if (name === 'global' && typeof G._ctx !== 'undefined') __debug("when creating the global context,  `_ctx` property should not be defined. (it's automatically created to store named subcontexts)")
  if (name !== 'global' && G._ctx[name]) __debug('parent context already has a subcontext with this name registered')
  if (name !== 'global') G._ctx.push(ctx), G._ctx[name] = ctx // push to the subcontext list, and also by name

  return ctx
}
