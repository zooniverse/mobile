import * as ActionConstants from '../constants/actions';
import * as R from 'ramda';

const InitialProjectState = {
    isLoading: false,
    isSuccess: false,
    isFailure: false,
    projectList: [],
    previewProjectList: [],
    collaboratorIds: [],
    ownerIds: []
};

export default function projects(state=InitialProjectState, action) {
    switch (action.type) {
        case ActionConstants.PROJECTS_REQUEST: {
            return {
                ...state,
                isLoading: true
            }
        }
        case ActionConstants.PROJECTS_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                isSuccess: true,
                isFailure: false,
            };
        }
        case ActionConstants.ADD_PROJECTS: {
            const { arePreview, projects } = action
            return arePreview ? { ...state, previewProjectList: projects } : { ...state, projectList: projects}
        }
        case ActionConstants.PROJECTS_FAILURE: {
            return {
                ...state,
                isLoading: false,
                isFailure: true
            }
        }
        case ActionConstants.ADD_OWNER_PROJECT_ID: {
            return {
                ...state,
                ownerIds: R.append(action.projectId, state.ownerIds)
            }
        }
        case ActionConstants.ADD_COLLABORATOR_PROJECT_ID: {
            return {
                ...state,
                collaboratorIds: R.append(action.projectId, state.collaboratorIds)
            }
        }
        case ActionConstants.SIGN_OUT: {
            return InitialProjectState;
        }
        default:
            return state;
    }
}
