/**
 * Submits a single-choice or multi-select classification to the Panoptes
 * API. Pure async function — no Redux, no dispatches. All inputs (including
 * annotations, start time, and viewport) come from the caller.
 *
 * Mirrors the shape of `submitSwiperClassification`. Replaces the legacy
 * `saveClassification` thunk for the new classifier flow; the legacy thunk
 * stays in place so the legacy classifier screens keep working for rollback.
 */

import apiClient from 'panoptes-client/lib/api-client'
import { Image, Platform } from 'react-native'
import { PushNotifications } from '../notifications/PushNotifications'

// Resolves each display's natural dimensions and builds the metadata entry
// the Panoptes API expects, matching the legacy `saveClassification` shape.
const buildSubjectDimensions = async (subject, displayDimensions) => {
    if (!subject?.displays?.length) return []
    const sizePromises = subject.displays.map(
        ({ src }) =>
            new Promise((resolve) => {
                Image.getSize(
                    src,
                    (naturalWidth, naturalHeight) => {
                        const aspectRatio = Math.min(
                            displayDimensions.height / naturalHeight,
                            displayDimensions.width / naturalWidth
                        )
                        resolve({
                            naturalWidth,
                            naturalHeight,
                            clientWidth: displayDimensions.width * aspectRatio,
                            clientHeight: displayDimensions.height * aspectRatio,
                        })
                    },
                    // Image.getSize error → resolve a zeroed entry so
                    // Promise.all doesn't reject on a single bad asset.
                    () => resolve({ naturalWidth: 0, naturalHeight: 0 })
                )
            })
    )
    try {
        return await Promise.all(sizePromises)
    } catch (error) {
        console.warn('Failed to resolve subject dimensions:', error)
        return []
    }
}

export async function submitChoiceClassification({
    workflow,
    subject,
    annotations,
    startTime,
    displayDimensions,
    viewport,
    sessionId,
    feedbackMeta = null,
    isPreviewMode = false,
}) {
    if (isPreviewMode) return

    const subjectDimensions = await buildSubjectDimensions(subject, displayDimensions)

    const metadata = {
        workflow_version: workflow.version,
        started_at: startTime,
        finished_at: new Date().toISOString(),
        user_agent: `${Platform.OS} Mobile App`,
        user_language: 'en',
        utc_offset: (new Date().getTimezoneOffset() * 60).toString(),
        subject_dimensions: subjectDimensions,
        viewport,
        session: sessionId,
    }
    if (feedbackMeta) {
        metadata.feedback = feedbackMeta
    }

    try {
        const result = await apiClient
            .type('classifications')
            .create({
                completed: true,
                annotations,
                metadata,
                links: {
                    project: workflow.links.project,
                    workflow: workflow.id,
                    subjects: [subject.id],
                },
            })
            .save()

        if (result.completed && result?.links?.project) {
            PushNotifications.userClassifiedProject(result.links.project)
        }
    } catch (error) {
        // Submission failures are non-blocking; the user advances
        // regardless, matching the legacy behavior.
        console.warn('Classification submission failed:', error)
    }
}
