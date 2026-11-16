import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCurrentProjectLanguage } from '../../i18n'
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import FontedText from '../common/FontedText'
import Icon from '@react-native-vector-icons/fontisto/static'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function DrawingToolSelector({ tools, counts, selectedIndex, onSelect, taskKey }) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  return (
    <>
      <TouchableOpacity accessibilityRole="button" onPress={() => setVisible(true)} style={styles.trigger}>
        <FontedText style={styles.triggerText}>{t('Mobile.classifier.toolsAvailable', { count: tools.length })}</FontedText>
        <FontedText style={styles.count}>{t('Mobile.classifier.countDrawn', { count: counts.reduce((sum, count) => sum + count, 0) })}</FontedText>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} accessibilityRole="button" accessibilityLabel={t('Mobile.classifier.closeToolSelector')} onPress={() => setVisible(false)} />
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <View style={styles.header}>
              <FontedText accessibilityRole="header" style={styles.title}>{t('Mobile.classifier.chooseTool')}</FontedText>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('Mobile.classifier.closeToolSelector')} onPress={() => setVisible(false)} style={styles.close}>
                <Icon name="close" color="#005D69" size={22} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {tools.map((tool, index) => {
                const selected = index === selectedIndex
                return (
                  <TouchableOpacity
                    key={index}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => { onSelect(index); setVisible(false) }}
                    style={[styles.row, selected && styles.selectedRow]}
                  >
                    <View style={styles.swatch}><View style={[styles.rectangle, { borderColor: tool.color }]} /></View>
                    <FontedText style={[styles.label, selected && styles.selectedText]}>{t(`workflow.tasks.${taskKey}.tools.${index}.label`, { defaultValue: tool.label, ns: 'project', lng: getCurrentProjectLanguage() })}</FontedText>
                    <FontedText style={[styles.rowCount, selected && styles.selectedText]}>{t('Mobile.classifier.countDrawn', { count: counts[index] })}</FontedText>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  trigger: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  triggerText: { color: '#005D69', fontSize: 16, fontWeight: '600', lineHeight: 18.7, letterSpacing: 0.5 },
  count: { color: '#5C5C5C', fontSize: 16, fontWeight: '600', lineHeight: 18.7, letterSpacing: 0.5 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { backgroundColor: '#fff', padding: 16, maxHeight: '80%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#005D69' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F2', borderWidth: 2, borderColor: '#CCC', marginBottom: 12, minHeight: 64 },
  selectedRow: { backgroundColor: '#007F89', borderColor: '#005D69' },
  swatch: { width: 54, alignSelf: 'stretch', backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  rectangle: { width: 24, height: 16, borderWidth: 2 },
  label: { flex: 1, color: '#595959', fontSize: 16, padding: 12 },
  rowCount: { color: '#595959', fontSize: 14, paddingRight: 12 },
  selectedText: { color: '#fff' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
})
