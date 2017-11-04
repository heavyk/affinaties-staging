const msgpack = require('msgpack-lite')
const Rpc = require('rpc-engine')
const RpcEvents = require('rpc-events')
const WebSocketServer = require('uws').Server
const genny = require('genny')


let wss = new WebSocketServer({ port: 3000 })

var list = []

function verifyDataObj (data) {
  if (typeof data !== 'object') throw new Error('not an object')
  if (!data.id || data.id.length !== 20) data.id = _id()
}

wss.on('connection', function (ws) {
  console.log('new connection!')
  var client = new RpcEvents({
    send: ws.send.bind(ws),
    // easier for debugging
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    // serialize: msgpack.encode,
    // deserialize: (d) => msgpack.decode(new Uint8Array(d)),
  })
  client.setInterface('list', {
    get (cb) {
      cb(null, list)
    },
    add (n, cb) {
      var c = list.push(n)
      if (cb) cb(null, c)
    },
    rm (idx, cb) {
      cb(null, list.slice(idx, 1))
    }
  })

  client.setInterface('project', {
    new: genny.fn(function* (data, resume) {
      // TODO: validation
      verifyDataObj(data)
      yield* db.project.insert(data, resume)
    })
  })

  // ws.on('message', (msg) => {
  //   console.log('got msg:', msg)
  //   client.receive(msg)
  // })
  ws.on('message', client.receive)
})
