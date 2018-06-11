import * as ActionConstants from '../constants/actions'

export const saveImageLocation = (remoteSource, localSource) => ({
    type: ActionConstants.SAVE_IMAGE_LOCATION,
    remoteSource,
    localSource
})

export const deleteImageLocation = (localSource) => ({
    type: ActionConstants.DELETE_IMAGE_LOCATION,
    localSource
})

export const clearImageLocations =  () => ({
    type: ActionConstants.CLEAR_IMAGE_CACHE
})