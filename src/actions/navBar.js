import * as ActionConstants from '../constants/actions';

/*
 * The Navbar settings available to set are:
 * title,
 * showBack,
 * hambugerMenuShowing,
 * centerType,
 * isPreview
*/
export const setNavbarSettingsForPage = (settings, page) => ({
    type: ActionConstants.SET_NAVBAR,
    settings,
    page
})

export const NavBarPageTitles = {
    classifier: 'Classifier',
    drawingClassifier: 'DrawingClassifier'
}

export const setPageShowing = (page) => ({
    type: ActionConstants.SET_PAGE_SHOWING,
    page
})
