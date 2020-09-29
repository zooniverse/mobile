import React, { Component } from 'react';
import {
  TouchableOpacity,
  View
} from 'react-native';
import DeviceInfo from 'react-native-device-info'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';

import FontedText from '../common/FontedText'
import * as colorModes from '../../displayOptions/colorModes'

class ClassificationPanel extends Component {
  render() {
    const tabs =
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={ () => { this.props.setQuestionVisibility(true) } }
          style={ this.props.isQuestionVisible ?
              [styles.tab,  colorModes.contentBackgroundColorFor(this.props.inMuseumMode)] :
              [styles.tab,  colorModes.framingBackgroundColorFor(this.props.inMuseumMode)]
          }>
          <FontedText style={ this.props.isQuestionVisible ?
            [styles.tabText, colorModes.selectedTextColorFor(this.props.inMuseumMode)] :
            [styles.tabText, colorModes.selectedTextColorFor(this.props.inMuseumMode)]
          }>
            QUESTION
          </FontedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={ () => { this.props.setQuestionVisibility(false) } }
          style={ this.props.isQuestionVisible ?
              [styles.tab,  colorModes.framingBackgroundColorFor(this.props.inMuseumMode)] :
              [styles.tab,  colorModes.contentBackgroundColorFor(this.props.inMuseumMode)]

          }>
          <FontedText style={ this.props.isQuestionVisible ?
            [styles.tabText, colorModes.selectedTextColorFor(this.props.inMuseumMode)]:
            [styles.tabText, colorModes.selectedTextColorFor(this.props.inMuseumMode)]
          }>
            TUTORIAL
          </FontedText>
        </TouchableOpacity>
      </View>

    return (
        <View style={[styles.panelContainer, this.props.containerStyle, colorModes.contentBackgroundColorFor(this.props.inMuseumMode)]}>
          { this.props.hasTutorial ? tabs : null }
          { this.props.children }
        </View>
    )
  }
}

const styles = EStyleSheet.create({
  panelContainer: {
    marginTop: 15,
    marginBottom: 0,
    marginHorizontal: 25
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 1,
  },
  tabText: {
    fontSize: DeviceInfo.isTablet() ? 22 : 14,
    marginVertical: 15
  }
})

ClassificationPanel.propTypes = {
  containerStyle: PropTypes.any,
  isFetching: PropTypes.bool,
  hasTutorial: PropTypes.bool,
  children: PropTypes.node,
  isQuestionVisible: PropTypes.bool,
  setQuestionVisibility: PropTypes.func,
  inMuseumMode: PropTypes.bool,
}
export default ClassificationPanel
