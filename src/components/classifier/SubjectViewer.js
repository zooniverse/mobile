/**
 * Displays the current subject. Handles three media shapes:
 *   - Single image → plain `Image` (tappable for full-screen expand)
 *   - Multi-image (`subject.displays.length > 1`) → `MultiImageCarousel`
 *     with pagination dots and auto-play
 *   - Video (MP4) → native `Video` with controls + Android expand button
 *
 * Fixed 300pt height matches the legacy Question/Multi layout. Exposes
 * `onLayoutChange` so bodies can capture display dimensions for submission
 * metadata, and `onPress` for full-screen expand (opened by the shell).
 */

import React, { useEffect, useState } from 'react'
import {
  Image,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native'

import MultiImageCarousel from './MultiImageCarousel'
import SubjectVideo from './SubjectVideo'
import SubjectLoadingIndicator from '../common/SubjectLoadingIndicator'

const SUBJECT_HEIGHT = 300

const isVideoSrc = (src = '') => src.slice(-4).toLowerCase() === '.mp4'

const SubjectViewer = ({ subject, onLayoutChange, onPress }) => {
  const displays = subject?.displays
  const firstSrc = displays?.[0]?.src
  const [singleImageLoaded, setSingleImageLoaded] = useState(false)

  // Reset single-image loading state when the subject changes so the
  // indicator shows during each new subject's decode.
  useEffect(() => {
    setSingleImageLoaded(false)
  }, [subject?.id])

  if (!displays?.length || !firstSrc) return null

  const renderMedia = () => {
    // Multi-image: auto-play carousel with pagination dots.
    if (displays.length > 1) {
      return (
        <MultiImageCarousel
          images={displays.map((d) => d.src)}
          swiping={false}
          onExpandImage={onPress}
          showPagination
          dotsStyle="flowed"
          subjectId={subject.id}
        />
      )
    }

    // Single video: SubjectVideo handles controls + Android expand button.
    if (isVideoSrc(firstSrc)) {
      return (
        <SubjectVideo
          uri={firstSrc}
          onExpandImage={onPress}
          style={styles.video}
        />
      )
    }

    // Single image: tappable for full-screen expand. Matches legacy
    // `LoadableMedia` by showing a loading indicator until decode.
    const image = (
      <Image
        source={{ uri: firstSrc }}
        style={styles.image}
        resizeMode="contain"
        onLoad={() => setSingleImageLoaded(true)}
      />
    )
    const imageWithLoader = (
      <View style={styles.tappable}>
        {image}
        {!singleImageLoaded && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <SubjectLoadingIndicator />
          </View>
        )}
      </View>
    )
    if (!onPress) return imageWithLoader
    return (
      <TouchableOpacity style={styles.tappable} onPress={() => onPress(firstSrc)}>
        {imageWithLoader}
      </TouchableOpacity>
    )
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => onLayoutChange?.(e.nativeEvent.layout)}
    >
      {renderMedia()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: SUBJECT_HEIGHT,
    width: '100%',
  },
  tappable: {
    flex: 1,
    width: '100%',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  video: {
    width: '100%',
    height: SUBJECT_HEIGHT,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default SubjectViewer
