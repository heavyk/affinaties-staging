import { value, transform, compute } from '../dom/observable'
// import * as L from '../dom/observable-logic'
import { prompter } from '../dom/observable-logic'
import { ObservableArray } from '../dom/observable-array'

// TODO LIST
//  - playa needs a prompter

class Player {
  constructor (name, chips) {
    this.name = value(name)
    this.chips = value(chips)
    this.state = value(null) // folded, all-in, waiting
    // this.folded = false
    // this.allIn = false
    // this.talked = false
    this.cards = new ObservableArray
    this.prompt = prompter((msg, options, response) => {
      console.log(msg, '\n -', options.join('\n - '))
      let answer = options[Math.floor(Math.random() * options.length)]
      console.log(`answering: '${answer}' in 1s`)
      setTimeout(() => { response(answer) }, 1000)
    })
  }
}

class Game {
  constructor (smallBlind, bigBlind) {
    this.smallBlind = smallBlind
    this.bigBlind = bigBlind
    this.pot = value(0)
    // this.roundName = 'Deal' // Start the first round
    // this.betName = 'bet' // bet,raise,re-raise,cap
    this.bets = []
    this.roundBets = []
    this.deck = []
    this.board = []
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
    this.bets.length = 0
    this.roundBets.length = 0
    this.board.length = 0
  }

  getMaxBet () {
    var maxBet = 0
    for (var bet of this.bets) if (bet > maxBet) maxBet = bet
    return maxBet
  }

}

function playa (name) {
  return {
    name,
    prompt: prompter((msg, options, response) => {
      console.log(msg, '\n -', options.join('\n - '))
      let answer = options[Math.floor(Math.random() * options.length)]
      console.log(`answering: '${answer}' in 1s`)
      setTimeout(() => { response(answer) }, 1000)
    })
  }
}

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
  const small_blind_idx = compute([dealer_idx, playaz.obv_len], (dealer, num_playaz) => (dealer + 1) % num_playaz)
  const big_blind_idx = compute([dealer_idx, playaz.obv_len], (dealer, num_playaz) => (dealer + 2) % num_playaz)
  const cur_playa = value(0)

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

      return p || false
    },
    startGame: () => {
      if (playaz.length > minPlayers()) {
        // TODO: send a starting game notification
        game(_game = new Game(smallBlind(), bigBlind()))
        state('deal')
      }
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
          playaz[dealer()].prompt('start game?')
        }
      } else {
        // return false
      }
    }
  }


  state((s, _s) => {
    // waiting, start_game, playing, game_done
    switch (s) {
      case 'waiting':
        // waiting for players to vote
      break
      case 'deal':
        // whoops.. this is supposed to go in game!
        let l = playaz.length
        let d = dealer_idx()
        let sb = (d + 1) % l // move this to transform
        let bb = (d + 2) % l // move this to transform
        for (let i = 0; i < l; i++) {
          let bet = i === sb ? _game.smallBlind : i === bb ? _game.bigBlind : 0
          betz.set(i, bet)
          playaz[i].chips -= bet
          playaz[i].cards.empty()
          _game.deck.pop() // burn one
          playaz[i].cards.push(_game.deck.pop())
          _game.deck.pop() // burn one
          playaz[i].cards.push(_game.deck.pop())
          // TODO: prompt each playa for su bet
        }
        cur_playa((d + 3) % l)
        state('flop')
      break
      case 'flop':
        // TODO: pull three cards from the deck and put them in the spaces
        state('turn')
      break
      case 'turn':
        // TODO: pull one card and put in space (4)
        state('river')
      break
      case 'river':
        // TODO: pull one card and put in space (5)
        state('showdown')
      break
      case 'showdown':
        // TODO: check all of the playaz cards for the winner
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
