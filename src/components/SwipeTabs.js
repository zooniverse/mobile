import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import FieldGuide from './FieldGuide'
import Icon from 'react-native-vector-icons/FontAwesome'
import { length } from 'ramda'

export class SwipeTabs extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isFieldGuideVisible: false,
    }
  }
  render() {
    const leftButton =
      <TouchableOpacity
        onPress={this.props.onAnswered.bind(this, 1)}
        activeOpacity={0.5}
        style={ [styles.button, styles.tealButton] }>
        <Image source={require('../../images/swipe-left.png')} style={styles.swipeIcon} />
        <StyledText additionalStyles={[styles.tealButtonText]} text={ this.props.answers[0].label } />
      </TouchableOpacity>


    const rightButton =
      <TouchableOpacity
        onPress={this.props.onAnswered.bind(this, 0)}
        activeOpacity={0.5}
        style={ [styles.button, styles.tealButton] }>
        <Image source={require('../../images/swipe-right.png')} style={styles.swipeIcon} />
        <StyledText additionalStyles={[styles.tealButtonText]} text={ this.props.answers[1].label } />
      </TouchableOpacity>

    const fieldGuideButton =
      <TouchableOpacity
        onPress={() => this.setState({isFieldGuideVisible: true})}
        activeOpacity={0.5}
        style={ styles.button }>
        <Icon name='map-o' style={styles.icon} />
        <StyledText additionalStyles={[styles.buttonText]} text={ 'Field Guide' } />
      </TouchableOpacity>

    const fieldGuide =
      <FieldGuide
        guide={this.props.guide}
        isVisible={this.state.isFieldGuideVisible}
        onClose={() => this.setState({isFieldGuideVisible: false})}
      />

    return (
      <View>
        <View style={styles.container}>
          { leftButton }
          { length(this.props.guide.items) > 0 ? fieldGuideButton : null }
          { rightButton }
        </View>
        { this.state.isFieldGuideVisible ? fieldGuide : null }
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  $containerHeight: 60,
  container: {
    backgroundColor: '$lightestGrey',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '$containerHeight',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  button: {
    backgroundColor: 'white',
    borderColor: '$disabledIconColor',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  buttonText: {
    color: '$darkGrey',
  },
  tealButton: {
    backgroundColor: '$buttonColor'
  },
  tealButtonText: {
    color: 'white'
  },
  icon: {
    fontSize: 16,
    color: '$darkGrey',
    padding: 3,
    marginRight: 5
  },
  swipeIcon: {
    height: 27,
    width: 20,
    marginRight: 10,
  },
})

SwipeTabs.propTypes = {
  guide: React.PropTypes.object,
  onAnswered: React.PropTypes.func,
  answers: React.PropTypes.arrayOf(React.PropTypes.object)
}

export default SwipeTabs
