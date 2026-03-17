/**
 * Yes/No button controls for the Swiper classifier.
 * Alternative to swiping for accessibility and museum kiosk mode.
 *
 * Button presses trigger the same swipe flow as gestures —
 * triggerSwipe() respects the state machine lock so rapid
 * presses can't cause double-fires.
 */

import React from 'react';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { withTranslation } from 'react-i18next';
import { getCurrentProjectLanguage } from '../../../i18n';
import ButtonAnswer from '../ButtonAnswer';

const SwiperTabs = ({
  onLeftButtonPressed,
  onRightButtonPressed,
  answers,
  t,
}) => {
  // Adaptive layout: full-width buttons if any label is long
  const fullWidthAnswers = answers?.some((a) => a.label.length >= 25) || false;
  const answerContainerStyles = fullWidthAnswers
    ? {}
    : { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' };

  return (
    <View style={[styles.container, answerContainerStyles]}>
      <ButtonAnswer
        onPress={onLeftButtonPressed}
        text={t(
          'workflow.tasks.T0.answers.1.label',
          answers?.[0]?.label || 'No',
          { ns: 'project', lng: getCurrentProjectLanguage() }
        )}
        fullWidth={fullWidthAnswers}
      />
      <ButtonAnswer
        onPress={onRightButtonPressed}
        text={t(
          'workflow.tasks.T0.answers.0.label',
          answers?.[1]?.label || 'Yes',
          { ns: 'project', lng: getCurrentProjectLanguage() }
        )}
        fullWidth={fullWidthAnswers}
      />
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    marginHorizontal: 12,
    paddingVertical: 16,
  },
});

export default withTranslation()(SwiperTabs);
