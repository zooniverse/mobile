import * as ActionConstants from '../constants/actions';


const InitialAppState = {
    device: {
        width: 0,
        height: 0
    }
};

export default function app(state=InitialAppState, action) {
    switch (action.type) {
        case ActionConstants.UPDATE_SCREEN_DIMENSIONS: {
            return {...state, device: action.dimensions}
        }
        default: {
            return state
        }
    }
}