import * as ActionConstants from '../constants/actions';
import * as R from 'ramda';

const InitialProjectState = {
    projectList: []
};

export default function projects(state=InitialProjectState, action) {
    switch (action.type) {
        case ActionConstants.ADD_PROJECTS: {
            return {
                ...state,
                projectList: action.projects
            };
        }
        case ActionConstants.ADD_PROJECT_AVATAR: {
            const updatedProjectList = updateProjectAttribute(state.projectList, action.projectId, 'avatar_src', action.avatarSrc);
            return {
                ...state, 
                projectList: updatedProjectList
            };
        }
        case ActionConstants.ADD_PROJECT_WORKFLOWS: {
            const updatedProjectList = updateProjectAttribute(state.projectList, action.projectId, 'workflows', action.workflows);
            return {
                ...state, 
                projectList: updatedProjectList
            };
        }
        default:
            return state;
    }
}

function updateProjectAttribute(projectList, projectId, attribute, value) {
    const newProjectList = projectList.slice(0);
    const index = newProjectList.findIndex((project) => {
        return project.id === projectId
    });

    if (index >= 0) {
        newProjectList[index] = R.assoc(attribute, value, newProjectList[index]);
    }

    return newProjectList;
}