
import api from '../api'
import local from '../local'
import assign from '../lib/lodash/object/assign'
import isEqual from '../lib/lodash/lang/isEqual'
import Ambition from '../lib/insightful/consciousness/ambition'
import { insert } from '../lib/ordered-array'

class opinion_ extends Ambition {
  constructor (creator) {
    super()
    this.situations = {
      '/': {
        '>' () {
          this.skip = this['+created']
        }
      }
    }

    this.exists = {}
    this.creator = creator
    this.list = []
    this.skip = 0
    this.sort = true
    this.keys = [
      'opinion:'+creator,
      'opinion:'+creator+':+created',
      'opinion:'+creator+':-created',
    ]
    this.query = assign({}, {
      sort: '+created',
      limit: 100,
      creator: creator,
    })

    api.local.getItems(this.keys, (err, data) => {
      if (data && data[this.keys[0]]) {
        // PUT ME BACK KENNY
        // for (var i = 0; i < data[this.keys[0]].length; i++)
        //   this.insert(data[this.keys[0]][i])

        this.skip = this['+created']
        // if (skip > 1321052100000) this.skip $gt {}
        this.now('/')
      }

      this.go()
    })
    // api.local.getItem('opinion*:' + creator, (err, data) => {
    //   if (data) {
    //     for (var i = 0; i < data.length; i++)
    //       this.insert(data[i])
    //     this.skip += data.length
    //   }
    // })

    // this.go()
  }
  insert (d, silent) {
    let loc = this.exists[d._id]
    if (!this['+created'] || this['+created'] > d.created) this['+created'] = d.created
    if (!this['-created'] || this['-created'] < d.created) this['-created'] = d.created
    if (loc === void 0) {
      this.exists[d._id] = insert(d, this.list, (a, b) => b.created > a.created ? 1 : -1)
      // console.info('not found', d._id)
      if (!silent) {
        this.emit(d.debate + '.' + d.creator, d)
        this.emit(d.creator + '.' + d.debate, d)
      }
    } else {
      let _d = this.list[loc]
      // console.info('found', _d, d._id)
      if (!isEqual(_d, d)) {
        // console.info('updating', !silent, JSON.stringify(_d), JSON.stringify(d))
        let __d = assign({}, _d)
        assign(_d, d)
        if (!silent) {
          this.emit(d.debate + '.' + d.creator, d, __d)
          this.emit(d.creator + '.' + d.debate, d, __d)
          this.emit(d._id, d, __d)
        }
      }
    }
  }

  get fetched () {
    return this.skip > 1321052100000
  }

  go (next) {
    let query = this.query
    let creator = this.creater
    let list = this.list
    // TODO change the queries to go based on time
    api.action('opinion*', assign({skip: this.skip}, query), (data) => {
      let silent = this.skip < 1321052100000
      for (var i = 0; i < data.length; i++)
        this.insert(data[i], silent)

      // eg. get all >= created
      this.skip += data.length
      if (next) next()
      if (data.length === this.query.limit) setTimeout(() => { this.go() }, 100)
      else this.now('/')

      api.local.setItems({
        ['opinion*:'+this.creator]: list
      }).then(() => {
        console.log('saved opinions into local')
      }).catch((err) => {
        console.error('setItems error', err)
      })
    })
  }

  debate_pos (debate) {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].debate === debate) return +this.list[i].pos
    }
    return 0
  }

  create (target, pos) {
    return api.action('opinion!', assign({pos: pos}, target), (data) => {
      this.insert(data.opinion)
      api.my.affinaties.update(data.affinaties)
    })
  }

  debate (debate) {
    // TODO - I think this can use this.list[this.exists[debate]]
    // actually, it needs this.exists to be updated on insert / remove
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].debate === debate) return this.list[i]
    }
  }
}

export default opinion_
