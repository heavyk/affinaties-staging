export function rankKickers (ranks, noOfCards) {
  var kickerRank = 0
  var myRanks = []
  var rank = ''

  for (var i = 0; i < ranks.length; i++) {
    rank = ranks[i]

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

export function rankHandInt (_cards) {
  var rank = 0
  var message = ''

  var l = _cards.length
  var handRanks = new Array(l)
  var handSuits = new Array(l)
  for (var i = 0; i < l; i++) {
    handRanks[i] = _cards[i].substr(0, 1)
    handSuits[i] = _cards[i].substr(1, 1)
  }

  var ranks = handRanks.sort().toString().replace(/\W/g, '')
  var suits = handSuits.sort().toString().replace(/\W/g, '')
  var cards = _cards.toString()

  console.log('ranks', ranks)
  console.log('suits', suits)
  console.log('cards', cards)

  // Four of a kind
  if (rank === 0) {
    rank =
      ~ranks.indexOf('AAAA') ? 292 + rankKickers(ranks.replace('AAAA', ''), 1) :
      ~ranks.indexOf('KKKK') ? 291 + rankKickers(ranks.replace('KKKK', ''), 1) :
      ~ranks.indexOf('QQQQ') ? 290 + rankKickers(ranks.replace('QQQQ', ''), 1) :
      ~ranks.indexOf('JJJJ') ? 289 + rankKickers(ranks.replace('JJJJ', ''), 1) :
      ~ranks.indexOf('TTTT') ? 288 + rankKickers(ranks.replace('TTTT', ''), 1) :
      ~ranks.indexOf('9999') ? 287 + rankKickers(ranks.replace('9999', ''), 1) :
      ~ranks.indexOf('8888') ? 286 + rankKickers(ranks.replace('8888', ''), 1) :
      ~ranks.indexOf('7777') ? 285 + rankKickers(ranks.replace('7777', ''), 1) :
      ~ranks.indexOf('6666') ? 284 + rankKickers(ranks.replace('6666', ''), 1) :
      ~ranks.indexOf('5555') ? 283 + rankKickers(ranks.replace('5555', ''), 1) :
      ~ranks.indexOf('4444') ? 282 + rankKickers(ranks.replace('4444', ''), 1) :
      ~ranks.indexOf('3333') ? 281 + rankKickers(ranks.replace('3333', ''), 1) :
      ~ranks.indexOf('2222') ? 280 + rankKickers(ranks.replace('2222', ''), 1) : 0
    if (rank !== 0) { message = 'Four of a kind' }
  }

  // Full House
  if (rank === 0) {
    rank =
      ~ranks.indexOf('AAA') && ~ranks.indexOf('KK') ? 279 :
      ~ranks.indexOf('AAA') && ~ranks.indexOf('QQ') ? 278 :
      ~ranks.indexOf('AAA') && ~ranks.indexOf('JJ') ? 277 :
      ~ranks.indexOf('AAA') && ~ranks.indexOf('TT') ? 276 :
      ~ranks.indexOf('AAA') && ~ranks.indexOf('99') ? 275 :
      ~ranks.indexOf('AAA') && ~ranks.indexOf('88') ? 274 :
      ~ranks.indexOf('AAA') && ~ranks.indexOf('77') ? 273 :
      ~ranks.indexOf('AAA') && ~ranks.indexOf('66') ? 272 :
      ~ranks.indexOf('AAA') && ~ranks.indexOf('55') ? 271 :
      ~ranks.indexOf('AAA') && ~ranks.indexOf('44') ? 270 :
      ~ranks.indexOf('AAA') && ~ranks.indexOf('33') ? 269 :
      ~ranks.indexOf('AAA') && ~ranks.indexOf('22') ? 268 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('AA') ? 267 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('QQ') ? 266 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('JJ') ? 265 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('TT') ? 264 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('99') ? 263 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('88') ? 262 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('77') ? 261 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('66') ? 260 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('55') ? 259 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('44') ? 258 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('33') ? 257 :
      ~ranks.indexOf('KKK') && ~ranks.indexOf('22') ? 256 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('AA') ? 255 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('KK') ? 254 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('JJ') ? 253 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('TT') ? 252 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('99') ? 251 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('88') ? 250 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('77') ? 249 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('66') ? 248 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('55') ? 247 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('44') ? 246 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('33') ? 245 :
      ~ranks.indexOf('QQQ') && ~ranks.indexOf('22') ? 244 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('AA') ? 243 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('KK') ? 242 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('QQ') ? 241 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('TT') ? 240 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('99') ? 239 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('88') ? 238 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('77') ? 237 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('66') ? 236 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('55') ? 235 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('44') ? 234 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('33') ? 233 :
      ~ranks.indexOf('JJJ') && ~ranks.indexOf('22') ? 232 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('AA') ? 231 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('KK') ? 230 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('QQ') ? 229 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('JJ') ? 228 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('99') ? 227 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('88') ? 226 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('77') ? 225 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('66') ? 224 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('55') ? 223 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('44') ? 222 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('33') ? 221 :
      ~ranks.indexOf('TTT') && ~ranks.indexOf('22') ? 220 :
      ~ranks.indexOf('999') && ~ranks.indexOf('AA') ? 219 :
      ~ranks.indexOf('999') && ~ranks.indexOf('KK') ? 218 :
      ~ranks.indexOf('999') && ~ranks.indexOf('QQ') ? 217 :
      ~ranks.indexOf('999') && ~ranks.indexOf('JJ') ? 216 :
      ~ranks.indexOf('999') && ~ranks.indexOf('TT') ? 215 :
      ~ranks.indexOf('999') && ~ranks.indexOf('88') ? 214 :
      ~ranks.indexOf('999') && ~ranks.indexOf('77') ? 213 :
      ~ranks.indexOf('999') && ~ranks.indexOf('66') ? 212 :
      ~ranks.indexOf('999') && ~ranks.indexOf('55') ? 211 :
      ~ranks.indexOf('999') && ~ranks.indexOf('44') ? 210 :
      ~ranks.indexOf('999') && ~ranks.indexOf('33') ? 209 :
      ~ranks.indexOf('999') && ~ranks.indexOf('22') ? 208 :
      ~ranks.indexOf('888') && ~ranks.indexOf('AA') ? 207 :
      ~ranks.indexOf('888') && ~ranks.indexOf('KK') ? 206 :
      ~ranks.indexOf('888') && ~ranks.indexOf('QQ') ? 205 :
      ~ranks.indexOf('888') && ~ranks.indexOf('JJ') ? 204 :
      ~ranks.indexOf('888') && ~ranks.indexOf('TT') ? 203 :
      ~ranks.indexOf('888') && ~ranks.indexOf('99') ? 202 :
      ~ranks.indexOf('888') && ~ranks.indexOf('77') ? 201 :
      ~ranks.indexOf('888') && ~ranks.indexOf('66') ? 200 :
      ~ranks.indexOf('888') && ~ranks.indexOf('55') ? 199 :
      ~ranks.indexOf('888') && ~ranks.indexOf('44') ? 198 :
      ~ranks.indexOf('888') && ~ranks.indexOf('33') ? 197 :
      ~ranks.indexOf('888') && ~ranks.indexOf('22') ? 196 :
      ~ranks.indexOf('777') && ~ranks.indexOf('AA') ? 195 :
      ~ranks.indexOf('777') && ~ranks.indexOf('KK') ? 194 :
      ~ranks.indexOf('777') && ~ranks.indexOf('QQ') ? 193 :
      ~ranks.indexOf('777') && ~ranks.indexOf('JJ') ? 192 :
      ~ranks.indexOf('777') && ~ranks.indexOf('TT') ? 191 :
      ~ranks.indexOf('777') && ~ranks.indexOf('99') ? 190 :
      ~ranks.indexOf('777') && ~ranks.indexOf('88') ? 189 :
      ~ranks.indexOf('777') && ~ranks.indexOf('66') ? 188 :
      ~ranks.indexOf('777') && ~ranks.indexOf('55') ? 187 :
      ~ranks.indexOf('777') && ~ranks.indexOf('44') ? 186 :
      ~ranks.indexOf('777') && ~ranks.indexOf('33') ? 185 :
      ~ranks.indexOf('777') && ~ranks.indexOf('22') ? 184 :
      ~ranks.indexOf('666') && ~ranks.indexOf('AA') ? 183 :
      ~ranks.indexOf('666') && ~ranks.indexOf('KK') ? 182 :
      ~ranks.indexOf('666') && ~ranks.indexOf('QQ') ? 181 :
      ~ranks.indexOf('666') && ~ranks.indexOf('JJ') ? 180 :
      ~ranks.indexOf('666') && ~ranks.indexOf('TT') ? 179 :
      ~ranks.indexOf('666') && ~ranks.indexOf('99') ? 178 :
      ~ranks.indexOf('666') && ~ranks.indexOf('88') ? 177 :
      ~ranks.indexOf('666') && ~ranks.indexOf('77') ? 176 :
      ~ranks.indexOf('666') && ~ranks.indexOf('55') ? 175 :
      ~ranks.indexOf('666') && ~ranks.indexOf('44') ? 174 :
      ~ranks.indexOf('666') && ~ranks.indexOf('33') ? 173 :
      ~ranks.indexOf('666') && ~ranks.indexOf('22') ? 172 :
      ~ranks.indexOf('555') && ~ranks.indexOf('AA') ? 171 :
      ~ranks.indexOf('555') && ~ranks.indexOf('KK') ? 170 :
      ~ranks.indexOf('555') && ~ranks.indexOf('QQ') ? 169 :
      ~ranks.indexOf('555') && ~ranks.indexOf('JJ') ? 168 :
      ~ranks.indexOf('555') && ~ranks.indexOf('TT') ? 167 :
      ~ranks.indexOf('555') && ~ranks.indexOf('99') ? 166 :
      ~ranks.indexOf('555') && ~ranks.indexOf('88') ? 165 :
      ~ranks.indexOf('555') && ~ranks.indexOf('77') ? 164 :
      ~ranks.indexOf('555') && ~ranks.indexOf('66') ? 163 :
      ~ranks.indexOf('555') && ~ranks.indexOf('44') ? 162 :
      ~ranks.indexOf('555') && ~ranks.indexOf('33') ? 161 :
      ~ranks.indexOf('555') && ~ranks.indexOf('22') ? 160 :
      ~ranks.indexOf('444') && ~ranks.indexOf('AA') ? 159 :
      ~ranks.indexOf('444') && ~ranks.indexOf('KK') ? 158 :
      ~ranks.indexOf('444') && ~ranks.indexOf('QQ') ? 157 :
      ~ranks.indexOf('444') && ~ranks.indexOf('JJ') ? 156 :
      ~ranks.indexOf('444') && ~ranks.indexOf('TT') ? 155 :
      ~ranks.indexOf('444') && ~ranks.indexOf('99') ? 154 :
      ~ranks.indexOf('444') && ~ranks.indexOf('88') ? 153 :
      ~ranks.indexOf('444') && ~ranks.indexOf('77') ? 152 :
      ~ranks.indexOf('444') && ~ranks.indexOf('66') ? 151 :
      ~ranks.indexOf('444') && ~ranks.indexOf('55') ? 150 :
      ~ranks.indexOf('444') && ~ranks.indexOf('33') ? 149 :
      ~ranks.indexOf('444') && ~ranks.indexOf('22') ? 148 :
      ~ranks.indexOf('333') && ~ranks.indexOf('AA') ? 147 :
      ~ranks.indexOf('333') && ~ranks.indexOf('KK') ? 146 :
      ~ranks.indexOf('333') && ~ranks.indexOf('QQ') ? 145 :
      ~ranks.indexOf('333') && ~ranks.indexOf('JJ') ? 144 :
      ~ranks.indexOf('333') && ~ranks.indexOf('TT') ? 143 :
      ~ranks.indexOf('333') && ~ranks.indexOf('99') ? 142 :
      ~ranks.indexOf('333') && ~ranks.indexOf('88') ? 141 :
      ~ranks.indexOf('333') && ~ranks.indexOf('77') ? 140 :
      ~ranks.indexOf('333') && ~ranks.indexOf('66') ? 139 :
      ~ranks.indexOf('333') && ~ranks.indexOf('55') ? 138 :
      ~ranks.indexOf('333') && ~ranks.indexOf('44') ? 137 :
      ~ranks.indexOf('333') && ~ranks.indexOf('22') ? 136 :
      ~ranks.indexOf('222') && ~ranks.indexOf('AA') ? 135 :
      ~ranks.indexOf('222') && ~ranks.indexOf('KK') ? 134 :
      ~ranks.indexOf('222') && ~ranks.indexOf('QQ') ? 133 :
      ~ranks.indexOf('222') && ~ranks.indexOf('JJ') ? 132 :
      ~ranks.indexOf('222') && ~ranks.indexOf('TT') ? 131 :
      ~ranks.indexOf('222') && ~ranks.indexOf('99') ? 130 :
      ~ranks.indexOf('222') && ~ranks.indexOf('88') ? 129 :
      ~ranks.indexOf('222') && ~ranks.indexOf('77') ? 128 :
      ~ranks.indexOf('222') && ~ranks.indexOf('66') ? 127 :
      ~ranks.indexOf('222') && ~ranks.indexOf('55') ? 126 :
      ~ranks.indexOf('222') && ~ranks.indexOf('44') ? 125 :
      ~ranks.indexOf('222') && ~ranks.indexOf('33') ? 124 : 0
    if (rank !== 0) { message = 'Full House' }
  }

  if (rank === 0) {
    // Flush
    if (~suits.indexOf('CCCCC') || ~suits.indexOf('DDDDD') || ~suits.indexOf('HHHHH') || ~suits.indexOf('SSSSS')) {
      // Straight flush
      rank =
        ~cards.indexOf('TC') && ~cards.indexOf('JC') && ~cards.indexOf('QC') && ~cards.indexOf('KC') && ~cards.indexOf('AC') ? 302 :
        ~cards.indexOf('TD') && ~cards.indexOf('JD') && ~cards.indexOf('QD') && ~cards.indexOf('KD') && ~cards.indexOf('AD') ? 302 :
        ~cards.indexOf('TH') && ~cards.indexOf('JH') && ~cards.indexOf('QH') && ~cards.indexOf('KH') && ~cards.indexOf('AH') ? 302 :
        ~cards.indexOf('TS') && ~cards.indexOf('JS') && ~cards.indexOf('QS') && ~cards.indexOf('KS') && ~cards.indexOf('AS') ? 302 :
        ~cards.indexOf('9C') && ~cards.indexOf('TC') && ~cards.indexOf('JC') && ~cards.indexOf('QC') && ~cards.indexOf('KC') ? 301 :
        ~cards.indexOf('9D') && ~cards.indexOf('TD') && ~cards.indexOf('JD') && ~cards.indexOf('QD') && ~cards.indexOf('KD') ? 301 :
        ~cards.indexOf('9H') && ~cards.indexOf('TH') && ~cards.indexOf('JH') && ~cards.indexOf('QH') && ~cards.indexOf('KH') ? 301 :
        ~cards.indexOf('9S') && ~cards.indexOf('TS') && ~cards.indexOf('JS') && ~cards.indexOf('QS') && ~cards.indexOf('KS') ? 301 :
        ~cards.indexOf('8C') && ~cards.indexOf('9C') && ~cards.indexOf('TC') && ~cards.indexOf('JC') && ~cards.indexOf('QC') ? 300 :
        ~cards.indexOf('8D') && ~cards.indexOf('9D') && ~cards.indexOf('TD') && ~cards.indexOf('JD') && ~cards.indexOf('QD') ? 300 :
        ~cards.indexOf('8H') && ~cards.indexOf('9H') && ~cards.indexOf('TH') && ~cards.indexOf('JH') && ~cards.indexOf('QH') ? 300 :
        ~cards.indexOf('8S') && ~cards.indexOf('9S') && ~cards.indexOf('TS') && ~cards.indexOf('JS') && ~cards.indexOf('QS') ? 300 :
        ~cards.indexOf('7C') && ~cards.indexOf('8C') && ~cards.indexOf('9C') && ~cards.indexOf('TC') && ~cards.indexOf('JC') ? 299 :
        ~cards.indexOf('7D') && ~cards.indexOf('8D') && ~cards.indexOf('9D') && ~cards.indexOf('TD') && ~cards.indexOf('JD') ? 299 :
        ~cards.indexOf('7H') && ~cards.indexOf('8H') && ~cards.indexOf('9H') && ~cards.indexOf('TH') && ~cards.indexOf('JH') ? 299 :
        ~cards.indexOf('7S') && ~cards.indexOf('8S') && ~cards.indexOf('9S') && ~cards.indexOf('TS') && ~cards.indexOf('JS') ? 299 :
        ~cards.indexOf('6C') && ~cards.indexOf('7C') && ~cards.indexOf('8C') && ~cards.indexOf('9C') && ~cards.indexOf('TC') ? 298 :
        ~cards.indexOf('6D') && ~cards.indexOf('7D') && ~cards.indexOf('8D') && ~cards.indexOf('9D') && ~cards.indexOf('TD') ? 298 :
        ~cards.indexOf('6H') && ~cards.indexOf('7H') && ~cards.indexOf('8H') && ~cards.indexOf('9H') && ~cards.indexOf('TH') ? 298 :
        ~cards.indexOf('6S') && ~cards.indexOf('7S') && ~cards.indexOf('8S') && ~cards.indexOf('9S') && ~cards.indexOf('TS') ? 298 :
        ~cards.indexOf('5C') && ~cards.indexOf('6C') && ~cards.indexOf('7C') && ~cards.indexOf('8C') && ~cards.indexOf('9C') ? 297 :
        ~cards.indexOf('5D') && ~cards.indexOf('6D') && ~cards.indexOf('7D') && ~cards.indexOf('8D') && ~cards.indexOf('9D') ? 297 :
        ~cards.indexOf('5H') && ~cards.indexOf('6H') && ~cards.indexOf('7H') && ~cards.indexOf('8H') && ~cards.indexOf('9H') ? 297 :
        ~cards.indexOf('5S') && ~cards.indexOf('6S') && ~cards.indexOf('7S') && ~cards.indexOf('8S') && ~cards.indexOf('9S') ? 297 :
        ~cards.indexOf('4C') && ~cards.indexOf('5C') && ~cards.indexOf('6C') && ~cards.indexOf('7C') && ~cards.indexOf('8C') ? 296 :
        ~cards.indexOf('4D') && ~cards.indexOf('5D') && ~cards.indexOf('6D') && ~cards.indexOf('7D') && ~cards.indexOf('8D') ? 296 :
        ~cards.indexOf('4H') && ~cards.indexOf('5H') && ~cards.indexOf('6H') && ~cards.indexOf('7H') && ~cards.indexOf('8H') ? 296 :
        ~cards.indexOf('4S') && ~cards.indexOf('5S') && ~cards.indexOf('6S') && ~cards.indexOf('7S') && ~cards.indexOf('8S') ? 296 :
        ~cards.indexOf('3C') && ~cards.indexOf('4C') && ~cards.indexOf('5C') && ~cards.indexOf('6C') && ~cards.indexOf('7C') ? 295 :
        ~cards.indexOf('3D') && ~cards.indexOf('4D') && ~cards.indexOf('5D') && ~cards.indexOf('6D') && ~cards.indexOf('7D') ? 295 :
        ~cards.indexOf('3H') && ~cards.indexOf('4H') && ~cards.indexOf('5H') && ~cards.indexOf('6H') && ~cards.indexOf('7H') ? 295 :
        ~cards.indexOf('3S') && ~cards.indexOf('4S') && ~cards.indexOf('5S') && ~cards.indexOf('6S') && ~cards.indexOf('7S') ? 295 :
        ~cards.indexOf('2C') && ~cards.indexOf('3C') && ~cards.indexOf('4C') && ~cards.indexOf('5C') && ~cards.indexOf('6C') ? 294 :
        ~cards.indexOf('2D') && ~cards.indexOf('3D') && ~cards.indexOf('4D') && ~cards.indexOf('5D') && ~cards.indexOf('6D') ? 294 :
        ~cards.indexOf('2H') && ~cards.indexOf('3H') && ~cards.indexOf('4H') && ~cards.indexOf('5H') && ~cards.indexOf('6H') ? 294 :
        ~cards.indexOf('2S') && ~cards.indexOf('3S') && ~cards.indexOf('4S') && ~cards.indexOf('5S') && ~cards.indexOf('6S') ? 294 :
        ~cards.indexOf('AC') && ~cards.indexOf('2C') && ~cards.indexOf('3C') && ~cards.indexOf('4C') && ~cards.indexOf('5C') ? 293 :
        ~cards.indexOf('AS') && ~cards.indexOf('2S') && ~cards.indexOf('3S') && ~cards.indexOf('4S') && ~cards.indexOf('5S') ? 293 :
        ~cards.indexOf('AH') && ~cards.indexOf('2H') && ~cards.indexOf('3H') && ~cards.indexOf('4H') && ~cards.indexOf('5H') ? 293 :
        ~cards.indexOf('AD') && ~cards.indexOf('2D') && ~cards.indexOf('3D') && ~cards.indexOf('4D') && ~cards.indexOf('5D') ? 293 : 123 + rankKickers(ranks, 5)
      message = rank >= 293 ? 'Straight Flush' : 'Flush'
    }
  }

  // Straight
  if (rank === 0) {
    rank =
      ~cards.indexOf('T') && ~cards.indexOf('J') && ~cards.indexOf('Q') && ~cards.indexOf('K') && ~cards.indexOf('A') ? 122 :
      ~cards.indexOf('9') && ~cards.indexOf('T') && ~cards.indexOf('J') && ~cards.indexOf('Q') && ~cards.indexOf('K') ? 121 :
      ~cards.indexOf('8') && ~cards.indexOf('9') && ~cards.indexOf('T') && ~cards.indexOf('J') && ~cards.indexOf('Q') ? 120 :
      ~cards.indexOf('7') && ~cards.indexOf('8') && ~cards.indexOf('9') && ~cards.indexOf('T') && ~cards.indexOf('J') ? 119 :
      ~cards.indexOf('6') && ~cards.indexOf('7') && ~cards.indexOf('8') && ~cards.indexOf('9') && ~cards.indexOf('T') ? 118 :
      ~cards.indexOf('5') && ~cards.indexOf('6') && ~cards.indexOf('7') && ~cards.indexOf('8') && ~cards.indexOf('9') ? 117 :
      ~cards.indexOf('4') && ~cards.indexOf('5') && ~cards.indexOf('6') && ~cards.indexOf('7') && ~cards.indexOf('8') ? 116 :
      ~cards.indexOf('3') && ~cards.indexOf('4') && ~cards.indexOf('5') && ~cards.indexOf('6') && ~cards.indexOf('7') ? 115 :
      ~cards.indexOf('2') && ~cards.indexOf('3') && ~cards.indexOf('4') && ~cards.indexOf('5') && ~cards.indexOf('6') ? 114 :
      ~cards.indexOf('A') && ~cards.indexOf('2') && ~cards.indexOf('3') && ~cards.indexOf('4') && ~cards.indexOf('5') ? 113 : 0
    if (rank !== 0) { message = 'Straight' }
  }

  // Three of a kind
  if (rank === 0) {
    rank =
      ~ranks.indexOf('AAA') ? 112 + rankKickers(ranks.replace('AAA', ''), 2) :
      ~ranks.indexOf('KKK') ? 111 + rankKickers(ranks.replace('KKK', ''), 2) :
      ~ranks.indexOf('QQQ') ? 110 + rankKickers(ranks.replace('QQQ', ''), 2) :
      ~ranks.indexOf('JJJ') ? 109 + rankKickers(ranks.replace('JJJ', ''), 2) :
      ~ranks.indexOf('TTT') ? 108 + rankKickers(ranks.replace('TTT', ''), 2) :
      ~ranks.indexOf('999') ? 107 + rankKickers(ranks.replace('999', ''), 2) :
      ~ranks.indexOf('888') ? 106 + rankKickers(ranks.replace('888', ''), 2) :
      ~ranks.indexOf('777') ? 105 + rankKickers(ranks.replace('777', ''), 2) :
      ~ranks.indexOf('666') ? 104 + rankKickers(ranks.replace('666', ''), 2) :
      ~ranks.indexOf('555') ? 103 + rankKickers(ranks.replace('555', ''), 2) :
      ~ranks.indexOf('444') ? 102 + rankKickers(ranks.replace('444', ''), 2) :
      ~ranks.indexOf('333') ? 101 + rankKickers(ranks.replace('333', ''), 2) :
      ~ranks.indexOf('222') ? 100 + rankKickers(ranks.replace('222', ''), 2) : 0
    if (rank !== 0) { message = 'Three of a Kind' }
  }

  // Two pair
  if (rank === 0) {
    rank =
      ~ranks.indexOf('AA') && ~ranks.indexOf('KK') ? 99 + rankKickers(ranks.replace('AA', '').replace('KK', ''), 1) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('QQ') ? 98 + rankKickers(ranks.replace('AA', '').replace('QQ', ''), 1) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('JJ') ? 97 + rankKickers(ranks.replace('AA', '').replace('JJ', ''), 1) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('TT') ? 96 + rankKickers(ranks.replace('AA', '').replace('TT', ''), 1) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('99') ? 95 + rankKickers(ranks.replace('AA', '').replace('99', ''), 1) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('88') ? 94 + rankKickers(ranks.replace('AA', '').replace('88', ''), 1) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('77') ? 93 + rankKickers(ranks.replace('AA', '').replace('77', ''), 1) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('66') ? 92 + rankKickers(ranks.replace('AA', '').replace('66', ''), 1) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('55') ? 91 + rankKickers(ranks.replace('AA', '').replace('55', ''), 1) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('44') ? 90 + rankKickers(ranks.replace('AA', '').replace('44', ''), 1) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('33') ? 89 + rankKickers(ranks.replace('AA', '').replace('33', ''), 1) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('22') ? 88 + rankKickers(ranks.replace('AA', '').replace('22', ''), 1) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('QQ') ? 87 + rankKickers(ranks.replace('KK', '').replace('QQ', ''), 1) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('JJ') ? 86 + rankKickers(ranks.replace('KK', '').replace('JJ', ''), 1) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('TT') ? 85 + rankKickers(ranks.replace('KK', '').replace('TT', ''), 1) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('99') ? 84 + rankKickers(ranks.replace('KK', '').replace('99', ''), 1) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('88') ? 83 + rankKickers(ranks.replace('KK', '').replace('88', ''), 1) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('77') ? 82 + rankKickers(ranks.replace('KK', '').replace('77', ''), 1) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('66') ? 81 + rankKickers(ranks.replace('KK', '').replace('66', ''), 1) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('55') ? 80 + rankKickers(ranks.replace('KK', '').replace('55', ''), 1) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('44') ? 79 + rankKickers(ranks.replace('KK', '').replace('44', ''), 1) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('33') ? 78 + rankKickers(ranks.replace('KK', '').replace('33', ''), 1) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('22') ? 77 + rankKickers(ranks.replace('KK', '').replace('22', ''), 1) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('JJ') ? 76 + rankKickers(ranks.replace('QQ', '').replace('JJ', ''), 1) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('TT') ? 75 + rankKickers(ranks.replace('QQ', '').replace('TT', ''), 1) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('99') ? 74 + rankKickers(ranks.replace('QQ', '').replace('99', ''), 1) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('88') ? 73 + rankKickers(ranks.replace('QQ', '').replace('88', ''), 1) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('77') ? 72 + rankKickers(ranks.replace('QQ', '').replace('77', ''), 1) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('66') ? 71 + rankKickers(ranks.replace('QQ', '').replace('66', ''), 1) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('55') ? 70 + rankKickers(ranks.replace('QQ', '').replace('55', ''), 1) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('44') ? 69 + rankKickers(ranks.replace('QQ', '').replace('44', ''), 1) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('33') ? 68 + rankKickers(ranks.replace('QQ', '').replace('33', ''), 1) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('22') ? 67 + rankKickers(ranks.replace('QQ', '').replace('22', ''), 1) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('TT') ? 66 + rankKickers(ranks.replace('JJ', '').replace('TT', ''), 1) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('99') ? 65 + rankKickers(ranks.replace('JJ', '').replace('99', ''), 1) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('88') ? 64 + rankKickers(ranks.replace('JJ', '').replace('88', ''), 1) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('77') ? 63 + rankKickers(ranks.replace('JJ', '').replace('77', ''), 1) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('66') ? 62 + rankKickers(ranks.replace('JJ', '').replace('66', ''), 1) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('55') ? 61 + rankKickers(ranks.replace('JJ', '').replace('55', ''), 1) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('44') ? 60 + rankKickers(ranks.replace('JJ', '').replace('44', ''), 1) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('33') ? 59 + rankKickers(ranks.replace('JJ', '').replace('33', ''), 1) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('22') ? 58 + rankKickers(ranks.replace('JJ', '').replace('22', ''), 1) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('99') ? 57 + rankKickers(ranks.replace('TT', '').replace('99', ''), 1) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('88') ? 56 + rankKickers(ranks.replace('TT', '').replace('88', ''), 1) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('77') ? 55 + rankKickers(ranks.replace('TT', '').replace('77', ''), 1) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('66') ? 54 + rankKickers(ranks.replace('TT', '').replace('66', ''), 1) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('55') ? 53 + rankKickers(ranks.replace('TT', '').replace('55', ''), 1) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('44') ? 52 + rankKickers(ranks.replace('TT', '').replace('44', ''), 1) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('33') ? 51 + rankKickers(ranks.replace('TT', '').replace('33', ''), 1) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('22') ? 50 + rankKickers(ranks.replace('TT', '').replace('22', ''), 1) :
      ~ranks.indexOf('99') && ~ranks.indexOf('88') ? 49 + rankKickers(ranks.replace('99', '').replace('88', ''), 1) :
      ~ranks.indexOf('99') && ~ranks.indexOf('77') ? 48 + rankKickers(ranks.replace('99', '').replace('77', ''), 1) :
      ~ranks.indexOf('99') && ~ranks.indexOf('66') ? 47 + rankKickers(ranks.replace('99', '').replace('66', ''), 1) :
      ~ranks.indexOf('99') && ~ranks.indexOf('55') ? 46 + rankKickers(ranks.replace('99', '').replace('55', ''), 1) :
      ~ranks.indexOf('99') && ~ranks.indexOf('44') ? 45 + rankKickers(ranks.replace('99', '').replace('44', ''), 1) :
      ~ranks.indexOf('99') && ~ranks.indexOf('33') ? 44 + rankKickers(ranks.replace('99', '').replace('33', ''), 1) :
      ~ranks.indexOf('99') && ~ranks.indexOf('22') ? 43 + rankKickers(ranks.replace('99', '').replace('22', ''), 1) :
      ~ranks.indexOf('88') && ~ranks.indexOf('77') ? 42 + rankKickers(ranks.replace('88', '').replace('77', ''), 1) :
      ~ranks.indexOf('88') && ~ranks.indexOf('66') ? 41 + rankKickers(ranks.replace('88', '').replace('66', ''), 1) :
      ~ranks.indexOf('88') && ~ranks.indexOf('55') ? 40 + rankKickers(ranks.replace('88', '').replace('55', ''), 1) :
      ~ranks.indexOf('88') && ~ranks.indexOf('44') ? 39 + rankKickers(ranks.replace('88', '').replace('44', ''), 1) :
      ~ranks.indexOf('88') && ~ranks.indexOf('33') ? 38 + rankKickers(ranks.replace('88', '').replace('33', ''), 1) :
      ~ranks.indexOf('88') && ~ranks.indexOf('22') ? 37 + rankKickers(ranks.replace('88', '').replace('22', ''), 1) :
      ~ranks.indexOf('77') && ~ranks.indexOf('66') ? 36 + rankKickers(ranks.replace('77', '').replace('66', ''), 1) :
      ~ranks.indexOf('77') && ~ranks.indexOf('55') ? 35 + rankKickers(ranks.replace('77', '').replace('55', ''), 1) :
      ~ranks.indexOf('77') && ~ranks.indexOf('44') ? 34 + rankKickers(ranks.replace('77', '').replace('44', ''), 1) :
      ~ranks.indexOf('77') && ~ranks.indexOf('33') ? 33 + rankKickers(ranks.replace('77', '').replace('33', ''), 1) :
      ~ranks.indexOf('77') && ~ranks.indexOf('22') ? 32 + rankKickers(ranks.replace('77', '').replace('22', ''), 1) :
      ~ranks.indexOf('66') && ~ranks.indexOf('55') ? 31 + rankKickers(ranks.replace('66', '').replace('55', ''), 1) :
      ~ranks.indexOf('66') && ~ranks.indexOf('44') ? 30 + rankKickers(ranks.replace('66', '').replace('44', ''), 1) :
      ~ranks.indexOf('66') && ~ranks.indexOf('33') ? 29 + rankKickers(ranks.replace('66', '').replace('33', ''), 1) :
      ~ranks.indexOf('66') && ~ranks.indexOf('22') ? 28 + rankKickers(ranks.replace('66', '').replace('22', ''), 1) :
      ~ranks.indexOf('55') && ~ranks.indexOf('44') ? 27 + rankKickers(ranks.replace('55', '').replace('44', ''), 1) :
      ~ranks.indexOf('55') && ~ranks.indexOf('33') ? 26 + rankKickers(ranks.replace('55', '').replace('33', ''), 1) :
      ~ranks.indexOf('55') && ~ranks.indexOf('22') ? 25 + rankKickers(ranks.replace('55', '').replace('22', ''), 1) :
      ~ranks.indexOf('44') && ~ranks.indexOf('33') ? 24 + rankKickers(ranks.replace('44', '').replace('33', ''), 1) :
      ~ranks.indexOf('44') && ~ranks.indexOf('22') ? 23 + rankKickers(ranks.replace('44', '').replace('22', ''), 1) :
      ~ranks.indexOf('33') && ~ranks.indexOf('22') ? 22 + rankKickers(ranks.replace('33', '').replace('22', ''), 1) : 0
    if (rank !== 0) { message = 'Two Pair' }
  }

  // One Pair
  if (rank === 0) {
    rank =
      ~ranks.indexOf('AA') ? 21 + rankKickers(ranks.replace('AA', ''), 3) :
      ~ranks.indexOf('KK') ? 20 + rankKickers(ranks.replace('KK', ''), 3) :
      ~ranks.indexOf('QQ') ? 19 + rankKickers(ranks.replace('QQ', ''), 3) :
      ~ranks.indexOf('JJ') ? 18 + rankKickers(ranks.replace('JJ', ''), 3) :
      ~ranks.indexOf('TT') ? 17 + rankKickers(ranks.replace('TT', ''), 3) :
      ~ranks.indexOf('99') ? 16 + rankKickers(ranks.replace('99', ''), 3) :
      ~ranks.indexOf('88') ? 15 + rankKickers(ranks.replace('88', ''), 3) :
      ~ranks.indexOf('77') ? 14 + rankKickers(ranks.replace('77', ''), 3) :
      ~ranks.indexOf('66') ? 13 + rankKickers(ranks.replace('66', ''), 3) :
      ~ranks.indexOf('55') ? 12 + rankKickers(ranks.replace('55', ''), 3) :
      ~ranks.indexOf('44') ? 11 + rankKickers(ranks.replace('44', ''), 3) :
      ~ranks.indexOf('33') ? 10 + rankKickers(ranks.replace('33', ''), 3) :
      ~ranks.indexOf('22') ?  9 + rankKickers(ranks.replace('22', ''), 3) : 0
    if (rank !== 0) { message = 'Pair' }
  }

  // High Card
  if (rank === 0) {
    rank =
       ~ranks.indexOf('A') ? 8 + rankKickers(ranks.replace('A', ''), 4) :
       ~ranks.indexOf('K') ? 7 + rankKickers(ranks.replace('K', ''), 4) :
       ~ranks.indexOf('Q') ? 6 + rankKickers(ranks.replace('Q', ''), 4) :
       ~ranks.indexOf('J') ? 5 + rankKickers(ranks.replace('J', ''), 4) :
       ~ranks.indexOf('T') ? 4 + rankKickers(ranks.replace('T', ''), 4) :
       ~ranks.indexOf('9') ? 3 + rankKickers(ranks.replace('9', ''), 4) :
       ~ranks.indexOf('8') ? 2 + rankKickers(ranks.replace('8', ''), 4) :
       ~ranks.indexOf('7') ? 1 + rankKickers(ranks.replace('7', ''), 4) : 0
    if (rank !== 0) { message = 'High Card' }
  }

  return { rank, message }
}

export function rankHands (hands) {
  var i, myResult

  for (i = 0; i < hands.length; i++) {
    myResult = rankHandInt(hands[i].cards)
    hands[i].rank = myResult.rank
    hands[i].message = myResult.message
  }

  return hands
}
