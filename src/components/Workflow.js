import React, { Component } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types';

class Workflow extends Component {
  render() {
      return (
      <TouchableOpacity
        style={styles.workflowRow}
        onPress={() => this.props.openMobileProject(this.props.workflow.id)}>
        <StyledText text={this.props.workflow.display_name} />
        <View style={[styles.workflowIconContainer, { backgroundColor: this.props.color }]}>
          <Icon name='angle-right' style={styles.workflowIcon} />
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = EStyleSheet.create({
  $iconSize: 30,
  workflowRow: {
    borderTopColor: '$greyBorder',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 15,
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  workflowIconContainer: {
    borderRadius: '0.5 * $iconSize',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '$iconSize',
    height: '$iconSize'
  },
  workflowIcon: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 24,
    lineHeight: 26,
    marginLeft: 2
  },
})

Workflow.propTypes = {
  workflow: PropTypes.shape({
    display_name: PropTypes.string,
    id: PropTypes.string
  }),
  color: PropTypes.string,
  openMobileProject: PropTypes.func
}

export default Workflow
