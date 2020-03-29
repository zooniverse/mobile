import { calculateDeleteButtonPosition } from '../shapeUtils'

describe('calculateDeleteButtonPosition', () => {
  describe('when the rects are in the corners', () => {
    const topRight = calculateDeleteButtonPosition(
      80, 0, 20, 20, 100, 1
    )
    expect(topRight).toEqual({ x: 54, y: 0 })

    const bottomRight = calculateDeleteButtonPosition(
      80, 80, 20, 20, 100, 1
    )
    expect(bottomRight).toEqual({ x: 54, y: 67 })

    const bottomLeft = calculateDeleteButtonPosition(
      0, 80, 20, 20, 100, 1
    )
    expect(bottomLeft).toEqual({ x: 20, y: 67 })

    const topLeft = calculateDeleteButtonPosition(
      0, 0, 20, 20, 100, 1
    )
    expect(topLeft).toEqual({ x: 20, y: 0 })
  })

  describe('when the rects are flipped and in the corners', () => {
    const topRight = calculateDeleteButtonPosition(
      100, 20, -20, -20, 100, 1
    )
    expect(topRight).toEqual({ x: 54, y: 0 })

    const bottomRight = calculateDeleteButtonPosition(
      100, 100, -20, -20, 100, 1
    )
    expect(bottomRight).toEqual({ x: 54, y: 67 })

    const bottomLeft = calculateDeleteButtonPosition(
      20, 100, -20, -20, 100, 1
    )
    expect(bottomLeft).toEqual({ x: 20, y: 67 })

    const topLeft = calculateDeleteButtonPosition(
      20, 20, -20, -20, 100, 1
    )
    expect(topLeft).toEqual({ x: 20, y: 0 })
  })

  describe('when the rects fill the screen', () => {
    const fullScreen = calculateDeleteButtonPosition(
      0, 0, 100, 100, 100, 1
    )
    expect(fullScreen).toEqual({ x: 0, y: 0 })

    const fullScreenFlipped = calculateDeleteButtonPosition(
      100, 100, -100, -100, 100, 1
    )
    expect(fullScreenFlipped).toEqual({ x: 0, y: 0 })
  })
})