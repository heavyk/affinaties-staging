# ARCHITECT
#
# a thrown together builder with still many flaws
#
# TODO:
#  - move the file watchers into elixir/phoenix as to get rid of the enormous cpu usage while idle


require! path: \Path
require! fs: \Fs

# es6 module support
require = (require '@std/esm')(module, cjs: true, esm: "js")

merge-deep-array = require './src/lib/utils' .merge-deep-array

src_dir = Path.join __dirname, \src
tmp_dir = Path.join __dirname, \priv \build
out_dir = Path.join __dirname, \priv \static
contracts_dir = Path.join __dirname, \contracts

poems =
  # 'plugins/booble-bobble.js':
  #   dest: 'plugins/booble-bobble.js'
  #   webpack:
  #     stuff: true
  # 'plugins/zibble-zabble.js':
  #   dest: 'plugins/zibble-zabble.js'
  #   css: 'plugins/zibble-zabble.css'
  # 'plugins/mastering-the-zodiac.js':
  #   dest: 'plugins/mastering-the-zodiac.js'
  # 'plugins/juego-x.js':
  #   dest: 'plugins/juego-x.js'
  # 'plugins/vertele.js':
  #   dest: 'plugins/vertele.js'
  # 'plugins/vertele-portada.js':
  #   dest: 'plugins/vertele-portada.js'
  # 'plugins/test-jsx.js':
  #   dest: 'plugins/test-jsx.js'
  # 'plugins/affinaties.js':
  #   dest: 'plugins/affinaties.js'
  # 'plugins/mop-great-again.js':
  #   dest: 'plugins/mop-great-again.js'
  #   css: 'plugins/mop-great-again.css'
  # 'plugins/spotify.js':
  #   dest: 'plugins/spotify.js'
  #   # css: 'plugins/spotify.css'
  'plugins/meditator.js':
    dest: 'plugins/meditator.js'
    css: 'plugins/meditator.css'
    webpack:
      plugins:
        new (require 'html-webpack-plugin') {
          inline-source: /.(js|css)$/
          filename: 'meditator.html'
        }
        # new (require 'html-webpack-inline-source-plugin')
        ...
  'plugins/demo.js':
    dest: 'plugins/demo.js'
    webpack:
      plugins:
        new (require 'html-webpack-plugin') {
          inline-source: /.(js|css)$/
          filename: 'demo.html'
        }
        # new (require 'html-webpack-inline-source-plugin')
        ...
  'plugins/new-form.js':
    dest: 'plugins/new-form.js'
    css: 'plugins/new-form.css'
    webpack:
      plugins:
        new (require 'html-webpack-plugin') {
          inline-source: /.(js|css)$/
          filename: 'new-form.html'
        }
        # new (require 'html-webpack-inline-source-plugin')
        ...
  # 'plugins/metatrons-compass.js':
  #   dest: 'plugins/metatrons-compass.js'
  #   css: 'plugins/metatrons-compass.css'
  # 'hamsternipples/fuq.js':
  #   dest: 'plugins/hamsternipples.js'
  #   # css: 'plugins/hamsternipples.css'
  # 'plugins/lending-coin.js':
  #   dest: 'plugins/lending-coin.js'
  #   css: 'plugins/lending-coin.css'
  # 'plugins/lending-crowd.js':
    # dest: 'plugins/lending-crowd.js'
    # css: 'plugins/lending-crowd.css'
  # 'plugins/poke-her-starz.js':
  #   dest: 'plugins/poke-her-starz.js'
  #   css: 'plugins/poke-her-starz.css'
  # 'plugins/meatr.js':
  #   dest: 'plugins/meatr.js'




# ===========
# ===========

require! \genny
require! \rimraf
require! \mkdirp
require! \rollup
require! \rollup-plugin-buble
require! \chokidar
require! \webpack
require! \postcss
require! \glob

# glob './node_modules/*/node_modules/web3', (err, files) !->
#   console.log 'node_modules:', files

# return

genny.long-stack-support = true
genny.ev = (gen) ->
  fn = genny gen
  return !->
    args = [].slice.call &
    args.push (err, res) !->
      if err => throw err
    fn.apply this, args

process.on \uncaughtException, (err) !->
  console.error 'uncaught err', err


POSTCSS_PLUGINS = [
  require 'postcss-import'
  require 'precss'
  require 'postcss-color-function'
  # (require 'autoprefixer')(browsers: ['last 2 versions'])
]

# set-interval !->
#   test-file = Path.join src_dir, \testing-file.js
#   Fs.stat test-file, (err, st) !->
#     if err
#       if Math.random! > 0.5
#         Fs.write-file test-file, 'test!', -> # console.log \added
#       else
#         # console.log \mkdir1
#         Fs.mkdir test-file, ->
#           # console.log \mkdir2
#           Fs.mkdir test-file + '/lala', ->
#             # console.log \write-file
#             Fs.write-file test-file + '/lala/lala.txt', 'test!', -> # console.log \added
#     else
#       sander.rimraf test-file
# , 2000ms

rollup_cache = {}
rollup_opts =
  format: \umd
  plugins: [ rollup-plugin-buble {
    jsx: \h
    transforms:
      # for now we are going to use all ES6 features
      # TODO: generate different bundles for different browsers with their capabilites (and serve accordingly)
      arrow: false
      classes: false
      collections: false
      computedProperty: false
      conciseMethodProperty: false
      constLoop: false
      dangerousForOf: false
      dangerousTaggedTemplateString: false
      defaultParameter: false
      destructuring: false
      forOf: false
      generator: false
      letConst: false
      modules: false
      numericLiteral: false
      parameterDestructuring: false
      reservedProperties: false
      spreadRest: false
      stickyRegExp: false
      templateString: false
      unicodeRegExp: false
  } ]
  source-map: true
  module-context: {}

webpack_compilers = {}
webpack_opts =
  context: __dirname
  # devtool: \source-map
  # devtool: \inline-source-map
  # devtool: \cheap-source-map
  # devtool: \eval
  devtool: false
  performance:
    max-asset-size: 500_000
    max-entrypoint-size: 500_000
    # asset-filter: (file) !->
    #   console.log "asset:", file
  plugins:
    # new (require 'html-webpack-plugin') {
    #   inline-source: /.(js|css)$/
    # }
    # new (require 'html-webpack-inline-source-plugin')
    new webpack.DefinePlugin {
      DEBUG: true
      # sometimes, a module can put their tests inline by saying "if (!module.parent) { ... }"
      # so that tests will be run if run directly: node src.js
      # so, we pretend that all files are required (and therefore have a parent)
      'module.parent': true
    }
    # this uses the gwt compiled (not-as-good as the java) version of the closure compiler
    # also, it has problems parsing utf-8 js source files (var niño = true :: parse error)
    # new (require 'google-closure-compiler-js' .webpack) {
    #   options:
    #     language-in: \ECMASCRIPT6
    #     language-out: \ECMASCRIPT6
    #     compilation-level: \ADVANCED
    #     warning-level: \VERBOSE
    # }
    ...
  module:
    rules:
      * test: /\.ejs$/
        loader: 'ejs-loader'
      * test: /.md$/
        loader: \raw-loader
      * test: /.js$/
        loader: \source-map-loader
      * test: /.sol$/
        loaders: <[web3-loader solc-loader]>
      ...

# resolve stupid rollup wanring with lodash: invalid use of 'this' at the root level
rollup_opts.module-context[Path.join tmp_dir, 'lib/lodash/_root.js'] = 'window'


get-opts = (opts) ->
  outfile = file = Path.basename opts.path
  opts.lang = switch ext = Path.extname file
  | \.ls \.alive => \alive-script
  | \.coffee => \coffee-script
  | \.js \.jsx => \js
  | \.json => \json
  | \.sol => \solidity

  unless opts.outfile
    if ~(idx_ext = file.lastIndexOf '.')
      ext = if opts.ext then opts.ext else file.substr idx_ext
      outfile = file.substr 0, idx_ext
      if ~(idx_ext2 = file.substr(0, idx_ext).lastIndexOf '.')
        ext = if opts.ext then opts.ext else file.substr idx_ext2
        outfile = file.substr 0, idx_ext2
      switch ext
      | '.blueprint.ls' =>
        opts.blueprint = true
        opts.result = true
        ext = \.blueprint
        #fallthrough
      | '.json.ls' =>
        opts.result = true
        opts.json = true
        ext = \.json
      | otherwise =>
        ext = ext.replace /(?:(\.\w+)?\.\w+)?$/, (r, ex) ->
          if ex is \.json then opts.json = true
          return ex or if opts.json or opts.lang is \json then \.json else if opts.lang then '.js' else ext

      if ext isnt \.js and opts.result isnt false
        opts.result = true
      outfile = outfile + ext
    else if opts.ext
      outfile = file + opts.ext
    else
      # throw new Error "source file (#{file}) does not have an extension"
      return

    opts.ext = ext
    # opts.outfile = outfile
    opts.outfile = (opts.path.substr 0, opts.path.length - file.length) + outfile

  unless opts.ext
    opts.ext = ext
  return opts

path_lookup = {}

process_src = (path, resume) ->*
  file = Path.basename path
  src = Path.join src_dir, path
  if file is \.DS_Store
    return yield rimraf src, resume!

  if file.0 is '.' or not (opts = get-opts {path})
    console.log 'skipping', path
    return

  path_lookup[path] = opts.outfile
  dest = Path.join tmp_dir, opts.outfile

  txt = yield Fs.read-file src, \utf-8, resume!
  new_txt = yield new Promise (resolve, reject) !->
    switch opts.lang
    | \alive-script =>
      try
        LiveScript = require \livescript
        res = LiveScript.compile txt, {
          bare: true
          header: false
          filename: Path.basename path
          outputFilename: Path.basename opts.outfile
          map: if opts.json => \none else \linked-src # \embedded
          json: opts.json
        }

        resolve (if opts.json => res else res.code)
      catch e
        console.error "error compiling: #{src} ::", e.stack or e
        reject e

    | \js =>
      # for now, no transformations are done...
      resolve txt

    | \coffee-script =>
      throw new Error "coffee-script not yet implemented"

    | \solidity =>
      require \child_process .exec "solc -o #{tmp_dir}/#{Path.dirname path} --overwrite --bin --abi --optimize ./#{path}", {cwd: src_dir},
      (err, stdout, stderr) !->
        console.log \solidity, err, stdout, stderr
        if stderr => reject stderr
        else resolve false # no txt to output (directly writes to the tmp_dir)

    | otherwise =>
      # console.log "#{opts.lang} not yet implemented"
      resolve txt

    # if opts.result
    #   opts.ast.makeReturn!
    #
    # opts.output = opts.ast.compileRoot options
    # if opts.result
    #   process.chdir Path.dirname opts.path
    #   opts.output = LiveScript.run opts.output, options, true
    #   process.chdir CWD

  # if txt is new_txt or new_txt is true
  #   console.log 'symlink:', dest, '->', src
  #   Fs.symlink dest, src, (err) -> if err and err.code isnt \EEXIST => throw err
  # else
  if new_txt isnt false
    # console.log 'write:', dest
    yield Fs.write-file dest, new_txt, resume!

process_css = (path, resume) ->*
  # not used. NEEEDS IMPROVEMENT!!!
  switch ext = Path.extname path
  | \.css =>
    src = Path.join tmp_dir, path
    dest = Path.join out_dir, path
    txt = yield Fs.read-file src, \utf-8, resume!
    res = yield postcss POSTCSS_PLUGINS .process txt
    yield Fs.write-file dest, res.css, resume!
  | otherwise =>
    console.error "unknown css extension: '#{ext}' for #{path}"

reprocess_poem = (path, resume) ->*
  if poem = poems[path]
    count = poem.processing
    poem.processing = 0
    # if the poem received a another request to reprocess while it was still processing,
    # then, the count will be more than one. go ahead and process again.
    if count > 1 => yield from process_poem path, resume.gen!


process_poem = (path, resume) ->*
  if not (poem = poems[path]) or (poem.processing++) isnt 0
    return

  # regardless of the number of times we tried to process, set it to 1
  poem.processing = 1
  console.log \process_poem, path

  src = Path.join tmp_dir, path
  webpack_src = Path.join tmp_dir, '.' + path
  dest = Path.join out_dir, poem.dest

  # -------

  cache = rollup_cache[path]
  # opts = merge-deep-array {}, rollup_opts, {
  #   entry: src
  #   cache: cache
  #   dest: webpack_src
  # }
  opts = {} <<< rollup_opts <<< {
    entry: src
    cache: cache
    dest: webpack_src
  }

  try
    [bundle] = yield [
      rollup.rollup opts
      (cb) !-> mkdirp (Path.dirname webpack_src), (err) !-> if err and err.code is \EEXIST => cb! else cb err
    ]
    rollup_cache[path] = bundle
    output = bundle.generate opts
    # add source map url to the last line of code
    code = output.code + "\n//# sourceMappingURL=#{Path.basename webpack_src}.map\n"
    # code = output.code + "\n//# sourceMappingURL=#{Path.basename dest}.map\n"
    # code = output.code + "\n//# sourceMappingURL=#{output.map.toUrl!}\n"

    yield [
      (cb) !-> Fs.write-file webpack_src, code, cb
      (cb) !-> Fs.write-file "#{webpack_src}.map", output.map.to-string!, cb
    ]
  catch e
    if e.id => console.error e.id
    console.error 'rollup error:' e.to-string!
    # TODO: save the error (for the interface)
    return yield from reprocess_poem path, resume.gen!
    # console.error e.message
    # if e.loc
    #   console.error e.loc
    #   if e.loc.line
    #     console.error 'line:', e.loc.line, 'column:', e.loc.column
    # if e.frame => console.error e.frame
    # if e.snippet => console.error e.snippet
    # console.error e, (Object.keys e)
  try
    opts = merge-deep-array {}, webpack_opts, {
      entry: webpack_src
      output:
        path: Path.dirname dest
        filename: Path.basename dest
    }, poem.webpack

    # console.log webpack_opts
    # console.log poem.webpack
    console.log path, \plugins, opts.plugins.length
    if opts.plugins.length > 1
      console.log opts.plugins, poem.webpack.plugins
    compiler = webpack opts
    stats = yield compiler.run resume!

    console.log \poem, dest
    if bundle.imports.length => console.log 'static imports:', bundle.imports.join ','
    if bundle.exports.length => console.log 'static exports:', bundle.exports.join ','
    if bundle.modules.length => console.log 'static modules:', bundle.modules.length
    # TODO: maybe find the biggest modules and print them?
    # for m in bundle.modules
    #   console.log m.id
    console.log stats.to-string {
      colors: true
      version: false
      chunks: false
    }
    # console.log stats#.compilation.modules
    # if stats.has-errors!
    #   console.error dest
    #   console.error "compile error", err
    # if stats.has-warnings!
    #   console.warn ''
    #   console.log "wrote:", stats

    if poem.css => yield from process_css poem.css, resume.gen!
    console.log "poem written:", dest
  catch e
    # console.log \catch, e.message.substr 0, 1000
    console.error 'error compiling', poem.dest
    console.error e.stack or if e.to-string => e.to-string! else e
    if e.details => console.error e.details

  yield from reprocess_poem path, resume.gen!


# =======================
#         MAIN
# =======================

genny.run (resume) ->*
  # TODO: don't remove these dirs & only update files if they are different (eg. different hashes)
  yield [
    rimraf tmp_dir, resume!
    rimraf out_dir, resume!
    mkdirp tmp_dir, resume!
    mkdirp out_dir, resume!
  ]

  # if has contracts in root dir, then
    # require \child_process .exec <[truffle watch]>, {detached: true}

  src_watcher = chokidar.watch src_dir, {
    # ignore-initial: true
    # ignored: /[\/\\]\./
    cwd: src_dir
    always-stat: true
  }

  src_watcher.on \change, genny.ev (path, st, resume) ->*
    console.log \src.change, path
    # first, process the source file
    yield from process_src path, resume.gen!

    # then, check to see if that source file was a dependency of a poem
    tmp_dir_path = Path.join tmp_dir, path
    ext = Path.extname path
    epath = Path.basename path, ext
    to_process = {}
    for p, poem of poems
      if path_lookup[path] is p
        console.log 'found poem!', path, p
        to_process[p] = true

      if poem.css is path or ~p.index-of epath
        to_process[p] = true

    for p, bundle of rollup_cache

      # using for-each because of the splice
      bundle.modules.for-each (m, idx) !->
        if m.id is tmp_dir_path
          bundle.modules.splice idx, 1
          to_process[p] = true

    # lastly, recompile all poems that were affected
    for p, v of to_process
      console.log 'process', p, poems[p].processing
      yield from process_poem p, resume.gen!

  src_watcher.on \add, genny.ev (path, st, resume) ->*
    # console.log \src.add, path
    yield from process_src path, resume.gen!

  src_watcher.on \unlink, (path) !->
    console.log \src.unlink, path
    if out_path = path_lookup[path]
      dest = Path.join tmp_dir, out_path
      console.log \src.unlinking, dest
      Fs.unlink dest, ->

  src_watcher.on \addDir, (path) !->
    console.log \src.addDir, path
    dest = Path.join tmp_dir, path
    Fs.mkdir dest, (err) !-> if err and err.code isnt \EEXIST => throw err

  src_watcher.on \unlinkDir, genny.ev (path, resume) ->*
    console.log \src.unlinkDir, path
    dest = Path.join tmp_dir, path
    yield rimraf dest, resume!

  src_watcher.on \ready !->
    console.log \src-ready
    Fs.symlink contracts_dir, (Path.join tmp_dir, 'contracts'), (err) !->
      if err and err.code isnt \EEXIST => throw err
      else console.log 'contracts symlinked'

    # init poems
    for p, poem of poems
      poem.processing = 0

    # =======================
    # =======================

    out_watcher = chokidar.watch out_dir, {
      ignore-initial: true
      # ignored: /[\/\\]\./
      cwd: out_dir
      always-stat: true
    }

    out_watcher.on \change, (path) !->
      console.log \out.change, path

    out_watcher.on \add, (path) !->
      console.log \out.add, path

    out_watcher.on \unlink, (path) !->
      console.log \out.unlink, path

    out_watcher.on \addDir, (path) !->
      console.log \out.addDir, path

    out_watcher.on \unlinkDir, (path) !->
      console.log \out.unlinkDir, path


    tmp_watcher = chokidar.watch tmp_dir, {
      # ignore-initial: true
      # ignored: /[\/\\]\./
      cwd: tmp_dir
      always-stat: true
    }


    tmp_watcher.on \change, genny.ev (path, st, resume) ->*
      # console.log \tmp.change, path
      yield from process_poem path, resume.gen!

    tmp_watcher.on \add, genny.ev (path, st, resume) ->*
      # console.log \tmp.add, path
      yield from process_poem path, resume.gen!

    tmp_watcher.on \unlink, (path) !->
      console.log \tmp.unlink, path

    tmp_watcher.on \addDir, (path) !->
      # console.log \tmp.addDir, path

    tmp_watcher.on \unlinkDir, (path) !->
      console.log \tmp.unlinkDir, path

  return null
, (err, res) !->
  if err => console.error "main error:", err.stack or err
  else if res => console.log res
