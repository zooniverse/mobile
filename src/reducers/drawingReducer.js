import * as ActionConstants from '../constants/actions';
import R from 'ramda'

/**
 *  We keep track of all of the drawing actions made
 *  Drawing actions look like the following: 
 *  {
 *      id: number - Id of the shape that's being mutated
 *      type: Oneof['add', 'edit', 'delete']
 *      shape: object - If of type add, the shape to be added
 *      dx: number - If of type 'edit', change in x
 *      dy: number - If of type 'edit', change in y
 *      dw: number - If of type 'edit', change in width
 *      dh: number - If of type 'edit', change in height
 *  }
 */

export const DrawingAction = {
    add: 'add',
    edit: 'edit',
    delete: 'delete'
}

const calculateChanges = (shapes, actions) => {
    let modifiedShapes = R.clone(shapes)
    actions.forEach((action) => {
        switch (action.type){
            case DrawingAction.add: {
                modifiedShapes[action.id] = action.shape
                break
            }
            case DrawingAction.edit: {
                modifiedShapes = R.mapObjIndexed((shape, key) => key === action.id ? updateShape(action, shape) : shape, modifiedShapes)
                break
            }
            case DrawingAction.delete: {
                modifiedShapes = R.dissoc(action.id, modifiedShapes)
                break
            }
        }
    })
    return modifiedShapes
}

const updateShape = ( { dx, dy, dw, dh }, shape ) => ({
    ... shape,
    x: shape.x + dx,
    y: shape.y + dy,
    width: shape.width + dw,
    height: shape.height + dh
})

const InitialState = {
    shapesInProgress: {},
    shapes: {},
    idCount: 0,
    actions: []
}

export default function drawing(state=InitialState, action) {
    switch (action.type) {
        case (ActionConstants.ADD_SHAPE): {
            const actions = [ ...state.actions, { id: state.idCount, shape: action.shapeObject, type: DrawingAction.add }]
            const shapesInProgress = calculateChanges(state.shapes, actions)
            return { ...state, actions, shapesInProgress, idCount: state.idCount + 1 }
        }
        case (ActionConstants.REMOVE_SHAPE): {
            const actions = [ ...state.actions, { id: action.index, type: DrawingAction.delete } ]
            const shapesInProgress = calculateChanges(state.shapes, actions)
            return { ...state, actions, shapesInProgress }
        }
        case (ActionConstants.CLEAR_SHAPES): {
            return { ...state, shapesInProgress: {}, actions: [], shapes: {} }
        }
        case (ActionConstants.SAVE_EDITS): {
            return { ...state, shapes: state.shapesInProgress, actions: [] }
        }
        case (ActionConstants.MUTATE_SHAPE): {
            const { dx, dy, dw, dh, index } = action
            const mutation = { id: index, dx, dy, dw, dh, type: DrawingAction.edit}
            const actions = [ ...state.actions, mutation ]
            const shapesInProgress = calculateChanges(state.shapes, actions)
            return { ...state, actions, shapesInProgress }
        }
        case (ActionConstants.UNDO_EDIT): {
            const actionsAfterUndo = R.dropLast(1, state.actions)
            const shapesInProgress = calculateChanges(state.shapes, actionsAfterUndo)
            return {...state, actions: actionsAfterUndo, shapesInProgress}
        }
        case (ActionConstants.CLEAR_SHAPES_IN_PROGRESS): {
            return {...state, actions: [], shapesInProgress: state.shapes}
        }
        default:
            return state
    }
}