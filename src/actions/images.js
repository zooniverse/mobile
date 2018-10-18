import * as ActionConstants from '../constants/actions'
import { loadRemoteImageToCache } from '../utils/imageUtils'

export const loadImageToCache = (remoteSource) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const cachedImagePath = getState().images[remoteSource]
            if (cachedImagePath) {
                resolve(cachedImagePath)
            } else {
                loadRemoteImageToCache(remoteSource).then((localSource) => {
                    dispatch(saveImageLocation(remoteSource, localSource))
                    resolve(localSource)
                })
                .catch((error) => {
                    reject(error)
                })
            }
        })
    }
}

const saveImageLocation = (remoteSource, localSource) => ({
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