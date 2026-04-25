/**
 * Bottom-anchored field guide panel with drag-to-resize gesture. Functional
 * replacement for the legacy class-based `FieldGuide.js`.
 *
 * Preserves the original animation behavior: panel animates up on open,
 * can be dragged to a larger height up to MAX_DRAG_HEIGHT, snaps closed
 * when dragged below 20px. Item detail view renders inline over the list.
 *
 * The leaf item components (`FieldGuideItemRow`, `FieldGuideItemDetail`)
 * and the drag-bar button (`FieldGuideBtn`) are reused from the existing
 * codebase — they are already functional.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  PanResponder,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { isEmpty } from 'ramda'

import FieldGuideItemDetail from './FieldGuideItemDetail'
import FieldGuideItemRow from './FieldGuideItemRow'
import FieldGuideBtn from './FieldGuideBtn'

const MAX_DEFAULT_HEIGHT = Dimensions.get('window').height * 0.6
const MIN_HEIGHT = 33
const MAX_DRAG_HEIGHT =
  Dimensions.get('window').height - (Platform.OS === 'ios' ? 100 : 110)

const FieldGuidePanel = ({
  guide = { items: [], icons: {} },
  inMuseumMode,
  isVisible,
  onClose,
}) => {
  const [selectedItem, setSelectedItem] = useState({})
  const [height, setHeight] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)

  // Animated.Value must be stable across renders.
  const heightAnim = useRef(new Animated.Value(0)).current

  // Keep a ref to the latest height and onClose so the PanResponder, which
  // is created once and closes over these, always sees current values.
  const latestRef = useRef({ height: 0, onClose })
  useEffect(() => {
    latestRef.current = { height, onClose }
  }, [height, onClose])

  const animateHeight = useCallback(
    (toHeight, duration = 300) => {
      Animated.timing(heightAnim, {
        toValue: toHeight,
        easing: Easing.linear,
        duration,
        useNativeDriver: false,
      }).start()
    },
    [heightAnim]
  )

  const close = useCallback(() => {
    animateHeight(0, 200)
    setTimeout(() => {
      setSelectedItem({})
      setHeaderHeight(0)
      latestRef.current.onClose?.()
    }, 200)
  }, [animateHeight])

  const open = useCallback(() => {
    heightAnim.setValue(0)
    animateHeight(150)
  }, [heightAnim, animateHeight])

  const openDetail = useCallback(
    (item, index) => {
      setSelectedItem({ ...item, index })
      animateHeight(150)
    },
    [animateHeight]
  )

  const closeDetail = useCallback(() => {
    setSelectedItem({})
    setHeaderHeight(0)
    animateHeight(150)
  }, [animateHeight])

  const setContentHeight = useCallback(
    (h) => {
      const newHeight = h + headerHeight + 32
      setHeight(newHeight)
      animateHeight(newHeight < MAX_DEFAULT_HEIGHT ? newHeight : MAX_DEFAULT_HEIGHT)
    },
    [headerHeight, animateHeight]
  )

  // Animate open whenever isVisible flips true.
  useEffect(() => {
    if (isVisible) open()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible])

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,

        onPanResponderGrant: () => {
          heightAnim.setOffset(heightAnim._value)
          heightAnim.setValue(0)
        },
        onPanResponderMove: (e, gestureState) => {
          const newVal = gestureState.dy * -1
          Animated.event([null, { dy: heightAnim }], { useNativeDriver: false })(
            e,
            { dy: newVal }
          )
        },
        onPanResponderTerminationRequest: () => true,
        onPanResponderRelease: () => {
          heightAnim.flattenOffset()

          if (heightAnim._value < 20) {
            close()
            return
          }

          const currentHeight = latestRef.current.height
          let adjustToHeight = false
          if (heightAnim._value < MIN_HEIGHT) {
            adjustToHeight = MIN_HEIGHT
          } else if (heightAnim._value > currentHeight) {
            adjustToHeight = currentHeight
          } else if (heightAnim._value > MAX_DRAG_HEIGHT) {
            adjustToHeight = MAX_DRAG_HEIGHT
          }

          if (adjustToHeight) {
            Animated.timing(heightAnim, {
              toValue: adjustToHeight,
              easing: Easing.out(Easing.ease),
              duration: 100,
              useNativeDriver: false,
            }).start()
          }
        },
      }),
    [heightAnim, close]
  )

  const showDetail = !isEmpty(selectedItem)

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.guideContainer, { height: heightAnim }]}>
        <View style={styles.backCloseContainer}>
          {showDetail && (
            <Animated.View style={styles.back}>
              <TouchableOpacity onPress={closeDetail} activeOpacity={0.5}>
                <Icon name="chevron-left" size={30} style={styles.navIcon} />
              </TouchableOpacity>
            </Animated.View>
          )}
          <Animated.View style={styles.close}>
            <TouchableOpacity onPress={close} activeOpacity={0.5}>
              <Icon name="chevron-down" size={30} style={styles.navIcon} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {showDetail ? (
          <FieldGuideItemDetail
            item={selectedItem}
            inMuseumMode={inMuseumMode}
            icons={guide.icons}
            heightAnim={heightAnim}
            onClose={closeDetail}
            setHeaderHeight={(event) =>
              setHeaderHeight(event.nativeEvent.layout.height + 70)
            }
            setContentHeight={setContentHeight}
          />
        ) : (
          <ScrollView>
            <View
              style={styles.fieldGuideContainer}
              onLayout={(event) =>
                setContentHeight(event.nativeEvent.layout.height)
              }
            >
              <FlatList
                data={guide.items}
                numColumns={2}
                renderItem={({ item, index }) => (
                  <FieldGuideItemRow
                    onPress={() => openDetail(item, index)}
                    key={index}
                    index={index}
                    item={item}
                    icons={guide.icons}
                    inMuseumMode={inMuseumMode}
                  />
                )}
              />
            </View>
          </ScrollView>
        )}
      </Animated.View>

      <Animated.View
        style={[styles.dragBarContainer, { bottom: heightAnim }]}
        hitSlop={{ top: 10, bottom: 10, left: 0, right: 0 }}
        {...panResponder.panHandlers}
      >
        <View style={{ top: 1 }}>
          <FieldGuideBtn onPress={closeDetail} />
        </View>
      </Animated.View>
    </View>
  )
}

const styles = EStyleSheet.create({
  backCloseContainer: {
    height: 40,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  guideContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1,
    borderColor: '#00979D',
    backgroundColor: '#fff',
  },
  dragBarContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  navIcon: {
    color: '$darkTeal',
  },
  back: {
    position: 'absolute',
    left: 4,
    top: 4,
    backgroundColor: 'transparent',
  },
  close: {
    position: 'absolute',
    right: 4,
    top: 4,
    backgroundColor: 'transparent',
  },
  fieldGuideContainer: {
    paddingBottom: 12,
  },
})

export default FieldGuidePanel
