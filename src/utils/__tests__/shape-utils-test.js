import {calculateDeleteButtonPosition} from '../shapeUtils'

it('moves delete button when the rects are in the corners', () => {
    const topRightCornerDeleteButtonPosition = calculateDeleteButtonPosition(
        80, 0, 20, 20, 100, 1
    )
    expect(topRightCornerDeleteButtonPosition).toEqual({x: 54, y: 0})

    const bottomRightCornerDeleteButtonPosition = calculateDeleteButtonPosition(
        80, 80, 20, 20, 100, 1
    )
    expect(bottomRightCornerDeleteButtonPosition).toEqual({x: 54, y: 67})

    const bottomLeftCornerDeleteButtonPosition = calculateDeleteButtonPosition(
        0, 80, 20, 20, 100, 1
    )
    expect(bottomLeftCornerDeleteButtonPosition).toEqual({x: 20, y: 67})

    const topLeftCornerDeleteButtonPosition = calculateDeleteButtonPosition(
        0, 0, 20, 20, 100, 1
    )
    expect(topLeftCornerDeleteButtonPosition).toEqual({x: 20, y: 0})
})

it('moves delete button when the rects are flipped and in the corners', () => {
    const topRightCornerDeleteButtonPosition = calculateDeleteButtonPosition(
        100, 20, -20, -20, 100, 1
    )
    expect(topRightCornerDeleteButtonPosition).toEqual({x: 54, y: 0})

    const bottomRightCornerDeleteButtonPosition = calculateDeleteButtonPosition(
        100, 100, -20, -20, 100, 1
    )
    expect(bottomRightCornerDeleteButtonPosition).toEqual({x: 54, y: 67})

    const bottomLeftCornerDeleteButtonPosition = calculateDeleteButtonPosition(
        20, 100, -20, -20, 100, 1
    )
    expect(bottomLeftCornerDeleteButtonPosition).toEqual({x: 20, y: 67})

    const topLeftCornerDeleteButtonPosition = calculateDeleteButtonPosition(
        20, 20, -20, -20, 100, 1
    )
    expect(topLeftCornerDeleteButtonPosition).toEqual({x: 20, y: 0})
})

it('moves delete button when the rects fill the screen', () => {
    const fullScreenDeleteButtonPosition = calculateDeleteButtonPosition(
        0, 0, 100, 100, 100, 1
    )
    expect(fullScreenDeleteButtonPosition).toEqual({x: 0, y: 0})

    const fullScreenFlippedDeleteButtonPosition = calculateDeleteButtonPosition(
        100, 100, -100, -100, 100, 1
    )
    expect(fullScreenFlippedDeleteButtonPosition).toEqual({x: 0, y: 0})
})