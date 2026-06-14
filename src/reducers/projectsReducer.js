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
    ownerIds: [],
    categoryProjects: {},
    categoryLoading: {},
    categoryErrors: {},
    projectDetails: {},
    projectDetailsLoading: {},
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
            const projectList = action.projects.filter( project => !project.isPreview && project.launch_approved )
            const betaProjectList = action.projects.filter( project => project.beta_approved && !project.launch_approved )
            return { ...state, previewProjectList, projectList, betaProjectList }
        }
        case ActionConstants.CATEGORY_PROJECTS_REQUEST: {
            return {
                ...state,
                categoryLoading: {
                    ...state.categoryLoading,
                    [action.categoryKey]: true,
                },
                categoryErrors: {
                    ...state.categoryErrors,
                    [action.categoryKey]: null,
                },
            }
        }
        case ActionConstants.CATEGORY_PROJECTS_SUCCESS: {
            return {
                ...state,
                categoryProjects: {
                    ...state.categoryProjects,
                    [action.categoryKey]: action.projects,
                },
                categoryLoading: {
                    ...state.categoryLoading,
                    [action.categoryKey]: false,
                },
                categoryErrors: {
                    ...state.categoryErrors,
                    [action.categoryKey]: null,
                },
            }
        }
        case ActionConstants.CATEGORY_PROJECTS_FAILURE: {
            return {
                ...state,
                categoryLoading: {
                    ...state.categoryLoading,
                    [action.categoryKey]: false,
                },
                categoryErrors: {
                    ...state.categoryErrors,
                    [action.categoryKey]: action.error,
                },
            }
        }
        case ActionConstants.PROJECT_DETAILS_REQUEST: {
            return {
                ...state,
                projectDetailsLoading: {
                    ...state.projectDetailsLoading,
                    [action.projectId]: true,
                },
            }
        }
        case ActionConstants.PROJECT_DETAILS_SUCCESS: {
            return {
                ...state,
                projectDetails: {
                    ...state.projectDetails,
                    [action.project.id]: action.project,
                },
                projectDetailsLoading: {
                    ...state.projectDetailsLoading,
                    [action.project.id]: false,
                },
            }
        }
        case ActionConstants.PROJECT_DETAILS_FAILURE: {
            return {
                ...state,
                projectDetailsLoading: {
                    ...state.projectDetailsLoading,
                    [action.projectId]: false,
                },
            }
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
