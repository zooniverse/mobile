import user from '../userReducer';
import * as ActionConstants from '../../constants/actions'

const initialState = {};

test('Set user avatar', () => {
    const action = { 
        type: ActionConstants.SET_USER_AVATAR,
        avatar: 'avatar'
    };
    expect(user(initialState, action)).toEqual({ avatar: 'avatar'});
})

test('Set User Project Data', () => {
    const action1 = {
        type: ActionConstants.SET_USER_PROJECT_DATA,
        projectId: '12',
        projectData: {
            test: 'firstValue'
        }
    }
    const action2 = {
        type: ActionConstants.SET_USER_PROJECT_DATA,
        projectId: '12',
        projectData: {
            test: 'secondValue'
        }
    }
    const modifiedState = user(initialState, action1);
    expect(modifiedState).toEqual({
        projects: {
            '12': {
                test: 'firstValue'
            }
        }
    });
    expect(user(modifiedState, action2)).toEqual({
        projects: {
            '12': {
                test: 'secondValue' 
            }
        }
    });
})

test('Set User Total Classifications', () => {
    const action = {
        type: ActionConstants.SET_USER_TOTAL_CLASSIFICATIONS,
        totalClassifications: 10
    }
    expect(user(initialState, action)).toEqual({ totalClassifications: 10 });
})

test('Set is guest user', () => {
    const action = {
        type: ActionConstants.SET_IS_GUEST_USER,
        isGuestUser: false
    }
    expect(user(initialState, action)).toEqual({ isGuestUser: false })
})

test('Set User', () => {
    const userObject = {
        a: 'a',
        obj: {
            crazyObject: 'v'
        }
    };

    const action = {
        type: ActionConstants.SET_USER,
        user: userObject
    }
    expect(user(initialState, action)).toEqual(userObject)
})

test('Set Push Prompted', () => {
    const action = {
        type: ActionConstants.SET_PUSH_PROMPTED,
        value: true
    };
    expect(user(initialState, action)).toEqual( {pushPrompted: true});
})

test('Set Tutorial Complete', () => {
    const action = {
        type: ActionConstants.SET_TUTORIAL_COMPLETE,
        projectId: '12',
        tutorialId: '13',
        completionTime: '245'
    };

    expect(user(initialState, action)).toEqual( {
        projects: {
            '12': {
                tutorials_completed_at: {
                    '13': '245'
                }
            }
        }
    })
})
// export default function user(state=InitialUserState, action) {
//         case ActionConstants.SET_TUTORIAL_COMPLETE: {
//             const modifiedState = R.set(R.lensPath(['projects', action.projectId, 'tutorials_completed_at', action.tutorialId]), action.completionTime, state);
//             return modifiedState;
//         }
//         default: 
//             return state;
//     }      