/**
 * Helper utils for workflows
 */

import R from 'ramda'

export const getTaskFromWorkflow = (workflow) => {
    const key = workflow.first_task
    return workflow.tasks[key]
  }
  
export const getAnswersFromWorkflow = (workflow) => {
    const task = getTaskFromWorkflow(workflow)
    return task.answers
}

const workflowHasSingleTask = (workflow) => {
  const nonShortCut = (taskKey) => { return workflow.tasks[taskKey].type !== 'shortcut' }
  const nonShortCutTasks = R.filter(nonShortCut, R.keys(workflow.tasks))
  return nonShortCutTasks.length === 1
}

export const isValidMobileWorkflow = workflow => {
  return isValidDrawingWorkflow(workflow) || isValidSwipeWorkflow(workflow)
}

const isValidSwipeWorkflow = (workflow) => {
  if (!workflow.first_task) {
    return false
  }
  const firstTask = workflow.tasks[workflow.first_task]
  const hasTwoAnswers = firstTask.answers.length === 2

  const hasSingleTask = workflowHasSingleTask(workflow)

  const shortcut = workflow.tasks[firstTask.unlinkedTask]
  const config = workflow.configuration

  const questionNotTooLong = firstTask.question.length < 200
  const notTooManyShortcuts = shortcut ? shortcut.answers.length <= 2 : true
  const isNotFlipbook = config ? config.multi_image_mode !== 'flipbook' : true
  const doesNotUseFeedback = firstTask.feedback ? !firstTask.feedback.enabled : true;

  if (hasTwoAnswers && hasSingleTask && questionNotTooLong && notTooManyShortcuts && isNotFlipbook && doesNotUseFeedback) {
    workflow.type = 'question'
    return true
  }

  return false
}

const isValidDrawingWorkflow = (workflow) => {
  if (!workflowHasSingleTask(workflow)) {
    return false
  }

  const firstTask = workflow.tasks[workflow.first_task]
  if (firstTask === undefined) {
    return false 
  }
  
  if (firstTask.type !== 'drawing') {
    return false
  }

  if (firstTask.instruction.length > 200) {
    return false
  }

  const taskTools = firstTask.tools
  if (taskTools.length !== 1) {
    return false
  }

  if (taskTools[0].type !== 'rectangle') {
    return false
  }

  workflow.type = 'drawing'
  return true
}
