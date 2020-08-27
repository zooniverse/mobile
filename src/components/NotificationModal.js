import React, { Component } from 'react'
import {
  Alert,
  Linking,
  Platform,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';
import StyledModal from './StyledModal'
import StyledText from './StyledText'
import Button from './Button'
import { connect } from 'react-redux'
import { fetchNotificationProject } from '../actions/index'
import { isEmpty, findIndex, propEq } from 'ramda'
import GoogleAnalytics from 'react-native-google-analytics-bridge'


let notificationTitle, notificationBody, projectID

const mapStateToProps = (state) => ({
  notificationProject: state.main.notificationProject,
  notificationPayload: state.main.notificationPayload,
  projectList: state.projects.projectList || [],
})

const mapDispatchToProps = (dispatch) => ({
  fetchNotificationProject(projectID) {
    dispatch(fetchNotificationProject(projectID))
  },
})

class NotificationModal extends Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

    static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState && prevState !== nextProps) {
      const notification = prevState.notificationPayload
      if (Platform.OS === 'ios'){
        if (notification._alert !== undefined) {
          notificationTitle = notification._alert.title
          notificationBody = notification._alert.body
          projectID = ( notification._data.data !== undefined ? notification._data.data.project_id : null)
        }
      } else {
        notificationTitle = notification.title
        notificationBody = notification.body
        projectID = notification.project_id
      }

      if (this.isMobileProject(projectID)) {
        this.props.fetchNotificationProject(projectID)
      }
    }
  }

  isMobileProject(projectID) {
    return findIndex(()=>propEq('id', projectID), this.props.projectList) >= 0
  }

  handleClick() {
    GoogleAnalytics.trackEvent('view from notification', this.props.notificationProject.display_name)

    const zurl=`http://zooniverse.org/projects/${this.props.notificationProject.slug}`
    Linking.canOpenURL(zurl).then(supported => {
      if (supported) {
        Linking.openURL(zurl);
      } else {
        Alert.alert(
          'Error',
          'Sorry, but it looks like you are unable to open the project in your default browser.',
        )
      }
    })
  }

  render() {
    const projectDisplay =
      <View style={styles.projectContainer}>
          <StyledText additionalStyles={[styles.subheader]} text={`About ${this.props.notificationProject.display_name}`} />
          <StyledText additionalStyles={[styles.smallText]}  text={this.props.notificationProject.description} />

          <View style={styles.container}>
            <Button
              handlePress={this.handleClick}
              text={'Visit this project'} />
          </View>
      </View>

    return (
      <StyledModal
        isVisible={this.props.isVisible}
        setVisibility={this.props.setVisibility}
        title="Notification">
        <StyledText
          textStyle='largeBold'
          text={notificationTitle} />

        <View style={styles.container}>
          <StyledText
            text={notificationBody} />
        </View>

        { (isEmpty(this.props.notificationProject) || (isEmpty(projectID))) ? null : projectDisplay }

        <Button
          handlePress={() => this.props.setVisibility(false)}
          buttonStyle={'navyButton'}
          text={'Close'} />

      </StyledModal>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  projectContainer: {
    marginTop: 20,
  },
  subheader: {
    fontStyle: 'italic',
    fontSize: 16
  },
  smallText: {
    fontSize: 13,
    lineHeight: 20
  }
})

NotificationModal.propTypes = {
  notificationPayload: PropTypes.object,
  notificationProject: PropTypes.object,
  projectList: PropTypes.array,
  isVisible: PropTypes.bool,
  setVisibility: PropTypes.func,
  fetchNotificationProject: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationModal)
