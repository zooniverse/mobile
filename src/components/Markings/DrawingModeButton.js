import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import PropTypes from 'prop-types';

import FontedText from '../common/FontedText';
import { useTranslation } from 'react-i18next';

function DrawingModeButton({ onPress }) {
  const isTablet = DeviceInfo.isTablet();
  const maxWidth = isTablet ? 400 : 280;
  const {t} = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { height: isTablet ? 44 : 40, maxWidth }]}
    >
      <MaterialCommunityIcons name="vector-rectangle" size={22} color="#000" />
      <FontedText style={styles.text}>{t('Mobile.classifier.enterDrawingMode', 'Enter drawing mode')}</FontedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    borderWidth: 0.5,
    borderColor: '#005D69',
    backgroundColor: '#ADDDE066',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 44,
    width: '100%',
  },
  text: {
    fontSize: 16,
    lineHeight: 18.7,
    letterSpacing: 0.5,
    fontWeight: '700',
    paddingLeft: 8,
    color: '#000',
  },
});

DrawingModeButton.propTypes = {
  onPress: PropTypes.func,
};

export default DrawingModeButton;
