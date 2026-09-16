import React, { useState } from 'react'
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
  height = 220
}) {
  const { t } = useTranslation()
  const image = subject.displays?.find(display => display.type === 'image')
  const [mode, setMode] = useState(image ? 'image' : 'text')
  const [imageFailed, setImageFailed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageAttempt, setImageAttempt] = useState(0)
  return (
    <View style={styles.container}>
      <View style={{ height }}>
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
                resizeMode="contain"
                style={styles.flex}
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
          <ScrollView>
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
