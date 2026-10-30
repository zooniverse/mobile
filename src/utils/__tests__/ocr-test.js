import getSubjectLocations from '../get-subject-location'
import { isValidMobileWorkflow } from '../workflow-utils'
import reducer, {
  startChain,
  recordAnnotation,
  advanceTo,
  goBack,
  selectActiveAnnotations
} from '../../reducers/classifierSlice'
const workflow = () => ({
  first_task: 'T0',
  tasks: {
    T0: { type: 'textFromSubject', next: 'T1' },
    T1: { type: 'multiple', question: 'Issues?', answers: [{ label: 'None' }] }
  }
})
it('handles OCR text while preserving the existing handling of other locations', () => {
  expect(
    getSubjectLocations({
      locations: [
        { 'image/jpeg': 'image' },
        { 'text/plain': 'text' },
        { 'application/pdf': 'pdf' }
      ]
    })
  ).toEqual([
    { type: 'image', format: 'jpeg', src: 'image' },
    { type: 'text', format: 'plain', src: 'text' },
    { type: 'application', format: 'pdf', src: 'pdf' }
  ])
})
it('accepts the OCR chain through ordinary workflow validation', () => {
  const value = workflow()
  expect(isValidMobileWorkflow(value)).toBe(true)
  expect(value.type).toBe('textFromSubject')
})
it.each(['missing', 'cycle', 'unsupported'])(
  'rejects %s OCR transitions',
  kind => {
    const value = workflow()
    if (kind === 'missing') value.tasks.T0.next = 'absent'
    if (kind === 'cycle') value.tasks.T1.next = 'T0'
    if (kind === 'unsupported') value.tasks.T1.type = 'unknown'
    expect(isValidMobileWorkflow(value)).toBe(false)
  }
)
it('preserves exact OCR text on Back and clears it on the next subject', () => {
  let state = reducer(undefined, startChain({ taskKey: 'T0' }))
  const annotation = { task: 'T0', value: '  Woman’s\n' }
  state = reducer(state, recordAnnotation({ taskKey: 'T0', annotation }))
  state = reducer(
    state,
    advanceTo({
      fromTaskKey: 'T0',
      toTaskKey: 'T1',
      answerValue: annotation.value
    })
  )
  state = reducer(state, goBack())
  expect(selectActiveAnnotations({ classification: state })).toEqual([
    annotation
  ])
  state = reducer(state, startChain({ taskKey: 'T0' }))
  expect(selectActiveAnnotations({ classification: state })).toEqual([])
})
