import EventEmitter from '../../lib/drip/emitter'

// most of the game logic code ripped from: https://github.com/mjhbell/node-poker (MIT license)

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

  getHandForPlayerName (playerName) {
    for (var i in this.players) {
      if (this.players[i].playerName === playerName) {
        return this.players[i].cards
      }
    }
    return []
  }

  // Player actions: Check(), Fold(), Bet(bet), Call(), AllIn()
  check (playerName) {
    var currentPlayer = this.currentPlayer
    if (playerName === this.players[ currentPlayer ].playerName) {
      this.players[ currentPlayer ].Check()
      return true
    } else {
      // todo: check if something went wrong ( not enough money or things )
      console.log('wrong user has made a move')
      return false
    }
  }

  fold (playerName) {
    var currentPlayer = this.currentPlayer
    if (playerName === this.players[ currentPlayer ].playerName) {
      this.players[ currentPlayer ].Fold()
      return true
    } else {
      console.log('wrong user has made a move')
      return false
    }
  }

  call (playerName) {
    var currentPlayer = this.currentPlayer
    if (playerName === this.players[ currentPlayer ].playerName) {
      this.players[ currentPlayer ].Call()
      return true
    } else {
      console.log('wrong user has made a move')
      return false
    }
  }

  bet (playerName, amt) {
    var currentPlayer = this.currentPlayer
    if (playerName === this.players[ currentPlayer ].playerName) {
      this.players[ currentPlayer ].Bet(amt)
      return true
    } else {
      console.log('wrong user has made a move')
      return false
    }
  }

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
    this.dealer += 1
    if (this.dealer >= this.players.length) {
      this.dealer = 0
    }
    this.game.pot = 0
    this.game.roundName = 'Deal' // Start the first round
    this.game.betName = 'bet' // bet,raise,re-raise,cap
    this.game.bets.splice(0, this.game.bets.length)
    this.game.deck.splice(0, this.game.deck.length)
    this.game.board.splice(0, this.game.board.length)
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].folded = false
      this.players[i].talked = false
      this.players[i].allIn = false
      this.players[i].cards.splice(0, this.players[i].cards.length)
    }
    fillDeck(this.game.deck)
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
      } else {
        console.log('still waiting for some players (round not yet done)')
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

function fillDeck (deck) {
  deck.push('AS','KS','QS','JS','TS','9S','8S','7S','6S','5S','4S','3S','2S',
            'AH','KH','QH','JH','TH','9H','8H','7H','6H','5H','4H','3H','2H',
            'AD','KD','QD','JD','TD','9D','8D','7D','6D','5D','4D','3D','2D',
            'AC','KC','QC','JC','TC','9C','8C','7C','6C','5C','4C','3C','2C')

  // Shuffle the deck array with Fisher-Yates
  var i, j, tempi, tempj
  for (i = 0; i < deck.length; i++) {
    j = Math.floor(Math.random() * (i + 1))
    tempi = deck[i]
    tempj = deck[j]
    deck[i] = tempj
    deck[j] = tempi
  }
}

function Hand (cards) {
  this.cards = cards
}

function rankKickers (ranks, noOfCards) {
  var i, kickerRank, myRanks, rank

  kickerRank = 0
  myRanks = []
  rank = ''

  for (i = 0; i <= ranks.length; i++) {
    rank = ranks.substr(i, 1)

    if (rank === 'A') { myRanks.push(0.2048) }
    if (rank === 'K') { myRanks.push(0.1024) }
    if (rank === 'Q') { myRanks.push(0.0512) }
    if (rank === 'J') { myRanks.push(0.0256) }
    if (rank === 'T') { myRanks.push(0.0128) }
    if (rank === '9') { myRanks.push(0.0064) }
    if (rank === '8') { myRanks.push(0.0032) }
    if (rank === '7') { myRanks.push(0.0016) }
    if (rank === '6') { myRanks.push(0.0008) }
    if (rank === '5') { myRanks.push(0.0004) }
    if (rank === '4') { myRanks.push(0.0002) }
    if (rank === '3') { myRanks.push(0.0001) }
    if (rank === '2') { myRanks.push(0.0000) }
  }

  myRanks.sort((a, b) => b - a)

  for (i = 0; i < noOfCards; i++) {
    kickerRank += myRanks[i]
  }

  return kickerRank
}

function rankHandInt (hand) {
  var rank = 0
  var message = ''

  var l = hand.cards.length
  var handRanks = new Array(l)
  var handSuits = new Array(l)
  for (var i = 0; i < l; i++) {
    handRanks[i] = hand.cards[i].substr(0, 1)
    handSuits[i] = hand.cards[i].substr(1, 1)
  }

  var ranks = handRanks.sort().toString().replace(/\W/g, '')
  var suits = handSuits.sort().toString().replace(/\W/g, '')
  var cards = hand.cards.toString()

  // Four of a kind
  if (rank === 0) {
    if (              ~ranks.indexOf('AAAA')) { rank = 292 + rankKickers(ranks.replace('AAAA', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KKKK')) { rank = 291 + rankKickers(ranks.replace('KKKK', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('QQQQ')) { rank = 290 + rankKickers(ranks.replace('QQQQ', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('JJJJ')) { rank = 289 + rankKickers(ranks.replace('JJJJ', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('TTTT')) { rank = 288 + rankKickers(ranks.replace('TTTT', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('9999')) { rank = 287 + rankKickers(ranks.replace('9999', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('8888')) { rank = 286 + rankKickers(ranks.replace('8888', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('7777')) { rank = 285 + rankKickers(ranks.replace('7777', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('6666')) { rank = 284 + rankKickers(ranks.replace('6666', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('5555')) { rank = 283 + rankKickers(ranks.replace('5555', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('4444')) { rank = 282 + rankKickers(ranks.replace('4444', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('3333')) { rank = 281 + rankKickers(ranks.replace('3333', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('2222')) { rank = 280 + rankKickers(ranks.replace('2222', ''), 1) }
    if (rank !== 0) {message = 'Four of a kind' }
  }

  // Full House
  if (rank === 0) {
    if (              ~ranks.indexOf('AAA') && ~ranks.indexOf('KK')) { rank = 279 }
    if (rank === 0 && ~ranks.indexOf('AAA') && ~ranks.indexOf('QQ')) { rank = 278 }
    if (rank === 0 && ~ranks.indexOf('AAA') && ~ranks.indexOf('JJ')) { rank = 277 }
    if (rank === 0 && ~ranks.indexOf('AAA') && ~ranks.indexOf('TT')) { rank = 276 }
    if (rank === 0 && ~ranks.indexOf('AAA') && ~ranks.indexOf('99')) { rank = 275 }
    if (rank === 0 && ~ranks.indexOf('AAA') && ~ranks.indexOf('88')) { rank = 274 }
    if (rank === 0 && ~ranks.indexOf('AAA') && ~ranks.indexOf('77')) { rank = 273 }
    if (rank === 0 && ~ranks.indexOf('AAA') && ~ranks.indexOf('66')) { rank = 272 }
    if (rank === 0 && ~ranks.indexOf('AAA') && ~ranks.indexOf('55')) { rank = 271 }
    if (rank === 0 && ~ranks.indexOf('AAA') && ~ranks.indexOf('44')) { rank = 270 }
    if (rank === 0 && ~ranks.indexOf('AAA') && ~ranks.indexOf('33')) { rank = 269 }
    if (rank === 0 && ~ranks.indexOf('AAA') && ~ranks.indexOf('22')) { rank = 268 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('AA')) { rank = 267 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('QQ')) { rank = 266 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('JJ')) { rank = 265 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('TT')) { rank = 264 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('99')) { rank = 263 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('88')) { rank = 262 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('77')) { rank = 261 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('66')) { rank = 260 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('55')) { rank = 259 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('44')) { rank = 258 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('33')) { rank = 257 }
    if (rank === 0 && ~ranks.indexOf('KKK') && ~ranks.indexOf('22')) { rank = 256 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('AA')) { rank = 255 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('KK')) { rank = 254 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('JJ')) { rank = 253 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('TT')) { rank = 252 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('99')) { rank = 251 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('88')) { rank = 250 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('77')) { rank = 249 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('66')) { rank = 248 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('55')) { rank = 247 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('44')) { rank = 246 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('33')) { rank = 245 }
    if (rank === 0 && ~ranks.indexOf('QQQ') && ~ranks.indexOf('22')) { rank = 244 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('AA')) { rank = 243 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('KK')) { rank = 242 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('QQ')) { rank = 241 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('TT')) { rank = 240 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('99')) { rank = 239 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('88')) { rank = 238 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('77')) { rank = 237 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('66')) { rank = 236 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('55')) { rank = 235 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('44')) { rank = 234 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('33')) { rank = 233 }
    if (rank === 0 && ~ranks.indexOf('JJJ') && ~ranks.indexOf('22')) { rank = 232 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('AA')) { rank = 231 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('KK')) { rank = 230 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('QQ')) { rank = 229 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('JJ')) { rank = 228 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('99')) { rank = 227 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('88')) { rank = 226 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('77')) { rank = 225 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('66')) { rank = 224 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('55')) { rank = 223 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('44')) { rank = 222 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('33')) { rank = 221 }
    if (rank === 0 && ~ranks.indexOf('TTT') && ~ranks.indexOf('22')) { rank = 220 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('AA')) { rank = 219 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('KK')) { rank = 218 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('QQ')) { rank = 217 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('JJ')) { rank = 216 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('TT')) { rank = 215 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('88')) { rank = 214 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('77')) { rank = 213 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('66')) { rank = 212 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('55')) { rank = 211 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('44')) { rank = 210 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('33')) { rank = 209 }
    if (rank === 0 && ~ranks.indexOf('999') && ~ranks.indexOf('22')) { rank = 208 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('AA')) { rank = 207 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('KK')) { rank = 206 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('QQ')) { rank = 205 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('JJ')) { rank = 204 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('TT')) { rank = 203 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('99')) { rank = 202 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('77')) { rank = 201 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('66')) { rank = 200 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('55')) { rank = 199 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('44')) { rank = 198 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('33')) { rank = 197 }
    if (rank === 0 && ~ranks.indexOf('888') && ~ranks.indexOf('22')) { rank = 196 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('AA')) { rank = 195 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('KK')) { rank = 194 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('QQ')) { rank = 193 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('JJ')) { rank = 192 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('TT')) { rank = 191 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('99')) { rank = 190 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('88')) { rank = 189 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('66')) { rank = 188 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('55')) { rank = 187 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('44')) { rank = 186 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('33')) { rank = 185 }
    if (rank === 0 && ~ranks.indexOf('777') && ~ranks.indexOf('22')) { rank = 184 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('AA')) { rank = 183 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('KK')) { rank = 182 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('QQ')) { rank = 181 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('JJ')) { rank = 180 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('TT')) { rank = 179 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('99')) { rank = 178 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('88')) { rank = 177 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('77')) { rank = 176 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('55')) { rank = 175 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('44')) { rank = 174 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('33')) { rank = 173 }
    if (rank === 0 && ~ranks.indexOf('666') && ~ranks.indexOf('22')) { rank = 172 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('AA')) { rank = 171 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('KK')) { rank = 170 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('QQ')) { rank = 169 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('JJ')) { rank = 168 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('TT')) { rank = 167 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('99')) { rank = 166 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('88')) { rank = 165 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('77')) { rank = 164 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('66')) { rank = 163 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('44')) { rank = 162 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('33')) { rank = 161 }
    if (rank === 0 && ~ranks.indexOf('555') && ~ranks.indexOf('22')) { rank = 160 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('AA')) { rank = 159 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('KK')) { rank = 158 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('QQ')) { rank = 157 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('JJ')) { rank = 156 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('TT')) { rank = 155 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('99')) { rank = 154 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('88')) { rank = 153 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('77')) { rank = 152 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('66')) { rank = 151 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('55')) { rank = 150 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('33')) { rank = 149 }
    if (rank === 0 && ~ranks.indexOf('444') && ~ranks.indexOf('22')) { rank = 148 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('AA')) { rank = 147 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('KK')) { rank = 146 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('QQ')) { rank = 145 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('JJ')) { rank = 144 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('TT')) { rank = 143 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('99')) { rank = 142 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('88')) { rank = 141 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('77')) { rank = 140 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('66')) { rank = 139 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('55')) { rank = 138 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('44')) { rank = 137 }
    if (rank === 0 && ~ranks.indexOf('333') && ~ranks.indexOf('22')) { rank = 136 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('AA')) { rank = 135 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('KK')) { rank = 134 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('QQ')) { rank = 133 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('JJ')) { rank = 132 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('TT')) { rank = 131 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('99')) { rank = 130 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('88')) { rank = 129 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('77')) { rank = 128 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('66')) { rank = 127 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('55')) { rank = 126 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('44')) { rank = 125 }
    if (rank === 0 && ~ranks.indexOf('222') && ~ranks.indexOf('33')) { rank = 124 }
    if (rank !== 0) {message = 'Full House' }
  }

  // Flush
  if (rank === 0) {
    if (~suits.indexOf('CCCCC') || ~suits.indexOf('DDDDD') || ~suits.indexOf('HHHHH') || ~suits.indexOf('SSSSS')) { rank = 123; message = 'Flush';}

    // Straight flush
    if (~cards.indexOf('TC') && ~cards.indexOf('JC') && ~cards.indexOf('QC') && ~cards.indexOf('KC') && ~cards.indexOf('AC') && rank === 123) { rank = 302; message = 'Straight Flush';}
    if (~cards.indexOf('TD') && ~cards.indexOf('JD') && ~cards.indexOf('QD') && ~cards.indexOf('KD') && ~cards.indexOf('AD') && rank === 123) { rank = 302; message = 'Straight Flush';}
    if (~cards.indexOf('TH') && ~cards.indexOf('JH') && ~cards.indexOf('QH') && ~cards.indexOf('KH') && ~cards.indexOf('AH') && rank === 123) { rank = 302; message = 'Straight Flush';}
    if (~cards.indexOf('TS') && ~cards.indexOf('JS') && ~cards.indexOf('QS') && ~cards.indexOf('KS') && ~cards.indexOf('AS') && rank === 123) { rank = 302; message = 'Straight Flush';}
    if (~cards.indexOf('9C') && ~cards.indexOf('TC') && ~cards.indexOf('JC') && ~cards.indexOf('QC') && ~cards.indexOf('KC') && rank === 123) { rank = 301; message = 'Straight Flush';}
    if (~cards.indexOf('9D') && ~cards.indexOf('TD') && ~cards.indexOf('JD') && ~cards.indexOf('QD') && ~cards.indexOf('KD') && rank === 123) { rank = 301; message = 'Straight Flush';}
    if (~cards.indexOf('9H') && ~cards.indexOf('TH') && ~cards.indexOf('JH') && ~cards.indexOf('QH') && ~cards.indexOf('KH') && rank === 123) { rank = 301; message = 'Straight Flush';}
    if (~cards.indexOf('9S') && ~cards.indexOf('TS') && ~cards.indexOf('JS') && ~cards.indexOf('QS') && ~cards.indexOf('KS') && rank === 123) { rank = 301; message = 'Straight Flush';}
    if (~cards.indexOf('8C') && ~cards.indexOf('9C') && ~cards.indexOf('TC') && ~cards.indexOf('JC') && ~cards.indexOf('QC') && rank === 123) { rank = 300; message = 'Straight Flush';}
    if (~cards.indexOf('8D') && ~cards.indexOf('9D') && ~cards.indexOf('TD') && ~cards.indexOf('JD') && ~cards.indexOf('QD') && rank === 123) { rank = 300; message = 'Straight Flush';}
    if (~cards.indexOf('8H') && ~cards.indexOf('9H') && ~cards.indexOf('TH') && ~cards.indexOf('JH') && ~cards.indexOf('QH') && rank === 123) { rank = 300; message = 'Straight Flush';}
    if (~cards.indexOf('8S') && ~cards.indexOf('9S') && ~cards.indexOf('TS') && ~cards.indexOf('JS') && ~cards.indexOf('QS') && rank === 123) { rank = 300; message = 'Straight Flush';}
    if (~cards.indexOf('7C') && ~cards.indexOf('8C') && ~cards.indexOf('9C') && ~cards.indexOf('TC') && ~cards.indexOf('JC') && rank === 123) { rank = 299; message = 'Straight Flush';}
    if (~cards.indexOf('7D') && ~cards.indexOf('8D') && ~cards.indexOf('9D') && ~cards.indexOf('TD') && ~cards.indexOf('JD') && rank === 123) { rank = 299; message = 'Straight Flush';}
    if (~cards.indexOf('7H') && ~cards.indexOf('8H') && ~cards.indexOf('9H') && ~cards.indexOf('TH') && ~cards.indexOf('JH') && rank === 123) { rank = 299; message = 'Straight Flush';}
    if (~cards.indexOf('7S') && ~cards.indexOf('8S') && ~cards.indexOf('9S') && ~cards.indexOf('TS') && ~cards.indexOf('JS') && rank === 123) { rank = 299; message = 'Straight Flush';}
    if (~cards.indexOf('6C') && ~cards.indexOf('7C') && ~cards.indexOf('8C') && ~cards.indexOf('9C') && ~cards.indexOf('TC') && rank === 123) { rank = 298; message = 'Straight Flush';}
    if (~cards.indexOf('6D') && ~cards.indexOf('7D') && ~cards.indexOf('8D') && ~cards.indexOf('9D') && ~cards.indexOf('TD') && rank === 123) { rank = 298; message = 'Straight Flush';}
    if (~cards.indexOf('6H') && ~cards.indexOf('7H') && ~cards.indexOf('8H') && ~cards.indexOf('9H') && ~cards.indexOf('TH') && rank === 123) { rank = 298; message = 'Straight Flush';}
    if (~cards.indexOf('6S') && ~cards.indexOf('7S') && ~cards.indexOf('8S') && ~cards.indexOf('9S') && ~cards.indexOf('TS') && rank === 123) { rank = 298; message = 'Straight Flush';}
    if (~cards.indexOf('5C') && ~cards.indexOf('6C') && ~cards.indexOf('7C') && ~cards.indexOf('8C') && ~cards.indexOf('9C') && rank === 123) { rank = 297; message = 'Straight Flush';}
    if (~cards.indexOf('5D') && ~cards.indexOf('6D') && ~cards.indexOf('7D') && ~cards.indexOf('8D') && ~cards.indexOf('9D') && rank === 123) { rank = 297; message = 'Straight Flush';}
    if (~cards.indexOf('5H') && ~cards.indexOf('6H') && ~cards.indexOf('7H') && ~cards.indexOf('8H') && ~cards.indexOf('9H') && rank === 123) { rank = 297; message = 'Straight Flush';}
    if (~cards.indexOf('5S') && ~cards.indexOf('6S') && ~cards.indexOf('7S') && ~cards.indexOf('8S') && ~cards.indexOf('9S') && rank === 123) { rank = 297; message = 'Straight Flush';}
    if (~cards.indexOf('4C') && ~cards.indexOf('5C') && ~cards.indexOf('6C') && ~cards.indexOf('7C') && ~cards.indexOf('8C') && rank === 123) { rank = 296; message = 'Straight Flush';}
    if (~cards.indexOf('4D') && ~cards.indexOf('5D') && ~cards.indexOf('6D') && ~cards.indexOf('7D') && ~cards.indexOf('8D') && rank === 123) { rank = 296; message = 'Straight Flush';}
    if (~cards.indexOf('4H') && ~cards.indexOf('5H') && ~cards.indexOf('6H') && ~cards.indexOf('7H') && ~cards.indexOf('8H') && rank === 123) { rank = 296; message = 'Straight Flush';}
    if (~cards.indexOf('4S') && ~cards.indexOf('5S') && ~cards.indexOf('6S') && ~cards.indexOf('7S') && ~cards.indexOf('8S') && rank === 123) { rank = 296; message = 'Straight Flush';}
    if (~cards.indexOf('3C') && ~cards.indexOf('4C') && ~cards.indexOf('5C') && ~cards.indexOf('6C') && ~cards.indexOf('7C') && rank === 123) { rank = 295; message = 'Straight Flush';}
    if (~cards.indexOf('3D') && ~cards.indexOf('4D') && ~cards.indexOf('5D') && ~cards.indexOf('6D') && ~cards.indexOf('7D') && rank === 123) { rank = 295; message = 'Straight Flush';}
    if (~cards.indexOf('3H') && ~cards.indexOf('4H') && ~cards.indexOf('5H') && ~cards.indexOf('6H') && ~cards.indexOf('7H') && rank === 123) { rank = 295; message = 'Straight Flush';}
    if (~cards.indexOf('3S') && ~cards.indexOf('4S') && ~cards.indexOf('5S') && ~cards.indexOf('6S') && ~cards.indexOf('7S') && rank === 123) { rank = 295; message = 'Straight Flush';}
    if (~cards.indexOf('2C') && ~cards.indexOf('3C') && ~cards.indexOf('4C') && ~cards.indexOf('5C') && ~cards.indexOf('6C') && rank === 123) { rank = 294; message = 'Straight Flush';}
    if (~cards.indexOf('2D') && ~cards.indexOf('3D') && ~cards.indexOf('4D') && ~cards.indexOf('5D') && ~cards.indexOf('6D') && rank === 123) { rank = 294; message = 'Straight Flush';}
    if (~cards.indexOf('2H') && ~cards.indexOf('3H') && ~cards.indexOf('4H') && ~cards.indexOf('5H') && ~cards.indexOf('6H') && rank === 123) { rank = 294; message = 'Straight Flush';}
    if (~cards.indexOf('2S') && ~cards.indexOf('3S') && ~cards.indexOf('4S') && ~cards.indexOf('5S') && ~cards.indexOf('6S') && rank === 123) { rank = 294; message = 'Straight Flush';}
    if (~cards.indexOf('AC') && ~cards.indexOf('2C') && ~cards.indexOf('3C') && ~cards.indexOf('4C') && ~cards.indexOf('5C') && rank === 123) { rank = 293; message = 'Straight Flush';}
    if (~cards.indexOf('AS') && ~cards.indexOf('2S') && ~cards.indexOf('3S') && ~cards.indexOf('4S') && ~cards.indexOf('5S') && rank === 123) { rank = 293; message = 'Straight Flush';}
    if (~cards.indexOf('AH') && ~cards.indexOf('2H') && ~cards.indexOf('3H') && ~cards.indexOf('4H') && ~cards.indexOf('5H') && rank === 123) { rank = 293; message = 'Straight Flush';}
    if (~cards.indexOf('AD') && ~cards.indexOf('2D') && ~cards.indexOf('3D') && ~cards.indexOf('4D') && ~cards.indexOf('5D') && rank === 123) { rank = 293; message = 'Straight Flush';}
    if (rank === 123) { rank = rank + rankKickers(ranks, 5);}
  }

  // Straight
  if (rank === 0) {
    if (              ~cards.indexOf('T') && ~cards.indexOf('J') && ~cards.indexOf('Q') && ~cards.indexOf('K') && ~cards.indexOf('A')) { rank = 122 }
    if (rank === 0 && ~cards.indexOf('9') && ~cards.indexOf('T') && ~cards.indexOf('J') && ~cards.indexOf('Q') && ~cards.indexOf('K')) { rank = 121 }
    if (rank === 0 && ~cards.indexOf('8') && ~cards.indexOf('9') && ~cards.indexOf('T') && ~cards.indexOf('J') && ~cards.indexOf('Q')) { rank = 120 }
    if (rank === 0 && ~cards.indexOf('7') && ~cards.indexOf('8') && ~cards.indexOf('9') && ~cards.indexOf('T') && ~cards.indexOf('J')) { rank = 119 }
    if (rank === 0 && ~cards.indexOf('6') && ~cards.indexOf('7') && ~cards.indexOf('8') && ~cards.indexOf('9') && ~cards.indexOf('T')) { rank = 118 }
    if (rank === 0 && ~cards.indexOf('5') && ~cards.indexOf('6') && ~cards.indexOf('7') && ~cards.indexOf('8') && ~cards.indexOf('9')) { rank = 117 }
    if (rank === 0 && ~cards.indexOf('4') && ~cards.indexOf('5') && ~cards.indexOf('6') && ~cards.indexOf('7') && ~cards.indexOf('8')) { rank = 116 }
    if (rank === 0 && ~cards.indexOf('3') && ~cards.indexOf('4') && ~cards.indexOf('5') && ~cards.indexOf('6') && ~cards.indexOf('7')) { rank = 115 }
    if (rank === 0 && ~cards.indexOf('2') && ~cards.indexOf('3') && ~cards.indexOf('4') && ~cards.indexOf('5') && ~cards.indexOf('6')) { rank = 114 }
    if (rank === 0 && ~cards.indexOf('A') && ~cards.indexOf('2') && ~cards.indexOf('3') && ~cards.indexOf('4') && ~cards.indexOf('5')) { rank = 113 }
    if (rank !== 0) {message = 'Straight' }
  }

  // Three of a kind
  if (rank === 0) {
    if (              ~ranks.indexOf('AAA')) { rank = 112 + rankKickers(ranks.replace('AAA', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('KKK')) { rank = 111 + rankKickers(ranks.replace('KKK', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('QQQ')) { rank = 110 + rankKickers(ranks.replace('QQQ', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('JJJ')) { rank = 109 + rankKickers(ranks.replace('JJJ', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('TTT')) { rank = 108 + rankKickers(ranks.replace('TTT', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('999')) { rank = 107 + rankKickers(ranks.replace('999', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('888')) { rank = 106 + rankKickers(ranks.replace('888', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('777')) { rank = 105 + rankKickers(ranks.replace('777', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('666')) { rank = 104 + rankKickers(ranks.replace('666', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('555')) { rank = 103 + rankKickers(ranks.replace('555', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('444')) { rank = 102 + rankKickers(ranks.replace('444', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('333')) { rank = 101 + rankKickers(ranks.replace('333', ''), 2) }
    if (rank === 0 && ~ranks.indexOf('222')) { rank = 100 + rankKickers(ranks.replace('222', ''), 2) }
    if (rank !== 0) {message = 'Three of a Kind' }
  }

  // Two pair
  if (rank === 0) {
    if (              ~ranks.indexOf('AA') && ~ranks.indexOf('KK')) { rank = 99 + rankKickers(ranks.replace('AA', '').replace('KK', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('AA') && ~ranks.indexOf('QQ')) { rank = 98 + rankKickers(ranks.replace('AA', '').replace('QQ', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('AA') && ~ranks.indexOf('JJ')) { rank = 97 + rankKickers(ranks.replace('AA', '').replace('JJ', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('AA') && ~ranks.indexOf('TT')) { rank = 96 + rankKickers(ranks.replace('AA', '').replace('TT', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('AA') && ~ranks.indexOf('99')) { rank = 95 + rankKickers(ranks.replace('AA', '').replace('99', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('AA') && ~ranks.indexOf('88')) { rank = 94 + rankKickers(ranks.replace('AA', '').replace('88', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('AA') && ~ranks.indexOf('77')) { rank = 93 + rankKickers(ranks.replace('AA', '').replace('77', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('AA') && ~ranks.indexOf('66')) { rank = 92 + rankKickers(ranks.replace('AA', '').replace('66', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('AA') && ~ranks.indexOf('55')) { rank = 91 + rankKickers(ranks.replace('AA', '').replace('55', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('AA') && ~ranks.indexOf('44')) { rank = 90 + rankKickers(ranks.replace('AA', '').replace('44', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('AA') && ~ranks.indexOf('33')) { rank = 89 + rankKickers(ranks.replace('AA', '').replace('33', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('AA') && ~ranks.indexOf('22')) { rank = 88 + rankKickers(ranks.replace('AA', '').replace('22', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KK') && ~ranks.indexOf('QQ')) { rank = 87 + rankKickers(ranks.replace('KK', '').replace('QQ', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KK') && ~ranks.indexOf('JJ')) { rank = 86 + rankKickers(ranks.replace('KK', '').replace('JJ', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KK') && ~ranks.indexOf('TT')) { rank = 85 + rankKickers(ranks.replace('KK', '').replace('TT', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KK') && ~ranks.indexOf('99')) { rank = 84 + rankKickers(ranks.replace('KK', '').replace('99', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KK') && ~ranks.indexOf('88')) { rank = 83 + rankKickers(ranks.replace('KK', '').replace('88', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KK') && ~ranks.indexOf('77')) { rank = 82 + rankKickers(ranks.replace('KK', '').replace('77', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KK') && ~ranks.indexOf('66')) { rank = 81 + rankKickers(ranks.replace('KK', '').replace('66', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KK') && ~ranks.indexOf('55')) { rank = 80 + rankKickers(ranks.replace('KK', '').replace('55', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KK') && ~ranks.indexOf('44')) { rank = 79 + rankKickers(ranks.replace('KK', '').replace('44', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KK') && ~ranks.indexOf('33')) { rank = 78 + rankKickers(ranks.replace('KK', '').replace('33', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('KK') && ~ranks.indexOf('22')) { rank = 77 + rankKickers(ranks.replace('KK', '').replace('22', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('QQ') && ~ranks.indexOf('JJ')) { rank = 76 + rankKickers(ranks.replace('QQ', '').replace('JJ', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('QQ') && ~ranks.indexOf('TT')) { rank = 75 + rankKickers(ranks.replace('QQ', '').replace('TT', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('QQ') && ~ranks.indexOf('99')) { rank = 74 + rankKickers(ranks.replace('QQ', '').replace('99', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('QQ') && ~ranks.indexOf('88')) { rank = 73 + rankKickers(ranks.replace('QQ', '').replace('88', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('QQ') && ~ranks.indexOf('77')) { rank = 72 + rankKickers(ranks.replace('QQ', '').replace('77', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('QQ') && ~ranks.indexOf('66')) { rank = 71 + rankKickers(ranks.replace('QQ', '').replace('66', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('QQ') && ~ranks.indexOf('55')) { rank = 70 + rankKickers(ranks.replace('QQ', '').replace('55', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('QQ') && ~ranks.indexOf('44')) { rank = 69 + rankKickers(ranks.replace('QQ', '').replace('44', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('QQ') && ~ranks.indexOf('33')) { rank = 68 + rankKickers(ranks.replace('QQ', '').replace('33', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('QQ') && ~ranks.indexOf('22')) { rank = 67 + rankKickers(ranks.replace('QQ', '').replace('22', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('JJ') && ~ranks.indexOf('TT')) { rank = 66 + rankKickers(ranks.replace('JJ', '').replace('TT', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('JJ') && ~ranks.indexOf('99')) { rank = 65 + rankKickers(ranks.replace('JJ', '').replace('99', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('JJ') && ~ranks.indexOf('88')) { rank = 64 + rankKickers(ranks.replace('JJ', '').replace('88', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('JJ') && ~ranks.indexOf('77')) { rank = 63 + rankKickers(ranks.replace('JJ', '').replace('77', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('JJ') && ~ranks.indexOf('66')) { rank = 62 + rankKickers(ranks.replace('JJ', '').replace('66', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('JJ') && ~ranks.indexOf('55')) { rank = 61 + rankKickers(ranks.replace('JJ', '').replace('55', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('JJ') && ~ranks.indexOf('44')) { rank = 60 + rankKickers(ranks.replace('JJ', '').replace('44', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('JJ') && ~ranks.indexOf('33')) { rank = 59 + rankKickers(ranks.replace('JJ', '').replace('33', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('JJ') && ~ranks.indexOf('22')) { rank = 58 + rankKickers(ranks.replace('JJ', '').replace('22', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('TT') && ~ranks.indexOf('99')) { rank = 57 + rankKickers(ranks.replace('TT', '').replace('99', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('TT') && ~ranks.indexOf('88')) { rank = 56 + rankKickers(ranks.replace('TT', '').replace('88', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('TT') && ~ranks.indexOf('77')) { rank = 55 + rankKickers(ranks.replace('TT', '').replace('77', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('TT') && ~ranks.indexOf('66')) { rank = 54 + rankKickers(ranks.replace('TT', '').replace('66', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('TT') && ~ranks.indexOf('55')) { rank = 53 + rankKickers(ranks.replace('TT', '').replace('55', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('TT') && ~ranks.indexOf('44')) { rank = 52 + rankKickers(ranks.replace('TT', '').replace('44', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('TT') && ~ranks.indexOf('33')) { rank = 51 + rankKickers(ranks.replace('TT', '').replace('33', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('TT') && ~ranks.indexOf('22')) { rank = 50 + rankKickers(ranks.replace('TT', '').replace('22', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('99') && ~ranks.indexOf('88')) { rank = 49 + rankKickers(ranks.replace('99', '').replace('88', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('99') && ~ranks.indexOf('77')) { rank = 48 + rankKickers(ranks.replace('99', '').replace('77', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('99') && ~ranks.indexOf('66')) { rank = 47 + rankKickers(ranks.replace('99', '').replace('66', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('99') && ~ranks.indexOf('55')) { rank = 46 + rankKickers(ranks.replace('99', '').replace('55', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('99') && ~ranks.indexOf('44')) { rank = 45 + rankKickers(ranks.replace('99', '').replace('44', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('99') && ~ranks.indexOf('33')) { rank = 44 + rankKickers(ranks.replace('99', '').replace('33', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('99') && ~ranks.indexOf('22')) { rank = 43 + rankKickers(ranks.replace('99', '').replace('22', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('88') && ~ranks.indexOf('77')) { rank = 42 + rankKickers(ranks.replace('88', '').replace('77', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('88') && ~ranks.indexOf('66')) { rank = 41 + rankKickers(ranks.replace('88', '').replace('66', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('88') && ~ranks.indexOf('55')) { rank = 40 + rankKickers(ranks.replace('88', '').replace('55', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('88') && ~ranks.indexOf('44')) { rank = 39 + rankKickers(ranks.replace('88', '').replace('44', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('88') && ~ranks.indexOf('33')) { rank = 38 + rankKickers(ranks.replace('88', '').replace('33', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('88') && ~ranks.indexOf('22')) { rank = 37 + rankKickers(ranks.replace('88', '').replace('22', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('77') && ~ranks.indexOf('66')) { rank = 36 + rankKickers(ranks.replace('77', '').replace('66', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('77') && ~ranks.indexOf('55')) { rank = 35 + rankKickers(ranks.replace('77', '').replace('55', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('77') && ~ranks.indexOf('44')) { rank = 34 + rankKickers(ranks.replace('77', '').replace('44', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('77') && ~ranks.indexOf('33')) { rank = 33 + rankKickers(ranks.replace('77', '').replace('33', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('77') && ~ranks.indexOf('22')) { rank = 32 + rankKickers(ranks.replace('77', '').replace('22', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('66') && ~ranks.indexOf('55')) { rank = 31 + rankKickers(ranks.replace('66', '').replace('55', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('66') && ~ranks.indexOf('44')) { rank = 30 + rankKickers(ranks.replace('66', '').replace('44', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('66') && ~ranks.indexOf('33')) { rank = 29 + rankKickers(ranks.replace('66', '').replace('33', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('66') && ~ranks.indexOf('22')) { rank = 28 + rankKickers(ranks.replace('66', '').replace('22', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('55') && ~ranks.indexOf('44')) { rank = 27 + rankKickers(ranks.replace('55', '').replace('44', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('55') && ~ranks.indexOf('33')) { rank = 26 + rankKickers(ranks.replace('55', '').replace('33', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('55') && ~ranks.indexOf('22')) { rank = 25 + rankKickers(ranks.replace('55', '').replace('22', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('44') && ~ranks.indexOf('33')) { rank = 24 + rankKickers(ranks.replace('44', '').replace('33', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('44') && ~ranks.indexOf('22')) { rank = 23 + rankKickers(ranks.replace('44', '').replace('22', ''), 1) }
    if (rank === 0 && ~ranks.indexOf('33') && ~ranks.indexOf('22')) { rank = 22 + rankKickers(ranks.replace('33', '').replace('22', ''), 1) }
    if (rank !== 0) {message = 'Two Pair' }
  }

  // One Pair
  if (rank === 0) {
    if (              ~ranks.indexOf('AA')) { rank = 21 + rankKickers(ranks.replace('AA', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('KK')) { rank = 20 + rankKickers(ranks.replace('KK', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('QQ')) { rank = 19 + rankKickers(ranks.replace('QQ', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('JJ')) { rank = 18 + rankKickers(ranks.replace('JJ', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('TT')) { rank = 17 + rankKickers(ranks.replace('TT', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('99')) { rank = 16 + rankKickers(ranks.replace('99', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('88')) { rank = 15 + rankKickers(ranks.replace('88', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('77')) { rank = 14 + rankKickers(ranks.replace('77', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('66')) { rank = 13 + rankKickers(ranks.replace('66', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('55')) { rank = 12 + rankKickers(ranks.replace('55', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('44')) { rank = 11 + rankKickers(ranks.replace('44', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('33')) { rank = 10 + rankKickers(ranks.replace('33', ''), 3) }
    if (rank === 0 && ~ranks.indexOf('22')) { rank = 9 + rankKickers(ranks.replace('22', ''), 3) }
    if (rank !== 0) {message = 'Pair' }
  }

  // High Card
  if (rank === 0) {
    if (              ~ranks.indexOf('A')) { rank = 8 + rankKickers(ranks.replace('A', ''), 4) }
    if (rank === 0 && ~ranks.indexOf('K')) { rank = 7 + rankKickers(ranks.replace('K', ''), 4) }
    if (rank === 0 && ~ranks.indexOf('Q')) { rank = 6 + rankKickers(ranks.replace('Q', ''), 4) }
    if (rank === 0 && ~ranks.indexOf('J')) { rank = 5 + rankKickers(ranks.replace('J', ''), 4) }
    if (rank === 0 && ~ranks.indexOf('T')) { rank = 4 + rankKickers(ranks.replace('T', ''), 4) }
    if (rank === 0 && ~ranks.indexOf('9')) { rank = 3 + rankKickers(ranks.replace('9', ''), 4) }
    if (rank === 0 && ~ranks.indexOf('8')) { rank = 2 + rankKickers(ranks.replace('8', ''), 4) }
    if (rank === 0 && ~ranks.indexOf('7')) { rank = 1 + rankKickers(ranks.replace('7', ''), 4) }
    if (rank !== 0) {message = 'High Card' }
  }

  return { rank, message }
}

function rankHand (hand) {
  var myResult = rankHandInt(hand)
  hand.rank = myResult.rank
  hand.message = myResult.message

  return hand
}

class Game {
  constructor (smallBlind, bigBlind) {
    this.smallBlind = smallBlind
    this.bigBlind = bigBlind
    this.pot = 0
    this.roundName = 'Deal' // Start the first round
    this.betName = 'bet' // bet,raise,re-raise,cap
    this.bets = []
    this.roundBets = []
    this.deck = []
    this.board = []
    fillDeck(this.deck)
  }

  getMaxBet () {
    var maxBet = 0
    for (var bet of this.bets) if (bet > maxBet) maxBet = bet
    return maxBet
  }

}


function rankHands (hands) {
  var i, myResult

  for (i = 0; i < hands.length; i++) {
    myResult = rankHandInt(hands[i])
    hands[i].rank = myResult.rank
    hands[i].message = myResult.message
  }

  return hands
}

export { Table, Game, Player, rankHands, rankHand }
