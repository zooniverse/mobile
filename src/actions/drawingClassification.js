/**
 * Submits a drawing classification to the Panoptes API. Pure async function
 * — no Redux, no dispatches. Annotations are constructed by the caller (or
 * passed straight through if already shaped); subject dimensions come in
 * as explicit args.
 *
 * Mirrors the shape of `submitSwiperClassification`. Replaces the legacy
 * `submitDrawingClassification` thunk for the new classifier flow; the
 * legacy thunk stays in place so the legacy drawing screen keeps working
 * for rollback.
 */

import apiClient from 'panoptes-client/lib/api-client'
import { Platform } from 'react-native'

import { constructDrawingAnnotations } from '../utils/annotationUtils'
import { PushNotifications } from '../notifications/PushNotifications'

export async function submitDrawing({
    workflow,
    subject,
    shapes,
    tools,
    startTime,
    subjectDimensions,
    clientDimensions,
    viewport,
    sessionId,
    isPreviewMode = false,
}) {
    if (isPreviewMode) return

    const firstTask = workflow.first_task
    const resolvedTools = tools || workflow?.tasks?.[firstTask]?.tools
    const annotations = constructDrawingAnnotations(shapes, resolvedTools, firstTask)

    const metadata = {
        workflow_version: workflow.version,
        started_at: startTime,
        finished_at: new Date().toISOString(),
        user_agent: `${Platform.OS} Mobile App`,
        user_language: 'en',
        utc_offset: (new Date().getTimezoneOffset() * 60).toString(),
        subject_dimensions: {
            ...(subjectDimensions || {}),
            clientHeight: clientDimensions?.clientHeight,
            clientWidth: clientDimensions?.clientWidth,
        },
        viewport,
        session: sessionId,
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
        console.warn('Drawing classification submission failed:', error)
    }
}
