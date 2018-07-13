import React from 'react'
import {
  FlatList,
  ScrollView,
  View
} from 'react-native'
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux'
import EStyleSheet from 'react-native-extended-stylesheet'
import { SettingsToggle, SettingHeader } from './settingsComponents'
import NavBar from '../NavBar'
import FontedText from '../common/FontedText'
import Separator from '../common/Separator'
import { connect } from 'react-redux'
import {
  checkPushPermissions,
} from '../../actions/index'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import * as settingsActions from '../../actions/settings'
import theme from '../../theme'

GoogleAnalytics.trackEvent('view', 'Notification Settings')

const mapStateToProps = (state) => {
  const {
    showAllWorkflows,
    enableNotifications,
    newProjectNotifications,
    newBetaNotifications,
    urgentHelpNotification,
    projectSpecificNotifications
  } = state.settings

  return {
    notifications: state.main.notifications,
    projectList: state.projects.projectList || [],
    isFetching: state.main.isFetching,
    errorMessage: state.main.errorMessage,
    pushEnabled: state.main.pushEnabled,
    showAllWorkflows,
    enableNotifications,
    newProjectNotifications,
    newBetaNotifications,
    urgentHelpNotification,
    projectSpecificNotifications
  }
}

const mapDispatchToProps = (dispatch) => ({
  checkPushPermissions(){
    dispatch(checkPushPermissions())
  },
  settingsActions: bindActionCreators(settingsActions, dispatch)
})

export class Settings extends React.Component {
  componentDidMount() {
    this.props.checkPushPermissions()
  }

  static renderNavigationBar() {
    return <NavBar title={'Settings'} showBack={true} />;
  }

  renderSettingsToggle = ({item}) => {
    const {subscribed, id, display_name } = item
    return (
      <SettingsToggle
        value={subscribed}
        onToggle={() => {this.props.settingsActions.updateProjectSubsciption(id, !subscribed)}}
        title={display_name}
        disabled={!this.props.enableNotifications}
      />
    )
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <SettingHeader text="General Settings" />
        <View style={styles.workflowContainer}>
          <SettingsToggle
            title="Show all workflows"
            description="Includes non-native workflows"
            onToggle={() => {this.props.settingsActions.updateShowAllWorkflow(!this.props.showAllWorkflows)}}
            value={this.props.showAllWorkflows}
          />
        </View>
        <Separator style={styles.titlePadding} color={theme.$seperator}/>
        <View>
          <SettingHeader text="Notification Settings" />
        </View>
        <FontedText style={styles.disclosureText}> 
          The Zooniverse app can occassionally send you updates about new projects or projects you might be interested in.
        </FontedText>
        <SettingsToggle
          style={styles.toggleSpacing}
          onToggle={() => {this.props.settingsActions.updateEnableNotifications(!this.props.enableNotifications)}}
          title='Enable Notifications'
          value={this.props.enableNotifications}
        />
        <SettingsToggle
          style={styles.toggleSpacing}
          onToggle={() => {this.props.settingsActions.updateNewProjectNotifications(!this.props.newProjectNotifications)}}
          title='New Projects'
          value={this.props.newProjectNotifications}
          disabled={!this.props.enableNotifications}
        />
        <SettingsToggle
          style={styles.toggleSpacing}
          onToggle={() => {this.props.settingsActions.updateBetaNotifications(!this.props.newBetaNotifications)}}
          title='New Beta Projects'
          value={this.props.newBetaNotifications}
          disabled={!this.props.enableNotifications}
        />
        <SettingsToggle
          style={styles.toggleSpacing}
          onToggle={() => {this.props.settingsActions.updateUrgentHelpNotifications(!this.props.urgentHelpNotification)}}
          title='Urgent Help Alerts'
          description='Notifications when projects need timely help'
          value={this.props.urgentHelpNotification}
          disabled={!this.props.enableNotifications}
        />
        <FontedText style={styles.projectHeader}>
          Project-specific Notifications
        </FontedText>
        <FlatList
          data={this.props.projectSpecificNotifications}
          renderItem={this.renderSettingsToggle}
          ItemSeparatorComponent={() => <View style={styles.separatorStyle}/>}
          keyExtractor={ item => item.id }
        />
      </ScrollView>
    );
  }
}

const styles = EStyleSheet.create({
  toggleSpacing: {
    paddingBottom: 15
  },
  disclosureText: {
    paddingBottom: 20
  },
  projectHeader: {
    color: '$headerGrey',
    fontSize: 18,
    paddingBottom: 15
  }, 
  separatorStyle: {
    paddingTop: 10
  },
  titlePadding: {
    paddingBottom: 30
  },
  workflowContainer: {
    paddingTop: 20,
    paddingBottom: 35
  },
  scrollViewContainer: {
    padding: 25
  }
});

Settings.propTypes = {
  notifications: PropTypes.shape({
    general: PropTypes.bool,
  }),
  settings: PropTypes.shape({
    promptForWorkflow: PropTypes.bool,
  }),
  projectList: PropTypes.array,
  isFetching: PropTypes.bool,
  pushEnabled: PropTypes.bool,
  errorMessage: PropTypes.string,
  updateGeneralNotification: PropTypes.func,
  checkPushPermissions: PropTypes.func,
  showAllWorkflows: PropTypes.bool,
  enableNotifications: PropTypes.bool,
  newProjectNotifications: PropTypes.bool,
  newBetaNotifications: PropTypes.bool,
  urgentHelpNotification: PropTypes.bool,
  projectSpecificNotifications: PropTypes.array,
  settingsActions: PropTypes.any
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
