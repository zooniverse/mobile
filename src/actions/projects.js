import { Alert } from 'react-native';
import apiClient from 'panoptes-client/lib/api-client'

import * as ActionConstants from '../constants/actions'
import { isValidSwipeWorkflow } from '../utils/is-valid-swipe-workflow'

export function fetchProjects() {
    return (dispatch) => {
        const allParams = {
            mobile_friendly: true,
            launch_approved: true,
            include: 'avatar',
            sort: 'display_name'
        }

        dispatch(addProjectsRequest)
        apiClient.type('projects').get(allParams).then((projects) => {            
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
            Promise.all(promises).then(() => dispatch(addProjectsSuccess(projects)))
        }).catch((error) => { 
            dispatch(addProjectsFailure);
            Alert.alert( 'Error', 'The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,);
        });
    }
}

const addProjectsRequest = {
    type: ActionConstants.ADD_PROJECTS_REQUEST
}

const addProjectsSuccess = (projects) => ({
    type: ActionConstants.ADD_PROJECT_SUCCESS,
    projects
});

const addProjectsFailure = {
    type: ActionConstants.ADD_PROJECT_FAILURE
}

function tagSwipeFriendly(workflows) {
    return workflows.map((workflow) => {
        workflow.swipe_verified = workflow.mobile_friendly && isValidSwipeWorkflow(workflow)
        return workflow
    });
}