import React from 'react';
import { Alert, Linking, TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import Feather from 'react-native-vector-icons/Feather';
import Toggle from 'react-native-toggle-element'

import FontedText from '../common/FontedText';
import EStyleSheet from 'react-native-extended-stylesheet';

export const SettingHeader = ({ text }) => {
  return (
    <View style={styles.settingsHeaderContainer}>
      <FontedText style={styles.settingHeader}>{text}</FontedText>
    </View>
  );
};

const SettingText = ({ text }) => (
  <FontedText style={styles.text}>{text}</FontedText>
);

const OpenInBrowserIcon = () => (
  <Feather
    name="external-link"
    color="#5C5C5C"
    size={16}
    style={{ marginLeft: 8, marginTop: 2 }}
  />
);

const openExternalLink = (text, link) => {
  Linking.canOpenURL(link).then((supported) => {
    if (supported) {
      Linking.openURL(link);
    } else {
      Alert.alert(
        'Error',
        `Sorry, but it looks like ${text} is currently unavailable.`
      );
    }
  });
};

export const PlatformSetting = ({ text, link }) => (
  <TouchableOpacity
    onPress={() => openExternalLink(text, link)}
    style={{ flexDirection: 'row', marginVertical: 6 }}
  >
    <SettingText text={text} />
    <OpenInBrowserIcon />
  </TouchableOpacity>
);

const trackBarStyles = {
  height: 8,
  width: 23,
  activeBackgroundColor: '#ADDDE0',
  inActiveBackgroundColor: '#A6A7A9',
}

const thumbButtonStyles = {
  width: 14,
  height: 14,
  radius: 7,
  activeBackgroundColor: '#005D69',
  inActiveBackgroundColor: '#EBEBEB'
}

export const SettingsToggle = ({
  onToggle,
  title,
  description,
  value,
  disabled,
  style,
}) => {
  return (
    <View style={style}>
      <View style={styles.settingsToggleContainer}>
        <Toggle
          value={value}
          onPress={onToggle}
          disabled={disabled}
          trackBar={trackBarStyles}
          thumbButton={thumbButtonStyles}
        />
        <View style={styles.toggleTextContainer}>
          <SettingText text={title} />
          {description ? <FontedText>{description}</FontedText> : null}
        </View>
      </View>
    </View>
  );
};

SettingHeader.propTypes = {
  text: PropTypes.string,
};

SettingsToggle.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  onToggle: PropTypes.func,
  style: PropTypes.any,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
};

const styles = EStyleSheet.create({
  settingsToggleContainer: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 18,
    lineHeight: 21.04,
    color: '#5C5C5C',
  },
  toggleTextContainer: {
    flex: 1,
    paddingLeft: 15,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '$headerGrey',
  },
  settingHeader: {
    color: '#000',
    fontSize: 18,
    lineHeight: 21.04,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  settingsHeaderContainer: {
    marginTop: 8,
    marginBottom: 2,
  },
});
