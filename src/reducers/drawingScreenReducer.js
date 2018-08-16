import * as ActionConstants from '../constants/actions';
import R from 'ramda'

const InitialState = {
    shapes: {},
    idCount: 0
}

export default function drawingScreen(state=InitialState, action) {
    switch (action.type) {
        case (ActionConstants.ADD_SHAPE): {
            const newShapeObject = R.set(R.lensProp(state.idCount), action.shapeObject, state.shapes)
            // const newShapesArray = R.append(action.shapeObject, state.shapes)
            return { ...state, shapes: newShapeObject, idCount: state.idCount + 1 }
        }
        case (ActionConstants.REMOVE_SHAPE): {
            const newShapesArray = R.omit([action.index], state.shapes)
            return { ...state, shapes: newShapesArray }
        }
        case (ActionConstants.MUTATE_SHAPE): {
            const { dx, dy, dw, dh, index } = action
            const updatedShapes = R.set(R.lensProp(index),updateShape(dx, dy, dw, dh)(state.shapes[index]), state.shapes)
            return { ...state, shapes: updatedShapes}
        }
        default:
            return state
    }
}

const updateShape = ( dx, dy, dw, dh) => {
    return (shape) => ({
        ... shape,
        x: shape.x + dx,
        y: shape.y + dy,
        width: shape.width + dw,
        height: shape.height + dh
    })
}