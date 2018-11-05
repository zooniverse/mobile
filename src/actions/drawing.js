import * as ActionConstants from '../constants/actions'

/**
 * Adds a shape to the drawing screen
 * 
 * A ShapeObject is a object consisting of a:
 * - type: One of ["Square"]
 * - color: string
 * - x: number
 * - y: number
 * - width: number
 * - height: number
 * 
 * @param {ShapeObject} shapeObject 
 */
export const addShape = (shapeObject) => {
    return ({
        shapeObject,
        type: ActionConstants.ADD_SHAPE
    })
}

export const removeShapeAtIndex = (index) => ({
    type: ActionConstants.REMOVE_SHAPE,
    index
})

export const undoMostRecentEdit = () => ({
    type: ActionConstants.UNDO_EDIT
})

export const clearShapes = () => ({
    type: ActionConstants.CLEAR_SHAPES
})

export const clearShapesInProgress = () => ({
    type: ActionConstants.CLEAR_SHAPES_IN_PROGRESS
})

export const saveEdits = () => ({
    type: ActionConstants.SAVE_EDITS
})

/**
 * Adds a shape mutation
 * 
 * Mutations are just delta values
 * @param {{dx, dy, dw, dh}} mutation 
 * @param {*} index 
 */
export const mutateShapeAtIndex = (mutation, index) => ({
    type: ActionConstants.MUTATE_SHAPE,
    index,
    dx: mutation.dx || 0,
    dy: mutation.dy || 0,
    dw: mutation.dw || 0,
    dh: mutation.dh || 0
})