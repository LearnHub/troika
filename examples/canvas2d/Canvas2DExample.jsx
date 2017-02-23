import React from 'react'
import {Canvas2D, Group2DFacade, Object2DFacade} from '../../src/index'



class CircleFacade extends Object2DFacade {
  constructor(...args) {
    super(...args)
    this.onMouseOver = e => {
      this.hovered = true
    }
    this.onMouseOut = e => {
      this.hovered = false
    }
  }

  render(ctx) {
    ctx.beginPath()
    ctx.arc(0, 0, this.r, 0, Math.PI * 2)
    if (this.fill) {
      ctx.fillStyle = this.hovered ? '#fff' : this.fill
      ctx.fill()
    }
    if (this.stroke) {
      ctx.lineWidth = 5
      ctx.strokeStyle = this.hovered ? '#fff' : this.stroke
      ctx.stroke()
    }
  }
}

class RectFacade extends Object2DFacade {
  constructor(...args) {
    super(...args)
    this.onMouseOver = e => {
      this.hovered = true
    }
    this.onMouseOut = e => {
      this.hovered = false
    }
  }

  render(ctx) {
    ctx.beginPath()
    ctx.rect(0, 0, this.width, this.height)
    if (this.fill) {
      ctx.fillStyle = this.hovered ? '#fff' : this.fill
      ctx.fill()
    }
    if (this.stroke) {
      ctx.lineWidth = 5
      ctx.strokeStyle = this.hovered ? '#fff' : this.stroke
      ctx.stroke()
    }
  }
}


export default React.createClass({
  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },

  getInitialState() {
    return {
    }
  },

  render() {
    let state = this.state
    let {width, height} = this.props

    return (
      <div>
        <Canvas2D
          width={ width }
          height={ height }
          objects={ [
            {
              key: 'circle1',
              class: CircleFacade,
              x: 100,
              y: 100,
              r: 50,
              fill: 'blue',
              animation: {
                from: {r: 20},
                to: {r: 50},
                duration: 1000,
                iterations: Infinity,
                direction: 'alternate'
              }
            },
            {
              key: 'circle2',
              class: CircleFacade,
              x: 100,
              y: 300,
              r: 50,
              stroke: 'blue',
              animation: {
                from: {r: 20, scaleX: 1},
                to: {r: 50, scaleX: 2},
                duration: 1000,
                iterations: Infinity,
                direction: 'alternate'
              }
            },
            {
              key: 'group1',
              class: Group2DFacade,
              x: 300,
              y: 300,
              scaleY: 2,
              animation: {
                from: {rotate: 0},
                to: {rotate: Math.PI * 2},
                duration: 5000,
                iterations: Infinity
              },
              children: [
                {
                  key: 'circle1',
                  class: CircleFacade,
                  x: -100,
                  r: 25,
                  fill: '#090',
                  scaleY: 2,
                  animation: {
                    from: {rotate: 0},
                    to: {rotate: Math.PI * 2},
                    duration: 2000,
                    iterations: Infinity,
                  }
                },
                {
                  key: 'circle2',
                  class: CircleFacade,
                  x: 100,
                  r: 25,
                  stroke: '#090',
                  scaleY: 2,
                  animation: {
                    from: {rotate: 0},
                    to: {rotate: Math.PI * -2},
                    duration: 2000,
                    iterations: Infinity,
                  }
                }
              ]
            },
            {
              key: 'hitTest',
              class: Group2DFacade,
              children: [
                {
                  key: '1',
                  class: RectFacade,
                  x: 0,
                  y: 600,
                  width: 100,
                  height: 100,
                  fill: '#600'
                },
                {
                  key: '2',
                  class: RectFacade,
                  x: 50,
                  y: 650,
                  width: 100,
                  height: 100,
                  fill: '#900'
                },
                {
                  key: '3',
                  class: RectFacade,
                  x: 100,
                  y: 700,
                  width: 100,
                  height: 100,
                  fill: '#c00'
                }
              ]
            },
            {
              key: 'zIndexChanges',
              class: Group2DFacade,
              x: 300,
              y: 500,
              children: [0,1,2,3,4,5,6,7].map(i => ({
                key: `${i}`,
                class: RectFacade,
                x: i * 20,
                y: 0,
                width: 50,
                height: 50,
                fill: `rgb(100, ${Math.floor(255 * i / 8)}, 100)`,
                animation: {
                  from: {y: 0, z: 0},
                  to: {y: 100, z: 100},
                  duration: 2000,
                  iterations: Infinity,
                  direction: 'alternate',
                  delay: 2000 * i / 8
                }
              }))
            }
          ] }
        />

        <div className="example_desc">
        </div>

        <div className="example_controls">
        </div>
      </div>
    )
  }
})

