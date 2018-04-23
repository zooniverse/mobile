import { Alert } from 'react-native';
import apiClient from 'panoptes-client/lib/api-client'
import { getAuthUser } from './auth'
import * as R from 'ramda'

import * as ActionConstants from '../constants/actions'
import { isValidSwipeWorkflow } from '../utils/is-valid-swipe-workflow'

export function fetchProjectsWithTags(tags=[]) {
    return (dispatch) => {
        const productionParams = {
            mobile_friendly: true,
            launch_approved: true,
            live: true,
            include: 'avatar',
            sort: 'display_name',
            tags
        }

        const ownerParams = {
            mobile_friendly: true,
            live: false,
            include: 'avatar',
            sort: 'display_name',
            current_user_roles: 'owner'
        }

        const collaboratorParams = {
            mobile_friendly: true,
            live: false,
            include: 'avatar',
            sort: 'display_name',
            current_user_roles: 'collaborator'
        }

        dispatch(addProjectsRequest)
        getAuthUser().then( () => {
            let projectCalls = []
            let previewProjects = []
            // Fetch production Projects
            projectCalls.push(apiClient.type('projects').get(productionParams).then(loadWorkflows(dispatch, false)));

            // Fetch Test Projects
            projectCalls.push(apiClient.type('projects').get(ownerParams).then((projects) => {
                projects.forEach((project) => dispatch(addOwnerProjectId(project)))
                previewProjects = previewProjects.concat(projects);
            }));
            projectCalls.push(apiClient.type('projects').get(collaboratorParams).then((projects) => {
                projects.forEach((project) => dispatch(addCollaboratorProjectId(project)))
                previewProjects = previewProjects.concat(projects);
            }));

            Promise.all(projectCalls).then(() => {
                loadWorkflows(dispatch, true, previewProjects).then(() => {
                    dispatch(addProjectsSuccess);
                })
                
            })
            .catch((error) => { 
                dispatch(addProjectsFailure);
                Alert.alert( 'Error', 'The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,);
            })
        })
    }
}

const loadWorkflows = R.curry((dispatch, arePreview, projects) => {            
    const promises = []
    projects.forEach((project) => {
        promises.push(apiClient.type('avatars').get(project.links.avatar.id).then((avatar) => {
            project.avatar_src = avatar.src
        })
        // Stub out avatar rejection because it is optional for projects to have avatars
        .catch(() => {}));

        promises.push(project.get('workflows', {mobile_friendly: true, active: true}).then((workflows) => {
            project.workflows = tagSwipeFriendly(workflows)
        })
        .catch(() => project.workflows = []));
    })
    return Promise.all(promises).then(() => {
        return dispatch(addProjects(projects, arePreview))
    })
});

const addOwnerProjectId = (project) => ({
    type: ActionConstants.ADD_OWNER_PROJECT_ID,
    projectId: project.id
})

const addCollaboratorProjectId = (project) => ({
    type: ActionConstants.ADD_COLLABORATOR_PROJECT_ID,
    projectId: project.id
})

const addProjectsRequest = {
    type: ActionConstants.PROJECTS_REQUEST
}

const addProjectsSuccess = {
    type: ActionConstants.PROJECTS_SUCCESS,
};

const addProjectsFailure = {
    type: ActionConstants.PROJECTS_FAILURE
}

const addProjects = (projects, arePreview) => ({
    type: ActionConstants.ADD_PROJECTS, 
    arePreview,
    projects
})

function tagSwipeFriendly(workflows) {
    return workflows.map((workflow) => {
        workflow.swipe_verified = workflow.mobile_friendly && isValidSwipeWorkflow(workflow)
        return workflow
    });
}