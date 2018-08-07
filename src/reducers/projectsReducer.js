import * as ActionConstants from '../constants/actions';
import * as R from 'ramda';

const InitialProjectState = {
    isLoading: false,
    isSuccess: false,
    isFailure: false,
    projectList: [],
    previewProjectList: [],
    betaProjectList: [],
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
            const previewProjectList = action.projects.filter( project => project.isPreview )
            const projectList = action.projects.filter( project => !project.isPreview && !project.beta_approved )
            const betaProjectList = action.projects.filter( project => project.beta_approved && !project.launch_approved )
            return { ...state, previewProjectList, projectList, betaProjectList }
        }
        case ActionConstants.PROJECTS_FAILURE: {
            return {
                ...state,
                isLoading: false,
                isFailure: true
            }
        }
        case ActionConstants.ADD_OWNER_PROJECT_ID: {
            const { ownerIds } = state
            const containsIds = ownerIds.includes(action.projectId)
            const newState = {
                ...state,
                ownerIds: containsIds ? ownerIds : R.append(action.projectId, ownerIds)
            }
            return newState
        }
        case ActionConstants.ADD_COLLABORATOR_PROJECT_ID: {
            const { collaboratorIds } = state
            const containsIds = collaboratorIds.includes(action.projectId)
            return {
                ...state,
                collaboratorIds: containsIds ? collaboratorIds : R.append(action.projectId, collaboratorIds)
            }
        }
        case ActionConstants.SIGN_OUT: {
            return InitialProjectState;
        }
        default:
            return state;
    }
}
