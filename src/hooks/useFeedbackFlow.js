/**
 * Correct/incorrect feedback flow for classification submit.
 *
 * When feedback rules are active on a subject+workflow, submit pauses to
 * show a modal before committing the classification. Used by SingleChoice
 * and Swipe bodies (legacy Question and Swiper classifiers — Multi and
 * Drawing did not implement feedback).
 *
 * Usage:
 *   const { feedbackModal, withFeedback } = useFeedbackFlow(workflow, project)
 *   withFeedback(subject, answer, (feedbackMeta) => submit(feedbackMeta))
 *   {feedbackModal?.show && <FeedbackModal ...feedbackModal />}
 */

import { useCallback, useState } from 'react'

import {
  getDataForFeedbackModal,
  isFeedbackActive,
} from '../utils/feedback'

const useFeedbackFlow = (workflow, project) => {
  const [feedbackModal, setFeedbackModal] = useState({})

  const withFeedback = useCallback(
    (subject, answer, submitFn) => {
      if (!isFeedbackActive(project, subject, workflow)) {
        submitFn(null)
        return
      }
      const modalData = getDataForFeedbackModal(subject, workflow, answer)
      if (!modalData) {
        submitFn(null)
        return
      }
      setFeedbackModal({
        ...modalData,
        onClose: () => {
          setFeedbackModal({})
          submitFn(modalData.feedbackMeta)
        },
      })
    },
    [workflow, project]
  )

  return { feedbackModal, withFeedback }
}

export default useFeedbackFlow
