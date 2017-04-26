import React, { Component } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Platform,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import FieldGuideItemDetail from './FieldGuideItemDetail'
import FieldGuideItemRow from './FieldGuideItemRow'
import Icon from 'react-native-vector-icons/FontAwesome'
import { addIndex, isEmpty, map } from 'ramda'

const MAX_DEFAULT_HEIGHT = Dimensions.get('window').height * .6
const MIN_HEIGHT = 33
const MAX_DRAG_HEIGHT = Dimensions.get('window').height - (Platform.OS === 'ios' ? 100 : 110)

export class FieldGuide extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedItem: {},
      heightAnim: new Animated.Value(0),
      height: 0,
      headerHeight: 0
    }
  }

  componentWillMount() {
     this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: () => {
        this.state.heightAnim.setOffset(this.state.heightAnim._value);
        this.state.heightAnim.setValue(0);
      },
      onPanResponderMove: (e, gestureState) => {
        const newVal = gestureState.dy * -1

        Animated.event([
            null, {dy: this.state.heightAnim}
        ])(e, { dy: newVal });
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: () => {
        this.state.heightAnim.flattenOffset();

        if (this.state.heightAnim._value < 20) {
          this.close()
        } else {
          let adjustToHeight = false
          if (this.state.heightAnim._value < MIN_HEIGHT) {
            adjustToHeight = MIN_HEIGHT
          } else if (this.state.heightAnim._value > this.state.height) {
            adjustToHeight = this.state.height
          } else if (this.state.heightAnim._value > MAX_DRAG_HEIGHT) {
            adjustToHeight = MAX_DRAG_HEIGHT
          }

          if (adjustToHeight) {
            Animated.timing(this.state.heightAnim, {
              toValue: adjustToHeight,
              easing: Easing.out(Easing.ease),
              duration: 100
            }).start()
          }
        }
      },
    })
  }

  componentWillReceiveProps(nextProps){
    if ((this.props.isVisible !== nextProps.isVisible) && (nextProps.isVisible === true)){
      this.open()
    }
  }

  open() {
    this.state.heightAnim.setValue(0)
    this.animateHeight(150)
  }

  close() {
    this.animateHeight(0, 200)
    setTimeout(()=> {
      this.setState({selectedItem: {}, headerHeight: 0})
      this.props.onClose()
    }, 200)
  }

  openDetail(item) {
    this.setState({selectedItem: item})
    this.animateHeight(150)
  }

  closeDetail() {
    this.setState({selectedItem: {}, headerHeight: 0})
    this.animateHeight(150)
  }

  animateHeight(toHeight, duration=300) {
    Animated.timing(
      this.state.heightAnim,
      {
        toValue: toHeight,
        easing: Easing.linear,
        duration: duration,
      }
    ).start()
  }

  setHeight(height) {
    const newHeight = height + this.state.headerHeight
    this.setState({height: newHeight})
    this.animateHeight(newHeight < MAX_DEFAULT_HEIGHT ? newHeight : MAX_DEFAULT_HEIGHT)
  }

  render() {
    const { items, icons } = this.props.guide
    const closeIcon =
      <Animated.View style={[styles.close, {paddingBottom: this.state.heightAnim}]}>
        <TouchableOpacity
          onPress={() => this.close()}
          activeOpacity={0.5}
          style={styles.navIconContainer}>
          <Icon name='chevron-down' style={styles.navIcon} />
        </TouchableOpacity>
      </Animated.View>

    const backIcon =
      <Animated.View style={[styles.back, {paddingBottom: this.state.heightAnim}]}>
        <TouchableOpacity
          onPress={ () => this.closeDetail() }
          activeOpacity={0.5}>
          <Icon name='chevron-left' style={styles.navIcon} />
        </TouchableOpacity>
      </Animated.View>

    const dragBar =
      <Animated.View
         style={[styles.dragBarContainer, {bottom: this.state.heightAnim}]}
         hitSlop={{top: 10, bottom: 10, left: 0, right: 0}}
        {...this._panResponder.panHandlers}>
        <View style={styles.dragBar} />
        <View style={styles.dragBarLineAbsoluteContainer}>
          <View style={styles.dragBarLineContainer}>
            <View style={styles.dragBarLine} />
            <View style={styles.dragBarLine} />
          </View>
        </View>
      </Animated.View>

    const renderItemRow = (item = {}, icons = [], idx) => {
      return (
        <FieldGuideItemRow
          onPress={() => this.openDetail(item)}
          key={idx}
          item={item}
          icons={icons}
        />
      )
    }

    const fieldGuide =
      <ScrollView>
        <View onLayout={(event) => this.setHeight(event.nativeEvent.layout.height) }>
          { addIndex (map)(
            (item, idx) => {
              return renderItemRow(item, icons, idx)
            },
            items
          ) }
        </View>
      </ScrollView>

    const itemDetail =
      <FieldGuideItemDetail
        item={this.state.selectedItem}
        icons={icons}
        heightAnim={this.state.heightAnim}
        onClose={() => this.closeDetail()}
        setHeaderHeight={(event) => { this.setState({ headerHeight: event.nativeEvent.layout.height + 70 }) }}
        setContentHeight={(newHeight) => { this.setHeight(newHeight) }}
      />

    const showFieldGuideItemDetail = !isEmpty(this.state.selectedItem)

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.guideContainer, {height: this.state.heightAnim}]}>
          { showFieldGuideItemDetail ? itemDetail : fieldGuide }
          { showFieldGuideItemDetail ? backIcon : null }
          { closeIcon }
        </Animated.View>
        { dragBar }
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  guideContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0,
    shadowColor: 'rgba(0, 0, 0, 0.24)',
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: {
      height: 1
    },
  },
  dragBarContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
    right: 0,
    height: 18
  },
  dragBar: {
    height: 12,
    backgroundColor: '$dragBarColor',
  },
  dragBarLineAbsoluteContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18
  },
  dragBarLineContainer: {
    alignSelf: 'center',
    backgroundColor: '$dragBarColor',
    paddingTop: 4,
    paddingBottom: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  dragBarLine: {
    backgroundColor: 'white',
    alignSelf: 'center',
    height: 2,
    width: 13,
    borderRadius: 2,
    marginTop: 2,
  },
  navIcon: {
    fontSize: 24,
    color: '$darkTeal',
    lineHeight: 24,
  },
  back: {
    position: 'absolute',
    bottom: -28,
    left: 10,
    backgroundColor: 'transparent',
  },
  close: {
    position: 'absolute',
    bottom: -25,
    right: 15,
    backgroundColor: 'transparent',
  },
})

FieldGuide.propTypes = {
  guide: React.PropTypes.shape({
    items: React.PropTypes.arrayOf(React.PropTypes.shape({
      title: React.PropTypes.string,
      content: React.PropTypes.string,
      icon: React.PropTypes.string,
    })),
    icons: React.PropTypes.object,
  }),
  isVisible: React.PropTypes.bool,
  onClose: React.PropTypes.func,
}

FieldGuide.defaultProps = {
  guide: {
    items: [],
    icons: {}
  }
}

export default FieldGuide
