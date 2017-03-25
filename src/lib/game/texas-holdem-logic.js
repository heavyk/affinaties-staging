import { value, object, transform, compute } from '../dom/observable'
import { prompter } from '../dom/observable-logic'
import { ObservableArray } from '../dom/observable-array'
import { rankHandInt } from './rank-hand'

class Player {
  constructor (name, chips) {
    this.name = value(name)
    this.chips = value(chips)
    this.state = value(null) // folded, all-in, playing
    this.cards = new ObservableArray
    this.prompt = prompter((msg, options, response) => {
      // TODO: wait for 'server' to reply back with the response...
      // TODO: for my playa, set_responder to something that makes UI elements
      console.log(this.name(), msg, options)
      if (msg === 'bet') setTimeout(() => { response(Math.random() > 0.5 ? 'call' : 'fold') }, 100)
      else if (msg === 'call') {
        let bet = Math.round(options.min * 1.5)
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
    this.pot = value(0)
    // this.betName = 'bet' // bet,raise,re-raise,cap
    this.bets = new ObservableArray
    this.roundBets = new ObservableArray
    this.board = new ObservableArray
    this.deck = []
    this.reset()
  }

  reset () {
    var deck = ['AS','KS','QS','JS','TS','9S','8S','7S','6S','5S','4S','3S','2S',
                'AH','KH','QH','JH','TH','9H','8H','7H','6H','5H','4H','3H','2H',
                'AD','KD','QD','JD','TD','9D','8D','7D','6D','5D','4D','3D','2D',
                'AC','KC','QC','JC','TC','9C','8C','7C','6C','5C','4C','3C','2C']

    // Shuffle the deck array with Fisher-Yates
    var i, j, tempi, tempj
    for (i = 0; i < deck.length; i++) {
      j = Math.floor(Math.random() * (i + 1))
      tempi = deck[i]
      tempj = deck[j]
      deck[i] = tempj
      deck[j] = tempi
    }

    this.deck.splice.apply(this.deck, [0, this.deck.length].concat(deck))
    this.pot(0)
    // this.roundName = 'Deal' // Start the first round
    // this.betName = 'bet' // bet,raise,re-raise,cap
    this.bets.empty()
    this.roundBets.empty()
    this.board.empty()
  }

  getMaxBet () {
    var maxBet = 0
    for (var bet of this.roundBets) if (bet > maxBet) maxBet = bet
    return maxBet
  }

}

// function playa (name) {
//   return {
//     name,
//     prompt: prompter((msg, options, response) => {
//       console.log(msg, '\n -', options.join('\n - '))
//       let answer = options[Math.floor(Math.random() * options.length)]
//       console.log(`answering: '${answer}' in 1s`)
//       setTimeout(() => { response(answer) }, 1000)
//     })
//   }
// }

export function holdem_table (_smallBlind, _bigBlind, _minPlayers, _maxPlayers, _minBuyIn, _maxBuyIn) {
  const state = value('waiting')

  // config
  const smallBlind = value(_smallBlind)
  const bigBlind = value(_bigBlind)
  const minPlayers = value(_minPlayers)
  const maxPlayers = value(_maxPlayers)
  const minBuyIn = value(_minBuyIn)
  const maxBuyIn = value(_maxBuyIn)

  // values
  const game = value(null)
  const playaz = new ObservableArray
  const observz = new ObservableArray
  const betz = new ObservableArray
  const dealer_idx = value(0)
  const sb_idx = compute([dealer_idx, playaz.obv_len], (dealer, num_playaz) => (dealer + 1) % num_playaz)
  const bb_idx = compute([dealer_idx, playaz.obv_len], (dealer, num_playaz) => (dealer + 2) % num_playaz)
  const cur_playa = value()
  const min_bet = value()

  var _game

  // functions
  var F = {
    addPlayer: (name, chips) => {
      if (playaz.length >= maxPlayers()) return 'max players reached'
      if (chips > maxBuyIn()) return 'too many chips to buy in'
      if (chips <= minBuyIn()) return 'not enough chips to buy in'

      var p = new Player(name, chips)
      playaz.push(p)
      // p.show('join game?')
      // get prompt replies
      let unprompt = p.prompt((res) => {
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
            p.prompt('bet', {min})
          }
        }
      })

      return p
    },
    startGame: () => {
      if (playaz.length > minPlayers()) {
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
      }

      return game()
    },
    add_playa: (p) => {
      if (playaz.length < maxPlayers()) {
        p.show('join game?')
      } else {
        // return false
      }
    },
    join_game: (p) => {
      if (playaz.length < maxPlayers()) {
        observz.remove(p)
        playaz.push(p)
        p.show('leave game?')
        if (playaz.length >= minPlayers()) {
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

  let elligible_playa = (cur) => {
    var min = min_bet()
    var len = playaz.length
    for (var j = 1; j < len; j++) {
      let k = (cur + j) % len
      let b = _game.roundBets[k]
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
    var next
    _game.roundBets.set(i, bet)
    _game.bets.push({i, bet, t: Date.now()})
    console.info(i, playaz[i].name(), bet === false ? 'folded' : bet < 0 ? `went all-in (${-bet})` : `bet (${bet})`)

    if (bet > min_bet()) min_bet(bet)
    if (~(next = elligible_playa(i))) {
      setTimeout(() => { cur_playa(next) }, 100)
    } else {
      // add roundBets to pot & reset to 0 (if not folded or all-in)
      var j = 0, pot = _game.pot(), l = playaz.length
      for (; j < l; j++) {
        let bet = _game.roundBets[j]
        if (typeof bet === 'number') {
          // TODO: for all-in bets, I think the max someone can win is his all-in amount. check into it, cause maybe this number needs to be saved
          //       (actually, it is saved in the bet list... maybe it needs to be used on a winning condition though)
          // we add all-in and bets to the pot
          pot += bet > 0 ? bet : -bet
          _game.roundBets.set(j, bet >= 0 ? null : true)
        }
      }
      // increase the pot
      _game.pot(pot)

      // jump to the next stage
      let s = state()
      state(s === 'deal' ? 'flop' : s === 'flop' ? 'turn' : s === 'turn' ? 'river' : 'showdown')
    }
  }

  cur_playa((i) => {
    let p = playaz[i]
    let min = min_bet()
    let bet = _game.roundBets[i]
    let l = playaz.length
    // if (p.name() === 'dylan') debugger

    // TODO: add timeout
    p.state('waiting')
    p.prompt(bet >= min && bet > 0 ? 'call' : 'bet', {min})
  })


  state((s, _s) => {
    // waiting, start_game, playing, game_done
    min_bet(0)
    let d = dealer_idx()
    switch (s) {
      case 'waiting':
        // TODO: waiting for enough playaz to join - give them prompts n'stuff
      break
      case 'deal':
        let l = playaz.length
        let sb = (d + 1) % l // move this to transform
        let bb = (d + 2) % l // move this to transform
        for (let i = 0; i < l; i++) {
          let playa = playaz[i]
          let bet = i === sb ? _game.smallBlind : i === bb ? _game.bigBlind : 0
          _game.roundBets.set(i, bet)
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
        cur_playa((d + 3) % l)
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
        setTimeout(() => { cur_playa(d + 1) }, 2000)
      break
      case 'turn':
        // pull one card and put in space (4)
        _game.deck.pop() // burn one
        _game.board.push(_game.deck.pop())
        console.log('effective turn', 'next round in 2s')
        setTimeout(() => { cur_playa(d + 1) }, 2000)
      break
      case 'river':
        // pull one card and put in space (5)
        _game.deck.pop() // burn one
        _game.board.push(_game.deck.pop())
        console.log('effective river', 'next round in 2s')
        setTimeout(() => { cur_playa(d + 1) }, 2000)
      break
      case 'showdown':
        // TODO: check all of the playaz cards for the winner
        console.log('SHOWDOWN!!!')
      break
      case 'game_done':
        var g = game()
        // return the playaz back into the table?
        for (let p of playaz) {
          p.emit('leave table?')
        }

      break
      case 'waiting':
        if (playaz.length < maxPlayers()) {
          for (let p of playaz) {
            p.emit('join game?')
          }
        }
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
