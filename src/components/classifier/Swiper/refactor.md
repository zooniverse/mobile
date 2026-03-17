# Swiper Classifier — Refactor History

This document captures the context and decisions behind the Swiper classifier refactor. It replaces the old class-based `SwipeClassifier` and its associated components (`SwipeCard`, `SwipeTabs`, `SwipeableSubject`, `SwipeSingleImage`). The old files have been deleted.

## Why the refactor

The old SwipeClassifier had five interconnected issues:

1. **Dual-state desync** — The `react-native-swipeable-card-stack` library managed its own internal card state while the component maintained a separate `swipes` array and derived the current index from `swipes.length`. These fell out of sync during rapid swiping, causing wrong subjects to display or animations to fire twice.

2. **Unbounded memory growth** — Subjects were only appended to `subjectLists` in Redux and never removed. `seenThisSession` grew in parallel. Image files cached via RNFetchBlob were only cleaned up on card unmount (and only 2 cards were ever mounted). The `images` reducer was in the redux-persist whitelist, accumulating across sessions. Users reported ~0.5MB per classification, app degraded after 20 and locked up at ~50.

3. **Image loading races** — The card stack rendered 2 cards simultaneously. When the library transitioned to the next card, its image might not be loaded yet, causing a flash. Multi-image subjects compounded this with `JSON.stringify` comparisons and `setInterval`-based auto-play overlapping with transitions.

4. **Competing refill logic** — Subject refill was triggered in two places with different thresholds — `saveClassification` fired when `usableSubjects.length < 5` (using O(n*m) filtering), and `onSwipeEnded` fired when within 8 of the end. Both could fire simultaneously, causing duplicate fetches.

5. **Submission-time overhead** — `Image.getSize()` was called asynchronously at classification submission time for every subject image. This added variable latency and could pile up during fast swiping.

## What changed

### Architecture

- **Dropped the card stack library** (`react-native-swipeable-card-stack`, `react-native-deck-swiper`) — replaced with custom gesture handling using `react-native-gesture-handler` (Gesture.Pan) and `react-native-reanimated` (useSharedValue, withTiming, withSpring), both already in the project.

- **Custom subject queue** (`useSubjectQueue`) — manages its own queue with eviction, single refill trigger, and O(1) dedup via a Set. Replaces the Redux `subjectLists` store. This is why the Swiper uses `startSwiperClassification` instead of `startNewClassification` in the navigator — we skip the Redux subject fetch to avoid a duplicate API call.

- **Image prefetch pipeline** (`useImagePrefetch`) — preloads images for the next N subjects and captures natural dimensions during prefetch. The old code loaded images reactively when a card mounted, and called `Image.getSize()` at submission time. Now dimensions are cached during prefetch and reused at submission.

- **Direct classification submission** (`swiperClassification.js`) — a plain async function, not a Redux thunk. Takes everything needed as arguments and sends a single POST. The old `saveClassification` action round-tripped through Redux annotations, dispatched multiple actions (`setSubjectSeenThisSession`, `initializeAnnotation`, `setSubjectForWorkflow`), and called `Image.getSize()` at submission time.

- **Functional components throughout** — the old code was a mix of class and functional components.

### Key design decisions

- **`isAnimating` is a Reanimated shared value** (not a React ref) so gesture callbacks on the UI thread can read it synchronously. Using a ref caused stale reads on the UI thread.

- **`isSwiping` is React state** (not a shared value) because it's only used as a boolean prop for child components, not in animated styles.

- **Ref-based callback pattern in `useSwiperGesture`** — `onSwipeComplete` is stored in a ref and invoked via a stable callback function (`stableNotifyComplete` with empty deps). This prevents Reanimated's worklet closure caching from calling a stale version of the callback. Without this, the worklet captures an old `advanceToNextSubject` with a stale `currentIndex`, making `setCurrentIndex` a no-op and leaving `isAnimating` stuck at true.

- **Declaration order matters in `SwiperClassifier`** — `doSubmit` must be defined before `handleClassification` because Babel transforms `const` to `var`. If `doSubmit` is defined after, its value is `undefined` in `handleClassification`'s dependency array, and React never detects when `doSubmit` changes. This caused the same stale closure symptom as the worklet issue above.

- **`resetCard` is separate from the swipe completion callback** — the parent swaps the subject first (via `advanceToNextSubject`), React re-renders with the new subject, then a `useEffect` detects the subject change and calls `resetCard`. This prevents the old subject from flashing at center position.

- **Two cards rendered** — the current card (interactive, gesture-enabled) and the next card (static, underneath with `zIndex: -1`). The next card's image is preloaded so it's visible the instant the current card animates away.

- **Background color on card container** — `#EBEBEB` when not swiping, transparent while swiping. Matches the old `SwipeableSubject` behavior so images appear uniform within the card area.

### What was preserved

- Button styling uses the same `ButtonAnswer` component with i18n translation support
- Card rotation range: ±30 degrees
- Yes/No overlay labels with the same font, size, and fade behavior
- Already-seen banner placement
- Multi-image carousel with 500ms auto-play interval
- Video display with platform-specific expand button
- Full classification POST payload structure (verified via curl comparison)
- `resizeMode="contain"` for all images

### Bugs found during implementation

1. Card flash-back after swipe — resetCard ran before React re-rendered with new subject
2. isAnimating as ref on UI thread — gesture callbacks read stale ref values
3. 'worklet' inside useCallback — broke Reanimated's Babel transformation
4. triggerSwipe calling worklet from JS thread — thread boundary violation
5. isSwiping shared value read in render — captured stale value
6. Missing doSubmit dependency — handleClassification used stale doSubmit
7. Stale closure on trim — advanceToNextSubject had nested state updaters reading stale values
8. Swiping stops after 2 swipes — stale worklet closure (fixed with ref-based callback pattern)
9. Declaration order bug — doSubmit undefined in handleClassification's dependency array (fixed by reordering)
