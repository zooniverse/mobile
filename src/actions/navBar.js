import * as ActionConstants from '../constants/actions';

export const setTitleForPage = (title, pageKey) => ({
    type: ActionConstants.SET_NAVBAR_TITLE,
    title,
    pageKey
});

export const setNavbarColorForPage = (color, pageKey) => ({
    type: ActionConstants.SET_NAVBAR_COLOR,
    color,
    pageKey
})

export const setNavbarColorForPageToDefault = (pageKey) => ({
    type: ActionConstants.SET_NAVBAR_COLOR_TO_DEFAULT,
    pageKey
})