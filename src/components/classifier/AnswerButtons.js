/**
 * Renders a button for each answer option on the current task. Delegates
 * button rendering to the legacy `ButtonAnswer` component so styling
 * matches the existing classifier exactly.
 *
 * Shared between `SingleChoice` and `MultiSelect` workflow types — pass
 * `multiSelect` to switch between radio-style and checkbox-style selection.
 * Selection state is owned by the parent and passed in via
 * `selectedIndex` (single) or `selectedIndices` (multi).
 *
 * Layout rule copied from legacy:
 * - If any answer label is ≥ 25 characters, buttons stack full-width.
 * - Otherwise, they flow in a row with wrap so they sit roughly half-width.
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import ButtonAnswer from './ButtonAnswer'
import { getCurrentProjectLanguage } from '../../i18n'

const AnswerButtons = ({
  answers = [],
  taskKey,
  selectedIndex = -1,
  selectedIndices = [],
  multiSelect = false,
  onSelect,
}) => {
  const { t } = useTranslation()
  const fullWidth = answers.some((a) => a.label?.length >= 25)
  const layoutStyle = fullWidth ? null : styles.row

  const isSelected = (index) =>
    multiSelect ? selectedIndices.includes(index) : index === selectedIndex

  return (
    <View style={[styles.container, layoutStyle]}>
      {answers.map((answer, index) => (
        <View key={index}>
          <ButtonAnswer
            selected={isSelected(index)}
            text={t(
              `workflow.tasks.${taskKey}.answers.${index}.label`,
              answer.label,
              { ns: 'project', lng: getCurrentProjectLanguage() }
            )}
            onPress={() => onSelect?.(index)}
            fullWidth={fullWidth}
          />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
})

export default AnswerButtons
