import { pluginBoilerplate } from '../plugins/plugin-boilerplate'
import { value, transform, compute, modify } from '../dom/observable'
import { win } from '../dom/dom-base'

win.plugger = (starting_panel, C = {}, D = {}) => {
  const name = starting_panel.name
  if (!name) error("cannot determine the name of the panel. please use a named function")

  let beginner = (args) => {
    // this should only happen in production env, and it should report the error or something.
    // for now, it's bad because it doesn't pause the debugger
    if (DEBUG) return starting_panel(args)
    else try {
      return starting_panel(args)
    } catch (e) {
      console.error('error in plugin('+name+'):', e)
    }
  }
  pluginBoilerplate(name, null, C, D, {}, beginner)
}
