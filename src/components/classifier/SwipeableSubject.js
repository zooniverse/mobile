import React, { Component } from 'react';
import { View, Platform, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import PropTypes from 'prop-types';
import R from 'ramda';
import EStyleSheet from 'react-native-extended-stylesheet';

import SubjectLoadingIndicator from '../common/SubjectLoadingIndicator';
import Video from 'react-native-video';
import AutoPlayMultiImage from './AutoPlayMultiImage';
import SwipeSingleImage from './SwipeSingleImage';
import ExpandImageIcon from './ExpandImageIcon';
import { isTablet } from 'react-native-device-info';

class SwipeableSubject extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pagerDimensions: {
        width: 1,
        height: 1,
      },
      imageIndex: 0,
    };
    this.handleDimensionsChange = this.handleDimensionsChange.bind(this);
  }

  handleDimensionsChange() {
    if (this.pager) {
      setTimeout(() => this.pager.scrollTo({ y: 0 }), 300);
    }
  }

  componentDidUpdate(prevProps) {
    if (R.isEmpty(prevProps.imageUris) && !R.isEmpty(this.props.imageUris)) {
      this.props.onDisplayImageChange(this.props.imageUris[0]);
    }
  }

  render() {
    const { pagerDimensions } = this.state;
    const {
      imageUris,
      hasMultipleSubjects,
      onExpandButtonPressed,
      swiping,
      currentCard,
    } = this.props;
    const imagesAreLoaded = !R.isEmpty(imageUris);

    function displaySubject() {
      // Handle single image/video or multi-frame accordingly.
      if (imageUris.length > 1) {
        // Multi-frame image
        const autoPlayImages = imageUris.map((i) => ({ uri: i }));
        return (
          <AutoPlayMultiImage
            images={autoPlayImages}
            subjectDisplayWidth={pagerDimensions.width}
            subjectDisplayHeight={pagerDimensions.height}
            expandImage={onExpandButtonPressed}
            swiping={swiping}
            currentCard={currentCard}
          />
        );
      } else if (imageUris.length === 1) {
        // Handle single Image/Video
        const uri = imageUris[0];
        if (uri.slice(uri.length - 4).match('.mp4')) {
          const height = isTablet() ? pagerDimensions.height : 300;
          return (
            <View key={`MULTI_ANSWER_VIDEO_${uri}`}>
              <Video
                source={{ uri: uri }}
                style={{
                  width: pagerDimensions.width,
                  height,
                }}
                controls={true}
                repeat={true}
                resizeMode="contain"
              />
              {Platform.OS === 'android' ? (
                <View style={styles.optionsBarContainer}>
                  <TouchableOpacity onPress={() => onExpandButtonPressed(uri)}>
                    <ExpandImageIcon />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          );
        } else {
          return (
            <SwipeSingleImage
              uri={uri}
              onExpandButtonPressed={onExpandButtonPressed}
            />
          );
        }
      }
    }

    const cardContainerBackgound = swiping ? 'transparent' : '#EBEBEB';

    return (
      <View
        style={[
          styles.cardContainer,
          { backgroundColor: cardContainerBackgound },
        ]}
      >
        <View
          style={styles.container}
          onLayout={(event) =>
            this.setState({
              pagerDimensions: {
                width: event.nativeEvent.layout.width,
                height: event.nativeEvent.layout.height,
              },
            })
          }
        >
          <View style={styles.container}>
                {imagesAreLoaded ? (
                    <TouchableWithoutFeedback>
                        <View style={[styles.borderView, pagerDimensions]}>
                            {displaySubject()}
                        </View>
                    </TouchableWithoutFeedback>
            ) : (
              <SubjectLoadingIndicator multipleSubjects={hasMultipleSubjects} />
            )}
          </View>
        </View>
      </View>
    );
  }
}

SwipeableSubject.propTypes = {
  imageUris: PropTypes.array,
  hasMultipleSubjects: PropTypes.bool,
  onDisplayImageChange: PropTypes.func,
  swiping: PropTypes.bool,
  currentCard: PropTypes.bool,
  onExpandButtonPressed: PropTypes.bool,
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  imageShadow: {
    backgroundColor: 'transparent',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: {
      height: 10,
      width: 0,
    },
  },
  image: {
    ...Platform.select({
      ios: {
        borderRadius: 2, // There's a bug on Android with image contain and borderRadius that gives it a red background. For now, only apply to iOS.
      },
    }),
    flex: 1,
  },
  borderView: {
    borderLeftWidth: 0,
    borderColor: '#E2E5E9',
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsBarContainer: {
    position: 'absolute',
    bottom: 36,
    right: 16,
  },
});

export default SwipeableSubject;
