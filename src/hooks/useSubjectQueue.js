/**
 * Manages the subject queue for the Swiper classifier.
 *
 * A simple array with a currentIndex pointer. Fetches more subjects from
 * the Panoptes API when running low, deduplicates incoming subjects, and
 * periodically trims classified subjects to bound memory growth.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import apiClient from 'panoptes-client/lib/api-client';
import getSubjectLocations from '../utils/get-subject-location';
import * as ActionConstants from '../constants/actions';

// How many unclassified subjects should remain before we fetch more
const REFILL_THRESHOLD = 8;

// How many subjects to request per API call
const PAGE_SIZE = 20;

// After this many classifications, trim classified subjects from the front of the queue
const TRIM_INTERVAL = 10;

const useSubjectQueue = (workflowId) => {
  const dispatch = useDispatch();

  // The queue of subjects waiting to be (or already) classified
  const [queue, setQueue] = useState([]);

  // Points to the subject currently being displayed
  const [currentIndex, setCurrentIndex] = useState(0);

  // Total classifications this session (doesn't reset on trim)
  const [classificationCount, setClassificationCount] = useState(0);

  // Reactive loading flag for the shell to show a spinner while a fetch
  // is in flight.
  const [isLoading, setIsLoading] = useState(false);

  // Prevents duplicate API requests when a refill is already in flight
  const isFetchingRef = useRef(false);

  // Set of subject IDs currently in the queue, for O(1) dedup lookups
  const queuedIdsRef = useRef(new Set());

  // Fetches subjects from the API and appends them to the queue.
  // Deduplicates and guards against concurrent requests.
  const fetchMoreSubjects = useCallback(async () => {
    if (isFetchingRef.current || !workflowId) return;

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const subjects = await apiClient.type('subjects').get({
        workflow_id: workflowId,
        sort: 'queued',
        page_size: PAGE_SIZE,
      });

      // Resolve media URLs for each subject
      subjects.forEach((subject) => {
        subject.displays = getSubjectLocations(subject);
      });

      // Filter out any subjects we already have in the queue
      const newSubjects = subjects.filter(
        (subject) => !queuedIdsRef.current.has(subject.id)
      );

      if (newSubjects.length > 0) {
        // Track the new IDs for future dedup
        newSubjects.forEach((s) => queuedIdsRef.current.add(s.id));

        setQueue((prev) => [...prev, ...newSubjects]);

        // Mirror the fetched subjects into the legacy Redux slot so legacy
        // thunks that still read `classifier.subjectLists[workflowId]`
        // (e.g. the `setSubjectSeenThisSession` reducer) stay in sync.
        dispatch({
          type: ActionConstants.APPEND_SUBJECTS_TO_WORKFLOW,
          workflowId,
          subjects: newSubjects,
        });
      }
    } catch (error) {
      console.warn('Failed to fetch more subjects:', error);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [workflowId, dispatch]);

  // Advances to the next subject. Triggers a refill if running low.
  const advanceToNextSubject = useCallback(() => {
    const classifiedSubject = queue[currentIndex];
    const newIndex = currentIndex + 1;

    setCurrentIndex(newIndex);
    setClassificationCount((prev) => prev + 1);

    // Check if we need more subjects
    const remaining = queue.length - newIndex;
    if (remaining < REFILL_THRESHOLD) {
      fetchMoreSubjects();
    }

    return classifiedSubject;
  }, [queue, currentIndex, fetchMoreSubjects]);

  // Periodically trim classified subjects from the front of the queue
  // to bound memory growth during long sessions.
  useEffect(() => {
    if (
      classificationCount > 0 &&
      classificationCount % TRIM_INTERVAL === 0 &&
      currentIndex > 1
    ) {
      const trimCount = currentIndex - 1; // Keep current subject, trim everything before

      // Clean up the ID set for trimmed subjects
      const trimmedIds = queue.slice(0, trimCount).map((s) => s.id);
      trimmedIds.forEach((id) => queuedIdsRef.current.delete(id));

      setQueue((prev) => prev.slice(trimCount));
      setCurrentIndex((prev) => prev - trimCount);
    }
  }, [classificationCount]);

  // Resets the queue for a new classification session.
  const resetQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
    setClassificationCount(0);
    isFetchingRef.current = false;
    queuedIdsRef.current = new Set();
  }, []);

  // Derived state
  const currentSubject = queue[currentIndex] || null;
  const nextSubject = queue[currentIndex + 1] || null;
  const hasSubjects = currentSubject !== null;
  const remaining = queue.length - currentIndex;

  return {
    queue,
    currentIndex,
    currentSubject,
    nextSubject,
    hasSubjects,
    remaining,
    classificationCount,
    isLoading,
    fetchMoreSubjects,
    advanceToNextSubject,
    resetQueue,
  };
};

export default useSubjectQueue;
