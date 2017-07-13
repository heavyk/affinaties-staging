// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { remote } = require('electron')
const { Menu, MenuItem } = remote

// Build our new menu
var menu = new Menu()
menu.append(new MenuItem({
  label: 'Delete',
  click: function() {
    // Trigger an alert when menu item is clicked
    alert('Deleted')
  }
}))

menu.append(new MenuItem({
  label: 'More Info...',
  click: function() {
    // Trigger an alert when menu item is clicked
    alert('Here is more information')
  }
}))

window.addEventListener('contextmenu', function (e) {
  e.preventDefault()
  menu.popup(remote.getCurrentWindow())
}, false)

const fs = require('fs')
const path = require('path')
const sander = require('sander')
const genny = require('genny')
const hyper_svg_import = require('./hyper-svg-import')

const { DomUtils, DomHandler, parseDOM } = require('htmlparser2')

const CONFIG = {
  export: 'cjs',
  indent: '  ',
}

function* export_hyper_svg (config, imported, resume) {
  var out = (config.export === 'cjs' ? 'module.exports' : 'export default var output') +
    ` = {\n${config.indent}${imported.join('').replace(/\n/g, '\n')}}\n`

  if (config.out_file) yield sander.writeFile(config.out_file, out)
  // if (config.out_file_local) yield sander.writeFile(config.out_file_local, out)
  console.log('out uncompressed:', out.length)

  if (config.export === 'cjs' && config.minify !== false) {
    let minified = require('uglify-js').minify(out, config.minify || {
      fromString: true,
      // sourceMap: {
      //   filename: "out.js",
      //   url: "out.js.map"
      // },
      parse: {},
      mangle: {
        toplevel: true
      },
      compress: {
        unsafe: true,
        properties: true,
        dead_code: true,
        pure_getters: true,
        reduce_vars: true,
        collapse_vars: true,
        join_vars: true,
        global_defs: {
          "@alert": "console.warn"
        },
      },
    })

    const ext = path.extname(config.out_file)
    const min_outfile = path.join(path.dirname(config.out_file), path.basename(config.out_file, ext) + '.min' + ext)
    yield sander.writeFile(min_outfile, minified.code)
    console.log('out compressed:', minified.code.length)
    console.log(config.out_file)
    if (minified.map) yield sander.writeFile(min_outfile + '.map', minified.map)
  }
}

function* import_deck (config, resume) {
  config = Object.assign({replacements: {
    'svg': {
      width: hyper_svg_import.attr,
      height: hyper_svg_import.attr,
      style: hyper_svg_import.xy_fixed_pos,
      // maintain aspect ratio even when the w/h of the card changes
      'preserveAspectRatio': 'xMidYMid meet',
    },
    'text[font-family] tspan[font-family]': function (el, config) {
      // TODO: actually, if it's a text with only one tspan, then just merge the tspan props into the text (but, for now this will work...)
      var p = el.parent
      var text = DomUtils.getText(el).trim()
      if (text === DomUtils.getText(p).trim()) {
        // only child... move the tspan into the text
        for (let attr in el.attribs) {
          p.attribs[attr] = el.attribs[attr]
        }
        p.children.length = 0
        p.children.push.apply(p.children, parseDOM(text))
      } else {
        delete p.attribs['font-family']
      }
    },
    // TODO: separate out the first path from the rest of the card (to allow for it to have a back-face)
    // perhaps what I want to do is delete it, make the 'svg' part common to the poke-her-card (allowing for styles to be shared) and simply put the rest inside of group elements
    // the downside is, that all defs will need to be merged (and ids remapped)
    'svg path:first-of-type': function (el, config) {
      var handler = new DomHandler

      // make a g element
      handler._addDomElement({type: 'text', data: config.indent})
      handler.onopentag('g', {style: `{display: this.attrx('down', function (v) { return v ? 'none' : '' } ) }!~!`})

      // remove (and save) all elements after the path
      var next, e = el.next
      while (next = e.next) {
        DomUtils.removeElement(e)
        if (e.type === 'text' && e.data.substr(-1) === ' ') e.data += config.indent
        handler._addDomElement(e)
        e = next
      }
      handler.onclosetag()
      DomUtils.appendChild(el.parent, handler.dom[0]) // the text node (indent)
      DomUtils.appendChild(el.parent, handler.dom[1]) // the g element
    },
  }}, config)

  const dir = config.dir
  const out_dir = path.join(path.dirname(config.out_file), path.basename(config.out_file, path.extname(config.out_file)))
  const suites = [ 'hearts', 'clubs', 'spades', 'diamonds' ]
  const cards = [ 'ace', 2,3,4,5,6,7,8,9,10, 'jack', 'queen', 'king' ]

  var deck = []
  for (let suite of suites) {
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i]
      let file = i >= 10 ? `simple/${card}_of_${suite}` : `${card}_of_${suite}`
      let id = ((i === 9 ? 'T' : (card+'')[0]) + (suite+'')[0]).toUpperCase()
      try {
        let data = yield fs.readFile(`${dir}/${file}.svg`, 'utf8', resume())
        let res = yield hyper_svg_import(data, config, resume())
        let export_id = `['${id}'] = `
        let fn = `function (G) {\n  var s = G.s\n  return ${res}\n}`
        deck.push(`'${id}': ${fn},\n`)
        yield sander.writeFile(`${out_dir}/${id}.js`, `exports${export_id}${fn}\n`)
        console.log(`file: ${id} :: ${file}\n${data.length} -> ${res.length}`)
      } catch (err) {
        console.error(`file: ${file}`, err)
      }
    }
  }

  return deck
}

function* import_flags (config, resume) {
  const dir = config.dir
  const out_dir = path.join(path.dirname(config.out_file), path.basename(config.out_file, path.extname(config.out_file)))
  var flags = []
  for (var file of yield fs.readdir(dir, resume())) {
    try {
      let ext = path.extname(file)
      let id = path.basename(file, ext)
      let p = `${dir}/${id}.svg`
      if (ext !== '.svg') {continue }
      let data = yield fs.readFile(p, 'utf8', resume())
      let res = yield hyper_svg_import(data, config, resume())
      let export_id = `['${id}'] = `
      let fn = `function (G) {\n  var s = G.s\n  return ${res}\n}`
      flags.push(`'${id}': ${fn},\n`)
      yield sander.writeFile(`${out_dir}/${id}.js`, `exports${export_id}${fn}\n`)
      console.log(`file: ${id} :: ${data.length} -> ${res.length}`, `${out_dir}/${id}.js`)
    } catch (err) {
      console.error(`file: ${file}`, err)
    }
  }

  return flags
}


genny.run(function* (resume) {
  const flags_config = Object.assign({
    dir: `${__dirname}/../../node_modules/lite-flag-icon/flags/4x3`,
    out_file: `${__dirname}/../../src/assets/flags.js`,
  }, CONFIG)
  yield* export_hyper_svg(flags_config, (yield* import_flags(flags_config, resume.gen())), resume.gen())

  const deck_config = Object.assign({
    dir:  `${__dirname}/svg-cards`,
    out_file:  `${__dirname}/../../src/assets/playing-cards.js`,
  }, CONFIG)
  yield* export_hyper_svg(deck_config, (yield* import_deck(deck_config, resume.gen())), resume.gen())
})


/*
const usb = require('usb')
var device, iface, in_endpoint
if (device = usb.findByIds(0xaba, 0x102)) {
  device.open(false)
  device.setConfiguration(1, (err, res) => {
    iface = device.interfaces[0]
    iface.claim()
    if (!(in_endpoint = iface.endpoints[0]))
      throw new Error("couldn't get the in-endpoint")

    try {
      var i, j
      const max_pkt_size = in_endpoint.descriptor.wMaxPacketSize
      const mult = 0.025
      var pk = 0
      var bytes = 0
      var mask = new Array(8)
      var ones = new Array(8)
      var zeros = new Array(8)
      var pos = new Array(8)
      for (j = 0; j < 8; j++) {
        ones[j] = zeros[j] = pos[j] = 0
        mask[j] = 1 << j
      }
      in_endpoint.startPoll(3)
      // in_endpoint.transfer(32, (err, data) => {
      //   console.log('transfer', err, data)
      //   in_endpoint.emit('data', data)
      // })
      in_endpoint.on('data', (d) => {
        pk++
        bytes += d.length
        console.log('data', pk, bytes)
        var delta = (is_one, pos) => {
          if (is_one) ones[pos]++
          else zeros[pos]++
          if (ones[pos] && zeros[pos]) {
            if (is_one) zeros[pos] = 0
            else ones[pos] = 0
          }
          return is_one ? ones[pos] * mult : -zeros[pos] * mult
        }
        for (i = 0; i < d.length; i++) {
          for (j = 0; j < 8; j++) {
            pos[j] += delta(d[i] & mask[j], j)
          }
        }
        console.log(pos.join(' '))
        console.log(zeros.join(' '))
        console.log(ones.join(' '))
        if (pk > 3) in_endpoint.stopPoll(() => {

        })
      })
      in_endpoint.on('error', (err) => {
        console.log('error', err)
      })
      in_endpoint.on('end', () => {
        console.log('end')
        // setTimeout(() => {
        //   pk = 0
        //   device.reset()
        //   in_endpoint.startPoll(32)
        // }, 10000)
      })
    } catch (e) {
      console.log('e:', e, e.errno, e.errno === usb.LIBUSB_TRANSFER_OVERFLOW)
      device.reset()
    }
  })
} else {
  console.log('plug it in, plug it in!')
}
*/
