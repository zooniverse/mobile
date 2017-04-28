import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Switch,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import theme from '../theme'
import StyledText from './StyledText'
import NavBar from './NavBar'
import OverlaySpinner from './OverlaySpinner'
import ProjectNotification from './ProjectNotification'
import { connect } from 'react-redux'
import {
  checkPushPermissions,
  setState,
  updateInterestSubscription,
  updateSetting,
  syncNotificationStore
} from '../actions/index'
import { addIndex, find, keys, map, flatten, propEq, without } from 'ramda'
import GoogleAnalytics from 'react-native-google-analytics-bridge'

GoogleAnalytics.trackEvent('view', 'Notification Settings')

const mapStateToProps = (state) => ({
  notifications: state.notifications,
  settings: state.settings,
  projectList: state.projectList || [],
  isFetching: state.isFetching,
  errorMessage: state.errorMessage,
  pushEnabled: state.pushEnabled
})

const mapDispatchToProps = (dispatch) => ({
  updateGeneralNotification(checked) {
    dispatch(setState('notifications.general', checked))
    dispatch(syncNotificationStore())
    dispatch(updateInterestSubscription('general', checked))
  },
  setState(key, value){
    dispatch(setState(key, value))
  },
  checkPushPermissions(){
    dispatch(checkPushPermissions())
  },
  updateSetting(key, value) {
    dispatch(updateSetting(key, value))
  }
})

export class Settings extends React.Component {
  componentDidMount() {
    this.props.checkPushPermissions()
  }

  static renderNavigationBar() {
    return <NavBar title={'Settings'} showBack={true} />;
  }

  render() {
    const renderPreference = (id, idx) => {
      let project = find(propEq('id', id))(this.props.projectList)

      if (project === undefined) { //project may no longer exist
        return
      } else {
        return (
          <ProjectNotification
            id={id}
            name={project.display_name}
            key={idx} /> )
      }
    }

    const projectNotificationsList =
      <View>
        <StyledText textStyle={'subHeaderText'}
          text={'Project-specific Notifications'} />

        {addIndex(map)(
            (key, idx) => { return renderPreference(key, idx) },
            without(['general'] , keys(this.props.notifications))
        )}
      </View>

    const notificationsSettings =
      <View>
        <StyledText
          text={'Zooniverse would like to occassionally send you updates about new projects or projects needing help.'} />
        <View style={styles.switchContainer}>
          <Switch
            value={this.props.notifications['general']}
            style={styles.switchComponent}
            onTintColor={theme.headerColor}
            onValueChange={(checked) => this.props.updateGeneralNotification(checked)}
          />
          <StyledText text="General Zooniverse notifications" />
        </View>

        { this.props.notifications ? projectNotificationsList : null }
      </View>

    const noNotifications =
      <View>
        <StyledText
          text={'Push notifications are not enabled on your device!  Please go to Settings > Notifications > Zooniverse to allow them.'} />
      </View>

    const pageView =
      <ScrollView>
        <View style={styles.section}>
          <StyledText
            textStyle={'headerText'}
            text={'General Settings'}
          />
          <View style={styles.switchContainer}>
            <Switch
              value={this.props.settings.promptForWorkflow}
              style={styles.switchComponent}
              onTintColor={theme.headerColor}
              onValueChange={(checked) => this.props.updateSetting('promptForWorkflow', checked)}
            />
            <View>
              <StyledText text="Prompt to see all project workflows" />
              <StyledText
                textStyle={'subLabelText'}
                text="Note: This will include non-mobile workflows"
              />
            </View>
          </View>
        </View>
        <StyledText
          textStyle={'headerText'}
          text={'Notification Settings'} />
       { this.props.pushEnabled ? notificationsSettings : noNotifications }
      </ScrollView>

    return (
      <View style={styles.container}>
        <StyledText textStyle={'errorMessage'} text={this.props.errorMessage} />
        { this.props.isFetching ? <OverlaySpinner /> : pageView }
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingLeft: 10,
    paddingRight: 10
  },
  messageContainer: {
    padding: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    paddingLeft: 8,
    paddingVertical: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderBottomColor: '$lightGrey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  switchComponent: {
    marginRight: 10,
  },
  section: {
    marginTop: 5,
    marginBottom: 5,
  }
});

Settings.propTypes = {
  notifications: React.PropTypes.shape({
    general: React.PropTypes.bool,
  }),
  settings: React.PropTypes.shape({
    promptForWorkflow: React.PropTypes.bool,
  }),
  projectList: React.PropTypes.array,
  isFetching: React.PropTypes.bool,
  pushEnabled: React.PropTypes.bool,
  errorMessage: React.PropTypes.string,
  setState: React.PropTypes.func,
  updateGeneralNotification: React.PropTypes.func,
  updateSetting: React.PropTypes.func,
  checkPushPermissions: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
