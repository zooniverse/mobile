import * as ActionConstants from '../constants/actions';
import * as R from 'ramda'

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
    actions: [],
    undoneActions: []
}

const nextShapeId = (shapes) => {
    const numericIds = R.keys(shapes)
        .map((key) => Number(key))
        .filter(Number.isFinite)
    const highestId = R.reduce(R.max, -1, numericIds)
    return highestId + 1
}

export default function drawing(state=InitialState, action) {
    switch (action.type) {
        case (ActionConstants.ADD_SHAPE): {
            const actions = [ ...state.actions, { id: state.idCount, shape: action.shapeObject, type: DrawingAction.add }]
            const shapesInProgress = calculateChanges(state.shapes, actions)
            return { ...state, actions, shapesInProgress, idCount: state.idCount + 1, undoneActions: [] }
        }
        case (ActionConstants.REMOVE_SHAPE): {
            const actions = [ ...state.actions, { id: action.index, type: DrawingAction.delete } ]
            const shapesInProgress = calculateChanges(state.shapes, actions)
            return { ...state, actions, shapesInProgress, undoneActions: [] }
        }
        case (ActionConstants.CLEAR_SHAPES): {
            return { ...state, shapesInProgress: {}, actions: [], undoneActions: [], shapes: {} }
        }
        case (ActionConstants.INITIALIZE_SHAPES): {
            return {
                ...state,
                shapes: action.shapes,
                shapesInProgress: action.shapes,
                actions: [],
                undoneActions: [],
                idCount: nextShapeId(action.shapes)
            }
        }
        case (ActionConstants.SAVE_EDITS): {
            return { ...state, shapes: state.shapesInProgress, actions: [], undoneActions: [] }
        }
        case (ActionConstants.MUTATE_SHAPE): {
            const { dx, dy, dw, dh, index } = action
            const mutation = { id: index, dx, dy, dw, dh, type: DrawingAction.edit}
            const actions = [ ...state.actions, mutation ]
            const shapesInProgress = calculateChanges(state.shapes, actions)
            return { ...state, actions, shapesInProgress, undoneActions: [] }
        }
        case (ActionConstants.UNDO_EDIT): {
            const undoneAction = R.last(state.actions)
            const actionsAfterUndo = R.dropLast(1, state.actions)
            const shapesInProgress = calculateChanges(state.shapes, actionsAfterUndo)
            const undoneActions = undoneAction
                ? [ ...state.undoneActions, undoneAction ]
                : state.undoneActions
            return {...state, actions: actionsAfterUndo, undoneActions, shapesInProgress}
        }
        case (ActionConstants.REDO_EDIT): {
            const redoneAction = R.last(state.undoneActions)
            const undoneActions = R.dropLast(1, state.undoneActions)
            const actions = redoneAction
                ? [ ...state.actions, redoneAction ]
                : state.actions
            const shapesInProgress = calculateChanges(state.shapes, actions)
            return {...state, actions, undoneActions, shapesInProgress}
        }
        case (ActionConstants.CLEAR_SHAPES_IN_PROGRESS): {
            return {...state, actions: [], undoneActions: [], shapesInProgress: state.shapes}
        }
        default:
            return state
    }
}
