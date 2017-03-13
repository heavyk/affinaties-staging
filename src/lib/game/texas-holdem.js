import EventEmitter from '../../lib/drip/emitter'

import { rankHandInt } from './rank-hand'

// most of the game logic code ripped from: https://github.com/mjhbell/node-poker (MIT license)

// TODO: rename to TexasHoldemTable
// or, extract out the game logic into something else
// TODO: generic table will get a config object and the game rules will have default values
class Table extends EventEmitter {
  constructor (smallBlind, bigBlind, minPlayers, maxPlayers, minBuyIn, maxBuyIn) {
    super()
    this.smallBlind = smallBlind
    this.bigBlind = bigBlind
    this.minPlayers = minPlayers
    this.maxPlayers = maxPlayers
    this.players = []
    this.dealer = 0 // Track the dealer position between games
    this.minBuyIn = minBuyIn
    this.maxBuyIn = maxBuyIn
    this.playersToRemove = []
    this.playersToAdd = []
    this.turnBet = {}
    this.gameWinners = []
    this.gameLosers = []

    // Validate acceptable value ranges.
    var err
    if (minPlayers < 2) { // require at least two players to start a game.
      err = new Error(101, 'Parameter [minPlayers] must be a postive integer of a minimum value of 2.')
    } else if (maxPlayers > 10) { // hard limit of 10 players at a table.
      err = new Error(102, 'Parameter [maxPlayers] must be a positive integer less than or equal to 10.')
    } else if (minPlayers > maxPlayers) { // Without this we can never start a game!
      err = new Error(103, 'Parameter [minPlayers] must be less than or equal to [maxPlayers].')
    }

    if (err) {
      return err
    }
  }

  // getHandForPlayerName (playerName) {
  //   for (var i in this.players) {
  //     if (this.players[i].playerName === playerName) {
  //       return this.players[i].cards
  //     }
  //   }
  //   return []
  // }

  // Player actions: Check(), Fold(), Bet(bet), Call(), AllIn()
  // check (playerName) {
  //   var currentPlayer = this.currentPlayer
  //   if (playerName === this.players[ currentPlayer ].playerName) {
  //     this.players[ currentPlayer ].Check()
  //     return true
  //   } else {
  //     // todo: check if something went wrong ( not enough money or things )
  //     console.log('wrong user has made a move')
  //     return false
  //   }
  // }
  //
  // fold (playerName) {
  //   var currentPlayer = this.currentPlayer
  //   if (playerName === this.players[ currentPlayer ].playerName) {
  //     this.players[ currentPlayer ].Fold()
  //     return true
  //   } else {
  //     console.log('wrong user has made a move')
  //     return false
  //   }
  // }
  //
  // call (playerName) {
  //   var currentPlayer = this.currentPlayer
  //   if (playerName === this.players[ currentPlayer ].playerName) {
  //     this.players[ currentPlayer ].Call()
  //     return true
  //   } else {
  //     console.log('wrong user has made a move')
  //     return false
  //   }
  // }
  //
  // bet (playerName, amt) {
  //   var currentPlayer = this.currentPlayer
  //   if (playerName === this.players[ currentPlayer ].playerName) {
  //     this.players[ currentPlayer ].Bet(amt)
  //     return true
  //   } else {
  //     console.log('wrong user has made a move')
  //     return false
  //   }
  // }

  getAllHands () {
    var all = this.losers.concat(this.players)
    var allHands = []
    for (var i in all) {
      allHands.push({
        playerName: all[i].playerName,
        chips: all[i].chips,
        hand: all[i].cards
      })
    }
    return allHands
  }

  initNewRound () {
    var i = 0, l = this.players.length
    this.dealer++
    if (this.dealer >= l) {
      this.dealer = 0
    }
    this.game.reset()
    for (; i < l; i++) {
      this.players[i].folded = false
      this.players[i].talked = false
      this.players[i].allIn = false
      this.players[i].cards.splice(0, 2)
    }
    this.NewRound()
  }

  startGame () {
    // If there is no current game and we have enough players, start a new game.
    if (!this.game && this.players.length === 0 && this.playersToAdd.length >= this.minPlayers) {
      this.game = new Game(this.smallBlind, this.bigBlind)
      this.NewRound()
    }
  }

  checkForEndOfRound () {
    var i = 0
    var endOfRound = true
    var maxBet = this.game.getMaxBet()
    // For each player, check
    for (; i < this.players.length; i++) {
      if (this.players[i].folded === false) {
        if (this.players[i].talked === false || this.game.bets[i] !== maxBet) {
          if (this.players[i].allIn === false) {
            this.currentPlayer = i
            endOfRound = false
          }
        }
      }
    }
    return endOfRound
  }

  addPlayer (playerName, chips) {
    var player
    if (chips >= this.minBuyIn && chips <= this.maxBuyIn) {
      player = new Player(playerName, chips, this)
      this.playersToAdd.push(player)
    }

    return player
  }

  removePlayer (playerName) {
    var i
    for (i in this.players) {
      if (this.players[i].playerName === playerName) {
        this.playersToRemove.push(i)
        this.players[i].Fold()
      }
    }
    for (i in this.playersToAdd) {
      if (this.playersToAdd[i].playerName === playerName) {
        this.playersToAdd.splice(i, 1)
      }
    }
  }

  NewRound () {
    // Add players in waiting list
    var removeIndex = 0
    var i, k, smallBlind, bigBlind
    var p, l = this.players.length

    // while ((p = this.playersToRemove.pop()) != null) {
    //   this.game.bets.push(0)
    //   this.game.roundBets.push(0)
    //   this.emit('newPlaya', p)
    // }
    //
    // while (l < this.maxPlayers && (p = this.playersToAdd.pop())) {
    //   this.game.bets.push(0)
    //   this.game.roundBets.push(0)
    //   this.emit('newPlaya', p)
    // }

    for (k in this.playersToAdd) {
      if (removeIndex < this.playersToRemove.length) {
        var index = this.playersToRemove[ removeIndex ]
        this.players[index] = this.playersToAdd[k]
        removeIndex += 1
      } else {
        this.players.push(this.playersToAdd[k])
      }
    }

    this.playersToRemove = []
    this.playersToAdd = []
    this.gameWinners = []
    this.gameLosers = []

    // Deal 2 cards to each player
    for (i = 0; i < this.players.length; i++) {
      this.players[i].cards.push(this.game.deck.pop())
      this.players[i].cards.push(this.game.deck.pop())
      this.game.bets[i] = 0
      this.game.roundBets[i] = 0
    }

    // Identify Small and Big Blind player indexes
    smallBlind = this.dealer + 1
    if (smallBlind >= this.players.length) {
      smallBlind = 0
    }
    bigBlind = this.dealer + 2
    if (bigBlind >= this.players.length) {
      bigBlind -= this.players.length
    }

    // Force Blind Bets
    this.players[smallBlind].chips -= this.smallBlind
    this.players[bigBlind].chips -= this.bigBlind
    this.game.bets[smallBlind] = this.smallBlind
    this.game.bets[bigBlind] = this.bigBlind

    // get currentPlayer
    this.currentPlayer = this.dealer + 3
    if (this.currentPlayer >= this.players.length) {
      this.currentPlayer -= this.players.length
    }

    this.emit('newRound')
  }

  progress () {
    this.emit('turn')
    var i, cards, hand
    if (this.game) {
      if (this.checkForEndOfRound() === true) {
        this.currentPlayer = (this.currentPlayer >= this.players.length - 1) ? (this.currentPlayer - this.players.length + 1) : (this.currentPlayer + 1)
        // Move all bets to the pot
        for (i = 0; i < this.game.bets.length; i++) {
          this.game.pot += this.game.bets[i]
          this.game.roundBets[i] += this.game.bets[i]
        }
        if (this.game.roundName === 'River') {
          this.game.roundName = 'Showdown'
          this.game.bets.splice(0, this.game.bets.length)
          // Evaluate each hand
          for (i = 0; i < this.players.length; i++) {
            cards = this.players[i].cards.concat(this.game.board)
            hand = new Hand(cards)
            this.players[i].hand = rankHand(hand)
          }
          this.checkForWinner()
          this.checkForBankrupt()
          this.emit('gameOver')
          console.log('game over')
        } else if (this.game.roundName === 'Turn') {
          console.log('effective turn')
          this.game.roundName = 'River'
          this.game.deck.pop() // Burn a card
          this.game.board.push(this.game.deck.pop()) // Turn a card
          // this.game.bets.splice(0,this.game.bets.length-1)
          for (i = 0; i < this.game.bets.length; i++) {
            this.game.bets[i] = 0
          }
          for (i = 0; i < this.players.length; i++) {
            this.players[i].talked = false
          }
          this.emit('deal')
        } else if (this.game.roundName === 'Flop') {
          console.log('effective flop')
          this.game.roundName = 'Turn'
          this.game.deck.pop() // Burn a card
          this.game.board.push(this.game.deck.pop()) // Turn a card
          for (i = 0; i < this.game.bets.length; i++) {
            this.game.bets[i] = 0
          }
          for (i = 0; i < this.players.length; i++) {
            this.players[i].talked = false
          }
          this.emit('deal')
        } else if (this.game.roundName === 'Deal') {
          console.log('effective deal')
          this.game.roundName = 'Flop'
          this.game.deck.pop() // Burn a card
          for (i = 0; i < 3; i++) { // Turn three cards
            this.game.board.push(this.game.deck.pop())
          }
          // this.game.bets.splice(0,this.game.bets.length-1)
          for (i = 0; i < this.game.bets.length; i++) {
            this.game.bets[i] = 0
          }
          for (i = 0; i < this.players.length; i++) {
            this.players[i].talked = false
          }
          this.emit('deal')
        }
      // } else {
      //   console.log('still waiting for some players (round not yet done)')
      }
    }
  }

  checkForAllInPlayer (winners) {
    var i
    var allInPlayer = []
    for (i = 0; i < winners.length; i++) {
      if (this.players[winners[i]].allIn === true) {
        allInPlayer.push(winners[i])
      }
    }
    return allInPlayer
  }

  checkForWinner () {
    var i, maxRank, winners, part, prize, allInPlayer, minBets, roundEnd
    // Identify winner(s)
    winners = []
    maxRank = 0.000
    for (i = 0; i < this.players.length; i++) {
      if (this.players[i].hand.rank === maxRank && this.players[i].folded === false) {
        winners.push(i)
      }
      if (this.players[i].hand.rank > maxRank && this.players[i].folded === false) {
        maxRank = this.players[i].hand.rank
        winners.splice(0, winners.length)
        winners.push(i)
      }
    }

    part = 0
    prize = 0
    allInPlayer = this.checkForAllInPlayer(winners)
    if (allInPlayer.length > 0) {
      minBets = this.game.roundBets[winners[0]]
      for (i = 1; i < allInPlayer.length; i++) {
        if (this.game.roundBets[winners[i]] !== 0 && this.game.roundBets[winners[i]] < minBets) {
          minBets = this.game.roundBets[winners[i]]
        }
      }
      part = minBets
    } else {
      part = this.game.roundBets[winners[0]]
    }
    for (i = 0; i < this.game.roundBets.length; i++) {
      if (this.game.roundBets[i] > part) {
        prize += part
        this.game.roundBets[i] -= part
      } else {
        prize += this.game.roundBets[i]
        this.game.roundBets[i] = 0
      }
    }

    for (i = 0; i < winners.length; i++) {
      var winnerPrize = prize / winners.length
      var winningPlayer = this.players[winners[i]]
      winningPlayer.chips += winnerPrize
      if (this.game.roundBets[winners[i]] === 0) {
        winningPlayer.folded = true
        this.gameWinners.push({
          playerName: winningPlayer.playerName,
          amount: winnerPrize,
          hand: winningPlayer.hand,
          chips: winningPlayer.chips
        })
      }
      // debugger
      console.log('player ' + this.players[winners[i]].playerName + ' wins !!')
    }

    roundEnd = true
    for (i = 0; i < this.game.roundBets.length; i++) {
      if (this.game.roundBets[i] !== 0) {
        roundEnd = false
      }
    }
    // if (roundEnd === false) {
    //   this.checkForWinner()
    // }
  }

  checkForBankrupt () {
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].chips === 0) {
        this.gameLosers.push(this.players[i])
        console.log('player ' + this.players[i].playerName + ' is going bankrupt')
        this.players.splice(i, 1)
      }
    }
  }
}

class Player {
  constructor (playerName, chips, table) {
    this.playerName = playerName
    this.chips = chips
    this.folded = false
    this.allIn = false
    this.talked = false
    this.table = table // Circular reference to allow reference back to parent object.
    this.cards = []
  }

  GetChips (cash) {
    this.chips += cash
  }

  // Player actions: Check(), Fold(), Bet(bet), Call(), AllIn()
  Check () {
    var checkAllow, v, i
    checkAllow = true
    for (v = 0; v < this.table.game.bets.length; v += 1) {
      if (this.table.game.bets[v] !== 0) {
        checkAllow = false
      }
    }
    if (checkAllow) {
      for (i = 0; i < this.table.players.length; i++) {
        if (this === this.table.players[i]) {
          this.table.game.bets[i] = 0
          this.talked = true
        }
      }
      // Attemp to progress the game
      this.turnBet = {action: 'check', playerName: this.playerName}
      this.table.progress()
    } else {
      console.log('Check not allowed, replay please')
    }
  }

  Fold () {
    var i, bet
    // Move any current bet into the pot
    for (i = 0; i < this.table.players.length; i++) {
      if (this === this.table.players[i]) {
        bet = this.table.game.bets[i]
        this.table.game.bets[i] = 0
        this.table.game.pot += bet
        this.talked = true
      }
    }
    // Mark the player as folded
    this.folded = true
    this.turnBet = {action: 'fold', playerName: this.playerName}

    // Attemp to progress the game
    this.table.progress()
  }

  Bet (bet) {
    if (typeof bet !== 'number') bet = parseInt(bet, 10)
    var i
    if (this.chips > bet) {
      for (i = 0; i < this.table.players.length; i++) {
        if (this === this.table.players[i]) {
          this.table.game.bets[i] += bet
          this.table.players[i].chips -= bet
          this.talked = true
        }
      }

      // Attemp to progress the game
      this.turnBet = {action: 'bet', playerName: this.playerName, amount: bet}
      this.table.progress()
    } else {
      console.log("You don't have enought chips --> ALL IN !!!")
      this.AllIn()
    }
  }

  Call () {
    var maxBet, i
    var maxBet = this.table.game.getMaxBet()
    if (this.chips > maxBet) {
      // Match the highest bet
      for (var i = 0; i < this.table.players.length; i++) {
        if (this === this.table.players[i]) {
          if (this.table.game.bets[i] >= 0) {
            this.chips += this.table.game.bets[i]
          }
          this.chips -= maxBet
          this.table.game.bets[i] = maxBet
          this.talked = true
        }
      }
      // Attemp to progress the game
      this.turnBet = {action: 'call', playerName: this.playerName, amount: maxBet}
      this.table.progress()
    } else {
      console.log("You don't have enought chips --> ALL IN !!!")
      this.AllIn()
    }
  }

  AllIn () {
    var i, allInValue = 0
    for (i = 0; i < this.table.players.length; i++) {
      if (this === this.table.players[i]) {
        if (this.table.players[i].chips !== 0) {
          allInValue = this.table.players[i].chips
          this.table.game.bets[i] += this.table.players[i].chips
          this.table.players[i].chips = 0

          this.allIn = true
          this.talked = true
        }
      }
    }

    // Attemp to progress the game
    this.turnBet = {action: 'allin', playerName: this.playerName, amount: allInValue}
    this.table.progress()
  }
}

function Hand (cards) {
  this.cards = cards
}

function rankHand (hand) {
  var myResult = rankHandInt(hand.cards)
  hand.rank = myResult.rank
  hand.message = myResult.message

  return hand
}

class Game {
  constructor (smallBlind, bigBlind) {
    this.smallBlind = smallBlind
    this.bigBlind = bigBlind
    // this.pot = 0
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
    // this.deck = deck
    this.pot = 0
    this.roundName = 'Deal' // Start the first round
    this.betName = 'bet' // bet,raise,re-raise,cap
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

export { Table, Game, Player }
