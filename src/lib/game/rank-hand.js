function rankKickers (noOfCards, ranks) {
  var kickerRank = 0
  var myRanks = []
  var rank = ''
  var i = 0

  for (; i < ranks.length; i++) {
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

  if (noOfCards > myRanks.length) noOfCards = myRanks.length

  for (i = 0; i < noOfCards; i++) {
    kickerRank += myRanks[i]
  }

  return kickerRank
}

const remove = (str, r1, r2) => r2 ? str.replace(r1, '').replace(r2, '') : str.replace(r1, '')
export function rankHandInt (_cards) {
  var rank = 0
  var message = ''

  var l = _cards.length
  var handRanks = new Array(l)
  var handSuits = new Array(l)
  for (var i = 0; i < l; i++) {
    handRanks[i] = _cards[i][0]
    handSuits[i] = _cards[i][1]
  }

  var ranks = handRanks.sort().join('')
  var suits = handSuits.sort().join('')
  var cards = _cards.join(',')

  // console.log('ranks', ranks)
  // console.log('suits', suits)
  // console.log('cards', cards)

  // Four of a kind
  if (rank === 0) {
    rank =
      ~ranks.indexOf('AAAA') ? 292 + rankKickers(1, remove(ranks, 'AAAA')) :
      ~ranks.indexOf('KKKK') ? 291 + rankKickers(1, remove(ranks, 'KKKK')) :
      ~ranks.indexOf('QQQQ') ? 290 + rankKickers(1, remove(ranks, 'QQQQ')) :
      ~ranks.indexOf('JJJJ') ? 289 + rankKickers(1, remove(ranks, 'JJJJ')) :
      ~ranks.indexOf('TTTT') ? 288 + rankKickers(1, remove(ranks, 'TTTT')) :
      ~ranks.indexOf('9999') ? 287 + rankKickers(1, remove(ranks, '9999')) :
      ~ranks.indexOf('8888') ? 286 + rankKickers(1, remove(ranks, '8888')) :
      ~ranks.indexOf('7777') ? 285 + rankKickers(1, remove(ranks, '7777')) :
      ~ranks.indexOf('6666') ? 284 + rankKickers(1, remove(ranks, '6666')) :
      ~ranks.indexOf('5555') ? 283 + rankKickers(1, remove(ranks, '5555')) :
      ~ranks.indexOf('4444') ? 282 + rankKickers(1, remove(ranks, '4444')) :
      ~ranks.indexOf('3333') ? 281 + rankKickers(1, remove(ranks, '3333')) :
      ~ranks.indexOf('2222') ? 280 + rankKickers(1, remove(ranks, '2222')) : 0
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
        ~cards.indexOf('AD') && ~cards.indexOf('2D') && ~cards.indexOf('3D') && ~cards.indexOf('4D') && ~cards.indexOf('5D') ? 293 : 123 + rankKickers(5, ranks)
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
      ~ranks.indexOf('AAA') ? 112 + rankKickers(2, remove(ranks, 'AAA')) :
      ~ranks.indexOf('KKK') ? 111 + rankKickers(2, remove(ranks, 'KKK')) :
      ~ranks.indexOf('QQQ') ? 110 + rankKickers(2, remove(ranks, 'QQQ')) :
      ~ranks.indexOf('JJJ') ? 109 + rankKickers(2, remove(ranks, 'JJJ')) :
      ~ranks.indexOf('TTT') ? 108 + rankKickers(2, remove(ranks, 'TTT')) :
      ~ranks.indexOf('999') ? 107 + rankKickers(2, remove(ranks, '999')) :
      ~ranks.indexOf('888') ? 106 + rankKickers(2, remove(ranks, '888')) :
      ~ranks.indexOf('777') ? 105 + rankKickers(2, remove(ranks, '777')) :
      ~ranks.indexOf('666') ? 104 + rankKickers(2, remove(ranks, '666')) :
      ~ranks.indexOf('555') ? 103 + rankKickers(2, remove(ranks, '555')) :
      ~ranks.indexOf('444') ? 102 + rankKickers(2, remove(ranks, '444')) :
      ~ranks.indexOf('333') ? 101 + rankKickers(2, remove(ranks, '333')) :
      ~ranks.indexOf('222') ? 100 + rankKickers(2, remove(ranks, '222')) : 0
    if (rank !== 0) { message = 'Three of a Kind' }
  }

  // Two pair
  if (rank === 0) {
    rank =
      ~ranks.indexOf('AA') && ~ranks.indexOf('KK') ? 99 + rankKickers(1, remove(ranks, 'AA', 'KK')) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('QQ') ? 98 + rankKickers(1, remove(ranks, 'AA', 'QQ')) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('JJ') ? 97 + rankKickers(1, remove(ranks, 'AA', 'JJ')) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('TT') ? 96 + rankKickers(1, remove(ranks, 'AA', 'TT')) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('99') ? 95 + rankKickers(1, remove(ranks, 'AA', '99')) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('88') ? 94 + rankKickers(1, remove(ranks, 'AA', '88')) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('77') ? 93 + rankKickers(1, remove(ranks, 'AA', '77')) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('66') ? 92 + rankKickers(1, remove(ranks, 'AA', '66')) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('55') ? 91 + rankKickers(1, remove(ranks, 'AA', '55')) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('44') ? 90 + rankKickers(1, remove(ranks, 'AA', '44')) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('33') ? 89 + rankKickers(1, remove(ranks, 'AA', '33')) :
      ~ranks.indexOf('AA') && ~ranks.indexOf('22') ? 88 + rankKickers(1, remove(ranks, 'AA', '22')) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('QQ') ? 87 + rankKickers(1, remove(ranks, 'KK', 'QQ')) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('JJ') ? 86 + rankKickers(1, remove(ranks, 'KK', 'JJ')) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('TT') ? 85 + rankKickers(1, remove(ranks, 'KK', 'TT')) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('99') ? 84 + rankKickers(1, remove(ranks, 'KK', '99')) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('88') ? 83 + rankKickers(1, remove(ranks, 'KK', '88')) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('77') ? 82 + rankKickers(1, remove(ranks, 'KK', '77')) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('66') ? 81 + rankKickers(1, remove(ranks, 'KK', '66')) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('55') ? 80 + rankKickers(1, remove(ranks, 'KK', '55')) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('44') ? 79 + rankKickers(1, remove(ranks, 'KK', '44')) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('33') ? 78 + rankKickers(1, remove(ranks, 'KK', '33')) :
      ~ranks.indexOf('KK') && ~ranks.indexOf('22') ? 77 + rankKickers(1, remove(ranks, 'KK', '22')) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('JJ') ? 76 + rankKickers(1, remove(ranks, 'QQ', 'JJ')) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('TT') ? 75 + rankKickers(1, remove(ranks, 'QQ', 'TT')) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('99') ? 74 + rankKickers(1, remove(ranks, 'QQ', '99')) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('88') ? 73 + rankKickers(1, remove(ranks, 'QQ', '88')) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('77') ? 72 + rankKickers(1, remove(ranks, 'QQ', '77')) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('66') ? 71 + rankKickers(1, remove(ranks, 'QQ', '66')) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('55') ? 70 + rankKickers(1, remove(ranks, 'QQ', '55')) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('44') ? 69 + rankKickers(1, remove(ranks, 'QQ', '44')) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('33') ? 68 + rankKickers(1, remove(ranks, 'QQ', '33')) :
      ~ranks.indexOf('QQ') && ~ranks.indexOf('22') ? 67 + rankKickers(1, remove(ranks, 'QQ', '22')) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('TT') ? 66 + rankKickers(1, remove(ranks, 'JJ', 'TT')) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('99') ? 65 + rankKickers(1, remove(ranks, 'JJ', '99')) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('88') ? 64 + rankKickers(1, remove(ranks, 'JJ', '88')) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('77') ? 63 + rankKickers(1, remove(ranks, 'JJ', '77')) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('66') ? 62 + rankKickers(1, remove(ranks, 'JJ', '66')) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('55') ? 61 + rankKickers(1, remove(ranks, 'JJ', '55')) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('44') ? 60 + rankKickers(1, remove(ranks, 'JJ', '44')) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('33') ? 59 + rankKickers(1, remove(ranks, 'JJ', '33')) :
      ~ranks.indexOf('JJ') && ~ranks.indexOf('22') ? 58 + rankKickers(1, remove(ranks, 'JJ', '22')) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('99') ? 57 + rankKickers(1, remove(ranks, 'TT', '99')) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('88') ? 56 + rankKickers(1, remove(ranks, 'TT', '88')) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('77') ? 55 + rankKickers(1, remove(ranks, 'TT', '77')) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('66') ? 54 + rankKickers(1, remove(ranks, 'TT', '66')) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('55') ? 53 + rankKickers(1, remove(ranks, 'TT', '55')) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('44') ? 52 + rankKickers(1, remove(ranks, 'TT', '44')) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('33') ? 51 + rankKickers(1, remove(ranks, 'TT', '33')) :
      ~ranks.indexOf('TT') && ~ranks.indexOf('22') ? 50 + rankKickers(1, remove(ranks, 'TT', '22')) :
      ~ranks.indexOf('99') && ~ranks.indexOf('88') ? 49 + rankKickers(1, remove(ranks, '99', '88')) :
      ~ranks.indexOf('99') && ~ranks.indexOf('77') ? 48 + rankKickers(1, remove(ranks, '99', '77')) :
      ~ranks.indexOf('99') && ~ranks.indexOf('66') ? 47 + rankKickers(1, remove(ranks, '99', '66')) :
      ~ranks.indexOf('99') && ~ranks.indexOf('55') ? 46 + rankKickers(1, remove(ranks, '99', '55')) :
      ~ranks.indexOf('99') && ~ranks.indexOf('44') ? 45 + rankKickers(1, remove(ranks, '99', '44')) :
      ~ranks.indexOf('99') && ~ranks.indexOf('33') ? 44 + rankKickers(1, remove(ranks, '99', '33')) :
      ~ranks.indexOf('99') && ~ranks.indexOf('22') ? 43 + rankKickers(1, remove(ranks, '99', '22')) :
      ~ranks.indexOf('88') && ~ranks.indexOf('77') ? 42 + rankKickers(1, remove(ranks, '88', '77')) :
      ~ranks.indexOf('88') && ~ranks.indexOf('66') ? 41 + rankKickers(1, remove(ranks, '88', '66')) :
      ~ranks.indexOf('88') && ~ranks.indexOf('55') ? 40 + rankKickers(1, remove(ranks, '88', '55')) :
      ~ranks.indexOf('88') && ~ranks.indexOf('44') ? 39 + rankKickers(1, remove(ranks, '88', '44')) :
      ~ranks.indexOf('88') && ~ranks.indexOf('33') ? 38 + rankKickers(1, remove(ranks, '88', '33')) :
      ~ranks.indexOf('88') && ~ranks.indexOf('22') ? 37 + rankKickers(1, remove(ranks, '88', '22')) :
      ~ranks.indexOf('77') && ~ranks.indexOf('66') ? 36 + rankKickers(1, remove(ranks, '77', '66')) :
      ~ranks.indexOf('77') && ~ranks.indexOf('55') ? 35 + rankKickers(1, remove(ranks, '77', '55')) :
      ~ranks.indexOf('77') && ~ranks.indexOf('44') ? 34 + rankKickers(1, remove(ranks, '77', '44')) :
      ~ranks.indexOf('77') && ~ranks.indexOf('33') ? 33 + rankKickers(1, remove(ranks, '77', '33')) :
      ~ranks.indexOf('77') && ~ranks.indexOf('22') ? 32 + rankKickers(1, remove(ranks, '77', '22')) :
      ~ranks.indexOf('66') && ~ranks.indexOf('55') ? 31 + rankKickers(1, remove(ranks, '66', '55')) :
      ~ranks.indexOf('66') && ~ranks.indexOf('44') ? 30 + rankKickers(1, remove(ranks, '66', '44')) :
      ~ranks.indexOf('66') && ~ranks.indexOf('33') ? 29 + rankKickers(1, remove(ranks, '66', '33')) :
      ~ranks.indexOf('66') && ~ranks.indexOf('22') ? 28 + rankKickers(1, remove(ranks, '66', '22')) :
      ~ranks.indexOf('55') && ~ranks.indexOf('44') ? 27 + rankKickers(1, remove(ranks, '55', '44')) :
      ~ranks.indexOf('55') && ~ranks.indexOf('33') ? 26 + rankKickers(1, remove(ranks, '55', '33')) :
      ~ranks.indexOf('55') && ~ranks.indexOf('22') ? 25 + rankKickers(1, remove(ranks, '55', '22')) :
      ~ranks.indexOf('44') && ~ranks.indexOf('33') ? 24 + rankKickers(1, remove(ranks, '44', '33')) :
      ~ranks.indexOf('44') && ~ranks.indexOf('22') ? 23 + rankKickers(1, remove(ranks, '44', '22')) :
      ~ranks.indexOf('33') && ~ranks.indexOf('22') ? 22 + rankKickers(1, remove(ranks, '33', '22')) : 0
    if (rank !== 0) { message = 'Two Pair' }
  }

  // One Pair
  if (rank === 0) {
    rank =
      ~ranks.indexOf('AA') ? 21 + rankKickers(3, remove(ranks, 'AA')) :
      ~ranks.indexOf('KK') ? 20 + rankKickers(3, remove(ranks, 'KK')) :
      ~ranks.indexOf('QQ') ? 19 + rankKickers(3, remove(ranks, 'QQ')) :
      ~ranks.indexOf('JJ') ? 18 + rankKickers(3, remove(ranks, 'JJ')) :
      ~ranks.indexOf('TT') ? 17 + rankKickers(3, remove(ranks, 'TT')) :
      ~ranks.indexOf('99') ? 16 + rankKickers(3, remove(ranks, '99')) :
      ~ranks.indexOf('88') ? 15 + rankKickers(3, remove(ranks, '88')) :
      ~ranks.indexOf('77') ? 14 + rankKickers(3, remove(ranks, '77')) :
      ~ranks.indexOf('66') ? 13 + rankKickers(3, remove(ranks, '66')) :
      ~ranks.indexOf('55') ? 12 + rankKickers(3, remove(ranks, '55')) :
      ~ranks.indexOf('44') ? 11 + rankKickers(3, remove(ranks, '44')) :
      ~ranks.indexOf('33') ? 10 + rankKickers(3, remove(ranks, '33')) :
      ~ranks.indexOf('22') ?  9 + rankKickers(3, remove(ranks, '22')) : 0
    if (rank !== 0) { message = 'Pair' }
  }

  // High Card
  if (rank === 0) {
    rank =
       ~ranks.indexOf('A') ? 8 + rankKickers(4, remove(ranks, 'A')) :
       ~ranks.indexOf('K') ? 7 + rankKickers(4, remove(ranks, 'K')) :
       ~ranks.indexOf('Q') ? 6 + rankKickers(4, remove(ranks, 'Q')) :
       ~ranks.indexOf('J') ? 5 + rankKickers(4, remove(ranks, 'J')) :
       ~ranks.indexOf('T') ? 4 + rankKickers(4, remove(ranks, 'T')) :
       ~ranks.indexOf('9') ? 3 + rankKickers(4, remove(ranks, '9')) :
       ~ranks.indexOf('8') ? 2 + rankKickers(4, remove(ranks, '8')) :
       ~ranks.indexOf('7') ? 1 + rankKickers(4, remove(ranks, '7')) : 0
    if (rank !== 0) { message = 'High Card' }
  }

  // console.log('hand:', { rank, message })
  return { v: rank, t: message }
}

export function rankHands (hands) {
  var i = 0, rank

  for (; i < hands.length; i++) {
    rank = rankHandInt(hands[i].cards)
    hands[i].rank = rank.rank
    hands[i].message = rank.message
  }

  return hands
}
