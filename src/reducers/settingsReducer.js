import * as ActionConstants from '../constants/actions'
import R from 'ramda'

const InitialState = {
    notificationsInitialized: false,
    showAllWorkflows: true,
    enableNotifications: true,
    newProjectNotifications: true,
    newBetaNotifications: true,
    urgentHelpNotification: true,
    projectSpecificNotifications: []
}

const markProjectsSubscriptionStatus = (projectId, subscribe) => {
    return (project) => {
        if (project.id === projectId) {
            project.subscribed = subscribe
        }
        return project
    }
}

const hasProjectId = (projectId) => {
    return (subbedProject) => subbedProject.id === projectId
}

export default function settings(state=InitialState, action) {
    switch (action.type) {
        case ActionConstants.UPDATE_SUBSCRIPTION_TO_PROJECT: {
            const { subscribe, projectId } = action
            const newProjectSubscriptions = state.projectSpecificNotifications.map(markProjectsSubscriptionStatus(projectId, subscribe))
            return { ...state, projectSpecificNotifications: newProjectSubscriptions }
        }
        case ActionConstants.ADD_PROJECT_SUBSCRIPTION: {
            action.project.subscribed = true
            return { ...state, projectSpecificNotifications: R.append(action.project, state.projectSpecificNotifications)}
        }
        case ActionConstants.REMOVE_PROJECT_SUBSCRIPTION: {
            const projectSpecificNotifications = R.reject(hasProjectId(action.project.id), state.projectSpecificNotifications)
            return { ...state, projectSpecificNotifications }
        }
        case ActionConstants.UPDATE_SHOW_ALL_WORKLFOWS:
            return { ...state, showAllWorkflows: action.enabled }
        case ActionConstants.UPDATE_ENABLE_NOTIFICATIONS:
            return { ...state, enableNotifications: action.enabled }
        case ActionConstants.UPDATE_NEW_PROJECT_NOTIICATIONS:
            return { ...state, newProjectNotifications: action.enabled }
        case ActionConstants.UPDATE_BETA_NOTIFICATIONS:
            return { ...state, newBetaNotifications: action.enabled}
        case ActionConstants.UPDATE_URGENT_HELP_NOTIFICATIONS:
            return { ...state, urgentHelpNotification: action.enabled}
        case ActionConstants.NOTIFICATIONS_INITIALIZED: 
            return { ...state, notificationsInitialized: true}
        default:
            return state
    }
}