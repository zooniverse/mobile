import R from 'ramda';
import * as ActionConstants from '../constants/actions';

export const InitialNavBarState = {
    pageShowing: '',
    pageSettings: {}
};

const defaultNavBarSettings = {
    title: '',
    showBack: false,
    hamburgerMenuShowing: true,
    centerType: 'logo',
    isPreview: false
}

export default function navBar(state=InitialNavBarState, action) {
    switch (action.type) {
        case ActionConstants.SET_NAVBAR:
            const pageSettings = R.set(R.lensProp(action.page), R.merge(defaultNavBarSettings, action.settings), state.pageSettings)
            // console.log({pageSettings})
            return { 
                ...state,
                pageSettings
            } 
        case ActionConstants.SET_PAGE_SHOWING:
            return { ...state, pageShowing: action.page }
        default:
            return state;
    }
}
