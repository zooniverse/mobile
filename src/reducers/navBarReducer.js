import * as ActionConstants from '../constants/actions';
import * as R from 'ramda'

const InitialNavBarState = {
    titles: {},
    backgroundColors: {}
};

export default function navBar(state=InitialNavBarState, action) {
    switch (action.type) {
        case ActionConstants.SET_NAVBAR_TITLE: {
            const titles = R.set(R.lensProp(action.pageKey), action.title, state.titles);
            return { ...state, titles }
        }
        case ActionConstants.SET_NAVBAR_COLOR: {
            const backgroundColors = R.set(R.lensProp(action.pageKey), action.color, state.backgroundColors);
            return { ...state, backgroundColors}
        }
        case ActionConstants.SET_NAVBAR_COLOR_TO_DEFAULT: {
            const backgroundColors = state.backgroundColors
            delete backgroundColors[action.pageKey]
            return { ...state, backgroundColors}
        }
        default:
            return state;
    }
}