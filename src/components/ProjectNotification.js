import React, { Component } from 'react';
import {
  Switch,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import theme from '../theme'
import StyledText from './StyledText'
import { connect } from 'react-redux'
import { setState, syncNotificationStore, updateInterestSubscription } from '../actions/index'

const mapStateToProps = (state, ownProps) => ({
  notification: state.notifications[ownProps.id]
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateProjectNotification(checked) {
    dispatch(setState(`notifications.${ownProps.id}`, checked))
    dispatch(syncNotificationStore())
    dispatch(updateInterestSubscription(ownProps.id, checked))
  },
})

export class ProjectNotification extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Switch
          value={this.props.notification}
          style={styles.switch}
          onTintColor={theme.headerColor}
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
  switch: {
    marginRight: 10
  },
});

ProjectNotification.propTypes = {
  id: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  notification: React.PropTypes.bool.isRequired,
  updateProjectNotification: React.PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectNotification)
