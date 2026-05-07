/**
 * Multi-task workflow chain helpers.
 *
 * Panoptes workflows can chain tasks via two mechanisms:
 *   - `task.next` — every task type can declare a single follow-up task.
 *   - `task.answers[i].next` — single-choice tasks branch per answer.
 *
 * The web (FEM) classifier honors per-answer `next` first, falling back to
 * `task.next`. Multi-select question tasks cannot branch per-answer (project
 * builder does not expose it), so they only honor `task.next`.
 */

const SINGLE_CHOICE = 'single'

const hasValue = (v) => v !== undefined && v !== null && v !== ''

/**
 * True if any task or single-choice answer in the workflow declares a `next`.
 * Used to pick between single-task and multi-task UI affordances.
 */
export const isMultiTaskWorkflow = (workflow) => {
  const tasks = workflow?.tasks
  if (!tasks) return false

  for (const taskKey of Object.keys(tasks)) {
    const task = tasks[taskKey]
    if (!task) continue
    if (hasValue(task.next)) return true
    if (task.type === SINGLE_CHOICE && Array.isArray(task.answers)) {
      for (const answer of task.answers) {
        if (hasValue(answer?.next)) return true
      }
    }
  }
  return false
}

/**
 * Resolve the next task key for `task` given the user's answer.
 *
 * - Single-choice: `answerValue` is the chosen answer index. Per-answer `next`
 *   wins; otherwise fall back to `task.next`.
 * - Anything else (multiple, drawing, swipe): `task.next` only.
 *
 * Returns `null` when the chain ends (no `next` is configured).
 */
export const getNextTaskKey = (task, answerValue) => {
  if (!task) return null

  if (task.type === SINGLE_CHOICE && Array.isArray(task.answers)) {
    const answer = task.answers[answerValue]
    if (answer && hasValue(answer.next)) return answer.next
  }

  return hasValue(task.next) ? task.next : null
}

/**
 * Convenience: true when this task + answer terminates the chain.
 */
export const isLastTaskInChain = (task, answerValue) => {
  return getNextTaskKey(task, answerValue) === null
}

/**
 * Project the ordered list of task keys currently on the active path.
 *
 * `history` is the chain stack the Classifier maintains: an ordered array
 * of `{ taskKey, annotation }` entries, oldest first. We only need the keys
 * here, but keeping the helper around centralizes the projection so the
 * shell, the back handler, and the prune-on-rebranch logic agree on what
 * "active path" means.
 */
export const activePathTaskKeys = (history) => {
  if (!Array.isArray(history)) return []
  return history.map((entry) => entry?.taskKey).filter(hasValue)
}
