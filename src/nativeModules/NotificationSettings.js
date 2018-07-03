import { NativeModules } from 'react-native'

const { NotificationSettings } = NativeModules

export const updateSubscriptionOfTopic = (subscribed, topic) => {
    const subscriptionFunction = subscribed ? subscribeToTopic : unsubscribeFromTopic
    return subscriptionFunction(topic)
}
/**
 * 
 * @param {The topic string} topic 
 * @returns A promise that resolved on completion
 */
const subscribeToTopic = (topic) => {
    return NotificationSettings.setInterestSubscription(topic, true)
}

/**
 * 
 * @param {The topic string} topic 
 * @returns A promise that resolves on completion
 */
const unsubscribeFromTopic = (topic) => {
    return NotificationSettings.setInterestSubscription(topic, false)
}