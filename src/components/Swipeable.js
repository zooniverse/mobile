import React, { Component } from 'react'
import {
  Animated,
  PanResponder,
  Platform,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import theme from '../theme'
import { connect } from 'react-redux'
import StyledText from './StyledText'
import SwipeSubject from './SwipeSubject'
import { clamp, reverse } from 'ramda'
import { saveAnnotation, saveThenStartNewClassification } from '../actions/classifier'
import { setNextSubject } from '../actions/subject'

//needs to be absolutely positioned below the question, otherwise it covers up
//everything above and prevents it from being touchable
const toTop = (Platform.OS === 'ios') ? 135 : 125
const SWIPE_THRESHOLD = 90
const leftOverlayColor = theme.swipeLeft
const rightOverlayColor = theme.swipeRight

const mapStateToProps = (state, ownProps) => ({
  workflow: state.classifier.workflow[ownProps.workflowID] || {},
  subject: state.classifier.subject[ownProps.workflowID] || {},
  classification: state.classifier.classification[ownProps.workflowID] || {},
  annotations: state.classifier.annotations[ownProps.workflowID] || {},
  subjectSizes: state.classifier.subjectSizes[ownProps.workflowID] || {},
  seenThisSession: state.classifier.seenThisSession[ownProps.workflowID] || [],
  questionContainerHeight: state.classifier.questionContainerHeight[ownProps.workflowID] || 0,
})

const mapDispatchToProps = (dispatch) => ({
  saveAnnotation(task, value) {
    dispatch(saveAnnotation(task, value))
  },
  saveThenStartNewClassification(answerIndex) {
    dispatch(saveThenStartNewClassification(answerIndex))
  },
  setNextSubject() {
    dispatch(setNextSubject())
  },
})

export class Swipeable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pan: new Animated.ValueXY(),
      enterAnim: new Animated.Value(.9),
    }
  }

  isSwipeGesture(gestureState) {
    return gestureState.dx > 5 || gestureState.dx < -5
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
    onStartShouldSetResponder: (evt, gestureState) => this.isSwipeGesture(gestureState),
    onMoveShouldSetPanResponder: (evt, gestureState) => this.isSwipeGesture(gestureState),

    onPanResponderGrant: () => {
      this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value})
      this.state.pan.setValue({x: 0, y: 0})
    },

    onPanResponderMove: Animated.event([
      null, {dx: this.state.pan.x, dy: this.state.pan.y + 100},
    ]),

    onPanResponderRelease: (e, {vx, vy}) => {
      this.state.pan.flattenOffset()
      let velocity

      if (vx >= 0) {
        velocity = clamp(3, 4, vx)
      } else if (vx < 0) {
        velocity = clamp(3, 4, vx * -1) * -1
      }

      if (Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD) {
        //negative=left (no = index 1)
        //positive=right (yes = index 0)
        const answer = ( this.state.pan.x._value < 0 ? 1 : 0 )
        Animated.decay(this.state.pan, {
          velocity: {x: velocity, y: vy},
          deceleration: 0.98
        }).start(this.onAnswered(answer))
      } else {
        Animated.spring(this.state.pan, {
          toValue: {x: 0, y: 0},
          friction: 4
        }).start()
      }
    }
    })
  }

  onAnswered(answer){
    this.props.saveAnnotation(this.props.workflow.first_task, answer)
    this.props.saveThenStartNewClassification()
  }

  render() {
    const key = this.props.workflow.first_task //always just one task
    const task = this.props.workflow.tasks[key]
    const answers = reverse(task.answers)  //Yes is listed first in project, but we need No listed first (on left)
    const imageSizeStyle = { width: this.props.subjectSizes.resizedWidth, height: this.props.subjectSizes.resizedHeight }
    const swipeableSize = { width: this.props.subjectSizes.resizedWidth, height: this.props.subjectSizes.resizedHeight + 10 }
    let pan = this.state.pan

    let [translateX, translateY] = [pan.x, pan.y]

    let rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ['-30deg', '0deg', '30deg']})
    let opacityRight = pan.x.interpolate({inputRange: [0, 100, 200], outputRange: [0, .6, .8]})
    let opacityLeft = pan.x.interpolate({inputRange: [-200, -100, 0], outputRange: [.8, .6, 0]})
    let opacityRightText = pan.x.interpolate({inputRange: [0, 30], outputRange: [0, 1]})
    let opacityLeftText = pan.x.interpolate({inputRange: [-30, 0], outputRange: [1, 0]})

    let animatedCardStyles = {transform: [{translateX}, {translateY}, {rotate}]}
    let leftOverlayStyle = {backgroundColor: leftOverlayColor, opacity: opacityLeft}
    let rightOverlayStyle = {backgroundColor: rightOverlayColor, opacity: opacityRight}
    let leftOverlayTextStyle = {opacity: opacityLeftText}
    let rightOverlayTextStyle = {opacity: opacityRightText}

    return (
      <View style={[styles.container, {top: toTop + this.props.questionContainerHeight}]}>
        <View style={styles.subjectContainer}>
          <Animated.View
            style={[styles.imageContainer, animatedCardStyles, swipeableSize]}
            {...this._panResponder.panHandlers}>

            <TouchableOpacity
              activeOpacity={0.8}
              style={swipeableSize}
              onPress={this.props.showFullSize}>
              <SwipeSubject
                inFront={true}
                subject={this.props.subject}
                subjectSizes={this.props.subjectSizes}
                seenThisSession={this.props.seenThisSession}
                setNextSubject={this.props.setNextSubject}
              />
              <Animated.View style={[styles.overlayContainer, leftOverlayStyle, imageSizeStyle]} />
              <Animated.View style={[styles.overlayContainer, leftOverlayTextStyle, imageSizeStyle]}>
                <StyledText additionalStyles={[styles.answerOverlayText]} text={ answers[0].label } />
              </Animated.View>

              <Animated.View style={[styles.overlayContainer, rightOverlayStyle, imageSizeStyle]} />
              <Animated.View style={[styles.overlayContainer, rightOverlayTextStyle, imageSizeStyle]}>
                <StyledText additionalStyles={[styles.answerOverlayText]} text={ answers[1].label } />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  subjectContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  overlayContainer: {
    borderRadius: 2,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 20,
    right: 0,
    left: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerOverlayText: {
    fontSize: 30,
    color: 'white'
  },
})

Swipeable.propTypes = {
  subject: React.PropTypes.shape({
    id: React.PropTypes.string
  }),
  nextSubject: React.PropTypes.shape({
    id: React.PropTypes.string
  }),
  subjectSizes: React.PropTypes.object,
  seenThisSession: React.PropTypes.arrayOf(React.PropTypes.string),
  workflow: React.PropTypes.shape({
    first_task: React.PropTypes.string,
    tasks: React.PropTypes.object,
  }),
  onAnswered: React.PropTypes.func,
  saveThenStartNewClassification: React.PropTypes.func,
  saveAnnotation: React.PropTypes.func,
  questionContainerHeight: React.PropTypes.number,
  setNextSubject: React.PropTypes.func,
  showFullSize: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Swipeable)
