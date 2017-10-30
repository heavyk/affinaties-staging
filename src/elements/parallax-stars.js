import PoemBase from './poem-base'

import { _px, compute } from '../lib/dom/observable'

const random = (n) => Math.floor(Math.random() * n)

export default class ParallaxStars extends PoemBase {
  constructor (_opts) {
    super(_opts, (G) => {
      compute([
        this.attr('width', 2000),
        this.attr('height', 300),
        this.attr('density', 100)
      ], (width, height, density) => {
        const star_shadows = (n) => Array(n).fill(0).map(v => random(width)+'px '+random(height)+'px #FFF').join(',')
        var sm_stars = star_shadows(density * 7)
        var md_stars = star_shadows(density * 2)
        var lg_stars = star_shadows(density * 1)

        this.style = `
        :host {
          display: block;
          contain: content;
          min-height: ${height}px;
          background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
          overflow: hidden;
        }

        #s1 {
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: ${sm_stars};
          animation: animStar 50s linear infinite;
        }
        #s1:after {
          content: " ";
          position: absolute;
          top: ${height}px;
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: ${sm_stars};
        }

        #s2 {
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: ${md_stars};
          animation: animStar 100s linear infinite;
        }
        #s2:after {
          content: " ";
          position: absolute;
          top: ${height}px;
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: ${md_stars};
        }

        #s3 {
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: ${lg_stars};
          animation: animStar 150s linear infinite;
        }
        #s3:after {
          content: " ";
          position: absolute;
          top: ${height}px;
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: ${lg_stars};
        }

        #title {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          color: #FFF;
          text-align: center;
          font-family: "lato", sans-serif;
          font-weight: 300;
          font-size: 50px;
          letter-spacing: 10px;
          padding-left: 10px;
          transform: translateY(-50%);
        }
        #title span {
          background: linear-gradient(white, #38495a);
          background-clip: text;
          text-fill-color: transparent;
        }

        @keyframes animStar {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-${height}px);
          }
        }
        `
      })

      const { h } = G
      this.els([
        h('#title', h('slot')),
        h('#s1'),
        h('#s2'),
        h('#s3'),
      ])
    })
  }

  prompt (msg, options, _answer) {
    var self = this
    var ctx = self._ctx = self.context()
    var h = ctx.h
    var tipW = self.attr('tip-w')
    var tipH = self.attr('tip-h')
    var answer = (a) => {
      if (!_answer(a)) self.close() // remove all elements if answer did not return truthy
    }
    var innerTip = self.fn(ctx, msg, options, answer)
    var inner, outer = h('#tooltip-outer', {s: {left: self.attrx('x', _px), top: self.attrx('y', _px)}},
      h('#tooltip-arrow'),
      // inner = h('#tooltip-inner', innerTip)
      inner = h('#tooltip-inner', h('slot'))
    )
    self.els(outer)
    self.aC(innerTip)
    setTimeout(() => {
      tipW(inner.clientWidth / 2)
      tipH(inner.clientHeight / 2)
      inner.style.visibility = 'visible'
      if (typeof options.onfocus === 'function') options.onfocus(inner)
    }, 0)
  }

  close () {
    var ctx = this._ctx
    if (ctx) ctx.cleanup()
    this.els()
  }
}

import { special_elements } from '../lib/dom/hyper-hermes'
special_elements.define('parallax-stars', ParallaxStars)
