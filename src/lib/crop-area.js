'use strict'

import CropCanvas from './crop-canvas'

class CropArea {
  constructor (ctx, events) {
    this._ctx = ctx
    this._events = events

    this._minSize = 10

    this._cropCanvas = new CropCanvas(ctx)

    this._image = new Image()
    this._x = 0
    this._y = 0
    this._size = 200
  }

  /* GETTERS/SETTERS */

  getImage () {
    return this._image
  }
  setImage (image) {
    this._image = image
  }

  getX () {
    return this._x
  }
  setX (x) {
    this._x = x
    this._dontDragOutside()
  }

  getY () {
    return this._y
  }
  setY (y) {
    this._y = y
    this._dontDragOutside()
  }

  getSize () {
    return this._size
  }
  setSize (size) {
    this._size = Math.max(this._minSize, size)
    this._dontDragOutside()
  }

  getMinSize () {
    return this._minSize
  }
  setMinSize (size) {
    this._minSize = size
    this._size = Math.max(this._minSize, this._size)
    this._dontDragOutside()
  }

  /* FUNCTIONS */
  _dontDragOutside () {
    var h = this._ctx.canvas.height,
      w = this._ctx.canvas.width
    if (this._size > w) { this._size = w; }
    if (this._size > h) { this._size = h; }
    if (this._x < this._size / 2) { this._x = this._size / 2; }
    if (this._x > w - this._size / 2) { this._x = w - this._size / 2; }
    if (this._y < this._size / 2) { this._y = this._size / 2; }
    if (this._y > h - this._size / 2) { this._y = h - this._size / 2; }
  }

  _drawArea () {}

  draw () {
    // draw crop area
    this._cropCanvas.drawCropArea(this._image, [this._x, this._y], this._size, this._drawArea)
  }

  processMouseMove () {}

  processMouseDown () {}

  processMouseUp () {}
}

export default CropArea
