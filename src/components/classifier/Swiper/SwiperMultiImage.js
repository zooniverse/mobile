/**
 * Auto-playing carousel for multi-frame subjects in the Swiper classifier.
 *
 * Cycles through images at 500ms intervals. User interactions:
 * - Tap: toggle auto-play on/off
 * - Long press (200ms+): pause while held, resume on release
 * - Pagination dots: jump to a specific frame
 *
 * Pauses auto-play when the user is swiping the card (via swiping prop).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ExpandImageIcon from '../ExpandImageIcon';

// Time between auto-play frames (ms)
const AUTOPLAY_INTERVAL = 500;

// How long a press must be held to count as a "long press" (ms)
const LONG_PRESS_DURATION = 200;

const SwiperMultiImage = ({
  images,
  subjectId,
  swiping,
  expandImage,
  isCurrentCard,
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [longPress, setLongPress] = useState(false);

  // Tracks how many images have been decoded by their <Image> components.
  // All images render simultaneously (stacked); the carousel only starts
  // after every image has fired onLoad, guaranteeing no white flash on Android.
  const [decodedCount, setDecodedCount] = useState(0);
  const imagesLoaded = decodedCount >= images.length && images.length > 0;

  const intervalRef = useRef(null);
  const pressTimerRef = useRef(null);
  const swipingRef = useRef(swiping);

  // Keep swiping ref in sync so interval callbacks have current value
  useEffect(() => {
    swipingRef.current = swiping;
  }, [swiping]);

  // Starts the auto-play slideshow, wrapping around at the end.
  const startSlideshow = useCallback(() => {
    // Clear any existing interval first to prevent stacking
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsPlaying(true);

    intervalRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % images.length);
    }, AUTOPLAY_INTERVAL);
  }, [images.length]);

  // Stops the auto-play slideshow.
  const stopSlideshow = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset decode count when subject changes.
  useEffect(() => {
    setDecodedCount(0);
  }, [subjectId]);

  // Start auto-play when this is the current card and all images are decoded.
  // Stop when it's no longer the current card.
  useEffect(() => {
    if (isCurrentCard && imagesLoaded) {
      startSlideshow();
    }

    return () => {
      stopSlideshow();
    };
  }, [isCurrentCard, imagesLoaded, startSlideshow, stopSlideshow]);

  // Press-to-pause: long press pauses the slideshow, tap toggles it.
  const onPressIn = useCallback(() => {
    pressTimerRef.current = setTimeout(() => {
      if (swipingRef.current) return;
      setLongPress(true);
      stopSlideshow();
    }, LONG_PRESS_DURATION);
  }, [stopSlideshow]);

  const onPressOut = useCallback(() => {
    clearTimeout(pressTimerRef.current);

    // Delay to let swipe events propagate first
    setTimeout(() => {
      if (swipingRef.current) return;

      if (longPress) {
        setLongPress(false);
        startSlideshow();
      } else {
        // Tap: toggle auto-play
        if (isPlaying) {
          stopSlideshow();
        } else {
          startSlideshow();
        }
      }
    }, LONG_PRESS_DURATION);
  }, [longPress, isPlaying, startSlideshow, stopSlideshow]);

  // Dot press: toggle auto-play on current dot, or jump to a different frame.
  const onDotPress = useCallback(
    (dotIndex) => {
      if (dotIndex === slideIndex) {
        if (isPlaying) {
          stopSlideshow();
        } else {
          startSlideshow();
        }
      } else {
        stopSlideshow();
        setSlideIndex(dotIndex);
      }
    },
    [slideIndex, isPlaying, startSlideshow, stopSlideshow]
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(pressTimerRef.current);
    };
  }, []);

  if (!images.length) return null;

  return (
    <View style={styles.container}>
      {/* All images render simultaneously, stacked via position: absolute.
          Only the current slideIndex image is visible (opacity: 1).
          This forces Android to decode every image on mount, avoiding the
          white flash that occurs when swapping a single Image's source. */}
      <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={styles.imageStack}>
          {images.map((uri, idx) => (
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

      {/* Expand button — only visible when paused */}
      {!isPlaying && !longPress && (
        <TouchableOpacity
          onPress={() => expandImage(images[slideIndex])}
          style={styles.expandContainer}
        >
          <ExpandImageIcon />
        </TouchableOpacity>
      )}

      {/* Pagination dots — only shown on the current card */}
      {isCurrentCard && (
        <View style={styles.dotsContainer}>
          {images.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => onDotPress(idx)}
              style={styles.dotContainer}
            >
              <FontAwesome
                solid
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
  );
};

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
  dotsContainer: {
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
});

export default SwiperMultiImage;
