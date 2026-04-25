/**
 * Shows the task's help text in a modal. Fresh replacement for the legacy
 * `TaskHelpModal` — functional, no HOCs. Uses the legacy `ButtonLarge`
 * for the close button to match styling exactly.
 */

import React from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import Modal from 'react-native-modal'
import Icon from 'react-native-vector-icons/Fontisto'
import { useTranslation } from 'react-i18next'

import SizedMarkdown from '../common/SizedMarkdown'
import FontedText from '../common/FontedText'
import ButtonLarge from './ButtonLarge'
import { getCurrentProjectLanguage } from '../../i18n'

const HelpModal = ({ isVisible, task, taskKey, onClose, inMuseumMode = false }) => {
  const { t } = useTranslation()

  const translationPath = `workflow.tasks.${taskKey}.help`
  const helpText = t(translationPath, task?.help, {
    ns: 'project',
    lng: getCurrentProjectLanguage(),
  })

  return (
    <Modal isVisible={isVisible}>
      <View style={styles.container}>
        <View style={styles.header}>
          <FontedText style={styles.headerText}>
            {t('Mobile.classifier.help', 'help')}
          </FontedText>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Icon name="close" color="#005D69" size={22} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <SizedMarkdown inMuseumMode={inMuseumMode}>
            {helpText}
          </SizedMarkdown>
        </ScrollView>
        <View style={styles.closeBtnContainer}>
          <ButtonLarge
            text={t('classifier.close', 'bClose')}
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 18,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.05,
    lineHeight: 21.04,
    color: '#005D69',
  },
  content: {
    paddingVertical: 5,
  },
  closeBtnContainer: {
    width: 190,
    marginTop: 16,
    alignSelf: 'center',
  },
})

export default HelpModal
