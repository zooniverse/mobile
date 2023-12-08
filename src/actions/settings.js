import * as ActionConstants from '../constants/actions'
import { ALL_NOTIFICATIONS, NEW_BETA_PROJECTS, NEW_PROJECTS, PROJECT_SPECIFIC, PushNotifications, URGENT_HELP } from '../notifications/PushNotifications'

/**
 * When projects are refreshed it will unsubscribe any projects
 * that were removed and subscribe any projects that were added.
 */
export const addUnusedProjectsToNotifications = (projects) => {
    return (dispatch, getState) => {
        const { projectSpecificNotifications } = getState().settings

        // Subscribe to new projects
        projects.forEach( project => {
            if (!projectSpecificNotifications.some( storedProject => storedProject.id === project.id )) {
                addProjectToSubscriptions(project)(dispatch)
            }
        })

        // Unsubscribe to projects no longer there
        projectSpecificNotifications.forEach( storedProject => {
            if (!projects.some( project => project.id === storedProject.id )) {
                removeProjectFromSubscriptions(storedProject)(dispatch)
            }
        })
    }
}

// Subscribe to project topic.
const addProjectToSubscriptions = project => {
    return dispatch => {
        PushNotifications.updateTopic(`${PROJECT_SPECIFIC}${project.id}`, true)
        dispatch({
            type: ActionConstants.ADD_PROJECT_SUBSCRIPTION,
            project
        })
    }
}

// Unsubscribe to project topic.
const removeProjectFromSubscriptions = project => {
    return dispatch => {
        PushNotifications.updateTopic(`${PROJECT_SPECIFIC}${project.id}`, false)
        dispatch({
            type: ActionConstants.REMOVE_PROJECT_SUBSCRIPTION,
            project
        })
    }
}

// Update project topic that was toggled in the settings.
export const updateProjectSubsciption = (projectId, subscribed) => {
    return dispatch => {
        PushNotifications.updateTopic(`${PROJECT_SPECIFIC}${projectId}`, subscribed)
        dispatch({
            type: ActionConstants.UPDATE_SUBSCRIPTION_TO_PROJECT,
            subscribe: subscribed,
            projectId
        })
    }
}

export const updateShowAllWorkflow = (enabled) => ({
    type: ActionConstants.UPDATE_SHOW_ALL_WORKLFOWS,
    enabled
})

/**
 * When "Enable Notifications" is toggled from the settings menu it will
 * update the "all_notifications" subscription and will also update all of 
 * the other subscriptions by either unsubscribing from them or subscribing if
 * "Enable Notifications" is toggled on AND that individual setting is also toggled on.
 * The individual settings are saved in state even though they might be unsubscribed
 * from Firebase.
 */
export const updateEnableNotifications = (enabled) => {
    return (dispatch, getState) => {
        const {
            newProjectNotifications,
            newBetaNotifications,
            urgentHelpNotification,
            projectSpecificNotifications
        } = getState().settings

        // Update subscription of global settings.
        PushNotifications.updateTopic(ALL_NOTIFICATIONS, enabled);
        PushNotifications.updateTopic(NEW_PROJECTS, newProjectNotifications && enabled);
        PushNotifications.updateTopic(NEW_BETA_PROJECTS,newBetaNotifications && enabled);
        PushNotifications.updateTopic(URGENT_HELP, urgentHelpNotification && enabled);

        // Update subscription for each project.
        projectSpecificNotifications.forEach(project => {
            PushNotifications.updateTopic(`${PROJECT_SPECIFIC}${project.id}`, project.subscribed && enabled)
        })

        dispatch({
            type: ActionConstants.UPDATE_ENABLE_NOTIFICATIONS,
            enabled
        })
    }
}

// When "New Projects" is toggled from the settings menu.
export const updateNewProjectNotifications = (enabled) => {
    return dispatch => {
        PushNotifications.updateTopic(NEW_PROJECTS, enabled);
        dispatch({
            type: ActionConstants.UPDATE_NEW_PROJECT_NOTIICATIONS,
            enabled
        })
    }
}

// When "New Beta Projects" is toggled from the settings menu.
export const updateBetaNotifications = (enabled) => {
    return dispatch => {
        PushNotifications.updateTopic(NEW_BETA_PROJECTS, enabled);
        dispatch({
            type: ActionConstants.UPDATE_BETA_NOTIFICATIONS,
            enabled
        })
    }
}

// When "Urgent help alerts" is toggled from the settings menu.
export const updateUrgentHelpNotifications = (enabled) => {
    return dispatch => {
        PushNotifications.updateTopic(URGENT_HELP, enabled);
        dispatch({
            type: ActionConstants.UPDATE_URGENT_HELP_NOTIFICATIONS,
            enabled
        })
    }
}