/**
 * Loads the one-time-per-workflow resources (field guide + tutorial) in
 * parallel on mount. Matches the old `startNewClassification` pattern so we
 * don't drift from existing behavior.
 *
 * Data lands in the legacy `state.classifier.guide` / `state.classifier.tutorial`
 * slices for now. Migration to the new `classification` slice happens during
 * tech-debt cleanup.
 */

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  fetchFieldGuide,
  fetchTutorials,
  setNeedsTutorial,
  setupProjectPreferences,
} from '../actions/classifier'

const useWorkflowResources = (workflow, project) => {
  const dispatch = useDispatch()
  const workflowId = workflow?.id
  const projectId = project?.id

  // Pull the resolved data from Redux once each fetch dispatches into the
  // legacy classifier slice.
  const guide = useSelector((state) => state.classifier.guide?.[workflowId])
  const tutorial = useSelector((state) => state.classifier.tutorial?.[workflowId])
  const needsTutorial = useSelector(
    (state) => state.classifier.needsTutorial?.[workflowId]
  )

  const [isLoading, setIsLoading] = useState(Boolean(workflowId && projectId))

  useEffect(() => {
    if (!workflowId || !projectId) return

    setIsLoading(true)

    // Kick off all fetches in parallel, matching the old Promise.all shape.
    // - `setupProjectPreferences` populates `state.user.projects[projectId]`
    //   which `setNeedsTutorial` reads to detect completed tutorials for a
    //   returning logged-in user.
    // - Tutorial fetch is followed by setNeedsTutorial to flag first-time
    //   users.
    Promise.all([
      dispatch(setupProjectPreferences(workflowId, project)),
      dispatch(fetchFieldGuide(workflowId, projectId)),
      dispatch(fetchTutorials(workflowId)).then(() =>
        dispatch(setNeedsTutorial(workflowId, projectId))
      ),
    ]).finally(() => {
      setIsLoading(false)
    })
  }, [workflowId, projectId])

  return { guide, tutorial, needsTutorial, isLoading }
}

export default useWorkflowResources
