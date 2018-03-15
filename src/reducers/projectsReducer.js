import * as ActionConstants from '../constants/actions';
import * as R from 'ramda';

const InitialProjectState = {
    isLoading: false,
    isSuccess: false,
    isFailure: false,
    projectList: []
};

export default function projects(state=InitialProjectState, action) {
    switch (action.type) {
        case ActionConstants.ADD_PROJECTS_REQUEST: {
            return {
                ...state,
                isLoading: true
            }
        }
        case ActionConstants.ADD_PROJECTS_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                isSuccess: true,
                isFailure: false,
                projectList: action.projects
            };
        }
        case ActionConstants.ADD_PROJECTS_FAILURE: {
            return {
                ...state,
                isLoading: false,
                isFailure: true
            }
        }
        default:
            return state;
    }
}
