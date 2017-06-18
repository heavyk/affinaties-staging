function rand (max, min = 0)
  min + Math.floor Math.random! * (max - min)

function rand2 (max, min = 0)
  diff = max - min
  min + Math.round Math.sqrt (Math.random! * diff * diff)

function random-id (dd)
  if len = dd.length
    dd[Math.floor Math.random! * len].id
  else dd.id

function random-el (dd)
  if len = dd.length
    dd[Math.floor Math.random! * len]
  else dd

function random-ids (dd, count)
  c = if count >= 0 then count else rand dd.length, 1
  ids = []
  if c > 0 and dd.length
    i = rand dd.length
    while ids.length < c
      if not ~(ids.index-of id = dd[i % dd.length].id) and id
        ids.push id
      i += 1 + rand dd.length
  ids

function random-pos
  do => pos = Math.round (Math.random! * 4) - 2
  while pos is 0
  pos

function random-date (days = 0, hours = Math.random! * 24, mins = Math.random! * 60, secs = Math.random! * 60)
  Math.round Date.now!                                  \
    - (( (0.5 + Math.random!) * 1000 * 60 * 60 * 24 ) * days  ) \
    - (( (0.5 + Math.random!) * 1000 * 60 * 60      ) * hours ) \
    - (( (0.5 + Math.random!) * 1000 * 60           ) * mins  ) \
    - (( (0.5 + Math.random!) * 1000                ) * secs  )

function in-time (days = 0, hours = 0, mins = 0, secs = 0)
  ( 1000 * 60 * 60 * 24 * days  ) +
  ( 1000 * 60 * 60      * hours ) +
  ( 1000 * 60           * mins  ) +
  ( 1000                * secs  )

function random-charactor
  xx='' ; while (xx += Math.random!.to-string 32 .substr 2)length <= it => true
  xx.substr 0, it

function random-hex
  xx='' ; while (xx += Math.random!.to-string 16 .substr 2)length <= it => true
  xx.substr 0, it


lipsum-data = <[ Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum ]>

# also kin has some neat things for model data

function between (min, max)
  if min > max
    temp = min
    min = max
    max = temp
  # Math.random! * (max - min + 1) + min
  min + (Math.random! * (max - min))

make-obj = (schema, entity_list, entity_index) ->
  m = {}
  for field in schema
    switch field.type
    | \str \string =>
      m[field.name] = make-string field.value, field.prefix, field.suffix, entity_index
    | \int =>
      m[field.name] = Math.floor between field.min, field.max
    | \float =>
      m[field.name] = between field.min, field.max
    | \obj \object =>
      m[field.name] = make-obj entity_list[field.entity], entity_list
    | \arr \list =>
      m[field.name] = make-list entity_list[field.entity], entity_list, field.count
    | \rand \random \randomselection =>
      m[field.name] = selectrandom field.options
    | \lipsum =>
      m[field.name] = lipsum field.min, field.max
  m

make-list = (schema, entity_list, count) ->
  instances = []
  while count > instances.push make-obj schema, entity_list, instances.length
    continue
  instances

make-string = (value, prefix, suffix, index) ->
  s = value || ''
  if prefix
    if prefix.index
      s = (index || 0) + s
    else
      s = (~~between prefix.begin || 0, prefix.end || 100) + s
  if suffix
    if suffix.index
      s += index || 0
    else
      s += ~~between suffix.begin || 0, suffix.end || 100
  s

function lipsum (min, max)
  i = ~~between 0, lipsum-data.length - 1
  n = ~~between min || 8, max || 16
  j = i + n
  (lipsum-data.slice i, j).join ' '

selectrandom = (options) ->
  i = ~~between 0, options.length - 1
  options[i]

function word (config, many, callback)
  switch typeof many
  | \function =>
    callback null, lipsum config.schema, config.entities
  | \number =>
    for i til many => lipsum config.schema, config.entities
  | otherwise =>
    throw new Error "you called me wrong... (config[, many], callback)"


function obj (config, many, callback)
  switch typeof many
  | \function =>
    callback null, make-obj config.schema, config.entities
  | \number =>
    callback null, for i til many => make-obj config.schema, config.entities
  | otherwise =>
    throw new Error "you called me wrong... (config[, many], callback)"

# exports.interval = (config, callback) ->
#   setInterval ->
#     m = make-obj config.schema, config.entities
#     callback m
#   , config.interval
# exports.end = (interval_id) ->
#   clearInterval interval_id

``export { rand, rand2, randomId, randomEl, randomIds, randomPos, randomHex, randomCharactor, randomDate, inTime, between, lipsum, word, obj }``
