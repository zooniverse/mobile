import React, { Component } from 'react';
import {
  Platform,
  TouchableOpacity,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'

const topPadding = (Platform.OS === 'ios') ? 10 : 0

class ClassificationPanel extends Component {
  render() {
    const tabs =
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={ () => { this.props.setQuestionVisibility(true) } }
          style={ this.props.isQuestionVisible ? [styles.tab] : [styles.tab, styles.deselectedTab] }>
          <StyledText text={ 'QUESTION' } />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={ () => { this.props.setQuestionVisibility(false) } }
          style={ this.props.isQuestionVisible ? [styles.tab, styles.deselectedTab] : [styles.tab] }>
          <StyledText text={ 'TUTORIAL' } />
        </TouchableOpacity>
      </View>

    return (
      <View style={styles.container}>
        <View style={styles.panelContainer}>
          { this.props.hasTutorial ? tabs : null }
          { this.props.children }
        </View>
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  $tabHeight: 32,
  $panelMargin: 13,
  container: {
    backgroundColor: '$lightestGrey',
    flex: 1,
    marginTop: 60,
    paddingTop: topPadding,
    paddingBottom: 0,
  },
  panelContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: '$panelMargin',
    marginBottom: 0,
  },
  tabContainer: {
    height: '$tabHeight',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '$tabHeight',
    width: '50% - $panelMargin',
    marginTop: 1,
  },
  deselectedTab: {
    backgroundColor: '$lightestGrey',
  }
})

ClassificationPanel.propTypes = {
  isFetching: React.PropTypes.bool,
  hasTutorial: React.PropTypes.bool,
  children: React.PropTypes.node,
  isQuestionVisible: React.PropTypes.bool,
  setQuestionVisibility: React.PropTypes.func,
}
export default ClassificationPanel
