import {
  Matrix4,
  Vector3,
} from 'three'
import { getSelectionRects, getCaretAtPoint } from './selectionUtils'
import { TextHighlight } from './TextHighlight.js'

const domOverlayBaseStyles = `
position:fixed;
top:0;
left:0;
opacity:0;
overflow:hidden;
margin:0;
pointer-events:none;
width:10px;
height:10px;
transform-origin:0 0;
font-size:10px;
line-height: 10px;
user-select: all;
`

const makeSelectable = (textInstance, options = {}) => {

  const tempMat4a = new Matrix4()
  const tempMat4b = new Matrix4()
  const tempVec3 = new Vector3()

  const _options = Object.assign({
    domContainer: document.documentElement
  }, options);

  textInstance._domElSelectedText = document.createElement('p')
  textInstance.selectionStartIndex = 0;
  textInstance.selectionEndIndex = 0;
  textInstance.selectedText = null;

  _options.domContainer.appendChild(textInstance._domElSelectedText)

  textInstance._domElSelectedText.setAttribute('aria-hidden', 'true')
  textInstance._domElSelectedText.style = domOverlayBaseStyles

  textInstance.selectionRects = []
  textInstance.selectionRectsMeshs = []

  textInstance.isSelectable = true

  /**
 * @member {THREE.Material} selectionMaterial
 * Defines a _base_ material to be used when rendering the text selection. This material will be
 * automatically replaced with a material derived from it, that adds shader code to manage
 * curved text.
 * By default it will derive from a simple white MeshBasicMaterial with alpha of 0.3, but you can use any
 * of the other mesh materials to gain other features like lighting, texture maps, etc.
 *
 * Also see the `selectionColor` shortcut property.
 */
  textInstance.selectionMaterial = null

  /**
   * @member {string|number|THREE.Color} selectionColor
   * This is a shortcut for setting the `color` of the text selection's material. You can use this
   * if you don't want to specify a whole custom `material`. Also, if you do use a custom
   * `material`, this color will only be used for this particuar Text instance, even if
   * that same material instance is shared across multiple Text objects.
   */
  textInstance.selectionColor = null

  textInstance.highlight = new TextHighlight()
  textInstance.add(textInstance.highlight)

  /**
   * update the selection visually and everything related to copy /paste
   */
  textInstance.updateSelection = function (textRenderInfo) {
    this.selectedText = this.text.substring(this.selectionStartIndex, this.selectionEndIndex)
    this.selectionRects = getSelectionRects(textRenderInfo, this.selectionStartIndex, this.selectionEndIndex)
    this._domElSelectedText.textContent = this.selectedText
    this.highlight.startIndex = this.selectionStartIndex
    this.highlight.endIndex = this.selectionEndIndex
    this.highlight.highlightText()
    this.selectDomText()
  }

  /**
   * Select the text contened in _domElSelectedText in order for it to reflect what's currently selected in the Text
   */
  textInstance.selectDomText = function () {
    const sel = document.getSelection()
    sel.removeAllRanges()
    const range = document.createRange()
    range.selectNodeContents(this._domElSelectedText); //sets Range
    sel.removeAllRanges(); //remove all ranges from selection
    sel.addRange(range);
  }

  /**
   * update the position of the overlaying HTML that contain
   * the selected text in order for it to be acessible through context menu copy
   */
  textInstance.updateSelectedDomPosition = function (renderer, camera) {
    const rects = this.selectionRects
    const el = this._domElSelectedText
    if (rects && rects.length) {
      // Find local space rect containing all selection rects
      // TODO can we wrap this even tighter to multiline selections where top/bottom lines are partially selected?
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (let i = 0; i < rects.length; i++) {
        minX = Math.min(minX, rects[i].left)
        minY = Math.min(minY, rects[i].bottom)
        maxX = Math.max(maxX, rects[i].right)
        maxY = Math.max(maxY, rects[i].top)
      }

      const z = this.geometry.boundingBox.max.z
      el.style.transform = this._textRectToCssMatrix(minX, minY, maxX, maxY, z, renderer, camera)
      el.style.display = 'block'
    } else {
      el.style.display = 'none'
    }
  }

  /**
   * Given a rect in local text coordinates, build a CSS matrix3d that will transform
   * a 10x10 DOM element to line up exactly with that rect on the screen.
   * @private
   */
  textInstance._textRectToCssMatrix = function (minX, minY, maxX, maxY, z, renderer, camera) {
    const canvasRect = renderer.domElement.getBoundingClientRect()

    // element dimensions to geometry dimensions (flipping the y)
    tempMat4a.makeScale((maxX - minX) / 10, (minY - maxY) / 10, 1)
      .setPosition(tempVec3.set(minX, maxY, z))

    // geometry to world
    tempMat4a.premultiply(this.matrixWorld)

    // world to camera
    tempMat4a.premultiply(camera.matrixWorldInverse)

    // camera to projection
    tempMat4a.premultiply(camera.projectionMatrix)

    // projection coords (-1 to 1) to screen pixels
    tempMat4a.premultiply(
      tempMat4b.makeScale(canvasRect.width / 2, -canvasRect.height / 2, 1)
        .setPosition(canvasRect.left + canvasRect.width / 2, canvasRect.top + canvasRect.height / 2, 0)
    )

    return `matrix3d(${tempMat4a.elements.join(',')})`
  }

  textInstance.addEventListener('beforerender', function () {
    this.highlight.updateHighlightTextUniforms()
  })

  textInstance.addEventListener('afterrender', function () {
    const renderer = this.renderer
    const camera = this.camera
    this.updateSelectedDomPosition(renderer, camera)
  })

}

export {
  makeSelectable
}
