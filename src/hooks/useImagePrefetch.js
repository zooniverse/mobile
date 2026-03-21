/**
 * Prefetch pipeline for subject images in the Swiper classifier.
 *
 * Preloads images for upcoming subjects and captures their natural
 * dimensions during prefetch. Maintains a window of N subjects ahead
 * so the next image is already in memory when the user swipes.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Image, Platform } from 'react-native';

// How many subjects ahead of the current one to prefetch
const PREFETCH_WINDOW = 3;

// Image load states: pending → loading → ready (or error)

const useImagePrefetch = (queue, currentIndex) => {
  // Map of subjectId → { status: 'pending'|'loading'|'ready'|'error', dimensions: [...] }
  const [imageStates, setImageStates] = useState({});

  // Track which subjects we've already started prefetching to avoid duplicate work
  const prefetchedRef = useRef(new Set());

  // Prefetches all images for a subject and captures their natural dimensions.
  const prefetchSubject = useCallback(async (subject) => {
    if (!subject?.displays?.length) return;

    const subjectId = subject.id;

    // Mark as loading
    setImageStates((prev) => ({
      ...prev,
      [subjectId]: { status: 'loading', dimensions: [] },
    }));

    try {
      // Prefetch each image and capture its natural dimensions
      const dimensions = await Promise.all(
        subject.displays.map(({ src }) => {
          return new Promise((resolve, reject) => {
            // Image.getSize both prefetches the image and returns dimensions.
            // On Android this is actually more reliable than Image.prefetch
            // for getting images into the cache.
            Image.getSize(
              src,
              (naturalWidth, naturalHeight) => {
                resolve({ naturalWidth, naturalHeight, src });
              },
              (error) => {
                console.warn(`Failed to prefetch image: ${src}`, error);
                // Resolve with null dimensions rather than rejecting —
                // a failed prefetch shouldn't block the whole subject
                resolve({ naturalWidth: 0, naturalHeight: 0, src });
              }
            );
          });
        })
      );

      // Also call Image.prefetch on iOS for better cache behavior
      if (Platform.OS === 'ios') {
        await Promise.all(
          subject.displays.map(({ src }) =>
            Image.prefetch(src).catch(() => {
              // Non-critical — getSize above already attempted the download
            })
          )
        );
      }

      setImageStates((prev) => ({
        ...prev,
        [subjectId]: { status: 'ready', dimensions },
      }));
    } catch (error) {
      console.warn(`Failed to prefetch subject ${subjectId}:`, error);
      setImageStates((prev) => ({
        ...prev,
        [subjectId]: { status: 'error', dimensions: [] },
      }));
    }
  }, []);

  // Prefetch subjects within the window whenever the queue or index changes.
  useEffect(() => {
    const endIndex = Math.min(currentIndex + PREFETCH_WINDOW, queue.length);

    for (let i = currentIndex; i < endIndex; i++) {
      const subject = queue[i];
      if (subject && !prefetchedRef.current.has(subject.id)) {
        prefetchedRef.current.add(subject.id);
        prefetchSubject(subject);
      }
    }
  }, [queue, currentIndex, prefetchSubject]);

  // Clean up image states for subjects trimmed from the queue.
  useEffect(() => {
    const currentIds = new Set(queue.map((s) => s.id));
    setImageStates((prev) => {
      const cleaned = {};
      for (const id of Object.keys(prev)) {
        if (currentIds.has(id)) {
          cleaned[id] = prev[id];
        }
      }
      // Only update if something was actually removed
      if (Object.keys(cleaned).length < Object.keys(prev).length) {
        // Also clean up the prefetched tracking set
        for (const id of prefetchedRef.current) {
          if (!currentIds.has(id)) {
            prefetchedRef.current.delete(id);
          }
        }
        return cleaned;
      }
      return prev;
    });
  }, [queue]);

  // Returns the image load state for a subject.
  const getImageState = useCallback(
    (subjectId) => {
      return imageStates[subjectId] || { status: 'pending', dimensions: [] };
    },
    [imageStates]
  );

  // Returns cached dimensions for a subject's images.
  const getDimensions = useCallback(
    (subjectId) => {
      return imageStates[subjectId]?.dimensions || [];
    },
    [imageStates]
  );

  // Check if a subject's images are ready to display.
  const isReady = useCallback(
    (subjectId) => {
      return imageStates[subjectId]?.status === 'ready';
    },
    [imageStates]
  );

  return {
    getImageState,
    getDimensions,
    isReady,
  };
};

export default useImagePrefetch;
