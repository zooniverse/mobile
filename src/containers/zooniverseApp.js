import React, {Component} from 'react'
import {
  Dimensions,
  Platform,
  PushNotificationIOS,
  View
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import ProjectDisciplines from '../components/ProjectDisciplines'
import NotificationModal from '../components/NotificationModal'
import NavBar from '../components/NavBar'
import { setState } from '../actions/index'
import FCM, { FCMEvent } from 'react-native-fcm'
import { removeLeftOverImages } from '../utils/imageUtils'
import * as settingsActions from '../actions/settings'
import * as imageActions from '../actions/images'
import * as appActions from '../actions/app'

const mapStateToProps = (state) => ({
  user: state.user,
  isFetching: state.main.isFetching,
  isConnected: state.main.isConnected,
  isModalVisible: state.main.isModalVisible || false,
  notificationPayload: state.main.notificationPayload || {},
  images: state.images
})

const mapDispatchToProps = (dispatch) => ({
  setModalVisibility(value) {
    dispatch(setState('isModalVisible', value))
  },
  setNotificationPayload(value) {
    dispatch(setState('notificationPayload', value))
  },
  imageActions: bindActionCreators(imageActions, dispatch),
  settingsActions: bindActionCreators(settingsActions, dispatch),
  appActions: bindActionCreators(appActions, dispatch)
})

class ZooniverseApp extends Component {
  constructor(props) {
    super(props);
  }

  handleDimensionsChange(dimensions) {
    this.props.appActions.updateScreenDimensions({
      width: dimensions.window.width,
      height: dimensions.window.height
    })
  }

  componentDidMount() {
    // Initially set screen dimensions
    this.handleDimensionsChange({window: Dimensions.get('window')})

    // Subscribe to screen change events
    Dimensions.addEventListener('change', this.handleDimensionsChange.bind(this))

    removeLeftOverImages(this.props.images)
    this.props.imageActions.clearImageLocations()
    if (Platform.OS === 'ios') {
      PushNotificationIOS.addEventListener('notification', this.onRemoteNotification)
      PushNotificationIOS.addEventListener('register', this.onPushRegistration)
    } else {
      FCM.on(FCMEvent.Notification, this.onRemoteNotification)
      this.onPushRegistration()
    }
  }

  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('notification', this.onRemoteNotification);
    PushNotificationIOS.removeEventListener('register', this.onPushRegistration)
  }

  onRemoteNotification = (notification) => {
    // Implement Firebase notification receive
  }

  onPushRegistration = () => {
    this.props.settingsActions.initializeSubscriptionsWithFirebase()
  }

  static renderNavigationBar() {
    return <NavBar showAvatar={true} />;
  }

  render() {
    return (
      <View style={styles.container}>
        <ProjectDisciplines />
        <NotificationModal
          isVisible={this.props.isModalVisible}
          setVisibility={this.props.setModalVisibility}/>
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
});

ZooniverseApp.propTypes = {
  user: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool,
  isModalVisible: PropTypes.bool,
  setModalVisibility: PropTypes.func,
  setNotificationPayload: PropTypes.func,
  images: PropTypes.object,
  imageActions: PropTypes.any,
  settingsActions: PropTypes.any,
  appActions: PropTypes.shape({
    updateScreenDimensions: PropTypes.func
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(ZooniverseApp)
