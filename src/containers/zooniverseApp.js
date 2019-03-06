import React, {Component} from 'react'
import {
  Dimensions,
  View
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import firebase from 'react-native-firebase';

import ProjectDisciplines from '../components/ProjectDisciplines'
import NotificationModal from '../components/NotificationModal'
import { setState } from '../actions/index'
import { removeLeftOverImages } from '../utils/imageUtils'
import * as settingsActions from '../actions/settings'
import * as imageActions from '../actions/images'
import * as appActions from '../actions/app'
import { setNavbarSettingsForPage } from '../actions/navBar'
import PageKeys from '../constants/PageKeys'

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
  appActions: bindActionCreators(appActions, dispatch),
  setNavbarSettingsForPage: (settings) => dispatch(setNavbarSettingsForPage(settings, PageKeys.ZooniverseApp))
})

class ZooniverseApp extends Component {
  constructor(props) {
    super(props);

    this.onFCMTokenReceived = this.onFCMTokenReceived.bind(this);
  }

  handleDimensionsChange(dimensions) {
    this.props.appActions.updateScreenDimensions({
      width: dimensions.window.width,
      height: dimensions.window.height
    })
  }

  onFCMTokenReceived(token) {
    this.props.settingsActions.initializeSubscriptionsWithFirebase(token)
  } 

  componentDidMount() {
    this.props.setNavbarSettingsForPage({
      centerType: 'avatar'
    })
    
    // Initially set screen dimensions
    this.handleDimensionsChange({window: Dimensions.get('window')})

    // Subscribe to screen change events
    Dimensions.addEventListener('change', this.handleDimensionsChange.bind(this))

    removeLeftOverImages(this.props.images)
    this.props.imageActions.clearImageLocations()

    firebase.messaging().getToken().then(this.onFCMTokenReceived);
    this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(this.onFCMTokenReceived);
  }

  componentWillUnmount() {
    this.onTokenRefreshListener()
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
  }),
  setNavbarSettingsForPage: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(ZooniverseApp)
