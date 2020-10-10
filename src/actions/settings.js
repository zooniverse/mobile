import * as ActionConstants from '../constants/actions'
import firebase from '@react-native-firebase/app';

/**
 * These are the topic names we subscribe to Firebase with
 * NOTE:
 *  It is very important that these don't change. If they
 *  change then we will not be able to properly send push
 *  notifications for what people are subscribed for.
 */
const TopicNames = {
    newProjects: 'new_projects',
    newBetaProjects: 'new_beta_projects',
    urgentNotifications: 'urgent_notifications'
}

const updateSubscriptionOfTopic = (subscribe, topicName) => {
    if (subscribe) {
        firebase.messaging().subscribeToTopic(topicName);
    } else {
        firebase.messaging().unsubscribeFromTopic(topicName);
    }
}

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

const addProjectToSubscriptions = project => {
    return dispatch => {
        updateSubscriptionOfTopic(true, project.id)
        dispatch({
            type: ActionConstants.ADD_PROJECT_SUBSCRIPTION,
            project
        })
    }
}

const removeProjectFromSubscriptions = project => {
    return dispatch => {
        updateSubscriptionOfTopic(false, project.id)
        dispatch({
            type: ActionConstants.REMOVE_PROJECT_SUBSCRIPTION,
            project
        })
    }
}

export const updateProjectSubsciption = (projectId, subscribed) => {
    return dispatch => {
        updateSubscriptionOfTopic(subscribed, projectId)
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

export const updateEnableNotifications = (enabled) => {
    return (dispatch, getState) => {
        const {
            newProjectNotifications,
            newBetaNotifications,
            urgentHelpNotification,
            projectSpecificNotifications
        } = getState().settings

        updateSubscriptionOfTopic(newProjectNotifications && enabled, TopicNames.newProjects)
        updateSubscriptionOfTopic(newBetaNotifications && enabled, TopicNames.newBetaProjects)
        updateSubscriptionOfTopic(urgentHelpNotification && enabled, TopicNames.urgentNotifications)
        projectSpecificNotifications.forEach(project => {
            updateSubscriptionOfTopic(project.subscribed && enabled, project.id)
        })

        dispatch({
            type: ActionConstants.UPDATE_ENABLE_NOTIFICATIONS,
            enabled
        })
    }
}

export const updateNewProjectNotifications = (enabled) => {
    return dispatch => {
        updateSubscriptionOfTopic(enabled, TopicNames.newProjects)
        dispatch({
            type: ActionConstants.UPDATE_NEW_PROJECT_NOTIICATIONS,
            enabled
        })
    }
}

export const updateBetaNotifications = (enabled) => {
    return dispatch => {
        updateSubscriptionOfTopic(enabled, TopicNames.newBetaProjects)
        dispatch({
            type: ActionConstants.UPDATE_BETA_NOTIFICATIONS,
            enabled
        })
    }
}

export const updateUrgentHelpNotifications = (enabled) => {
    return dispatch => {
        updateSubscriptionOfTopic(enabled, TopicNames.urgentNotifications)
        dispatch({
            type: ActionConstants.UPDATE_URGENT_HELP_NOTIFICATIONS,
            enabled
        })
    }
}

export const initializeSubscriptionsWithFirebase = (token) => {
    return (dispatch, getState) => {
        const {
            fcmToken,
            newProjectNotifications,
            newBetaNotifications,
            urgentHelpNotification,
            projectSpecificNotifications
        } = getState().settings;

        if (fcmToken !== token) {
            updateSubscriptionOfTopic(newProjectNotifications, TopicNames.newProjects)
            updateSubscriptionOfTopic(newBetaNotifications, TopicNames.newBetaProjects)
            updateSubscriptionOfTopic(urgentHelpNotification, TopicNames.urgentNotifications)
            projectSpecificNotifications.forEach(project => {
                updateSubscriptionOfTopic(project.subscribed, project.id)
            })

            dispatch({
                type: ActionConstants.NOTIFICATIONS_INITIALIZED,
                token
            })
        }
    }
}
