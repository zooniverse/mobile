import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
} from 'react-native';
import { PlatformSetting, SettingHeader, SettingsToggle } from './settingsComponents';
import FontedText from '../common/FontedText';
import { useDispatch, useSelector } from 'react-redux';
import { setNavbarSettingsForPage } from '../../actions/navBar';
import PageKeys from '../../constants/PageKeys';
import {
  ALL_NOTIFICATIONS,
  NEW_BETA_PROJECTS,
  NEW_PROJECTS,
  PushNotifications,
  URGENT_HELP,
} from '../../notifications/PushNotifications';

function Settings(props) {
  const dispatch = useDispatch();
  const {
    enableNotifications,
    newProjects,
    newBetaProjects,
    urgentHelpAlerts,
    projectSpecificNotifications,
  } = useSelector((state) => state.notificationSettings);

  const {isGuestUser} = useSelector(state => state.user)

  const sortedProjects = [...projectSpecificNotifications].sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  // Update the navigation header with the title and zoon icon.
  useEffect(() => {
    dispatch(
      setNavbarSettingsForPage(
        {
          title: 'Settings',
          showBack: true,
          centerType: 'title',
          showIcon: true
        },
        PageKeys.Settings
      )
    );
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      {!isGuestUser && (
        <View>
          <View>
            <SettingHeader text="Platform Settings" />
          </View>
          <PlatformSetting text="Zooniverse account information" link="https://www.zooniverse.org/settings" />
          <PlatformSetting text="Delete my account" link="https://panoptes.zooniverse.org/profile" />
        </View>
      )}
      <View>
        <SettingHeader text="Notification Settings" />
      </View>
      <FontedText style={styles.disclosureText}>
      The Zooniverse can occasionally send you updates about new projects or projects you might be interested in.
      </FontedText>
      <SettingsToggle
        style={styles.toggleSpacing}
        onToggle={() =>
          PushNotifications.settingToggled(
            ALL_NOTIFICATIONS,
            !enableNotifications
          )
        }
        title="Enable notifications"
        value={enableNotifications}
      />
      <SettingsToggle
        style={styles.toggleSpacing}
        onToggle={() => {
          PushNotifications.settingToggled(NEW_PROJECTS, !newProjects);
        }}
        title="New projects"
        value={newProjects}
        disabled={!enableNotifications}
      />
      <SettingsToggle
        style={styles.toggleSpacing}
        onToggle={() => {
          PushNotifications.settingToggled(NEW_BETA_PROJECTS, !newBetaProjects);
        }}
        title="New beta projects"
        value={newBetaProjects}
        disabled={!enableNotifications}
      />
      <SettingsToggle
        style={styles.toggleSpacing}
        onToggle={() => {
          PushNotifications.settingToggled(URGENT_HELP, !urgentHelpAlerts);
        }}
        title="Urgent help alerts"
        description="Notifications when projects need timely help."
        value={urgentHelpAlerts}
        disabled={!enableNotifications}
      />
      <FontedText style={styles.projectHeader}>
        Project-specific notifications
      </FontedText>
      <FlatList
        data={sortedProjects}
        renderItem={({ item }) => (
          <SettingsToggle
            value={item.subscribed}
            onToggle={() => {
              PushNotifications.projectSettingToggled(item, !item.subscribed);
            }}
            title={item.displayName}
            disabled={!enableNotifications}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separatorStyle} />}
        keyExtractor={(item) => item.id}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  toggleSpacing: {
    paddingBottom: 8,
  },
  disclosureText: {
    fontSize: 13,
    lineHeight: 16.37,
    color: '#5C5C5C',
    paddingBottom: 8,
  },
  projectHeader: {
    fontSize: 16,
    lineHeight: 18.7,
    fontWeight: '700',
    paddingBottom: 8,
    marginTop: 8,
  },
  separatorStyle: {
    paddingTop: 10,
  },
  titlePadding: {
    paddingBottom: 30,
  },
  workflowContainer: {
    paddingTop: 20,
    paddingBottom: 35,
  },
  scrollViewContainer: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
});

export default Settings;
