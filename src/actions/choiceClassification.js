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
import DeviceInfo from 'react-native-device-info'
import { PushNotifications } from '../notifications/PushNotifications'

// Resolves each display's natural dimensions and builds the metadata entry
// the Panoptes API expects, matching the legacy `saveClassification` shape.
const buildSubjectDimensions = async (subject, displayDimensions, isOCR) => {
    if (!subject?.displays?.length) return []
    const displays = isOCR
        ? subject.displays.filter(display => display.type === 'image')
        : subject.displays
    const sizePromises = displays.map(
        ({ src, type }) =>
            type && type !== 'image' ? Promise.resolve({}) : new Promise((resolve) => {
                Image.getSize(
                    src,
                    (naturalWidth, naturalHeight) => {
                        const aspectRatio = Math.min(
                            (displayDimensions?.height || 0) / naturalHeight,
                            (displayDimensions?.width || 0) / naturalWidth
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
    userLanguage = 'en',
    isPreviewMode = false,
}) {
    if (isPreviewMode) return true

    const isOCR = Object.values(workflow.tasks || {}).some(task => task?.type === 'textFromSubject')
    const subjectDimensions = await buildSubjectDimensions(subject, displayDimensions, isOCR)
    const submittedAnnotations = isOCR
        ? annotations.map(annotation => ({
            ...annotation,
            taskType: workflow.tasks[annotation.task]?.type,
        }))
        : annotations

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

    if (isOCR) {
        Object.assign(metadata, {
            classifier_version: DeviceInfo.getVersion(),
            revision: DeviceInfo.getBuildNumber(),
            user_language: userLanguage,
            source: subject.metadata?.intervention ? 'sugar' : 'api',
            feedback: feedbackMeta ?? {},
            subject_flagged: false,
            subject_selection_state: {
                already_seen: subject.already_seen,
                finished_workflow: subject.finished_workflow,
                retired: subject.retired,
                selected_at: subject.selected_at,
                selection_state: subject.selection_state,
                user_has_finished_workflow: subject.user_has_finished_workflow,
            },
        })
    }

    try {
        const result = await apiClient
            .type('classifications')
            .create({
                completed: true,
                annotations: submittedAnnotations,
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
        return Boolean(result.completed)
    } catch (error) {
        // OCR callers await this result and retain the chain for retry.
        // Legacy callers can continue using their existing advance behavior.
        console.warn('Classification submission failed:', error)
        return false
    }
}
