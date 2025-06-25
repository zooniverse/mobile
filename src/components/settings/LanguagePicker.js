import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SettingHeader } from './settingsComponents';
import { setPlatformLanguage } from '../../reducers/languageSettingsSlice';
import { changePlatformLanguage } from '../../i18n';
import { useDispatch, useSelector } from 'react-redux';
import languageOptions from '../../i18n/languages';

// Transform languageOptions to the format required by Dropdown
console.log({ languageOptions });
const dropdownLanguageOptions = Object.entries(languageOptions).map(
  ([value, label]) => ({
    label,
    value,
  })
);

const LanguagePicker = () => {
  const dispatch = useDispatch();
  const platformLanguage = useSelector(
    (state) => state.languageSettings.platformLanguage
  );

  const handleLanguageChange = async (lang) => {
    dispatch(setPlatformLanguage(lang));
    await changePlatformLanguage(lang);
  };

  return (
    <View style={styles.languageSection}>
      <SettingHeader text="Language" />
      <View style={styles.dropDownContainer}>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={dropdownLanguageOptions}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Language"
          searchPlaceholder="Search language"
          value={platformLanguage}
          onChange={(item) => {
            handleLanguageChange(item.value);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  languageSection: {
    // paddingTop: 8,
    paddingBottom: 8,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dropDownContainer: {
    marginTop: 4,
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'gray',
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default LanguagePicker;
