'use strict'

var rcu = require('rcu')
var postcss = require('postcss')
var toSource = require('tosource')
var path = require('path')
rcu.init(require('ractive'))

module.exports = ractive

// ---------
// to_source
// ---------

function to_fun_old (object, filter, indent, startingIndent) {
	var seen = []
	return walk(object, filter, indent === undefined ? '	' : (indent || ''), startingIndent || '', seen)

	function walk (object, filter, indent, currentIndent, seen) {
		var nextIndent = currentIndent + indent
		object = filter ? filter(object) : object

		switch (typeof object) {
			case 'string':
				return JSON.stringify(object)
			case 'boolean':
			case 'number':
			case 'undefined':
				return '' + object
			case 'function':
				return object.toString()
		}

		if (object === null) {
			return 'null'
		}
		if (object instanceof RegExp) {
			return stringifyRegExp(object)
		}
		if (object instanceof Date) {
			return 'new Date(' + object.getTime() + ')'
		}

		var seenIndex = seen.indexOf(object) + 1
		if (seenIndex > 0) {
			return '{$circularReference:' + seenIndex + '}'
		}
		seen.push(object)

		function join (elements) {
			return indent.slice(1) + elements.join(',' + (indent && '\n') + nextIndent) + (indent ? ' ' : '')
		}

		if (Array.isArray(object)) {
			return '[' + join(object.map(function (element) {
				return walk(element, filter, indent, nextIndent, seen.slice())
			})) + ']'
		}
		var keys = Object.keys(object)
		keys.sort()
		if (object.t) {
			console.log(object)
		}
		return keys.length ? '{' + join(keys.map(function (key) {
			return (legalKey(key) ? key : JSON.stringify(key)) + ':' + walk(object[key], filter, indent, nextIndent, seen.slice())
		})) + '}' : '{}'
	}
}

var KEYWORD_REGEXP = /^(abstract|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|undefined|var|void|volatile|while|with)$/

function legalKey (string) {
	return /^[a-z_$][0-9a-z_$]*$/gi.test(string) && !KEYWORD_REGEXP.test(string)
}

// Node.js 0.10 doesn't escape slashes in re.toString() or re.source
// when they were not escaped initially.
// Here we check if the workaround is needed once and for all,
// then apply it only for non-escaped slashes.
var isRegExpEscaped = (new RegExp('/')).source === '\\/'

function stringifyRegExp (re) {
	if (isRegExpEscaped) {
		return re.toString()
	}
	var source = re.source.replace(/\//g, function (found, offset, str) {
		if (offset === 0 || str[offset - 1] !== '\\') {
			return '\\/'
		}
		return '/'
	})
	var flags = (re.global && 'g' || '') + (re.ignoreCase && 'i' || '') + (re.multiline && 'm' || '')
	return '/' + source + '/' + flags
}




// -------
// BUILDER
// -------




const requirePattern = /require\s*\(\s*(?:"([^"]+)"|'([^']+)')\s*\)/g

function stringify (key) {
	if (/^[a-zA-Z$_][a-zA-Z$_0-9]*$/.test(key)) {
		return key
	}

	return JSON.stringify(key)
}


function builder (definition, options) {
	options = options || {}
	let outro = createOutro(definition)

	let imports = [ `import Ractive from 'ractive';` ]
	let script = definition.script
	let counter = 0

	if (definition.modules.length) {
		definition.modules.forEach(path => {
			imports.push(`import __import${counter}__ from '${path}';`)
			script = script.replace(requirePattern, (str, _, p) => p === path ? `__import${counter}__` : str)
			counter += 1
		})
	}

	definition.imports.forEach(imported => {
		let path = imported.href

		if (!options.preserveExtensions) {
			path = path.replace(/\.[a-zA-Z]+$/, '')
		}

		imports.push(`import __import${counter}__ from '${path}';`)
		counter += 1
	})

	const importBlock = imports.join('\n')

	const beforeScript = [
		'"use strict"',
		`// component: ${definition.name}`,
		importBlock,
		'var component = { exports: {} };'
	].join('\n')

	const code = [
		beforeScript,
		script,
		outro,
		'export default Ractive.extend( component.exports );'
	].join('\n')

	const map = options.sourceMap ?
		rcu.generateSourceMap(definition, {
			offset: beforeScript.split('\n').length,
			hires: options.hires !== false,
			file: options.sourceMapFile,
			source: options.sourceMapSource,
			content: definition.source
		}) : null

	return {code, map}
}

function to_fun (tpl, options) {
	options = options || {}
	for (var i in tpl) {
		console.log(i, tpl[i])
	}
	return
`function (node, options) {
	//	yay!!!
	return h()
}`
}

// make ls file to convert the template
// add the ls file to the watcher

function createOutro (definition, indent) {
	indent = indent || ''
	const css = definition.css || '' // ? new CleanCSS().minify(definition.css).styles : ''
	const imports = definition.imports.map((imported, i) => `${stringify(imported.name)}: __import${definition.modules.length + i}__`)

	let outro = [
		`${indent}component.exports.template = ${toSource(definition.template, null, '	')};`,
		// `${indent}component.exports.fun = ${to_fun(definition.template, null, '	')};`,
	]


	if (css) outro.push(`${indent}component.exports.css = ${toSource(css)};`)
	if (imports.length) outro.push(`${indent}component.exports.components = { ${imports.join(', ')} };`)

	return outro.join('\n')
}





// ----------------
// GOBBLE TRANSFORM
// ----------------


var sander = require('sander')
var path = require('path')
var genny = require('genny')
var fs = require('fs')

function ractive (inputdir, outputdir, options, callback) {
	var file, sourceMap = options.sourceMap !== false

	if (sourceMap) {
		options.sourceMapFile = this.dest
		options.sourceMapSource = this.src
	}

	genny.run(function* (resume) {
		var paths = yield sander.lsr(inputdir)

		for (var i = 0; i < paths.length; i++) {
			var p = file = paths[i]
			var ext = path.extname(p)
			// console.log('starting', p)
			if (ext === '.html') {
				var source = yield fs.readFile(inputdir + '/' + p, 'utf8', resume())
				var parsed = rcu.parse(source)
				parsed.name = path.basename(p)

				var result = yield function (cb) {
					postcss(options.postcss).process(parsed.css).then(function (result) { cb(null, result) }).catch(cb)
				}

				// console.log('result', result)
				var warnings = result.warnings()
				if (warnings.length) {
					console.warn(`warnings for '${p}':`)
					warnings.forEach(function (warn) {
						console.warn(' * ' + warn.toString())
					})
				}

				parsed.css = result.css
				var out = builder(parsed, options)

				var outfile = outputdir + '/' + path.dirname(p) + '/' + path.basename(p, ext) + '.js'
				// console.log('writing', outfile)
				yield sander.writeFile(outfile, out.code)
				if (sourceMap && out.map) {
					yield sander.writeFile(outfile + '.map', out.map)
				}
			} else {
				yield sander.symlink(inputdir + '/' + p).to(outputdir + '/' + p)
			}
			// console.log('done', p)
		}
		callback(null)
	}, function (err) {
		if (err) console.error('ERROR:', file, err.stack)
		callback(err)
	})
}

var fs = require('fs')
if (!module.parent) {
	const POSTCSS_PLUGINS = [
		require('postcss-import'),
		require('precss'),
		require('postcss-color-function'),
		require('autoprefixer-core', { browsers: ['last 2 versions'] }),
	]
	var file = './src/partials/poll-stats.html'
	var code = fs.readFileSync(file, 'utf8')
	// code.dest
	console.log(ractive.call({src: file}, code, {postcss: POSTCSS_PLUGINS}), code)
}
