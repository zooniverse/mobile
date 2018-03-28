import React from 'react'
import {
  ActivityIndicator,
  AlertIOS,
  FlatList,
  Platform,
  PushNotificationIOS,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import R from 'ramda'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { GLOBALS, allProjectTags, loggedInDisciplineTags } from '../constants/globals'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import PropTypes from 'prop-types';
import Discipline from './Discipline'
import NavBar from '../components/NavBar'
import { syncUserStore, setPushPrompted } from '../actions/user'
import FontedText from '../components/common/FontedText'
import * as projectActions from '../actions/projects'

GoogleAnalytics.setTrackerId(GLOBALS.GOOGLE_ANALYTICS_TRACKING)
GoogleAnalytics.trackEvent('view', 'Home')

const mapStateToProps = (state) => ({
  user: state.user,
  isGuestUser: state.user.isGuestUser,
  isConnected: state.main.isConnected,
  isFetching: state.main.isFetching,
  pushPrompted: state.user.pushPrompted,
  projectList: state.projects.projectList || [],
  hasBetaProjects: !R.isEmpty(state.projects.betaProjectList),
  hasRecentProjects: state.user.projects && !R.isEmpty(state.user.projects),
  isLoading: state.projects.isLoading,
})

const mapDispatchToProps = (dispatch) => ({
  projectActions: bindActionCreators(projectActions, dispatch),
  setPushPrompted(value) {
    dispatch(setPushPrompted(value))
    dispatch(syncUserStore())
  },
})

export class ProjectDisciplines extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.shouldPromptForPermissions()) {
      setTimeout(()=> {
        this.promptRequestPermissions()
      }, 500)
    }

    if (R.isEmpty(this.props.projectList)) {
      this.props.projectActions.fetchProjectsWithTags(allProjectTags)
    }
  }

  shouldPromptForPermissions() {
    return ((Platform.OS === 'ios') && (!this.props.user.pushPrompted))
  }

  promptRequestPermissions = () => {
    PushNotificationIOS.checkPermissions((permissions) => {
      if (permissions.alert === 0){
        AlertIOS.alert(
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

  static renderNavigationBar() {
    return <NavBar showAvatar={true} />;
  }

  _renderItem({item}) {
    const { faIcon, value, label, color } = item
    return (
      <Discipline
        faIcon={faIcon}
        icon={value}
        title={label}
        tag={value}
        color={color}
      />
    );
  }

  render() {
    const totalClassifications = this.props.user.totalClassifications
    const pluralizeClassification = ( totalClassifications > 1 ? 'S' : '' )
    const totalClassificationsDisiplay =
      <FontedText style={styles.totalClassifications}>
        {`${totalClassifications} TOTAL CLASSIFICATION${pluralizeClassification}`}
      </FontedText>

    const disciplineInProjectList = (discipline) => {
      const {user, hasBetaProjects, hasRecentProjects} = this.props
      const isForLoggerInUser = !user.isGuestUser && loggedInDisciplineTags(hasRecentProjects, hasBetaProjects ).includes(discipline.value)
      const isTagged = this.props.projectList.find((project) => project.tags.includes(discipline.value)) !== undefined
      return isForLoggerInUser || isTagged
    }
    const disciplineList = R.filter(disciplineInProjectList, GLOBALS.DISCIPLINES)
    const listView = 
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={disciplineList}
        renderItem={this._renderItem}
        keyExtractor={(item, index) => index}
        showsVerticalScrollIndicator={false}
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
        { this.props.isLoading ? activityIndicator : listView }
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  subNavContainer: {
    paddingTop: 74,
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
  isFetching: PropTypes.bool,
  pushPrompted: PropTypes.bool,
  setPushPrompted: PropTypes.func,
  projectList: PropTypes.array,
  isLoading: PropTypes.bool,
  projectActions: PropTypes.any,
  hasRecentProjects: PropTypes.bool,
  hasBetaProjects: PropTypes.bool
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDisciplines)
