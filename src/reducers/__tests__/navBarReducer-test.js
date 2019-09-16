import navBar from '../navBarReducer'
import * as ActionConstants from '../../constants/actions';

const InitialNavBarState = {
    pageShowing: '',
    pageSettings: {}
};

describe('Nav Bar Reducer', () => {
    test('test set page showings', () => {
        const action = {
            type: ActionConstants.SET_PAGE_SHOWING,
            page: 'TestPage'
        }

        expect(navBar(InitialNavBarState, action)).toEqual({pageShowing: 'TestPage', pageSettings: {}})
    });

    test('test set full pageSettings', () => {
        const newSettings = {
            title: 'Tst',
            showBack: true,
            hamburgerMenuShowing: false,
            centerType: 'title',
            isPreview: true
        }

        const action = {
            type: ActionConstants.SET_NAVBAR,
            page: 'TestPage',
            settings: newSettings
        }

        const newState = navBar(InitialNavBarState, action)
        expect(newState.pageSettings.TestPage).toEqual(newSettings)

        newSettings.title = 'New Title'
        const resetState = navBar(InitialNavBarState, action)
        expect(resetState.pageSettings.TestPage.title).toEqual('New Title')
    })
})
