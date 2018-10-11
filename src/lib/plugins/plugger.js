import { pluginBoilerplate } from '../plugins/plugin-boilerplate'
import { value, transform, compute, modify } from '../dom/observable'
import { win } from '../dom/dom-base'

win.plugger = (starting_panel, C = {}, D = {}) => {
  let beginner = ({G, C}) => {
    // temporary, for now...
    // this stupid shit is required because making contexts is super supid and needs to be rethought.
    // I need to provide a 'lib' to the plugin with the following (and other) important functions.
    // I also need a way to make a context. I think the best way will be to give the plugin the lib
    // and then let it make its own contexts how it pleases...
    G.t = transform
    G.v = value
    G.c = compute
    G.m = modify

    // this should only happen in production env, and it should report the error or something.
    // for now, it's bad because it doesn't pause the debugger
    try {
      return starting_panel({G, C})
    } catch (e) {
      console.error('error in the plugin:', e)
    }
  }
  pluginBoilerplate(starting_panel.name, null, C, D, {}, beginner)
}
