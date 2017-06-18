Path = require \path
require! \fs
require! \genny

genny.run (resume) ->*
  _last-names = yield fs.read-file (Path.join __dirname, \.. \data \last-names.txt), \utf-8, resume!
  _female-names = yield fs.read-file (Path.join __dirname, \.. \data \female-names.txt), \utf-8, resume!
  last-names = _last-names.trim!.split \\n .map (d) ->
    dd = d.split ' / '
    name: dd.0.trim!
    freq: (dd.1.trim!replace /\./g, '') * 1
    origin: dd.2.trim!
  female-names = _female-names.trim!.split \\n .map (d) ->
    # name: d.0.to-upper-case! + d.substr 1
    d.0.to-upper-case! + d.substr 1
  # make-name = ->
  #   female-names[rand female-names.length].name + ' ' + last-names[rand last-names.length].name

  yield fs.write-file (Path.join __dirname, \.. \data \names.json), (JSON.stringify {female-names, last-names}, null, 2), resume!
