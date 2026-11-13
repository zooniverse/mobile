import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
  useWindowDimensions
} from 'react-native'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import ImageAndTextViewer from '../ImageAndTextViewer'
import ButtonLarge from '../ButtonLarge'
import ChainBackButton from '../ChainBackButton'
import { getNextTaskKey } from '../../../utils/taskChain'
import {
  recordAnnotation,
  advanceTo,
  startChain,
  incrementClassificationCount,
  selectActiveAnnotations
} from '../../../reducers/classifierSlice'
import { submitChoiceClassification } from '../../../actions/choiceClassification'

export default function TextFromSubject({
  subject,
  subjectText: original,
  task,
  taskKey,
  workflow,
  onAdvance,
  onExpandMedia
}) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const annotations = useSelector(selectActiveAnnotations, shallowEqual)
  const prior = annotations.find(annotation => annotation.task === taskKey)
  // Undefined means not edited; an empty string is a deliberate answer.
  const [draft, setDraft] = useState(prior?.value)
  const value = draft === undefined ? (original.text ?? '') : draft
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)
  const busy = useRef(false)
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0
  })
  const startTime = useSelector(state => state.classification.subjectStartTime)
  const userLanguage = useSelector(state => state.languageSettings?.platformLanguage ?? 'en')
  const sessionId = useSelector(state => state.main?.session?.id)
  const isPreviewMode = useSelector(state => state.classifier?.inPreviewMode)
  const isGuest = useSelector(state => state.user?.isGuestUser)
  const viewport = useWindowDimensions()
  const next = getNextTaskKey(task)
  const update = text => {
    setDraft(text)
    dispatch(
      recordAnnotation({ taskKey, annotation: { task: taskKey, value: text } })
    )
  }
  const submit = async () => {
    if (
      busy.current ||
      original.status !== 'success' ||
      (task.required && value === '')
    )
      return
    Keyboard.dismiss()
    const annotation = { task: taskKey, value }
    dispatch(recordAnnotation({ taskKey, annotation }))
    if (next) {
      dispatch(
        advanceTo({ fromTaskKey: taskKey, answerValue: value, toTaskKey: next })
      )
      return
    }
    busy.current = true
    setSaving(true)
    setFailed(false)
    const success = await submitChoiceClassification({
      workflow,
      subject,
      annotations: [
        ...annotations.filter(item => item.task !== taskKey),
        annotation
      ],
      startTime,
      displayDimensions,
      viewport: { width: viewport.width, height: viewport.height },
      sessionId,
      userLanguage,
      isPreviewMode
    })
    busy.current = false
    setSaving(false)
    if (!success) {
      setFailed(true)
      return
    }
    dispatch(startChain({ taskKey: workflow.first_task }))
    if (!isGuest && !isPreviewMode) dispatch(incrementClassificationCount())
    onAdvance?.()
  }
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View
          onLayout={event => setDisplayDimensions(event.nativeEvent.layout)}
        >
          <ImageAndTextViewer
            original={original}
            adaptiveHeight
            subject={subject}
            onPress={onExpandMedia}
            height={Math.min(200, viewport.height * 0.24)}
          />
        </View>
        {original.status === 'error' && (
          <ButtonLarge
            text={t('Mobile.ocr.retryText', 'Retry loading text')}
            onPress={original.retry}
          />
        )}
        <TextInput
          accessibilityLabel={t('Mobile.ocr.answer', 'Correct the text')}
          value={value}
          onChangeText={update}
          editable={original.status === 'success' && !saving}
          multiline
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          textAlignVertical="top"
          style={styles.input}
        />
      </ScrollView>
      <View style={styles.navigation}>
        <ButtonLarge
          text={t('Mobile.ocr.reset', 'Reset')}
          disabled={
            saving || original.status !== 'success' || value === original.text
          }
          onPress={() => update(original.text)}
        />
        <ChainBackButton disabled={saving} />
        {failed && (
          <Text accessibilityRole="alert" style={styles.error}>
            {t(
              'Mobile.ocr.saveError',
              'Could not submit. Your answers are saved here. Please try again.'
            )}
          </Text>
        )}
        <ButtonLarge
          disabled={
            saving ||
            original.status !== 'success' ||
            (task.required && value === '')
          }
          text={
            saving
              ? t('Mobile.ocr.saving', 'Submitting…')
              : next
                ? t('Mobile.classifier.next', 'Next')
                : t('Mobile.classifier.done', 'Done')
          }
          onPress={submit}
        />
      </View>
    </KeyboardAvoidingView>
  )
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: 12, gap: 12 },
  input: {
    marginHorizontal: 12,
    minHeight: 80,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#005D69',
    backgroundColor: '#fff',
    color: '#222',
    fontSize: 20,
    padding: 12
  },
  navigation: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8
  },
  error: { color: '#a11919', backgroundColor: '#fff', padding: 8 }
})
