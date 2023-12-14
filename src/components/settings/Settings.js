import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Text } from 'react-native';
import { SettingHeader, SettingsToggle } from './settingsComponents';
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

  const sortedProjects = [...projectSpecificNotifications].sort((a, b) => a.displayName.localeCompare(b.displayName));

  // Update the navigation header with the title and zoon icon.
  useEffect(() => {
    dispatch(
      setNavbarSettingsForPage(
        {
          title: 'Settings',
          showBack: true,
          centerType: 'title',
        },
        PageKeys.Settings
      )
    );
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View>
        <SettingHeader text="Notification Settings" />
      </View>
      <FontedText style={styles.disclosureText}>
        The Zooniverse app can occassionally send you updates about new projects
        or projects you might be interested in.
      </FontedText>
      <SettingsToggle
        style={styles.toggleSpacing}
        onToggle={() =>
          PushNotifications.settingToggled(
            ALL_NOTIFICATIONS,
            !enableNotifications
          )
        }
        title="Enable Notifications"
        value={enableNotifications}
      />
      <SettingsToggle
        style={styles.toggleSpacing}
        onToggle={() => {
          PushNotifications.settingToggled(NEW_PROJECTS, !newProjects);
        }}
        title="New Projects"
        value={newProjects}
        disabled={!enableNotifications}
      />
      <SettingsToggle
        style={styles.toggleSpacing}
        onToggle={() => {
          PushNotifications.settingToggled(NEW_BETA_PROJECTS, !newBetaProjects);
        }}
        title="New Beta Projects"
        value={newBetaProjects}
        disabled={!enableNotifications}
      />
      <SettingsToggle
        style={styles.toggleSpacing}
        onToggle={() => {
          PushNotifications.settingToggled(URGENT_HELP, !urgentHelpAlerts);
        }}
        title="Urgent Help Alerts"
        description="Notifications when projects need timely help"
        value={urgentHelpAlerts}
        disabled={!enableNotifications}
      />
      <FontedText style={styles.projectHeader}>
        Project-specific Notifications
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
    paddingBottom: 15,
  },
  disclosureText: {
    paddingBottom: 20,
  },
  projectHeader: {
    fontSize: 18,
    paddingBottom: 15,
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
    padding: 25,
  },
});

export default Settings;
