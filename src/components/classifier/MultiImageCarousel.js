/**
 * Auto-playing carousel for multi-frame subjects. Used by both Swipe
 * (card stack) and non-Swipe (Question/Multi/Drawing) workflow bodies.
 *
 * Replaces the two parallel legacy implementations:
 *   - `AutoPlayMultiImage` (non-Swipe)
 *   - `SwiperMultiImage` (Swipe)
 *
 * Behavior (matches both legacy components):
 *   - Cycles through images every 500ms while playing
 *   - Starts auto-play once all images have decoded (and when
 *     `showPagination` is true — matches both legacy `currentCard`
 *     and `isCurrentCard` gates)
 *   - Stacks all images with opacity toggle to avoid Android white flash
 *     between frames (Swiper's technique)
 *   - Tap to toggle play/pause; long press (200ms+) pauses while held
 *   - Pagination dots show per frame; tapping a dot jumps to it (and
 *     toggles play/pause when tapping the current dot)
 *   - Expand icon appears at bottom-right whenever the slideshow is
 *     paused
 *
 * The one visual option that differs between legacy consumers is where
 * the pagination dots sit: Swipe overlaid the dots on the image (legacy
 * Swiper), while Question/Multi put them in the flowed space below
 * (legacy AutoPlay). Both are preserved via `dotsStyle`.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Image,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native'
import FontAwesome from '@react-native-vector-icons/fontawesome/static'

import ExpandImageIcon from './ExpandImageIcon'
import SubjectLoadingIndicator from '../common/SubjectLoadingIndicator'

// Time between auto-play frames (ms)
const AUTOPLAY_INTERVAL = 500

// How long a press must be held to count as a "long press" (ms)
const LONG_PRESS_DURATION = 200

// Normalize `images` — accept both plain URI strings and `{uri}` objects
// so we can drop in place of both legacy APIs.
const normalizeUri = (img) => (typeof img === 'string' ? img : img?.uri)

const MultiImageCarousel = ({
  images,
  swiping = false,
  onExpandImage,
  showPagination = true,
  dotsStyle = 'flowed',
  subjectId,
}) => {
  const uris = (images || []).map(normalizeUri).filter(Boolean)

  const [slideIndex, setSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [longPress, setLongPress] = useState(false)
  const [decodedCount, setDecodedCount] = useState(0)

  const imagesLoaded = decodedCount >= uris.length && uris.length > 0

  const intervalRef = useRef(null)
  const pressTimerRef = useRef(null)
  const swipingRef = useRef(swiping)

  // Keep swiping ref current so timer callbacks see the latest value.
  useEffect(() => {
    swipingRef.current = swiping
  }, [swiping])

  const startSlideshow = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsPlaying(true)
    intervalRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % uris.length)
    }, AUTOPLAY_INTERVAL)
  }, [uris.length])

  const stopSlideshow = useCallback(() => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Reset decode count (and slide position) when the subject changes.
  useEffect(() => {
    setDecodedCount(0)
    setSlideIndex(0)
  }, [subjectId])

  // Match legacy AutoPlayMultiImage: warm the image cache explicitly.
  // Android flashes on the first slideshow iteration unless getSize is
  // called first; iOS needs prefetch to avoid a blurred-thumbnail flash.
  useEffect(() => {
    if (!uris.length) return
    const allLocal = uris.every((uri) => uri.startsWith('file://'))
    const warm = async () => {
      try {
        if (!allLocal && Platform.OS === 'android') {
          await Promise.all(uris.map((uri) => Image.getSize(uri)))
        }
        if (Platform.OS === 'ios') {
          await Promise.all(uris.map((uri) => Image.prefetch(uri)))
        }
      } catch (error) {
        console.warn('Error preloading carousel images', error)
      }
    }
    warm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])

  // Start auto-play once pagination is enabled and all images are decoded.
  // Stop when pagination toggles off (e.g. off-screen card in Swipe).
  useEffect(() => {
    if (showPagination && imagesLoaded) {
      startSlideshow()
    }
    return () => {
      stopSlideshow()
    }
  }, [showPagination, imagesLoaded, startSlideshow, stopSlideshow])

  // Press-to-pause: long press pauses the slideshow; tap toggles it.
  const onPressIn = useCallback(() => {
    pressTimerRef.current = setTimeout(() => {
      if (swipingRef.current) return
      setLongPress(true)
      stopSlideshow()
    }, LONG_PRESS_DURATION)
  }, [stopSlideshow])

  const onPressOut = useCallback(() => {
    clearTimeout(pressTimerRef.current)
    // Delay so swipe events can propagate first and claim the touch.
    setTimeout(() => {
      if (swipingRef.current) return
      if (longPress) {
        setLongPress(false)
        startSlideshow()
      } else if (isPlaying) {
        stopSlideshow()
      } else {
        startSlideshow()
      }
    }, LONG_PRESS_DURATION)
  }, [longPress, isPlaying, startSlideshow, stopSlideshow])

  // Dot press: toggle play/pause on the current dot, otherwise jump.
  const onDotPress = useCallback(
    (dotIndex) => {
      if (dotIndex === slideIndex) {
        if (isPlaying) stopSlideshow()
        else startSlideshow()
      } else {
        stopSlideshow()
        setSlideIndex(dotIndex)
      }
    },
    [slideIndex, isPlaying, startSlideshow, stopSlideshow]
  )

  // Clean up timers on unmount.
  useEffect(
    () => () => {
      clearInterval(intervalRef.current)
      clearTimeout(pressTimerRef.current)
    },
    []
  )

  if (!uris.length) return null

  const dotsContainerStyle =
    dotsStyle === 'overlay' ? styles.dotsOverlay : styles.dotsFlowed

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={styles.imageStack}>
          {uris.map((uri, idx) => (
            <Image
              key={uri}
              source={{ uri }}
              style={[
                styles.stackedImage,
                { opacity: imagesLoaded && idx === slideIndex ? 1 : 0 },
              ]}
              resizeMode="contain"
              onLoad={() => setDecodedCount((prev) => prev + 1)}
            />
          ))}
        </View>
      </TouchableWithoutFeedback>

      {!imagesLoaded && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <SubjectLoadingIndicator multipleSubjects />
        </View>
      )}

      {!isPlaying && !longPress && onExpandImage && (
        <TouchableOpacity
          onPress={() => onExpandImage(uris[slideIndex])}
          style={styles.expandContainer}
        >
          <ExpandImageIcon />
        </TouchableOpacity>
      )}

      {showPagination && (
        <View style={dotsContainerStyle}>
          {uris.map((_uri, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => onDotPress(idx)}
              style={styles.dotContainer}
            >
              <FontAwesome
                size={16}
                name={idx === slideIndex ? 'circle' : 'circle-thin'}
                color="gray"
                style={styles.dot}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  imageStack: {
    flex: 1,
    alignSelf: 'stretch',
  },
  stackedImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    flex: 1,
  },
  expandContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsFlowed: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dotsOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dotContainer: {
    marginTop: 8,
  },
  dot: {
    marginHorizontal: 6,
  },
})

export default MultiImageCarousel
