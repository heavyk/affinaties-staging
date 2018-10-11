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
    return starting_panel({G, C})
  }
  pluginBoilerplate(null, 'id', C, D, {}, beginner)
}
