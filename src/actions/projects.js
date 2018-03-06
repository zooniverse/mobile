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
        apiClient.type('projects').get(allParams).then((projects) => {
            dispatch(addProjectsAction(projects));

            projects.forEach((project) => {
                // Store Project Avatars
                apiClient.type('avatars').get(project.links.avatar.id).then((avatar) => {
                    dispatch(addProjectAvatarAction(project.id, avatar.src))
                });
        
                // Store Project Workflows
                project.get('workflows', {mobile_friendly: true, active: true}).then((workflows) => {
                    dispatch(addProjectWorkflows(project.id ,tagSwipeFriendly(workflows)));
                });
            })
        }).catch((error) => { 
            Alert.alert( 'Error', 'The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,);
        });
    }
}

const addProjectsAction = (projects) => ({
    type: ActionConstants.ADD_PROJECTS,
    projects
});

const addProjectAvatarAction = (projectId, avatarSrc) => ({
    type: ActionConstants.ADD_PROJECT_AVATAR,
    projectId,
    avatarSrc
})

const addProjectWorkflows = (projectId, workflows) => ({
    type: ActionConstants.ADD_PROJECT_WORKFLOWS,
    projectId,
    workflows
})


function tagSwipeFriendly(workflows) {
    return workflows.map((workflow) => {
        workflow.swipe_verified = workflow.mobile_friendly && isValidSwipeWorkflow(workflow)
        return workflow
    });
}