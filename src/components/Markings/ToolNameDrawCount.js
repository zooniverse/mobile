import React from 'react';
import { View, StyleSheet } from 'react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import PropTypes from 'prop-types';

import FontedText from '../common/FontedText';
import { useTranslation } from 'react-i18next';
import { getCurrentProjectLanguage } from '../../i18n';

function ToolNameDrawCount({ label, number }) {
  const {t} = useTranslation()
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <FontAwesome5 name="shapes" size={18} color="#000000" />
        <FontedText numberOfLines={2} style={[styles.text, styles.toolText]}>
          {t('workflow.tasks.T0.tools.0.label', label, {ns: 'project', lng: getCurrentProjectLanguage()})}
        </FontedText>
      </View>
      <FontedText style={[styles.text, styles.drawnText]}>
        {t('Mobile.classifier.countDrawn', `${number} drawn`, {count: number})}
      </FontedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 16,
    alignItems: 'flex-start', // Ensure vertical alignment is centered
  },
  drawnText: {
    color: '#5C5C5C',
    marginRight: 4,
  },
  leftContainer: {
    flexDirection: 'row',
    flex: 0.96,
  },
  toolText: {
    color: '#000',
    paddingLeft: 8,
    flex: 1,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 18.7,
    letterSpacing: 0.5,
  },
});

ToolNameDrawCount.propTypes = {
  label: PropTypes.string,
  number: PropTypes.string,
};

export default ToolNameDrawCount;
