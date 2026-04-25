/**
 * Renders an MP4 subject video with native controls + an Android-only
 * expand button (iOS controls already include fullscreen).
 *
 * Replaces the duplicated video blocks that used to live inline in
 * `SubjectViewer` (non-Swipe) and `SwiperSubject` (Swipe). Both now
 * render this component with their own sizing via the `style` prop.
 */

import React from 'react'
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import Video from 'react-native-video'

import ExpandImageIcon from './ExpandImageIcon'

const SubjectVideo = ({ uri, onExpandImage, style, expandButtonStyle }) => {
  if (!uri) return null

  return (
    <View>
      <Video
        source={{ uri }}
        style={style}
        controls
        repeat
        resizeMode="contain"
      />
      {Platform.OS === 'android' && onExpandImage && (
        <TouchableOpacity
          onPress={() => onExpandImage(uri)}
          style={[styles.expandButton, expandButtonStyle]}
        >
          <ExpandImageIcon />
        </TouchableOpacity>
      )}
    </View>
  )
}

// Default: matches legacy non-Swipe position. Swipe consumers pass a
// `expandButtonStyle` override with `bottom: 36` to match legacy Swiper.
const styles = StyleSheet.create({
  expandButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
})

export default SubjectVideo
