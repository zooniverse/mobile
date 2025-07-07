import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import PropTypes from 'prop-types';

import FontedText from '../common/FontedText';
import { useTranslation } from 'react-i18next';

function ButtonsDrawingModal({ onCancel, onSave }) {
  const {t} = useTranslation()
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, styles.btnCancel]}
        onPress={onCancel}
      >
        <FontedText style={[styles.text, styles.textCancel]}>{t('tasks.survey.cancel', 'Cancel')}</FontedText>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={onSave}>
        <FontedText style={[styles.text, styles.textSave]}>
          Save & Close
        </FontedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginTop: 16,
    justifyContent: 'center',
  },
  btn: {
    height: 40,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  btnCancel: {
    backgroundColor: 'rgba(173, 221, 224, 0.4)',
    maxWidth: 270,
  },
  btnSave: {
    backgroundColor: '#005D69',
    maxWidth: 400,
  },
  text: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 18.7,
    letterSpacing: 0.5,
  },
  textCancel: {
    color: '#000',
  },
  textSave: {
    color: '#fff',
  },
});

ButtonsDrawingModal.propTypes = {
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
};

export default ButtonsDrawingModal;
