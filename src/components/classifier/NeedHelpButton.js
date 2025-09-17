import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontedText from '../common/FontedText';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const NeedHelpButton = ({ onPress, inMuseumMode = false }) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <FontedText style={styles.needHelpText}>
        {t('classifier.taskHelpButton', 'Need some help with this task?')}
      </FontedText>
    </TouchableOpacity>
  );
};

NeedHelpButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  inMuseumMode: PropTypes.bool,
};

NeedHelpButton.defaultProps = {
  inMuseumMode: false,
};

const styles = {
  container: {
    marginBottom: 12,
  },
  needHelpText: {
    fontSize: 12,
    lineHeight: 14.03,
    letterSpacing: 0.5,
    color: '#272727',
    textTransform: 'uppercase',
  },
};

export default NeedHelpButton;
