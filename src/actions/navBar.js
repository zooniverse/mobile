import * as ActionConstants from '../constants/actions';

export const setTitleForPage = (title, pageKey) => ({
    type: ActionConstants.SET_NAVBAR_TITLE,
    title,
    pageKey
});
