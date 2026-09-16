/**
 * Helper utils for workflows
 */

import * as R from 'ramda'

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
  return isValidOCRWorkflow(workflow) || isValidDrawingWorkflow(workflow) || isValidQuestionWorkflow(workflow)
}

const isValidOCRWorkflow = (workflow) => {
  if (!workflow?.tasks || !workflow.first_task) return false
  // OCR support currently covers sequential correction and multi-select
  // reporting tasks, including the HAVI 32497 workflow. Do not silently
  // enable task bodies with different submission semantics.
  if (Object.values(workflow.tasks).some(task => task?.type === 'textFromSubject')) {
    const visited = new Set()
    let key = workflow.first_task
    while (key) {
      if (visited.has(key)) return false
      visited.add(key)
      const task = workflow.tasks[key]
      if (!task || !['textFromSubject', 'multiple'].includes(task.type)) return false
      if (task.type === 'multiple' && (!Array.isArray(task.answers) || !task.answers.length || typeof task.question !== 'string')) return false
      if (task.unlinkedTask || task.feedback?.enabled) return false
      key = task.next
    }
    workflow.type = workflow.tasks[workflow.first_task].type
    return true
  }
  return false
}

const isValidQuestionWorkflow = (workflow) => {
  if (!workflow.first_task) {
    return false
  }
  
  const firstTask = workflow.tasks[workflow.first_task]
  
  if (firstTask === undefined) {
    return false
  }

  if (firstTask.type !== 'single' && firstTask.type !== 'multiple') {
    return false
  }
  
  const hasSingleTask = workflowHasSingleTask(workflow)

  const shortcut = workflow.tasks[firstTask.unlinkedTask]

  const questionNotTooLong = firstTask.question.length < 200
  const notTooManyShortcuts = shortcut ? shortcut.answers.length <= 2 : true
  const usesFeedback = firstTask.feedback ? firstTask.feedback.enabled : false;

  // Feedback will have multiple tasks so you chec that the workflow has a single task OR is feedback.
  if ((hasSingleTask || usesFeedback)&& questionNotTooLong && notTooManyShortcuts) {
    workflow.type = firstTask.type

    const hasTwoAnswers = firstTask.answers.length === 2
    if (hasTwoAnswers && workflow.type === 'single') {
        // This is a special, mobile-only flow where users swipe left and right for questions where they choose on of two answers
        workflow.type = 'swipe'
    }

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
