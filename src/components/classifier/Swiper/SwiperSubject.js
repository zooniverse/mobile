/**
 * Routes subject rendering to the appropriate display component
 * based on the subject's media type:
 * - Single image → SwiperSingleImage
 * - Multiple images → SwiperMultiImage (auto-play carousel)
 * - Video (.mp4) → inline video player
 *
 * Shows SubjectLoadingIndicator while images are being prefetched.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Video from 'react-native-video';
import { isTablet } from 'react-native-device-info';
import SubjectLoadingIndicator from '../../common/SubjectLoadingIndicator';
import SwiperSingleImage from './SwiperSingleImage';
import SwiperMultiImage from './SwiperMultiImage';
import ExpandImageIcon from '../ExpandImageIcon';

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
        <SwiperMultiImage
          images={imageUris}
          subjectId={subject.id}
          swiping={swiping}
          expandImage={onExpandImage}
          isCurrentCard={isCurrentCard}
        />
      );
    }

    const uri = imageUris[0];
    const isVideo = uri?.slice(-4)?.toLowerCase() === '.mp4';

    if (isVideo) {
      const height = isTablet() ? containerDimensions.height : 300;
      return (
        <View>
          <Video
            source={{ uri }}
            style={{ width: containerDimensions.width, height }}
            controls={true}
            repeat={true}
            resizeMode="contain"
          />
          {Platform.OS === 'android' && (
            <TouchableOpacity
              onPress={() => onExpandImage(uri)}
              style={styles.videoExpandButton}
            >
              <ExpandImageIcon />
            </TouchableOpacity>
          )}
        </View>
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

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  container: {
    flex: 1,
  },
  videoExpandButton: {
    position: 'absolute',
    bottom: 36,
    right: 16,
  },
});

export default SwiperSubject;
