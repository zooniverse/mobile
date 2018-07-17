import React, { Component } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import FontedText from '../common/FontedText'
import FieldGuide from './FieldGuide'
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
        onPress={this.props.onLeftButtonPressed}
        activeOpacity={0.5}
        style={ [styles.button, styles.tealButton, styles.leftButtonPadding] }>
        <FontedText style={[styles.buttonText, styles.tealButtonText]}>
          { this.props.answers[0].label }
        </FontedText>
      </TouchableOpacity>


    const rightButton =
      <TouchableOpacity
        onPress={this.props.onRightButtonPressed}
        activeOpacity={0.5}
        style={ [styles.button, styles.tealButton] }>
        <FontedText style={[styles.buttonText, styles.tealButtonText]}>
          { this.props.answers[1].label }
        </FontedText>
      </TouchableOpacity>

    const fieldGuideButton =
      <TouchableOpacity
        onPress={() => this.setState({isFieldGuideVisible: true})}
        activeOpacity={0.5}
        style={ [styles.buttonShadow, styles.button, styles.leftButtonPadding] }>
        <FontedText style={styles.buttonText}>
           Field Guide
        </FontedText>
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
  container: {
    marginHorizontal: 25,
    marginVertical: 15,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  leftButtonPadding: {
    marginRight: 20
  },
  button: {
    backgroundColor: 'white',
    borderColor: '$disabledIconColor',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonShadow: {
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
        height: 1,
        width: 2,
    },
  },
  buttonText: {
    marginVertical: 11,
    marginHorizontal: 9
  },
  tealButton: {
    flex: 1,
    backgroundColor: '$buttonColor'
  },
  tealButtonText: {
    color: 'white', 
  },
})

SwipeTabs.propTypes = {
  guide: PropTypes.object,
  onLeftButtonPressed: PropTypes.func,
  onRightButtonPressed: PropTypes.func,
  answers: PropTypes.arrayOf(PropTypes.object)
}

export default SwipeTabs
