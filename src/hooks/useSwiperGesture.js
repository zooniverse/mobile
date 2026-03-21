/**
 * Swipe gesture configuration and state machine for the Swiper classifier.
 *
 * State machine: IDLE → SWIPING → ANIMATING_OUT → (callback) → IDLE
 *                               → ANIMATING_BACK → IDLE
 *
 * isAnimating is a shared value so gesture callbacks on the UI thread can
 * read it. onSwipeComplete is stored in a ref to avoid stale worklet closures.
 * See refactor.md for history on the stale closure bug.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Card must be dragged past this fraction of screen width to count as a swipe
const SWIPE_THRESHOLD = 0.3;

// Where the card lands off screen (1.5x screen width ensures it's fully gone)
const EXIT_POSITION = SCREEN_WIDTH * 1.5;

// Animation duration for the card sliding off screen (ms)
const EXIT_DURATION = 200;

// Spring config for snapping back to center on cancelled swipe
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
};

const useSwiperGesture = ({ onSwipeComplete, enabled = true }) => {
  // Card's horizontal position. 0 = centered, negative = left, positive = right.
  const translateX = useSharedValue(0);

  // Whether a swipe or animation is in progress (locks input).
  // Must be a shared value so gesture callbacks on the UI thread can read it.
  const isAnimating = useSharedValue(false);

  // Whether finger is currently down on the card.
  // React state because it's only used as a prop for children.
  const [isSwiping, setIsSwiping] = useState(false);

  // Stable callbacks for runOnJS
  const setSwipingTrue = useCallback(() => setIsSwiping(true), []);
  const setSwipingFalse = useCallback(() => setIsSwiping(false), []);

  // Store onSwipeComplete in a ref so the worklet always calls the latest
  // version. Without this, Reanimated can cache a stale closure that
  // references an old advanceToNextSubject with a stale currentIndex.
  const onSwipeCompleteRef = useRef(onSwipeComplete);
  useEffect(() => {
    onSwipeCompleteRef.current = onSwipeComplete;
  }, [onSwipeComplete]);

  // Stable reference for the worklet — reads the latest callback from the ref.
  const stableNotifyComplete = useCallback((direction) => {
    if (onSwipeCompleteRef.current) {
      onSwipeCompleteRef.current(direction);
    }
  }, []);

  // Resets the card to center and unlocks input.
  // Must be called after the subject has changed and React has re-rendered.
  const resetCard = useCallback(() => {
    translateX.value = 0;
    isAnimating.value = false;
  }, [translateX, isAnimating]);

  // Pan gesture: horizontal only, vertical movement cancels.
  // All callbacks run on the UI thread (worklets).
  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
    .onStart(() => {
      'worklet';
      if (isAnimating.value) return;
      runOnJS(setSwipingTrue)();
    })
    .onUpdate((event) => {
      'worklet';
      if (isAnimating.value) return;
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      'worklet';
      if (isAnimating.value) return;
      runOnJS(setSwipingFalse)();

      const swipeDistance = Math.abs(event.translationX);
      const threshold = SCREEN_WIDTH * SWIPE_THRESHOLD;

      if (swipeDistance > threshold) {
        // Swipe exceeded threshold — lock input and animate off screen
        isAnimating.value = true;
        const direction = event.translationX > 0 ? 'right' : 'left';
        const target = direction === 'right' ? EXIT_POSITION : -EXIT_POSITION;

        translateX.value = withTiming(
          target,
          { duration: EXIT_DURATION, easing: Easing.out(Easing.cubic) },
          (finished) => {
            'worklet';
            if (finished) {
              // Stable ref — see comment above
              runOnJS(stableNotifyComplete)(direction);
            }
          }
        );
      } else {
        // Swipe didn't reach threshold — snap back to center
        isAnimating.value = true;
        translateX.value = withSpring(0, SPRING_CONFIG, (finished) => {
          'worklet';
          if (finished) {
            isAnimating.value = false;
          }
        });
      }
    })
    .onFinalize(() => {
      'worklet';
      runOnJS(setSwipingFalse)();
    });

  // Programmatic swipe triggered by button presses.
  // Respects the same input lock as gesture swipes.
  const triggerSwipe = useCallback(
    (direction) => {
      if (isAnimating.value) return;
      isAnimating.value = true;

      const target = direction === 'right' ? EXIT_POSITION : -EXIT_POSITION;

      translateX.value = withTiming(
        target,
        { duration: EXIT_DURATION, easing: Easing.out(Easing.cubic) },
        (finished) => {
          'worklet';
          if (finished) {
            runOnJS(stableNotifyComplete)(direction);
          }
        }
      );
    },
    [translateX, isAnimating, stableNotifyComplete]
  );

  return {
    translateX,
    isSwiping,
    panGesture,
    triggerSwipe,
    resetCard,
  };
};

export default useSwiperGesture;
