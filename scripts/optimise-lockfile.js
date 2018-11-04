
const yarn_lock = `${__dirname}/../yarn.lock`
const updates = {
  'ms@^2': 'ms@2',
  'debug@^2': 'debug@2',
  'debug@^3': 'debug@3'
}

const fs = require('fs')
const lockfile = require('@yarnpkg/lockfile')
const semver = require('semver')

let file = fs.readFileSync(yarn_lock, 'utf8')
let json = lockfile.parse(file)

function find_pkg (pkg) {
  let biggest = null
  let [pkg_name, pkg_ver] = pkg.split('@')

  for (let query in json.object) {
    let [query_pkg, query_ver] = query.split('@')
    let dep = json.object[query]

    if (pkg_name === query_pkg && semver.intersects(dep.version, pkg_ver)) {
      if (!biggest || semver.gt(dep.version, biggest.version)) {
        biggest = dep
      }
    }
  }

  return biggest
}

for (let query in json.object) {
  let [query_pkg, query_ver] = query.split('@')
  let dep = json.object[query]
  let dep_ds = dep.dependencies

  for (let update_q in updates) {
    let update = updates[update_q]
    if (typeof update === 'string') {
      let [up_name, up_ver] = update_q.split('@')
      if (up_name === query_pkg && semver.intersects(dep.version, up_ver, true)) {
        json.object[query] = find_pkg(update)
      }
    } else if (typeof update === 'object') {
      // update the dependencies
      // ...
      // delete if null
      // replace otherwise
    } else {
      throw 'unknown update kind: ' + update
    }
  }

  if (query_pkg === 'debug') console.log(query_pkg, '--', query_ver, '::', json.object[query].version)
}

fs.writeFileSync(yarn_lock, lockfile.stringify(json.object))
