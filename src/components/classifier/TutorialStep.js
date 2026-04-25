import React, { useRef, useState } from 'react'
import {
  Dimensions,
  ScrollView,
  View,
  Platform,
} from 'react-native'
import PropTypes from 'prop-types'

import FittedImage from '../common/FittedImage'
import SizedMarkdown from '../common/SizedMarkdown'
import Video from 'react-native-video'

const ImageWidth = Math.min(Dimensions.get('window').width - 100, 400)

const TutorialStep = ({
  markdownContent,
  mediaUri,
  inMuseumMode,
}) => {
  const scrollViewRef = useRef(null)
  // Preserved from the class version (not currently read elsewhere — kept
  // so any future consumers relying on image decode state can re-enable).
  const [, setDisplayStep] = useState(mediaUri === null)

  const isVideo =
    mediaUri && mediaUri.slice(mediaUri.length - 4).match('.mp4')

  const onLayout = () => {
    scrollViewRef.current?.flashScrollIndicators?.()
  }

  return (
    <ScrollView ref={scrollViewRef} style={styles.container}>
      <View style={styles.container}>
        <View style={styles.contentContainer} onLayout={onLayout}>
          {isVideo ? (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: mediaUri }}
                style={{
                  width: ImageWidth,
                  height: (ImageWidth / 4) * 3.4,
                }}
                controls={Platform.OS === 'ios'}
                repeat={true}
                resizeMode="contain"
              />
            </View>
          ) : mediaUri ? (
            <FittedImage
              maxWidth={ImageWidth}
              maxHeight={ImageWidth}
              source={{ uri: mediaUri }}
              onLoad={() => setDisplayStep(true)}
            />
          ) : null}

          <View style={styles.markdown}>
            <SizedMarkdown inMuseumMode={inMuseumMode}>
              {markdownContent}
            </SizedMarkdown>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = {
  markdown: {
    flex: 1,
    marginTop: 15,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    margin: 25,
  },
  videoContainer: {
    alignSelf: 'center',
    width: ImageWidth,
  },
}

TutorialStep.propTypes = {
  markdownContent: PropTypes.string,
  mediaUri: PropTypes.string,
  width: PropTypes.number,
  inMuseumMode: PropTypes.bool,
  isActive: PropTypes.bool,
}

export default TutorialStep
