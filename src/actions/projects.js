import apiClient from 'panoptes-client/lib/api-client'
import { getAuthUser } from './auth'
import * as R from 'ramda'

import * as ActionConstants from '../constants/actions'
import { isValidMobileWorkflow } from '../utils/workflow-utils'

const productionParams = {
    // mobile_friendly: true,
    launch_approved: true,
    live: true,
    include: 'avatar',
    sort: 'display_name',
}

const betaParams = {
    // mobile_friendly: true,
    beta_approved: true,
    include: 'avatar',
    sort: 'display_name',
    live: true,
}

const ownerParams = {
    // mobile_friendly: true,
    live: false,
    include: 'avatar',
    sort: 'display_name',
    current_user_roles: 'owner'
}

const collaboratorParams = {
    // mobile_friendly: true,
    live: false,
    include: 'avatar',
    sort: 'display_name',
    current_user_roles: 'collaborator'
}

export function fetchProjects() {
    return (dispatch) => { 
        return new Promise((resolve, reject) => {
            dispatch(addProjectsRequest)
            getAuthUser().then( (userProfile) => {
                const userIsLoggedIn = userProfile !== null
                let projectCalls = []
                let allProjects = []
                
                // Fetch production Projects
                projectCalls.push(apiClient.type('projects').get(productionParams).then( projects => {
                    const taggedProjects = tagProjects(projects, false)
                    allProjects = allProjects.concat(taggedProjects)
                }))

                // Fetch Beta Projects
                projectCalls.push(apiClient.type('projects').get(betaParams).then( projects => {
                    const taggedProjects = tagProjects(projects, false)
                    allProjects = allProjects.concat(taggedProjects)
                }))

                // Fetch Test Projects
                if (userIsLoggedIn) {
                    projectCalls.push(apiClient.type('projects').get(ownerParams).then( projects => {
                        const taggedProjects = tagProjects(projects, true)
                        allProjects = allProjects.concat(taggedProjects)
                        taggedProjects.forEach((project) => dispatch(addOwnerProjectId(project)))
                    }));
                    projectCalls.push(apiClient.type('projects').get(collaboratorParams).then( projects => {
                        const taggedProjects = tagProjects(projects, true)
                        allProjects = allProjects.concat(taggedProjects)
                        taggedProjects.forEach((project) => dispatch(addCollaboratorProjectId(project)))
                    }));
                }

                // First Load the projects
                Promise.all(projectCalls).then(() => {
                    let projectDetailCalls = []
                    projectDetailCalls.push(getWorkflowsForProjects(allProjects))
                    const avatarCall = getAvatarsForProjects(allProjects)
                    projectDetailCalls = projectDetailCalls.concat(avatarCall)
                    // Then load the avatars and workflows
                    Promise.all(projectDetailCalls)
                    .then(() => {
                        dispatch(addProjects(allProjects))
                        dispatch(addProjectsSuccess);
                        resolve(allProjects)
                    } )
                    .catch((error) => { 
                        dispatch(addProjectsFailure);
                        reject(error)
                    })
                })
                .catch((error) => { 
                    dispatch(addProjectsFailure);
                    reject(error)
                })
            })
        })
    }
}

const getAvatarsForProjects = projects => {
    return projects.map( project => {
        return apiClient.type('avatars').get(project.links.avatar.id)
        .then((avatar) => {
            project.avatar_src = avatar.src
        })
        // Stub out avatar rejection because it is optional for projects to have avatars
        .catch(() => {});
    })
}

const getWorkflowsForProjects = projects => {            
    const projectIds = projects.map((project) => project.id)

    // TODO: change the literal list in the next line to projectIds
    return apiClient.type('workflows').get({active: true, project_id: [1878,1877,302,514,523]})
    .then(workflows => {
        workflows.forEach( workflow => {
            // TODO: change below to workflow.mobile_friendly && isValidMobileWorkflow(workflow) upon panoptes change
            workflow.mobile_verified = isValidMobileWorkflow(workflow)
            const project = projects.find( project => project.id === workflow.links.project )
            if (!project.workflows.find((projectWorkflow) => projectWorkflow.id === workflow.id)) {
                project.workflows = R.append(workflow, project.workflows)
            }
        })
    })
};

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

const addProjects = projects => ({
    type: ActionConstants.ADD_PROJECTS, 
    projects
})

const tagProjects = (projects, arePreview) => {
    const taggedProjects = projects.map( project => {
        project.isPreview = arePreview
        if (!project.workflows) project.workflows = []
        return project
    })
    return taggedProjects
}