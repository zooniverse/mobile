import * as ActionConstants from '../constants/actions'

/**
 * Updates the saved screen dimensions
 * @param {object of shape {height, width}} dimensions 
 */
export const updateScreenDimensions = (dimensions) => {
    return {
        type: ActionConstants.UPDATE_SCREEN_DIMENSIONS,
        dimensions
    }
}