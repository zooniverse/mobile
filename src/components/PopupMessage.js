import React, { Component } from 'react';
import {
  Animated,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import Icon from 'react-native-vector-icons/FontAwesome'

export class PopupMessage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fadeAnim: new Animated.Value(0),
    }
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.isVisible === true){
      this.showPopup()
    }
  }

  showPopup() {
    Animated.timing(
      this.state.fadeAnim,
      { toValue: 1,
        duration: 300,
      },
    ).start(this.closePopup())
  }

  closePopup() {
    setTimeout(() => {
      Animated.timing(
        this.state.fadeAnim,
        { toValue: 0,
          duration: 500,
        },
      ).start()
    }, 1200)
    setTimeout(() => {
      this.props.setHidden()
    }, 1700)
  }

  render() {
    const popup =
      <Animated.View style={[styles.container, { opacity: this.state.fadeAnim } ]}>
        <View style={[styles.content, { marginBottom: this.props.workflowSelectionHeight }]}>
          <StyledText additionalStyles={[styles.text]} text={'Please choose a workflow'} />
          <Icon name='angle-double-down' style={styles.icon} />
        </View>
      </Animated.View>

    return (
      this.props.isVisible ? popup : null
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '$darkGreyTextColor',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent:  'flex-end',
    alignItems: 'center',
  },
  content: {
    borderRadius: 6,
    backgroundColor: '$darkGreyTextColor',
    justifyContent:  'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  text: {
    color: 'white',
  },
  icon: {
    color: 'white',
    fontSize: 14,
  }
});

PopupMessage.propTypes = {
  text: React.PropTypes.string,
  setHidden: React.PropTypes.func,
  workflowSelectionHeight: React.PropTypes.number,
  isVisible: React.PropTypes.bool,
}

export default PopupMessage
