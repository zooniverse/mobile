import apiClient from 'panoptes-client/lib/api-client';
import { Platform } from 'react-native';
import { PushNotifications } from '../notifications/PushNotifications';

// Submits a classification to the Panoptes API.
export async function submitSwiperClassification({
  workflow,
  subject,
  answer,
  startTime,
  subjectDimensions,
  displayDimensions,
  viewport,
  sessionId,
  feedbackMeta = null,
  isPreviewMode = false,
  // Multi-task chain support: any annotations from earlier tasks in the
  // chain are prepended to the swipe annotation. Empty/undefined for
  // single-task swipe workflows so the legacy POST shape is unchanged.
  priorAnnotations = [],
  // Override the swipe annotation's task key when this Swipe task is
  // reached as a non-first task in a chain. Defaults to first_task.
  taskKey,
}) {
  // In preview/test mode, don't submit to the API
  if (isPreviewMode) return;

  // Build dimension metadata from prefetched dimensions.
  // Calculate client (display) dimensions using aspect ratio.
  const dimensionsMeta = subjectDimensions.map((dim) => {
    if (!dim.naturalWidth || !dim.naturalHeight) {
      return dim;
    }
    const aspectRatio = Math.min(
      displayDimensions.width / dim.naturalWidth,
      displayDimensions.height / dim.naturalHeight
    );
    return {
      naturalWidth: dim.naturalWidth,
      naturalHeight: dim.naturalHeight,
      clientWidth: dim.naturalWidth * aspectRatio,
      clientHeight: dim.naturalHeight * aspectRatio,
    };
  });

  const metadata = {
    workflow_version: workflow.version,
    started_at: startTime,
    finished_at: new Date().toISOString(),
    user_agent: `${Platform.OS} Mobile App`,
    user_language: 'en',
    utc_offset: (new Date().getTimezoneOffset() * 60).toString(),
    subject_dimensions: dimensionsMeta,
    viewport,
    session: sessionId,
  };

  if (feedbackMeta) {
    metadata.feedback = feedbackMeta;
  }

  const swipeAnnotation = { task: taskKey || workflow.first_task, value: answer };
  const annotations = [...priorAnnotations, swipeAnnotation];

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
      .save();

    // If this is the user's first classification on the project,
    // toggle on the push notification setting
    if (result.completed && result?.links?.project) {
      PushNotifications.userClassifiedProject(result.links.project);
    }
  } catch (error) {
    // Classification submission failures are non-blocking.
    // The user continues classifying regardless.
    console.warn('Classification submission failed:', error);
  }
}
