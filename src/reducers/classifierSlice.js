import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // ISO timestamp set whenever the subject on screen changes. Used by the
  // submission pipeline as `started_at` in the classification metadata.
  subjectStartTime: null,

  // Phase 2: multi-task chain state.
  // `currentTaskKey` is the task currently presented to the user.
  // `taskHistory` is the breadcrumb of completed tasks for the current chain,
  //   oldest first; each entry is `{ taskKey, answerValue }`. Does NOT include
  //   the current task.
  // `annotationsByTask` is the authoritative store of per-task annotations
  //   for the in-progress chain. Kept across `goBack` so the body can
  //   pre-select the user's prior choice on the restored task. Pruned on
  //   `advanceTo` to drop annotations for tasks no longer reachable on the
  //   active path (i.e. branch invalidation when the user re-picks).
  currentTaskKey: null,
  taskHistory: [],
  annotationsByTask: {},

  // Mini-course resource keyed by workflow id. Stored separately from the
  // tutorial state so the two never share a slot. Value is the panoptes
  // resource (with `mediaResources` attached for images) or null when the
  // workflow has no mini-course.
  miniCoursesByWorkflow: {},

  // Per-session classification counter for the mini-course trigger.
  // Incremented only for signed-in users (guests don't see mini-course, so
  // their classifications never enter the count). Not persisted; resets on
  // app launch.
  classificationCount: 0,
}

const classifierSlice = createSlice({
  name: 'classification',
  initialState,
  reducers: {
    reset: () => initialState,
    setSubjectStartTime: (state, action) => {
      state.subjectStartTime = action.payload
    },
    startChain: (state, action) => {
      state.currentTaskKey = action.payload?.taskKey ?? null
      state.taskHistory = []
      state.annotationsByTask = {}
    },
    recordAnnotation: (state, action) => {
      const { taskKey, annotation } = action.payload || {}
      if (!taskKey) return
      state.annotationsByTask[taskKey] = annotation
    },
    advanceTo: (state, action) => {
      const { fromTaskKey, answerValue, toTaskKey } = action.payload || {}
      if (!fromTaskKey || !toTaskKey) return
      state.taskHistory.push({ taskKey: fromTaskKey, answerValue })
      const validKeys = new Set([
        ...state.taskHistory.map((e) => e.taskKey),
        toTaskKey,
      ])
      for (const key of Object.keys(state.annotationsByTask)) {
        if (!validKeys.has(key)) delete state.annotationsByTask[key]
      }
      state.currentTaskKey = toTaskKey
    },
    goBack: (state) => {
      if (state.taskHistory.length === 0) return
      const popped = state.taskHistory.pop()
      state.currentTaskKey = popped.taskKey
    },
    setMiniCourse: (state, action) => {
      const { workflowId, miniCourse } = action.payload || {}
      if (!workflowId) return
      state.miniCoursesByWorkflow[workflowId] = miniCourse ?? null
    },
    incrementClassificationCount: (state) => {
      state.classificationCount += 1
    },
    resetClassificationCount: (state) => {
      state.classificationCount = 0
    },
  },
})

/**
 * Selector: ordered list of annotations on the active chain path
 * (history tasks first, then the current task), ready to be submitted.
 * Filters out tasks that don't yet have a recorded annotation.
 */
export const selectActiveAnnotations = (state) => {
  const slice = state.classification
  if (!slice) return []
  const orderedKeys = [
    ...slice.taskHistory.map((e) => e.taskKey),
    slice.currentTaskKey,
  ].filter(Boolean)
  return orderedKeys
    .map((key) => slice.annotationsByTask[key])
    .filter((a) => a !== undefined && a !== null)
}

export const {
  reset,
  setSubjectStartTime,
  startChain,
  recordAnnotation,
  advanceTo,
  goBack,
  setMiniCourse,
  incrementClassificationCount,
  resetClassificationCount,
} = classifierSlice.actions

export default classifierSlice.reducer
