'use strict'

const { Parser, DomUtils, parseDOM } = require('htmlparser2')
const CSSselect = require('css-select')
const CSSwhat = require('css-what')
const entities = require('entities')
const svg_attrs = require('./svg-attrs')

class ItemList {
  constructor (parent, indent = '') {
    this.parent = parent
    this.content = ''
    this.spacer = ''
    this.indent = parent ? parent.indent : indent
    this.isFirstItem = true
  }

  addSpace (space) {
    this.spacer += space

    if (space.indexOf('\n') !== -1) {
      // reset indent when there are new lines
      this.indent = /[^\n]*$/.exec(space)[0]
    } else {
      // otherwise keep appending to current indent
      this.indent += space
    }
  }

  add (data, ignoreComma) {
    if (!ignoreComma) {
      if (!this.isFirstItem) {
        this.content += this.spacer.length ? ',' : ', '
      }

      this.isFirstItem = false
    }

    this.content += this.spacer
    this.spacer = ''
    this.content += data
  }
}

function rename_attr (attrs, from, to) {
  var attr = attrs[from]
  if (attr != null) {
    attrs[to] = attr
    delete attrs[from]
  }
}

function convert (inputMarkup, _opts) {
  const parser_opts = {
    xmlMode: true,
    decodeEntities: true,
  }
  var opts = Object.assign({
    fn: 'h',
    indent: '  ',
  }, _opts)

  var elementStack = []
  var currentItemList = new ItemList(null, opts.indent)

  if (opts.replacements) {
    var doc = parseDOM(inputMarkup, parser_opts)
    var attrs, attr, val, replace
    for (var query in opts.replacements) {
      // try {
        var els = CSSselect(query, doc)
        if (els.length) {
          var replace = opts.replacements[query]
          for (var el of els) {
            if (typeof replace === 'function') {
              replace(el)
            } else if (typeof replace === 'object') {
              for (attr in replace) {
                // if (attr === 'x') debugger
                attrs = el.attribs
                let replacer = replace[attr]
                if ((val = opts.attrFilter(attr, attrs[attr])) == null || val === false) {
                  attrs[attr] = typeof replacer === 'function' ? replacer(attr) + '!~!' : replacer
                } else if (val !== true) {
                  attrs[attr] = entities.encodeXML((typeof replacer === 'function' ? replacer(attr, val) : replacer) + '!~!')
                }
              }
            }
            // var what = CSSwhat(query)
            // for (var w of what) {
            //   for (var s of w) {
            //     debugger
            //     if (s.type === 'attribute') {
            //       el.attribs[s.name] = opts.replacements[query]
            //
            //     }
            //   }
            // }
          }
        }
      // } catch (e) {
      //   console.info(e)
      // }
    }
    inputMarkup = DomUtils.getOuterHTML(doc, {xmlMode: true})
  }

  var parser = new Parser({
    onopentag: function (name, attrs) {
      currentItemList = new ItemList(currentItemList)
      elementStack.unshift([ name, attrs ])
    },
    ontext: function (text) {
      var lines = text.split('\n')
      var isFirst = true

      lines.forEach(function (line) {
        var lineMatch = /^(\s*)(.*?)(\s*)$/.exec(line)
        var preSpace = lineMatch[1]
        var mainText = lineMatch[2]
        var postSpace = lineMatch[3]

        if (!isFirst) {
          currentItemList.addSpace('\n')
        }

        currentItemList.addSpace(preSpace)

        if (mainText.length > 0) {
          currentItemList.add(JSON.stringify(mainText))
        }

        isFirst = false
      })
    },
    onclosetag: function (tagname) {
      var element = elementStack.shift()
      var elementContent = currentItemList.content + currentItemList.spacer
      currentItemList = currentItemList.parent
      var indent = currentItemList.indent
      var attrs = element[1]
      var attr, val, suffix = ''

      // first, correct any errors
      for (attr in attrs) {
        // check to see if a mixed case attr is lowercased by accident (can easily happen when a program is assuming html instead of xml)
        if (~(val = svg_attrs.mixed_case_lower.indexOf(attr))) rename_attr(attrs, attr, svg_attrs.mixed_case[val])
        // check to see if a dashed case attr is camelized by accident (don't know of any cases, but just to be sure...)
        if (~attr.indexOf('-') && ~(val = svg_attrs.dashed_camelized.indexOf(attr))) rename_attr(attrs, attr, svg_attrs.dashed[val])
      }

      if (opts.attrFilter) {
        for (attr in attrs) {
          if ((val = opts.attrFilter(attr, attrs[attr])) == null || val === false) {
            delete attrs[attr]
          } else if (val !== true) {
            attrs[attr] = val
          }
        }
      }

      if (attr = attrs['id']) {
        suffix = '#' + attr
        delete attrs['id']
      }

      if (attr = attrs['class']) {
        suffix += attr.split(/\s+/g).filter(function (v) { return v.length > 0; }).map((cls) => '.' + cls).join('')
        delete attrs['class']
      }

      // shorten style -> s
      // TODO: move this to tho config...
      rename_attr(attrs, 'style', 's')


      var attrPairs = Object.keys(attrs).map((k) => (/^[a-zA-Z0-9]+$/.test(k) ? k : JSON.stringify(k)) + ': ' + (typeof attrs[k] === 'function' ? attrs[k]() : JSON.stringify(attrs[k])) )
      // if (element[0] === 'fegaussianblur') debugger // just in case I make a mistake
      var item = opts.fn + '(' + JSON.stringify(element[0] + suffix) + (
        attrPairs.length
          ? ', {\n' + indent + '  ' + attrPairs.join(',\n' + indent + '  ') + '\n' + indent + '}'
          : ''
        ) + (
        elementContent.trim().length
          ? (opts.array ? ', [' : ', ') + (elementContent[0] === '\n' ? '' : ' ') + elementContent + (elementContent.match(/\s$/) ? '' : ' ') + (opts.array ? ']' : '')
          : ''
        ) + ')'

      currentItemList.add(item)
    },
    oncomment: function (text) {
      currentItemList.add('/*' + (text.replace(/\*\//g, '°/')) + '*/', false)
    }
  }, parser_opts)

  parser.write(inputMarkup)
  parser.end()

  return currentItemList.content
}

const to_single = require('to-single-quotes')
const SVGO = require('svgo')
const cssLib = require('css')
const SVGO_CONFIG = {
  multipass: true,
  floatPrecision: 3,
  js2svg: { pretty: true, indent: 2 },
}


function reduceCss (css, _opts) {
  var opts = Object.assign({
    filterSelector: () => true,
    filterDeclaration: () => true,
  }, _opts)

  var ast = cssLib.parse(css || '')
  ast.stylesheet.rules = ast.stylesheet.rules.map((rule) => {
    switch (rule.type) {
      case 'rule':
        rule.selectors = rule.selectors.filter(opts.filterSelector)
        return rule.selectors.length === 0 ? null : rule
      case 'media':
        rule.rules = rule.rules.filter((rule) => {
          return rule.type === 'rule'
        }).map((rule) => {
          rule.selectors = rule.selectors.filter(opts.filterSelector)
          return rule.selectors.length === 0 ? null : rule
        }).filter((rule) => {
          return rule !== null && rule !== undefined
        })
        return rule.rules.length === 0 ? null : rule
      case 'comment':
        // curently not including comments
        break
      case 'keyframes':
        return rule
      case 'font-face':
        return rule
      default:
        console.error(`Unknown rule! Add ${rule.type} as case to switch on!`)
        return rule
    }
  }).filter((rule) => rule !== null && rule !== undefined).map((rule) => {
    rule.declarations = rule.declarations.filter((decl) => opts.filterDeclaration(decl.property, decl.value))
    return rule
  })
  return cssLib.stringify(ast, {compress: true, indent: ''})
}

function reduceInlineStyles (styles, filterDeclaration) {
  var ast = cssLib.parse(`el { ${styles || ''} }`)
  var rule = ast.stylesheet.rules[0]
  rule.declarations = rule.declarations.filter((decl) => filterDeclaration(decl.property, decl.value))
  var str = cssLib.stringify(ast)
  str = str.substr(7, str.length - 7 - 2).trim().replace(/;$/, '') // 'el {\n' - '}\n'
  return str.length ? str : false
}


function reduceNumberList (config, vb) {
  var precision = config.floatPrecision != null ? config.floatPrecision : SVGO_CONFIG.floatPrecision
  return vb.split(' ').map((v) => ((parseFloat(v).toFixed(precision) * 1) + '').replace(/0(?=[.])/, '')).join(' ')
}

function hyper_svg_import (data, config, cb) {
  if (typeof config === 'function') cb = config, config = SVGO_CONFIG
  else config = Object.assign({}, config, SVGO_CONFIG)

  const svgo = new SVGO(config)
  svgo.optimize(data, (res) => {
    if (res.data) {
      var out = convert(res.data, Object.assign({
        fn: 's',
        attrFilter: function (k, v) {
          var f, s
          // when is literal code (string ending with '!~!')
          if (typeof v === 'string' && v.substr(-3) === '!~!') return () => v.substr(0, v.length - 3)
          // no need for null values
          if (v == null) return false

          switch (k) {
            // xmlns is assumed for s()
            case 'xmlns':
              return v === 'http://www.w3.org/2000/svg' ? false : v

            // xmlns:xlink is also assumed for s()
            case 'xmlns:xlink':
              return v === 'http://www.w3.org/1999/xlink' ? false : v

            // viewbox should conform to floatPrecision
            case 'viewBox':
              return reduceNumberList(config, v)

            // remove inline styles that are useless (eg. inkscape)
            case 'style':
              return reduceInlineStyles(v, (name, val) => !~name.indexOf('-inkscape') )

            // shorten up matrix floats
            case 'transform':
            case 'gradientTransform':
              return v.replace(/[0-9., -]+/, (m) => m.split(' ').map((v) => ((parseFloat(v).toFixed(3) * 1) + '').replace(/^0(?=[.])/, '').replace(/^-0(?=[.])/, '-')).join(' '))
          }

          // when it's a number
          if (!isNaN(f = parseFloat(v))) return f

          // same as above, but will turn -0.1234 -> -.1234
          // not really necessary, because uglify-js will automatically do this for you
          if (!isNaN(f = parseFloat(v))) return (s = (f+'').substr(0, 2)) === '-0' || s === '0.' ? () => ((f+'').replace(/^0(?=[.])/, '').replace(/^-0(?=[.])/, '-')) : f
          return true
        },
      }, config))
      cb(null, to_single(out))
    }
  })
}

hyper_svg_import.attr_val = (name, val) => `this.attr('${name}'` + (val != null ? `, ${val})` : `)`)
hyper_svg_import.attr = (name) => `this.attr('${name}')`
hyper_svg_import.xy_fixed_pos = (name, val) => `{ position: 'fixed', left: this.attr('x'), top: this.attr('y') }`

module.exports = hyper_svg_import
