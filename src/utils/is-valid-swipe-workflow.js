import { filter, keys } from 'ramda'

export function isValidSwipeWorkflow(workflow) {
  if (!workflow.first_task) {
    return false
  }
  const firstTask = workflow.tasks[workflow.first_task]
  const hasTwoAnswers = firstTask.answers.length === 2

  const nonShortCut = (taskKey) => { return workflow.tasks[taskKey].type !== 'shortcut' }
  const nonShortCutTasks = filter(nonShortCut, keys(workflow.tasks))

  const hasSingleTask = nonShortCutTasks.length === 1

  const shortcut = workflow.tasks[firstTask.unlinkedTask]
  const config = workflow.configuration

  const questionNotTooLong = firstTask.question.length < 200
  const notTooManyShortcuts = shortcut ? shortcut.answers.length <= 2 : true
  const isNotFlipbook = config ? config.multi_image_mode !== 'flipbook' : true
  const doesNotUseFeedback = firstTask.feedback ? !firstTask.feedback.enabled : true;

  return hasTwoAnswers && hasSingleTask && questionNotTooLong && notTooManyShortcuts && isNotFlipbook && doesNotUseFeedback
}
