import apiClient from 'panoptes-client/lib/api-client'
import {getAuthUser} from './auth'
import * as R from 'ramda'

import * as ActionConstants from '../constants/actions'
import {isValidMobileWorkflow} from '../utils/workflow-utils'

const productionParams = {
    mobile_friendly: true,
    launch_approved: true,
    live: true,
    include: 'avatar,background',
    sort: 'display_name',
}

const betaParams = {
    mobile_friendly: true,
    beta_approved: true,
    launch_approved: false,
    include: 'avatar,background',
    sort: 'display_name',
    live: true,
}

const ownerParams = {
    mobile_friendly: true,
    live: false,
    include: 'avatar,background',
    sort: 'display_name',
    current_user_roles: 'owner'
}

const collaboratorParams = {
    mobile_friendly: true,
    live: false,
    include: 'avatar,background',
    sort: 'display_name',
    current_user_roles: 'collaborator'
}

export function fetchProjects() {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            dispatch(addProjectsRequest)
            getAuthUser()
                .then((userProfile) => {
                const userIsLoggedIn = userProfile !== null
                let projectCalls = []
                let allProjects = []

                let fetchPaginatedProjects = (params, _page = 1) => {
                    return apiClient.type('projects')
                        .get({...params, ...{page: _page}})
                        .then((projects) => {
                            const taggedProjects = tagProjects(projects, false)
                            allProjects = allProjects.concat(taggedProjects)
                            if (taggedProjects.length === 20) {
                                var currentPage = _page + 1
                                return fetchPaginatedProjects(params, currentPage)
                            }
                        })
                }


                projectCalls.push(fetchPaginatedProjects(productionParams));
                projectCalls.push(fetchPaginatedProjects(betaParams));

                // Fetch Test Projects
                if (userIsLoggedIn) {
                    projectCalls.push(apiClient.type('projects').get(ownerParams).then(projects => {
                        const taggedProjects = tagProjects(projects, true)
                        allProjects = allProjects.concat(taggedProjects)
                        taggedProjects.forEach((project) => dispatch(addOwnerProjectId(project)))
                    }));
                    projectCalls.push(apiClient.type('projects').get(collaboratorParams).then(projects => {
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
                    if (userIsLoggedIn) {
                      const museumModeCall = tagMuseumRoleForProjects(allProjects)
                      projectDetailCalls = projectDetailCalls.concat(museumModeCall)
                    }
                        
                    const projectBackgroundCall = getBackgroundImageForProject(allProjects)
                    projectDetailCalls.concat(projectBackgroundCall)    

                    const filterOutFinished = allProjects.filter(project => project.state !== 'finished')
                    // Then load the avatars and workflows
                    Promise.all(projectDetailCalls)
                        .then(() => {
                            dispatch(addProjects(filterOutFinished))
                            dispatch(addProjectsSuccess);
                            resolve(filterOutFinished)
                        })
                        .catch((error) => {
                            dispatch(addProjectsFailure);
                            reject(error)
                        })
                })
                    .catch((error) => {
                        dispatch(addProjectsFailure);
                        reject(error)
                    })
            }).catch(() => {
                // Stub out avatar rejection because it is optional for users to have avatars
            })
        })
    }
}

const getAvatarsForProjects = projects => {
    return projects.map(project => {
        return apiClient.type('avatars')
            .get(project.links.avatar.id)
            .then((avatar) => {
                project.avatar_src = avatar.src
            })
            // Stub out avatar rejection because it is optional for projects to have avatars
            .catch(() => {
            });
    })
}

const getBackgroundImageForProject = projects => {
    return projects.map(project => {
        return apiClient.type('backgrounds')
        .get(project.links.background.id)
            .then((background) => {
            project.background = background;
        })
        .catch(error => {
          return { src: '' };
        });
    })
}

export const tagMuseumRoleForProjects = projects => {
    return apiClient.type('projects')
      .get({ current_user_roles: 'museum' })
      .then((museumProjects) => {
        const museumProjIds = museumProjects.map(project => project.id)
        projects.forEach(project => {
          project.in_museum_mode = project.in_museum_mode || museumProjIds.includes(project.id)
        })
      })
}

const getWorkflowsForProjects = projects => {
    const projectIds = projects.map((project) => project.id)

    let fetchPaginatedWorkflows = (params, _page = 1) => {
        return apiClient.type('workflows')
            .get({...params, ...{page: _page}})
            .then((workflows) => {
                workflows.forEach(workflow => {
                    workflow.mobile_verified = workflow.mobile_friendly && isValidMobileWorkflow(workflow)
                    
                    const project = projects.find(project => project.id === workflow.links.project)
                    if (!project.workflows.find((projectWorkflow) => projectWorkflow.id === workflow.id)) {
                        project.workflows = R.append(workflow, project.workflows)
                    }
                })

                if (workflows.length === 20) {
                    var currentPage = _page + 1
                    return fetchPaginatedWorkflows(params, currentPage)
                }
            })
    }

    fetchPaginatedWorkflows({mobile_friendly: true, active: true, project_id: projectIds})
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
    const taggedProjects = projects.map(project => {
        project.isPreview = arePreview
        if (!project.workflows) project.workflows = []
        return project
    })
    return taggedProjects
}
