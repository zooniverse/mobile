/**
 * The animated card component for the Swiper classifier.
 *
 * A single component type handles both "current" and "next" cards via the
 * isCurrent prop. Cards are keyed by subject ID so React preserves the
 * component instance when a subject moves from next to current. This fixes
 * the video flash issue — without this, video subjects would briefly show
 * a white flash between swipes because the Video component was destroyed
 * and recreated each time.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import SwiperSubject from './SwiperSubject';
import SwiperOverlay from './SwiperOverlay';
import AlreadySeenBanner from '../AlreadySeenBanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Maximum card rotation in degrees at full swipe
const MAX_ROTATION = 30;

const SwiperCard = ({
  subject,
  isCurrent,
  isImageReady,
  panGesture,
  translateX,
  isSwiping,
  answers,
  alreadySeen,
  inMuseumMode,
  onExpandImage,
  containerDimensions,
}) => {
  // Shared value so the animated style can react to isCurrent changes
  const isCurrentShared = useSharedValue(isCurrent);
  useEffect(() => {
    isCurrentShared.value = isCurrent;
  }, [isCurrent, isCurrentShared]);

  // Delays overlay rendering by one frame after becoming current,
  // so resetCard has time to set translateX back to 0 first.
  const [overlayReady, setOverlayReady] = useState(isCurrent);
  useEffect(() => {
    if (!isCurrent) {
      setOverlayReady(false);
      return undefined;
    }

    const animationFrame = requestAnimationFrame(() => {
      setOverlayReady(true);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [isCurrent]);

  // Disabled gesture for the next card — keeps the component tree
  // identical so React doesn't remount when isCurrent changes.
  const disabledGesture = useMemo(() => Gesture.Pan().enabled(false), []);

  // Only apply translateX + rotation when this is the current card.
  // When not current, no transform — card sits at (0,0) behind the current card.
  const animatedStyle = useAnimatedStyle(() => {
    if (!isCurrentShared.value) return {};

    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-MAX_ROTATION, 0, MAX_ROTATION],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const yesLabel = answers?.[0]?.label || 'Yes';
  const noLabel = answers?.[1]?.label || 'No';

  if (!subject) return null;

  return (
    <GestureDetector gesture={isCurrent ? panGesture : disabledGesture}>
      <Animated.View
        style={[
          styles.card,
          {
            width: containerDimensions.width,
            height: containerDimensions.height,
            zIndex: isCurrent ? 1 : -1,
          },
          animatedStyle,
        ]}
      >
        <SwiperSubject
          subject={subject}
          isImageReady={isImageReady}
          swiping={isCurrent ? isSwiping : false}
          isCurrentCard={isCurrent}
          onExpandImage={onExpandImage}
          containerDimensions={containerDimensions}
        />

        {isCurrent && alreadySeen && !inMuseumMode && (
          <View style={styles.bannerContainer} pointerEvents="none">
            <AlreadySeenBanner />
          </View>
        )}

        {overlayReady && (
          <SwiperOverlay
            translateX={translateX}
            yesLabel={yesLabel}
            noLabel={noLabel}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SwiperCard;
