import R from 'ramda'

/**
 * This function receives and x,y coordinate and determines if
 * the coordinate is within the bounds of the shape.
 * 
 * @param {x coordinate of touch} xCoord 
 * @param {y coordinate of touch} yCoord 
 * @param {location data of shape} shape 
 */
export const isCoordinateWithinSquare = (xCoord, yCoord, {x, y, width, height}) => {
    const withinX = xCoord > x && xCoord < (x + width)
    const withinY = yCoord > y && yCoord < (y + height)
    return withinX && withinY
}

/**
 * This function determines if any part of the shape passed in is out of bounds
 * 
 * @param {{x, y, width, height} dimensions of the shape} shape 
 * @param {{width, height} dimensions of the bounds} bounds 
 */
export const isShapeOutOfBounds = (shape, bounds, bufferConstant=0) => {
    const {x, y, width, height} = shape
    const isPastLeftBound = (width > 0 ? x : parseFloat(x) + parseFloat(width)) < 0 - bufferConstant
    const isPastUpperBound = (height > 0 ? y : parseFloat(y) + parseFloat(height)) < 0 - bufferConstant
    const isPastRightBound = (width > 0 ? parseFloat(x) + parseFloat(width) : x) > bounds.width + bufferConstant
    const isPastBottomBound = ( height > 0 ? parseFloat(y) + parseFloat(height) : y) > bounds.height + bufferConstant

    return isPastLeftBound || isPastUpperBound || isPastRightBound || isPastBottomBound
}

/**
 * This function determines whether a touch coordinate is touching the permeter of an object
 * 
 * @param {x coordinate of touch} xCoord 
 * @param {y coordinate of touch} yCoord 
 * @param {dimensions of perimeter} shapePerimeter 
 */
const isCoordinateTouchingPerimeter = (xCoord, yCoord, {x, y ,width, height}) => {
    const touchRange = 10
    const isCoordinateTouching = (touchCoordinate, targeCoordinate) => {
        return touchCoordinate > (targeCoordinate - touchRange) && touchCoordinate < (targeCoordinate + touchRange)
    }

    const isCoordinateWithinRange = (touchCoordinate, rangeOrigin, rangeLength) => {
        return touchCoordinate > rangeOrigin && touchCoordinate < rangeOrigin + rangeLength
    }

    const isTouchingLeftSide = isCoordinateTouching(xCoord, x) && isCoordinateWithinRange(yCoord, y, height)
    const isTouchingRightSide = isCoordinateTouching(xCoord, x + width) && isCoordinateWithinRange(yCoord, y, height)
    const isTouchingTopSide = isCoordinateTouching(yCoord, y) && isCoordinateWithinRange(xCoord, x, width)
    const isTouchingBottomSide = isCoordinateTouching(yCoord, y + height) && isCoordinateWithinRange(xCoord, x, width)

    return isTouchingLeftSide || isTouchingRightSide || isTouchingTopSide || isTouchingBottomSide
}

/**
 * This function receives an x,y coordinate and determines if the touch is touching
 * any of the corners passed into the object
 * 
 * @param {x coordinate of the touch event} xCoord 
 * @param {y coordinate of the touch event} yCoord 
 * @param {This objects container data on the locations of the corners of a shape. } corners 
 */
const analyzeCorners = (xCoord, yCoord, corners) => {
    return R.mapObjIndexed((val) => {
        const isWithinCorner = isCoordinateWithinSquare(xCoord, yCoord, val)
        return isWithinCorner
    },corners)
}

/**
 * This function receives an x,y coordinate touch event, a shape coordinate
 * and corner coordinates.
 * 
 * The function returns an analysis object based on where the touch is relative to the shape.
 * 
 * An example of this object would look like the following: 
 * {
 *  upperLeft: false,
 *  upperRight: false,
 *  bottomLeft: true,
 *  bottomRight: false,
 *  withinSquare: true,
 *  perimeterOnly: false
 * }
 * 
 * This object essentially explains which part of the shape the user is touching
 * 
 * @param {x coordinate of touch} xCoord 
 * @param {y coordinate of touch} yCoord 
 * @param {coordinate information for shape} shape 
 * @param {coordinate information for shape's corners} corners 
 */
export const analyzeCoordinateWithShape = (xCoord, yCoord, shape, corners) => {
    const analyzedCorners = analyzeCorners(xCoord, yCoord, corners)
    const touchingCorners = analyzedCorners.upperLeft || analyzedCorners.upperRight || analyzedCorners.bottomLeft || analyzedCorners.bottomRight
    const touchingPerimeter = isCoordinateTouchingPerimeter(xCoord, yCoord, shape)
    const withinSquare = touchingCorners || touchingPerimeter
    return {
        ... analyzedCorners,
        withinSquare,
        perimeterOnly: !touchingCorners && touchingPerimeter
    }
}

/**
 * Calculates the deltas that should be applied to an object
 * based on a touch events dx and dy.
 * 
 * @param {An object that explains where the user is touching} touchState 
 * @param {Touch dx} dx 
 * @param {Touch dy} dy 
 * @param {The ratio that the shape should scale in the x direction} scaleRatioX 
 * @param {The ratio that the shape should scale in the y direction} scaleRatioY 
 */
export const calculateShapeChanges = (touchState, touchDx, touchDy, scaleRatioX, scaleRatioY) => {
    const {upperLeft, bottomLeft, upperRight, bottomRight, perimeterOnly} = touchState
    const scaledX = touchDx * scaleRatioX
    const scaledY = touchDy * scaleRatioY

    let dx = 0, dy = 0, dw = 0, dh = 0
    if (perimeterOnly) {
        dx = scaledX
        dy = scaledY
    } else if (upperLeft) {
        dx = scaledX
        dy = scaledY
        dw = -scaledX
        dh = -scaledY
    } else if (bottomLeft) {
        dx = scaledX
        dw = -scaledX
        dh = scaledY
    } else if (upperRight) {
        dy = scaledY
        dw = scaledX
        dh = -scaledY
    } else if (bottomRight) {
        dw = scaledX
        dh = scaledY
    }

    return {
        dx,
        dy,
        dw,
        dh
    }
}
