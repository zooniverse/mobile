import React, { Component } from 'react';
import {
  Switch,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';
import theme from '../theme'
import StyledText from './StyledText'
import { connect } from 'react-redux'
import { setState, syncNotificationStore, updateInterestSubscription } from '../actions/index'

const mapStateToProps = (state, ownProps) => ({
  notification: state.main.notifications[ownProps.id]
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateProjectNotification(checked) {
    // Implement Firebase Project Notification change
  },
})

export class ProjectNotification extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Switch
          value={this.props.notification}
          style={styles.switchComponent}
          onTintColor={theme.$headerColor}
          onValueChange={(checked) => this.props.updateProjectNotification(checked)}
        />

        <StyledText text={this.props.name} />
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center'
  },
  switchComponent: {
    marginRight: 10
  },
});

ProjectNotification.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  notification: PropTypes.bool.isRequired,
  updateProjectNotification: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectNotification)
