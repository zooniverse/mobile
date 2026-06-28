import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import R from 'ramda'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { GLOBALS } from '../constants/globals'
import PropTypes from 'prop-types';
import Discipline from './Discipline'
import { setPushPrompted } from '../actions/user'
import FontedText from '../components/common/FontedText'
import * as projectActions from '../actions/projects'
import * as settingsActions from '../actions/settings'
import { makeCancelable } from '../utils/promiseUtils'
import { setNavbarSettingsForPage } from '../actions/navBar'
import PageKeys from '../constants/PageKeys'
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { useRoute } from '@react-navigation/native';
import ErasStats from './ErasStats';
import theme from '../theme';
import { useTranslation } from 'react-i18next';
import languageOptions from '../i18n/languages';

const mapStateToProps = (state) => {
  return {
    user: state.user,
    isGuestUser: state.user.isGuestUser,
    isConnected: state.main.isConnected,
    hasRecentProjects: state.user.projects && !R.isEmpty(state.user.projects),
    isSuccess: state.projects.isSuccess,
    isLoading: state.projects.isLoading,
    platformLanguage: state.languageSettings.platformLanguage,
  };
};

const mapDispatchToProps = (dispatch) => ({
  setNavbarSettingsForPage: (settings, page) => dispatch(setNavbarSettingsForPage(settings, page)),
  projectActions: bindActionCreators(projectActions, dispatch),
  settingsActions: bindActionCreators(settingsActions, dispatch),
  setPushPrompted(value) {
    dispatch(setPushPrompted(value))
  },
})

function ProjectDisciplines({ ...props }) {
  const [refreshing, setRefreshing] = useState(true);
  const fetchProjectPromise = useRef(null);
  const route = useRoute();
  const { t } = useTranslation('platform');

  useEffect(() => {
    props.setNavbarSettingsForPage(
      {
        centerType: 'avatar',
      },
      PageKeys.ProjectDisciplines
    );
    if (shouldPromptForPermissions()) {
      setTimeout(() => {
        promptRequestPermissions();
      }, 500);
    }

    refreshProjects();

    return () => {
      if (fetchProjectPromise.current) {
        fetchProjectPromise.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (route?.params?.refresh) {
      route.params.refresh = false;
      refreshProjects();
    }
  }, [route]);

  function shouldPromptForPermissions() {
    return Platform.OS === 'ios' && !props.user.pushPrompted;
  }

  const promptRequestPermissions = () => {
    PushNotificationIOS.checkPermissions((permissions) => {
      if (permissions.alert === 0){
        Alert.alert(
          'Allow Notifications?',
          'Zooniverse would like to occasionally send you info about new projects or projects needing help.',
          [
            {text: 'Not Now', onPress: () => requestIOSPermissions(false)},
            {text: 'OK', onPress: () => requestIOSPermissions(true)},
          ]
        )
      }
    })
  };

  function requestIOSPermissions(accepted) {
    if (accepted) {
      PushNotificationIOS.requestPermissions();
    }
    props.setPushPrompted(true);
  }

  function renderItem({ item, navigation }) {
    const {
      faIcon,
      value,
      label,
      color,
      description,
      translation = null,
    } = item;
    let title = label;

    if (translation) {
      title = t(translation, title);
    }

    if (value === 'translated projects') {
      title = 'Translated Projects';
      const nativeLanguage = languageOptions[props.platformLanguage];
      const projectsTranslation = t(translation, '');
      if (nativeLanguage && projectsTranslation) {
        title = `${projectsTranslation} ${nativeLanguage}`;
      }
    }

    return (
      <Discipline
        faIcon={faIcon}
        icon={value}
        title={title}
        tag={value}
        color={color}
        description={description}
        navigation={props.navigation}
      />
    );
  }

  function refreshProjects() {
    setRefreshing(true);
    fetchProjectPromise.current = makeCancelable(props.projectActions.fetchProjects());

    fetchProjectPromise.current.promise
      .then((projectList) => {
        fetchProjectPromise.current = null;
        setRefreshing(false);
      })
      .catch((error) => {
        if (!error.isCanceled) {
          Alert.alert(
            'Error',
            'The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' +
              error
          );
        }
      });
  }
  const totalClassifications = props.user.totalClassifications;
  const pluralizeClassification = totalClassifications > 1 ? 'S' : '';
  const totalClassificationsDisiplay = (
    <FontedText style={styles.totalClassifications}>
      {`${totalClassifications} TOTAL CLASSIFICATION${pluralizeClassification}`}
    </FontedText>
  );

  const disciplineInProjectList = (discipline) => {
    const isRecent = discipline.value === 'recent';
    const isPreview = discipline.value === 'preview';
    const translated =
      props.platformLanguage !== 'en' &&
      discipline.value === 'translated projects';
    if (isRecent) return !props.user.isGuestUser && props.hasRecentProjects;
    if (isPreview) return !props.user.isGuestUser;
    if (discipline.value === 'translated projects') return translated;
    return true;
  };
  const disciplineList = props.isSuccess
    ? R.filter(disciplineInProjectList, GLOBALS.DISCIPLINES)
    : [];
  const listView = (
    <FlatList
      contentContainerStyle={styles.listContainer}
      data={disciplineList}
      renderItem={(item) => renderItem(item, props.navigation)}
      keyExtractor={(item, index) => `${index}`}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshProjects} />
      }
    />
  );
  const activityIndicator = (
    <View style={styles.activityIndicator}>
      <ActivityIndicator size="large" />
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.subNavContainer}>
        <FontedText style={styles.userName}>
          {props.isGuestUser
            ? t('Mobile.homeScreen.guestUser', 'Guest User')
            : props.user.display_name}
        </FontedText>
        {props?.user?.login && (
          <FontedText style={styles.loginName}>@{props.user.login}</FontedText>
        )}
        {!props.isGuestUser && <ErasStats user={props.user} />}
      </View>
      {props.isLoading && !props.isSuccess ? activityIndicator : listView}
    </View>
  );
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
    color: theme.$zooniverseTeal,
    fontSize: 24,
    lineHeight: 28.06,
    marginTop: 50,
    letterSpacing: 0.5,
    fontWeight: '700',
    textTransform: 'uppercase'
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
  },
  loginName: {
    color: '$darkGrey',
    fontSize: 16,
    lineHeight: 18.7,
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDisciplines)
