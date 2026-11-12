/**
 * Animated Yes/No label overlay that appears as the user swipes.
 * Opacity is driven by the card's horizontal position (translateX).
 *
 * Android labels appear immediately during a swipe; iOS labels fade in.
 */

import React from 'react';
import { Text, Dimensions, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import EStyleSheet from 'react-native-extended-stylesheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// How far the card must move (in pixels) before the label is fully visible
const LABEL_REVEAL_DISTANCE = SCREEN_WIDTH * 0.15;
const IS_ANDROID = Platform.OS === 'android';

const SwiperOverlay = ({ translateX, yesLabel = 'Yes', noLabel = 'No' }) => {
  // "Yes" label appears when swiping right (positive translateX)
  const yesStyle = useAnimatedStyle(() => {
    // On Android, fading white text over its black shadow makes the letters look dark.
    // Show the label at full opacity during the swipe to keep the letters white.
    if (IS_ANDROID) return { opacity: translateX.value > 0 ? 1 : 0 };
    const opacity = interpolate(
      translateX.value,
      [0, LABEL_REVEAL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // "No" label appears when swiping left (negative translateX)
  const noStyle = useAnimatedStyle(() => {
    // Skip the fade on Android for the same text/shadow contrast issue.
    if (IS_ANDROID) return { opacity: translateX.value < 0 ? 1 : 0 };
    const opacity = interpolate(
      translateX.value,
      [0, -LABEL_REVEAL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <>
      <Animated.View style={[styles.labelContainer, yesStyle]} pointerEvents="none">
        <Text style={styles.labelText}>{noLabel}</Text>
      </Animated.View>
      <Animated.View style={[styles.labelContainer, noStyle]} pointerEvents="none">
        <Text style={styles.labelText}>{yesLabel}</Text>
      </Animated.View>
    </>
  );
};

const styles = EStyleSheet.create({
  labelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  labelText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'normal',
    fontFamily: 'Karla',
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default SwiperOverlay;
