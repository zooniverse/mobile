import React, { useEffect, useState } from 'react'
import {
  View,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform
} from 'react-native'
import Icon from '@react-native-vector-icons/feather/static'
import { useTranslation } from 'react-i18next'
import ButtonLarge from './ButtonLarge'

// Text and loading state come from the classifier screen for both task views.
export default function ImageAndTextViewer({
  subject,
  original,
  onPress,
  height = 220,
  adaptiveHeight = false
}) {
  const { t } = useTranslation()
  const image = subject.displays?.find(display => display.type === 'image')
  const [mode, setMode] = useState(image ? 'image' : 'text')
  const [imageFailed, setImageFailed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageAttempt, setImageAttempt] = useState(0)
  const [availableWidth, setAvailableWidth] = useState(0)
  const [imageSize, setImageSize] = useState(null)
  const [textHeight, setTextHeight] = useState(48)
  useEffect(() => {
    if (!adaptiveHeight || !image?.src) return
    let active = true
    setImageSize(null)
    Image.getSize(image.src, (width, naturalHeight) => {
      if (active) setImageSize({ width, height: naturalHeight })
    }, () => {})
    return () => { active = false }
  }, [adaptiveHeight, image?.src, imageAttempt])
  const imageScale = imageSize && availableWidth
    ? Math.min(1, availableWidth / imageSize.width, height / imageSize.height)
    : null
  const imageHeight = imageScale !== null ? imageSize.height * imageScale : height
  const viewerHeight = !adaptiveHeight ? height
    : mode === 'image' ? (imageFailed ? height : imageHeight)
      : original.status === 'success' ? Math.min(textHeight, height) : height
  return (
    <View style={styles.container} onLayout={event => setAvailableWidth(event.nativeEvent.layout.width)}>
      <View style={{ height: viewerHeight, marginVertical: adaptiveHeight ? 12 : 0 }}>
        {mode === 'image' && image ? (
          imageFailed ? (
            <ButtonLarge
              text={t('Mobile.ocr.retryImage', 'Retry image')}
              onPress={() => {
                setImageFailed(false)
                setImageLoaded(false)
                setImageAttempt(value => value + 1)
              }}
            />
          ) : (
            <TouchableOpacity
              style={styles.flex}
              accessibilityRole="button"
              accessibilityLabel={t(
                'Mobile.ocr.expandImage',
                'Enlarge subject image'
              )}
              onPress={() => onPress?.(image.src)}
            >
              <Image
                key={imageAttempt}
                source={{ uri: image.src }}
                resizeMode={adaptiveHeight ? 'contain' : 'center'}
                style={adaptiveHeight && imageScale !== null
                  ? { width: imageSize.width * imageScale, height: imageHeight, alignSelf: 'center' }
                  : styles.flex}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageFailed(true)}
              />
              {!imageLoaded && <ActivityIndicator style={styles.loading} />}
            </TouchableOpacity>
          )
        ) : original.status === 'loading' ? (
          <ActivityIndicator />
        ) : original.status === 'error' ? (
          <ButtonLarge
            text={t('Mobile.ocr.retryText', 'Retry loading text')}
            onPress={original.retry}
          />
        ) : (
          <ScrollView onContentSizeChange={adaptiveHeight ? (_width, contentHeight) => setTextHeight(contentHeight) : undefined}>
            <Text selectable style={styles.text}>
              {original.text}
            </Text>
          </ScrollView>
        )}
      </View>
      <View style={styles.controls}>
        {image && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t(
              'Mobile.ocr.previousMedia',
              'Previous subject media'
            )}
            onPress={() =>
              setMode(value => (value === 'image' ? 'text' : 'image'))
            }
            style={styles.arrow}
          >
            <Icon name="chevron-left" size={28} color="#005D69" />
          </TouchableOpacity>
        )}
        {(image ? ['image', 'text'] : ['text']).map(value => (
          <TouchableOpacity
            key={value}
            accessibilityRole="tab"
            accessibilityLabel={
              value === 'image'
                ? t('Mobile.ocr.image', 'Image')
                : t('Mobile.ocr.originalText', 'Original text')
            }
            accessibilityState={{ selected: mode === value }}
            onPress={() => setMode(value)}
            style={[styles.tab, mode === value && styles.selected]}
          >
            {value === 'image' ? (
              <Image
                source={{ uri: image.src }}
                resizeMode="cover"
                style={styles.thumbnail}
                accessible={false}
              />
            ) : (
              <Icon name="file-text" size={30} color="#005D69" />
            )}
          </TouchableOpacity>
        ))}
        {image && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('Mobile.ocr.nextMedia', 'Next subject media')}
            onPress={() =>
              setMode(value => (value === 'image' ? 'text' : 'image'))
            }
            style={styles.arrow}
          >
            <Icon name="chevron-right" size={28} color="#005D69" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: { width: '100%', backgroundColor: '#fff' },
  flex: { flex: 1 },
  loading: { ...StyleSheet.absoluteFillObject },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10
  },
  arrow: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tab: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#767676',
    alignItems: 'center',
    justifyContent: 'center'
  },
  thumbnail: { width: '100%', height: '100%' },
  selected: { borderWidth: 3, borderColor: '#005D69' },
  text: {
    color: '#222',
    fontSize: 18,
    padding: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  }
})
