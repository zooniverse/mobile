import * as ActionConstants from '../constants/actions'
import R from 'ramda'

const InitialState = {}

export default function images(state=InitialState, action) {
    switch (action.type) {
        case ActionConstants.SAVE_IMAGE_LOCATION: {
            const imageKeyLens = R.lensProp(action.remoteSource)
            return R.set(imageKeyLens, action.localSource, state)
        }
        case ActionConstants.DELETE_IMAGE_LOCATION: {
            return R.reject((value) => value === action.localSource, state)
        }
        case ActionConstants.CLEAR_IMAGE_CACHE: {
            return InitialState
        }
        default:
            return state
    }
}