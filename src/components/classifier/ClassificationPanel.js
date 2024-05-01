import React, { Component } from 'react';
import {
  TouchableOpacity,
  View
} from 'react-native';
import DeviceInfo from 'react-native-device-info'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import FontedText from '../common/FontedText'

class ClassificationPanel extends Component {
  render() {
    const activeTab = { backgroundColor: '#EBEBEB'}
    const inactiveTab = { backgroundColor: '#CBCCCB'}
    const tabLeftOverride = this.props.isQuestionVisible ? activeTab : inactiveTab;
    const tabRightOverride = this.props.isQuestionVisible ? inactiveTab : activeTab;
    const tabLeftFont = this.props.isQuestionVisible ? '700' : '400';
    const tabRightFont = this.props.isQuestionVisible ? '400' : '700';

    const hasTutorial = this.props.hasTutorial;
    const color = hasTutorial ? '#005D69' : '#A6A7A9'
    const TutorialIcon = () => <FontAwesome
      name="question-circle-o"
      size={18}
        color={color}
      style={styles.icon}
    />
    const TutorialText = () => <FontedText style={[styles.tabText, {fontWeight: tabRightFont, color}]}>
      TUTORIAL
    </FontedText>

    const TutorialTab = ({children}) => {
      return hasTutorial ? (
        <TouchableOpacity
          onPress={ () => { this.props.setQuestionVisibility(false) } }
          style={[styles.tab, { ...tabRightOverride }]}>
          {children}
        </TouchableOpacity>
      ) :
      (<View style={[styles.tab, { ...tabRightOverride }]}>
        {children}
      </View>
      )
    }
    const tabs =
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={ () => { this.props.setQuestionVisibility(true) } }
          style={ [styles.tab, {...tabLeftOverride}] }>
          <FontAwesome
            name="pencil-square-o"
            size={18}
            color="#005D69"
            style={styles.icon}
          />
          <FontedText style={[styles.tabText, {fontWeight: tabLeftFont, color}]}>
            TASK
          </FontedText>
        </TouchableOpacity>
        <TutorialTab>
          <TutorialIcon />
          <TutorialText />
        </TutorialTab>
      </View>

    return (
        <View style={this.props.containerStyle}>
          { tabs }
          { this.props.children }
        </View>
    )
  }
}

const styles = EStyleSheet.create({
  noTabsFiller: {
    height: 44, 
    backgroundColor: '#EBEBEB',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    height: 44,
  },
  tabText: {
    fontSize: DeviceInfo.isTablet() ? 22 : 16,
    lineHeight: 18.7,
    letterSpacing: 1,
    marginLeft: 8
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
