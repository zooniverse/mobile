/**
 * Routes subject rendering to the appropriate display component
 * based on the subject's media type:
 * - Single image → SwiperSingleImage
 * - Multiple images → MultiImageCarousel (auto-play carousel)
 * - Video (.mp4) → inline video player
 *
 * Shows SubjectLoadingIndicator while images are being prefetched.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { isTablet } from 'react-native-device-info';
import SubjectLoadingIndicator from '../../common/SubjectLoadingIndicator';
import SwiperSingleImage from './SwiperSingleImage';
import MultiImageCarousel from '../MultiImageCarousel';
import SubjectVideo from '../SubjectVideo';

const SwiperSubject = ({
  subject,
  isImageReady,
  swiping,
  isCurrentCard,
  onExpandImage,
  containerDimensions,
}) => {
  if (!subject?.displays?.length) return null;

  const hasMultipleImages = subject.displays.length > 1;
  const imageUris = subject.displays.map((d) => d.src);

  // Transparent while swiping so the card background shows through
  const cardBackground = swiping ? 'transparent' : '#EBEBEB';

  // Show loading indicator while images are being prefetched
  if (!isImageReady) {
    return (
      <View style={[styles.cardContainer, { backgroundColor: cardBackground }]}>
        <SubjectLoadingIndicator multipleSubjects={hasMultipleImages} />
      </View>
    );
  }

  // Route to the appropriate display component
  const renderMedia = () => {
    if (hasMultipleImages) {
      return (
        <MultiImageCarousel
          images={imageUris}
          subjectId={subject.id}
          swiping={swiping}
          onExpandImage={onExpandImage}
          showPagination={isCurrentCard}
          dotsStyle="overlay"
        />
      );
    }

    const uri = imageUris[0];
    const isVideo = uri?.slice(-4)?.toLowerCase() === '.mp4';

    if (isVideo) {
      const height = isTablet() ? containerDimensions.height : 300;
      return (
        <SubjectVideo
          uri={uri}
          onExpandImage={onExpandImage}
          style={{ width: containerDimensions.width, height }}
          expandButtonStyle={swiperExpandButtonStyle}
        />
      );
    }

    return (
      <SwiperSingleImage uri={uri} onExpandButtonPressed={onExpandImage} />
    );
  };

  return (
    <View style={[styles.cardContainer, { backgroundColor: cardBackground }]}>
      <View style={styles.container}>{renderMedia()}</View>
    </View>
  );
};

// Matches legacy Swiper's videoExpandButton position (36pt from bottom
// vs 16pt for non-Swipe).
const swiperExpandButtonStyle = { bottom: 36 };

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  container: {
    flex: 1,
  },
});

export default SwiperSubject;
