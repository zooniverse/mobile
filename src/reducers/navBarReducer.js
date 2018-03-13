import * as ActionConstants from '../constants/actions';
import * as R from 'ramda'

const InitialNavBarState = {
    titles: {}
};

export default function navBar(state=InitialNavBarState, action) {
    switch (action.type) {
        case ActionConstants.SET_NAVBAR_TITLE: {
            const titles = R.set(R.lensProp(action.pageKey), action.title, state.titles);
            return { ...state, titles }
        }
        default:
            return state;
    }
}