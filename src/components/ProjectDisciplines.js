import React from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  PushNotificationIOS,
  RefreshControl,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import R from 'ramda'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { GLOBALS, loggedInDisciplineTags } from '../constants/globals'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import PropTypes from 'prop-types';
import Discipline from './Discipline'
import { setPushPrompted } from '../actions/user'
import FontedText from '../components/common/FontedText'
import * as projectActions from '../actions/projects'
import * as settingsActions from '../actions/settings'
import { makeCancelable } from '../utils/promiseUtils'
import { extractSwipeEnabledProjects } from '../utils/projectUtils'
import { setNavbarSettingsForPage } from '../actions/navBar'
import PageKeys from '../constants/PageKeys'

GoogleAnalytics.setTrackerId(GLOBALS.GOOGLE_ANALYTICS_TRACKING)
GoogleAnalytics.trackEvent('view', 'Home')

const mapStateToProps = (state) => {
  const nativePreviewProjects = state.projects.previewProjectList.filter((project) => R.any((workflow) => workflow.mobile_verified)(project.workflows))
  const hasPreviewProjects = !R.isEmpty(nativePreviewProjects)
  const hasBetaProjects = !R.isEmpty(state.projects.betaProjectList.count)
  return {
    user: state.user,
    isGuestUser: state.user.isGuestUser,
    isConnected: state.main.isConnected,
    projectList: state.projects.projectList || [],
    hasPreviewProjects,
    hasBetaProjects,
    hasRecentProjects: state.user.projects && !R.isEmpty(state.user.projects),
    isSuccess: state.projects.isSuccess,
    isLoading: state.projects.isLoading
  }
}

const mapDispatchToProps = (dispatch) => ({
  setNavbarSettingsForPage: (settings, page) => dispatch(setNavbarSettingsForPage(settings, page)),
  projectActions: bindActionCreators(projectActions, dispatch),
  settingsActions: bindActionCreators(settingsActions, dispatch),
  setPushPrompted(value) {
    dispatch(setPushPrompted(value))
  },
})

export class ProjectDisciplines extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: true
  }

    this.refreshProjects = this.refreshProjects.bind(this)
  }

  componentDidMount() {
    this.props.setNavbarSettingsForPage({
      centerType: 'avatar' 
    }, PageKeys.ProjectDisciplines)
    if (this.shouldPromptForPermissions()) {
      setTimeout(()=> {
        this.promptRequestPermissions()
      }, 500)
    }

    this.refreshProjects()
  }

  componentWillUnmount() {
    if (this.fetchProjectPromise) {
      this.fetchProjectPromise.cancel()
    }
  }

  shouldPromptForPermissions() {
    return ((Platform.OS === 'ios') && (!this.props.user.pushPrompted))
  }

  promptRequestPermissions = () => {
    PushNotificationIOS.checkPermissions((permissions) => {
      if (permissions.alert === 0){
        Alert.alert(
          'Allow Notifications?',
          'Zooniverse would like to occasionally send you info about new projects or projects needing help.',
          [
            {text: 'Not Now', onPress: () => this.requestIOSPermissions(false)},
            {text: 'OK', onPress: () => this.requestIOSPermissions(true)},
          ]
        )
      }
    })
  }

  requestIOSPermissions(accepted) {
    if (accepted) {
      PushNotificationIOS.requestPermissions()
    }
    this.props.setPushPrompted(true)
  }

  _renderItem({item}) {
    const { faIcon, value, label, color, description } = item
    return (
      <Discipline
        faIcon={faIcon}
        icon={value}
        title={label}
        tag={value}
        color={color}
        description={description}
      />
    );
  }

  refreshProjects() {
    this.setState({refreshing: true});
    this.fetchProjectPromise = makeCancelable(this.props.projectActions.fetchProjects())
    
    this.fetchProjectPromise
    .promise
    .then((projectList) => {
      this.fetchProjectPromise = null
      this.setState({refreshing: false});

      // Handle push subscriptions 
      const notificationProjects = extractSwipeEnabledProjects(projectList.filter(project => !project.isPreview))
      this.props.settingsActions.addUnusedProjectsToNotifications(notificationProjects)
    })
    .catch((error) => {
      if (!error.isCanceled) {
        Alert.alert( 'Error', 'The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error)
      }
    })
  }

  render() {
    const totalClassifications = this.props.user.totalClassifications
    const pluralizeClassification = ( totalClassifications > 1 ? 'S' : '' )
    const totalClassificationsDisiplay =
      <FontedText style={styles.totalClassifications}>
        {`${totalClassifications} TOTAL CLASSIFICATION${pluralizeClassification}`}
      </FontedText>

    const disciplineInProjectList = (discipline) => {
      const {user, hasPreviewProjects, hasRecentProjects, hasBetaProjects} = this.props
      const isForLoggerInUser = !user.isGuestUser && loggedInDisciplineTags(hasRecentProjects, hasPreviewProjects ).includes(discipline.value)
      const isTagged = this.props.projectList.find((project) => project.tags.includes(discipline.value)) !== undefined
      const isBeta = hasBetaProjects && discipline.value === 'beta'
      return isForLoggerInUser || isTagged || isBeta
    }
    const disciplineList = this.props.isSuccess ? R.filter(disciplineInProjectList, GLOBALS.DISCIPLINES) : []
    const listView = 
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={disciplineList}
        renderItem={this._renderItem}
        keyExtractor={(item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refreshProjects}
          />}
      />
    const activityIndicator =
      <View style={activityIndicator}>
        <ActivityIndicator size="large" />
      </View>
  

    return (
      <View style={styles.container}>
        <View style={styles.subNavContainer}>
            <FontedText style={styles.userName}>
              { this.props.isGuestUser ? 'Guest User' : this.props.user.display_name }
            </FontedText>
            { totalClassifications > 0 ? totalClassificationsDisiplay : null }
        </View>
        { this.props.isLoading && !this.props.isSuccess ? activityIndicator : listView }
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  subNavContainer: {
    paddingTop: Platform.OS === 'ios' ? 25 : 74,
    paddingBottom: 25,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  userName: {
    color: '$headerGrey',
    fontSize: 26,
    lineHeight: 31,
  },
  totalClassifications: {
    color: '$headerGrey',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 17
  },
  signOut: {
    backgroundColor: '$transparent',
  },
  signOutText: {
    color: '$darkTextColor',
    fontSize: 11,
  },
  messageContainer: {
    padding: 15,
  },
  innerContainer: {
    flex: 1,
    marginTop: 10,
  },
  activityIndicator: {
    flex: 1,
    paddingBottom: 75,
    justifyContent: 'center'
  },
  listContainer: {
    paddingBottom: 25
  }
});

ProjectDisciplines.propTypes = {
  user: PropTypes.object,
  isGuestUser: PropTypes.bool,
  setPushPrompted: PropTypes.func,
  projectList: PropTypes.array,
  isSuccess: PropTypes.bool,
  isLoading: PropTypes.bool,
  projectActions: PropTypes.any,
  settingsActions: PropTypes.any,
  hasRecentProjects: PropTypes.bool,
  hasPreviewProjects: PropTypes.bool,
  hasBetaProjects: PropTypes.bool,
  setNavbarSettingsForPage: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDisciplines)
