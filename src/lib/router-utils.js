export function pathVars (path) {
  let m = path.match(/\/:\w+/g)
  return m ? m.map((name) => name.substr(2)) : []
}

export function pathToRegExp (path) {
  return new RegExp(
    pathToRegExpString(path)
      .replace(/^\^(\\\/)?/, '^\\/?')
      .replace(/(\\\/)?\$$/, '\\/?$'),
    'i'
  )
}

export function pathToStrictRegExp (path) {
  return new RegExp(pathToRegExpString(path))
}

function pathToRegExpString (path) {
  return ('^' + path + '$')
    .replace(/\/:\w+(\([^)]+\))?/g, '(?:\/([^/]+)$1)')
    .replace(/\(\?:\/\(\[\^\/]\+\)\(/, '(?:/(')
    .replace(/\//g, '\\/')
}
