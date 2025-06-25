import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';

import FontedText from '../common/FontedText';
import { useTranslation } from 'react-i18next';

function FieldGuideBtn({ onPress }) {
  const {t} = useTranslation()
  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF', '#FFFFFF']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          locations={[0, 0.8201, 1]}
          style={styles.gradient}
        >
          <Feather name="map" size={16} color="#005D69" />
          <FontedText style={styles.text}>{t('project.fieldGuide', 'FIELD GUIDE')}</FontedText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    borderBottomWidth: 0,
    borderColor: '#00979D',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    alignSelf: 'flex-start',
    height: 40,
    paddingHorizontal: 1, // small buffer to prevent clipping
  },
  gradient: {
    paddingHorizontal: 12,
    height: '100%',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '500',
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#005D69',
    marginLeft: 4,
    textTransform: 'uppercase'
  },
});

FieldGuideBtn.propTypes = {
  onPress: PropTypes.func,
};

export default FieldGuideBtn;
