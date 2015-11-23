
// bump this number if you need to purge localStorage
let VERSION = '1'

import router from './router'
import local from './local'

// TODO move this out of here and make an abstration of api (so it's not so specific)
// generic containers
import category_ from './api/category'
import tag_ from './api/tag'
// my stuff
import opinion from './api/opinion'
import affinaties from './api/affinaties'
import notifier from './api/notifier'
// import relation_ from './api/relation'

let CronTab = require('crontabjs')
let Ractive = require('ractive')

function hashCode(str) {
  var hash = 0;
  if (str.length == 0) return hash
  for (var i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

let Api = Ractive.extend({
  data: {
    authenticated: false,
    connected: false,
  },
    url: (function() {
      try {
        let host = window.location.host

        // kenny's local dev
        if (host === 'localhost:1111') {
          switch(window.localStorage.host) {
            case 'term': return 'http://5.9.94.75:1158' // action-terminal
            case 'local': return 'http://localhost:1155' // local
            default:
            case 'mothership': return 'http://5.9.94.75:1155' // normal
          }
        }

        // rest of the world
        return ( host === '127.0.0.1'
          || host.indexOf('localhost') === 0
          || host.indexOf('192.168') === 0
        ) ? 'http://5.9.94.75:1155'
          : window.location.origin
      } catch(e) {}
    }()),
  my: {
    affinaties: new affinaties,
    notifier: new notifier,
  },
  oninit () {
    this.delay = 0 // set this higher to simulate network delay
    this._token = hashCode(this.url + ':token')
    this.token = window.localStorage.getItem(this._token)
    this.rolex = new CronTab(20000)
    let store = 'affinaty_'+hashCode(this.url)
    this.local = local.createInstance({
      name: store,
      storeName: store,
    })
    let version = window.localStorage.affinaty_version
    if (version !== VERSION) this.local.clear(() => {
      console.warn(`upgraded from version ${version} -> ${VERSION}`)
      window.localStorage.affinaty_version = VERSION
    })
    this.observe('me', (me, _me) => {
      this.me = me
      this.initialize(me, _me)
    })
    this.local.getItem('me', (err, val) => {
      if (err || !this.token) return this.signOut()
      this.set('me', val)
    })
    this.client = new ActionheroClient({ url: this.url })
    this.client.on('connected', () => this.set('connected', Date.now()))
    this.client.on('disconnected', () => this.set('connected', 0))
    // reconnecting logic?
    this.client.connect(() => {
      if (this.token) this.client.action('who-am-i', {token: this.token}, (res) => {
        if (res.data) {
          this.whoIaM(res.data)
        } else {
          this.signOut()
        }
      })
    })
  },
  signIn (data) {
    this.mundial = data.mundial
    this.token = data.token
    window.localStorage.setItem(this._token, data.token)
    return this.whoIaM(data.mundial[0])
  },
  whoIaM(me) {
    return this.local.setItem('me', me, (err) => {
      if (!err) this.set('me', me)
      this.set('authenticated', true)
    })
  },
  signOut (redirect) {
    window.localStorage.removeItem(this._token)
    this.local.removeItem('me')
    this.set('me', null)
    if (redirect) router.dispatch('/')
    this.set('authenticated', false)
  },
  action (action, params, resolve, reject) {
    const start = Date.now()
    let _params = {}
    for (var k in params) {
      if (params.hasOwnProperty(k) && params[k] != null) {
        _params[k] = params[k]
      }
    }
    console.log('action:', action, _params)
    if (!this.token)
      // TODO - instead of redirecting to the login page, we should just show a login modal
      this.signOut(true)
    else _params.token = this.token

    return new Ractive.Promise((_resolve, _reject) => {
      let respond = (res) => {
        const now = Date.now()
        // api.log.unshift({
        //   action: action,
        //   params: _params,
        //   response: res,
        //   duration: now - start,
        //   time: now
        // })
        setTimeout(() => {
          console.log('response:', action, _params, res)
          if (res.error) {
            // this is temporary
            // TODO: remember the time that the session has existed and either forward to landing or make a popup
            // TODO: delete me
            if (~res.error.indexOf('you should sign-in')) {
              if (router.uri.path !== '/') router.redirect('/')
              return
            }
            // TODO: log errors
            if (reject) reject(res.error)
            else _reject(res.error)
          } else {
            _resolve(res.data)
            if (resolve) resolve(res.data)
          }
        }, this.delay)
      }

      if (this.client.state !== 'connected') {
        this.client.once('connected', () =>  {
          setTimeout(() => {
            if (this.delay) setTimeout(() => {
              this.client.action(action, _params, respond)
            }, this.delay)
            else this.client.action(action, _params, respond)
          }, 1)
        })
      } else {
        if (this.delay) setTimeout(() => {
          this.client.action(action, _params, respond)
        }, this.delay)
        else this.client.action(action, _params, respond)
      }
    })
  },
  initialize (me, _me) {
    if (me) {
      // my.* initialization
      if (!api.my.opinion || api.my.opinion.creator !== me._id)
        api.my.opinion = new opinion(me._id)
      // if (!api.my.relation || api.my.relation.creator !== me._id)
      //   api.my.relation = new relation_(me._id)
      // if (!api.my.debate || api.my.debate.creator !== me._id)
      //   api.my.debate = new debate_(me._id)

      // other initialization
      if (!api.category)
        api.category = new category_
      if (!api.tag)
        api.tag = new tag_
    }
  },
})

let api = new Api
export default api