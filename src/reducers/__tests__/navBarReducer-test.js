import navBar from '../navBarReducer'
import * as ActionConstants from '../../constants/actions';

const initialState = {
    titles: {}
}

test('test set navbar title', () => {
    const action = {
        type: ActionConstants.SET_NAVBAR_TITLE,
        title: 'Custom Title',
        pageKey: 'CustomKey'
    }

    const stateWithTitleAdded = navBar(initialState, action)
    expect(stateWithTitleAdded).toEqual({
        titles: {
            CustomKey: 'Custom Title'
        }
    })
    expect(initialState.titles).toEqual({})
    const differentAction = {
        type: ActionConstants.SET_NAVBAR_TITLE,
        title: 'Custom Title',
        pageKey: 'DifferentCustomKey'
    }
    expect(navBar(stateWithTitleAdded,differentAction)).toEqual({
        titles: {
            CustomKey: 'Custom Title',
            DifferentCustomKey: 'Custom Title'
        }
    })

});
