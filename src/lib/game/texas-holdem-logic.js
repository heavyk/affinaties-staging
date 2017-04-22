import { value, number, object, transform, compute } from '../dom/observable'
import { prompter } from '../dom/observable-logic'
import { ObservableArray } from '../dom/observable-array'
import { rankHandInt } from './rank-hand'
import { shuffled_deck } from './deck'
import round from '../lodash/round'

class Playa {
  constructor (name, chips) {
    this.name = value(name)
    this.chips = number(chips)
    this.state = value() // folded, all-in, playing
    this.cards = new ObservableArray
    this.prompt = prompter((msg, options, response) => {
      // TODO: wait for 'server' to reply back with the response...
      // TODO: fix all-in prize division. uncomment to test
      // if (options.cards.length) return setTimeout(() => { response('all-in') }, 100)

      let board_rank = rankHandInt(options.cards)
      let hand_rank = rankHandInt(this.cards.concat(options.cards))
      console.log(this.name(), msg, 'min:', options.min, hand_rank.t, hand_rank.v, hand_rank.v / board_rank.v)
      if (msg === 'bet') setTimeout(() => { response(Math.random() < 0.7 ? 'call' : 'fold') }, 100)
      else if (msg === 'raise') {
        let bet = round(options.min + (Math.random() * 1.5 * options.min), -1)
        setTimeout(() => { response(Math.random() > 0.5 ? (bet > this.chips() ? 'all-in' : bet) : 'call') }, 100)
      }
      // TODO: use rankHandInt to evaluate whether I should bet or not.
      // TODO: implement a basic AI which makes decisions also based on others' bets (and their possible hand hank)
    })
  }
}

class Game {
  constructor (smallBlind, bigBlind, playaz) {
    this.smallBlind = smallBlind
    this.bigBlind = bigBlind
    this.playaz = playaz
    this.pot = number()
    this.bets = new ObservableArray
    this.prevBets = new ObservableArray
    this.moves = new ObservableArray
    this.board = new ObservableArray
    this.deck = []
    this.reset()
  }

  reset () {
    var deck = shuffled_deck()

    this.deck.splice.apply(this.deck, [0, this.deck.length].concat(deck))
    this.pot(0)
    // this.roundName = 'Deal' // Start the first round
    // this.betName = 'bet' // bet,raise,re-raise,cap
    this.bets.empty()
    this.prevBets.empty()
    this.moves.empty()
    this.board.empty()
  }

  playaBetTotal (i) {
    var b, total = 0
    for (b of this.moves) {
      if (b.i === i) total += Math.abs(b.v)
    }
    return total
  }
}

export function holdem_table (config = {}) {
  const state = value('waiting')

  // config
  const smallBlind = number(config.smallBlind)
  const bigBlind = number(config.bigBlind)
  const minPlayaz = number(config.minPlayaz)
  const maxPlayaz = number(config.maxPlayaz)
  const minBuyIn = number(config.minBuyIn)
  const maxBuyIn = number(config.maxBuyIn)

  const timeout = number(config.timeout || 11111) // default 11s timeout

  // values
  const game = value(null)
  const playaz = new ObservableArray
  const observz = new ObservableArray
  const betz = new ObservableArray
  const dealer_idx = value(0)
  const sb_idx = compute([dealer_idx, playaz.obv_len], (dealer, num_playaz) => (dealer + 1) % num_playaz)
  const bb_idx = compute([dealer_idx, playaz.obv_len], (dealer, num_playaz) => (dealer + 2) % num_playaz)
  const cur_playa = value()
  const min_bet = number()
  const active_playaz = number()
  const all_in_playaz = number()

  var _game

  // functions
  var F = {
    addPlaya: (name, chips) => {
      if (playaz.length >= maxPlayaz()) return 'max playaz reached'
      if (chips > maxBuyIn()) return 'too many chips to buy in'
      if (chips <= minBuyIn()) return 'not enough chips to buy in'

      var p = new Playa(name, chips)
      playaz.push(p)
      // p.show('join game?')
      // get prompt replies
      let unprompt = p.prompt((res, msg, options) => {
        // TODO: capped bets
        let chips = p.chips()
        let min = min_bet()
        let i = playaz.indexOf(p)

        if (res === 'fold') {
          p.cards.empty()
          p.state('folded')
          go_next(i, false)
        } else if (res === 'call') {
          if (chips < min) {
            p.chips(0)
            p.state('all-in')
            go_next(i, -chips)
          } else {
            p.chips(chips - min)
            p.state('playing')
            go_next(i, min)
          }
        } else if (res === 'all-in') {
          p.chips(0)
          p.state('all-in')
          go_next(i, -chips)
        } else {
          let bet = +res
          if (bet >= min) {
            p.chips(chips - bet)
            p.state('playing')
            go_next(i, bet)
          } else {
            options.min = min
            p.prompt('bet', options)
          }
        }
      })

      return p
    },
    startGame: () => {
      var num = playaz.length
      if (num > minPlayaz()) {
        // TODO: send a starting game notification
        _game = new Game(smallBlind(), bigBlind())
        _game.d_idx = dealer_idx
        _game.sb_idx = sb_idx
        _game.bb_idx = bb_idx
        _game.cur = cur_playa
        _game.min = min_bet
        _game.state = state
        game(_game)
        state('deal')
        all_in_playaz(0)
        active_playaz(num)
      }

      return game()
    },
    add_playa: (p) => {
      if (playaz.length < maxPlayaz()) {
        p.show('join game?')
      } else {
        // return false
      }
    },
    join_game: (p) => {
      if (playaz.length < maxPlayaz()) {
        observz.remove(p)
        playaz.push(p)
        p.show('leave game?')
        if (playaz.length >= minPlayaz()) {
          // this.emit
          // start game?
          // TODO: start game goes by consensus or it has a table leader (dealer?)
          playaz[dealer_idx()].prompt('start game?')
        }
      } else {
        // return false
      }
    }
  }

  let goto_next_round = () => {
    let s = state()
    state(s === 'deal' ? 'flop' : s === 'flop' ? 'turn' : s === 'turn' ? 'river' : 'showdown')
  }

  let calc_winners = () => {
    var r, p, i = 0, m = playaz.length
    var ranks = []
    var pot = _game.pot()
    console.info('pot', pot)
    for (; i < m; i++)
      if ((p = playaz[i]).state() !== 'folded')
        ranks.push({i, v: rankHandInt(_game.board.concat(p.cards)) })

    if (ranks.length > 1) {
      // the long way...
      ranks.sort((a, b) => b.v.v - a.v.v)
      var winners = [r = ranks[0]]
      var prizes = {}
      var part, remain
      var calc_parts = () => {
        var n = winners.length - Object.keys(prizes).length
        part = Math.floor(pot / n)
        remain = pot % n
      }

      // pick the top ranks which are equal
      for (i = 1, m = r.v.v; i < ranks.length; i++) {
        if ((r = ranks[i]).v.v === m) winners.push(r)
        // else break // not really necessary
      }

      calc_parts()
      // first calc prizes for all-in playaz
      for (r of winners) {
        if (playaz[r.i].state() === 'all-in') {
          // calc max winning amount
          m = r.max = _game.playaBetTotal(r.i)
          if (m < part) {
            // if max is less than the pot partition
            prizes[r.i] = r.prize = m
            pot -= m
            calc_parts()
          }
        }
      }

      // apply prizes for each non all-in winners
      for (r of winners) if (!r.max) prizes[r.i] = part

      // for all remaining chips, add them to each non all-in winner's prize
      while (remain > 0) {
        for (r of winners) if (!r.max) prizes[r.i]++, remain--
      }

      // award prizes to winners
      for (r of winners) {
        p = playaz[r.i]
        p.state('winner')
        p.chips.add(prizes[r.i])
        console.info(p.name(), 'awarded', prizes[r.i])
      }

      // for showdown, list winners and losers
      for (r of ranks) {
        p = playaz[r.i]
        if (p.state() !== 'winner') p.state('loser')
        console.info(p.name(), p.state(), r.v.v, r.v.t)
      }
    } else {
      r = ranks[0]
      p = playaz[r.i]
      p.state('winner')
      p.chips.add(pot)
      console.info('one winner', p.name(), r.v.v, r.v.t)
    }

    // TODO: add winners to game
    // _game.pot(0)
    cur_playa(false)
    state('done')
  }

  let elligible_playa = (cur) => {
    var min = min_bet()
    var len = playaz.length
    for (var j = 1; j < len; j++) {
      let k = (cur + j) % len
      let b = _game.bets[k]
          // has not yet talked
      if (b === null ||
          // has already bet, but it's still below the minimum bet
         (typeof b === 'number' && b >= 0 && b < min) ||
          // exception to allow for bb to attempt to go again
         (state() === 'deal' && k === bb_idx())) return k
    }
    return -1
  }

  let go_next = (i, bet) => {
    var next, existing_bet = _game.bets[i] || 0
    if (typeof existing_bet !== 'number') debugger
    if (typeof bet === 'number') {
      bet -= existing_bet
      _game.bets.set(i, (bet > 0 ? bet : -bet) + existing_bet)
    } else { // bet === false
      if (bet !== false) debugger
      _game.prevBets.set(i, _game.prevBets[i] + existing_bet)
      _game.bets.set(i, bet)
    }

    _game.moves.push({i, v: bet, t: Date.now()})
    console.info(i, playaz[i].name(), bet === false ? 'folded' : bet < 0 ? `went all-in (${-bet})` : `bet (${bet})`)

    if (bet === false) active_playaz.add(-1)
    else if (bet < 0) all_in_playaz.add(1)

    var min = min_bet()
    if (bet > min) min_bet(bet)
    else if (-bet > min) min_bet(-bet)

    if (active_playaz() < 2) {
      // everyone else has folded, so calculate the only winner and end the game
      calc_winners()
    } else if (~(next = elligible_playa(i))) {
      setTimeout(() => { cur_playa(next) }, 100)
    } else {
      // end of round
      // add bets to pot & reset bets to null (if not folded or all-in)
      var j = 0, pot = 0, b
      for (; j < playaz.length; j++) {
        bet = _game.bets[j]
        if (typeof bet === 'number') {
          // we add all-in and bets to the pot
          pot += (b = bet > 0 ? bet : -bet)
          if (b > 0) _game.prevBets.set(j, _game.prevBets[j] + b)
          _game.bets.set(j, bet >= 0 ? null : true)
        }
      }

      // increase the pot
      if (pot !== 0) {
        console.info('addding', pot, 'to the pot')
        _game.pot.add(pot)
      }

      // jump to the next stage
      goto_next_round()
    }
  }

  cur_playa((i) => {
    if (typeof i === 'number') {
      var p = playaz[i]
      var min = min_bet()
      var bet = _game.bets[i]

      if (typeof bet !== 'boolean') {
        p.state('waiting')
        // TODO: add timeout & fold if timed out (I think this is the correct punishment, anyway)
        p.prompt(bet >= min && bet > 0 ? 'raise' : 'bet', {min, cards: _game.board.slice(0), timeout: timeout()}, () => { go_next(i, false) })
      } else {
        console.log ('active:', active_playaz(), 'all-in:', all_in_playaz())
        if (active_playaz() === all_in_playaz()) goto_next_round()
        else cur_playa((i+1) % playaz.length)
      }
    // } else if (i === false) {
    //   // game done
    }
  })


  state((s, _s) => {
    // waiting, start_game, playing, game_done
    min_bet(0)
    if (_game) _game.moves.push({s, t: Date.now()})
    let dealer = dealer_idx()
    switch (s) {
      case 'waiting':
        // TODO: waiting for enough playaz to join - give them prompts n'stuff
      break

      // in-game states:
      case 'deal':
        let l = playaz.length
        let sb = (dealer + 1) % l // move this to transform
        let bb = (dealer + 2) % l // move this to transform
        for (let i = 0; i < l; i++) {
          let playa = playaz[i]
          let bet = i === sb ? _game.smallBlind : i === bb ? _game.bigBlind : 0
          _game.bets.push(bet)
          _game.prevBets.push(0)
          if (bet) playa.chips(playa.chips() - bet)
          playa.cards.empty()
          _game.deck.pop() // burn one
          playa.cards.push(_game.deck.pop())
          _game.deck.pop() // burn one
          playa.cards.push(_game.deck.pop())
        }

        // set min bet to BB
        min_bet(_game.bigBlind)
        // start one to the left of the BB
        cur_playa.set((bb + 1) % l)
      break
      case 'flop':
        // put first three cards in the spaces (3)
        _game.deck.pop() // burn one
        _game.board.push(_game.deck.pop())
        _game.deck.pop() // burn one
        _game.board.push(_game.deck.pop())
        _game.deck.pop() // burn one
        _game.board.push(_game.deck.pop())
        console.log('effective flop', 'next round in 2s')
        setTimeout(() => { cur_playa.set(dealer + 1) }, 2000)
      break
      case 'turn':
        // pull one card and put in space (4)
        _game.deck.pop() // burn one
        _game.board.push(_game.deck.pop())
        console.log('effective turn', 'next round in 2s')
        setTimeout(() => { cur_playa.set(dealer + 1) }, 2000)
      break
      case 'river':
        // pull one card and put in space (5)
        _game.deck.pop() // burn one
        _game.board.push(_game.deck.pop())
        console.log('effective river', 'next round in 2s')
        setTimeout(() => { cur_playa.set(dealer + 1) }, 2000)
      break
      case 'showdown':
        console.log('SHOWDOWN!!!')
        // TODO: send a show cards event
        calc_winners()
      break
      case 'done':
        // var g = game()
        // return the playaz back into the table?
        // for (let p of playaz) {
        //   p.emit('leave table?')
        // }
      break
    }
  })

  return F
}

// function holdem_game (playaz, smallBlind, bigBlind) {
//   const state = value('deal')
//   const smallBlind = value(smallBlind)
//   const bigBlind = value(bigBlind)
//
//   state((s, _s) => {
//     switch (s) {
//       case 'add_playaz':
//         // a
//         // state()
//       break
//       case 'new_round':
//         // a
//       break
//     }
//   })
//
// }
