require! path: \Path
require! fs: \Fs

src_dir = Path.join __dirname, \src
tmp_dir = Path.join __dirname, \priv \build
out_dir = Path.join __dirname, \priv \static

poems =
  'plugins/booble-bobble.js':
    dest: 'plugins/booble-bobble.js'
    webpack:
      stuff: true
  # 'plugins/zibble-zabble.js':
  #   dest: 'plugins/zibble-zabble.js'
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
  'plugins/metatrons-compass.js':
    dest: 'plugins/metatrons-compass.js'
    css: 'plugins/metatrons-compass.css'
  'plugins/poke-her-starz.js':
    dest: 'plugins/poke-her-starz.js'
    css: 'plugins/poke-her-starz.css'
  # 'plugins/meatr.js':
  #   dest: 'plugins/meatr.js'




# ===========
# ===========

require! \sander
require! \rollup
require! \rollup-plugin-buble
require! \chokidar
require! \webpack
require! \postcss
EE = require \events .EventEmitter


sander.rimraf-sync tmp_dir
sander.mkdir-sync tmp_dir

sander.rimraf-sync out_dir
sander.mkdir-sync out_dir

emitter = new EE

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

# class Architect extends EE

rollup_cache = {}
rollup_opts =
  format: \umd
  plugins: [ rollup-plugin-buble {
    jsx: \h
    transforms:
      # for now we are going to use all ES6 features
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
  module:
    rules:
      * test: /.js$/
        loader: \source-map-loader
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
      throw new Error "source file does not have an extension"

    opts.ext = ext
    # opts.outfile = outfile
    opts.outfile = (opts.path.substr 0, opts.path.length - file.length) + outfile

  unless opts.ext
    opts.ext = ext
  return opts

path_lookup = {}

process_src = (path) !->
  origin = Path.join src_dir, path
  file = Path.basename path
  if file is \.DS_Store
    # console.log 'deleting', path
    return sander.rimraf origin
  opts = get-opts {path}
  # console.log \src.opts, opts
  path_lookup[path] = opts.outfile
  dest = Path.join tmp_dir, opts.outfile
  txt = Fs.readFileSync origin, \utf-8
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

      output = if opts.json => res else res.code
    catch e
      console.error e

  | \js =>
    # for now, no transformations are done...
    output = txt

  | \coffee-script =>
    throw new Error "coffee-script not yet implemented"

  | otherwise =>
    # console.log "#{opts.lang} not yet implemented"
    # console.log opts
    output = txt

  # if opts.result
  #   opts.ast.makeReturn!
  #
  # opts.output = opts.ast.compileRoot options
  # if opts.result
  #   process.chdir Path.dirname opts.path
  #   opts.output = LiveScript.run opts.output, options, true
  #   process.chdir CWD

  if output
    # console.log "writing:", dest
    Fs.write-file-sync dest, output, \utf-8

process_css = (path) !->
  # NEEEDS IMPROVEMENT!!!
  switch ext = Path.extname path
  | \.css =>
    console.log \process_css, path
    # prolly should do some postcss magic or something... I hate this build shit so much!
    src = Path.join tmp_dir, path
    dest = Path.join out_dir, path
    sander.write-file dest, (Fs.read-file-sync src)

process_poem = (path) !->
  if not (poem = poems[path]) or poem.processing
    return # process_css path # console.log "could not process #{path}"
  poem.processing = true
  console.log \process_poem, path
  # src_dir = Path.dirname Path.join src_dir, path
  src = Path.join tmp_dir, path
  webpack_src = Path.join tmp_dir, '.' + path
  dest = Path.join out_dir, poem.dest

  # -------

  cache = rollup_cache[path]
  opts = {} <<< rollup_opts <<< {
    entry: src
    cache: cache
    dest: webpack_src
  }

  rollup.rollup opts
    .then (bundle) ->
      rollup_cache[path] = bundle
      # console.log \poem, dest
      console.log \mods, bundle.modules.length
      # for m in bundle.modules
      #   console.log m.id

      output = bundle.generate opts
      map = output.map
      code = output.code + "\n//# sourceMappingURL=#{Path.basename dest}.map\n"
      # code = output.code + "\n//# sourceMappingURL=#{map.toUrl!}\n"

      Promise.all [
        sander.write-file webpack_src, code
        sander.write-file "#{webpack_src}.map", map.to-string!
      ]
    .then !->
      opts = {} <<< webpack_opts <<< {
        # entry: src
        # context: Path.dirname Path.join src_dir, path
        entry: webpack_src
        # resolve:
        #   # extensions: <[.js .json]>
        #   modules:
        #     * \node_modules
        #     * Path.dirname src
        #     * Path.dirname Path.join src_dir, path
        output:
          path: Path.dirname dest
          filename: Path.basename dest
      }
      # console.log "resolve:", opts.resolve
      # console.log "context:", opts.context

      compiler = webpack opts
      compiler.run (err, stats) !->
        # poem.processing = false
        if err => throw err
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
    .catch (e) ->
      # console.log \catch, e.message.substr 0, 1000
      console.log 'error compiling', poem.dest
      console.log if e.to-string => e.to-string! else e.stack
      poem.processing = false
    .then ->
      if path = poem.css
        POSTCSS_PLUGINS = [
          require 'postcss-import'
          require 'precss'
          require 'postcss-color-function'
          (require 'autoprefixer')(browsers: ['last 2 versions'])
        ]
        src = Path.join tmp_dir, path
        postcss POSTCSS_PLUGINS .process (Fs.read-file-sync src)
          .then (res) ->
            dest = Path.join out_dir, path
            sander.write-file dest, res.css
    .then !->
      console.log "poem written:", dest
      poem.processing = false



src_watcher = chokidar.watch src_dir, {
  # ignore-initial: true
  # ignored: /[\/\\]\./
  cwd: src_dir
  # always-stat: true
}

src_watcher.on \change, (path) !->
  console.log \src.change, path
  process_src path
  tmp_dir_path = Path.join tmp_dir, path
  for p, poem of poems
    if poem.css is path
      process_poem p

  for p, bundle of rollup_cache
    for m in bundle.modules
      if m.id is tmp_dir_path and poems[p]
        process_poem p
  # readFile
  # if length or sha1 contents are different, process it
  # sander.copyFile

src_watcher.on \add, (path) !->
  # console.log \src.add, path
  process_src path

src_watcher.on \unlink, (path) !->
  console.log \src.unlink, path
  if out_path = path_lookup[path]
    dest = Path.join tmp_dir, out_path
    console.log \src.unlinking, dest
    Fs.unlink dest, ->

src_watcher.on \addDir, (path) !->
  console.log \src.addDir, path
  # src_watcher.add path
  dest = Path.join tmp_dir, path
  Fs.mkdir dest, (err) !->
    if err and err.code isnt \EEXIST
      throw err

src_watcher.on \unlinkDir, (path) !->
  console.log \src.unlinkDir, path
  dest = Path.join tmp_dir, path
  Fs.rmdir dest, ->

<-! src_watcher.on \ready
console.log \src-ready

# =======================
# =======================

out_watcher = chokidar.watch out_dir, {
  ignore-initial: true
  # ignored: /[\/\\]\./
  cwd: out_dir
  # always-stat: true
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
  # always-stat: true
}


tmp_watcher.on \change, (path) !->
  # console.log \tmp.change, path
  process_poem path

tmp_watcher.on \add, (path) !->
  # console.log \tmp.add, path
  process_poem path

tmp_watcher.on \unlink, (path) !->
  console.log \tmp.unlink, path

tmp_watcher.on \addDir, (path) !->
  console.log \tmp.addDir, path

tmp_watcher.on \unlinkDir, (path) !->
  console.log \tmp.unlinkDir, path
