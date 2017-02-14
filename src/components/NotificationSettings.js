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
import { checkPushPermissions, setState, updateInterestSubscription, syncNotificationStore } from '../actions/index'
import { addIndex, find, keys, map, flatten, propEq, without } from 'ramda'
import GoogleAnalytics from 'react-native-google-analytics-bridge'

GoogleAnalytics.trackEvent('view', 'Notification Settings')

const mapStateToProps = (state) => ({
  notifications: state.notifications,
  projectList: state.projectList,
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
  }
})

export class NotificationSettings extends React.Component {
  componentDidMount() {
    this.props.checkPushPermissions()
  }

  static renderNavigationBar() {
    return <NavBar title={'Notification Settings'} showBack={true} />;
  }


  render() {
    var mobileProjects = flatten(
      map((tag) => { return this.props.projectList[tag] }, keys(this.props.projectList))
    )

    const renderPreference = (id, idx) => {
      var project = find(propEq('id', id))(mobileProjects)

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

    const preferencesScrollView =
      <ScrollView>
        <StyledText
          text={'Zooniverse would like to occassionally send you updates about new projects or projects needing help.'} />
        <View style={styles.switchContainer}>
          <Switch
            value={this.props.notifications['general']}
            style={styles.switch}
            onTintColor={theme.headerColor}
            onValueChange={(checked) => this.props.updateGeneralNotification(checked)}
          />
          <StyledText text="General Zooniverse notifications" />
        </View>

        { this.props.notifications ? projectNotificationsList : null }
      </ScrollView>

    const noNotifications =
      <View>
        <StyledText
          text={'Push notifications are not enabled on your device!  Please go to Settings > Notifications > Zooniverse to allow them.'} />
      </View>

    const pageView =
      this.props.pushEnabled ? preferencesScrollView : noNotifications

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
    paddingBottom: 16,
    paddingTop: 16,
    alignItems: 'center',
    borderBottomColor: '$lightGrey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  switch: {
    marginRight: 10,
  },
});

NotificationSettings.propTypes = {
  notifications: React.PropTypes.object,
  projectList: React.PropTypes.object,
  isFetching: React.PropTypes.bool,
  pushEnabled: React.PropTypes.bool,
  errorMessage: React.PropTypes.string,
  setState: React.PropTypes.func,
  updateGeneralNotification: React.PropTypes.func,
  checkPushPermissions: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationSettings)
