import { Image } from 'react-native'
import apiClient from 'panoptes-client/lib/api-client'
import { submitChoiceClassification } from '../choiceClassification'
jest.mock('react-native-device-info', () => ({ getVersion: () => '2.17.0', getBuildNumber: () => '67' }))
jest.mock('panoptes-client/lib/api-client', () => ({ type: jest.fn() }))
jest.mock('../../notifications/PushNotifications', () => ({
  PushNotifications: { userClassifiedProject: jest.fn() }
}))
const args = {
  workflow: { id: '32497', version: '1', links: { project: '32778' }, tasks: { T0: { type: 'textFromSubject' }, T1: { type: 'multiple' } } },
  subject: {
    id: 'subject',
    already_seen: true,
    finished_workflow: false,
    retired: true,
    selected_at: '2026-09-14T12:00:00.000Z',
    selection_state: 'normal',
    user_has_finished_workflow: false,
    displays: [
      { type: 'image', src: 'image' },
      { type: 'text', src: 'text' }
    ]
  },
  annotations: [
    { task: 'T0', value: "Woman's" },
    { task: 'T1', value: [1] }
  ],
  userLanguage: 'es',
  displayDimensions: { width: 100, height: 100 }
}
it('submits both answers without measuring the text URL', async () => {
  const getSize = jest
    .spyOn(Image, 'getSize')
    .mockImplementation((url, done) => done(100, 100))
  const create = jest.fn(() => ({ save: async () => ({ completed: true }) }))
  apiClient.type.mockReturnValue({ create })
  expect(await submitChoiceClassification(args)).toBe(true)
  const payload = create.mock.calls[0][0]
  expect(payload.annotations).toEqual([
    { task: 'T0', taskType: 'textFromSubject', value: "Woman's" },
    { task: 'T1', taskType: 'multiple', value: [1] }
  ])
  expect(payload.metadata).toMatchObject({
    classifier_version: '2.17.0', revision: '67', user_language: 'es',
    source: 'api', feedback: {}, subject_flagged: false,
    subject_selection_state: {
      already_seen: true, finished_workflow: false, retired: true,
      selected_at: '2026-09-14T12:00:00.000Z', selection_state: 'normal',
      user_has_finished_workflow: false
    },
    subject_dimensions: [{ naturalWidth: 100, naturalHeight: 100, clientWidth: 100, clientHeight: 100 }]
  })
  expect(args.annotations[0]).not.toHaveProperty('taskType')
  expect(getSize).toHaveBeenCalledTimes(1)
  expect(getSize.mock.calls[0][0]).toBe('image')
  getSize.mockRestore()
})
it('reports failure and can retry the same answers', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  const save = jest
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ completed: true })
  apiClient.type.mockReturnValue({ create: () => ({ save }) })
  const input = { ...args, subject: { id: 'subject', displays: [] } }
  expect(await submitChoiceClassification(input)).toBe(false)
  expect(await submitChoiceClassification(input)).toBe(true)
  jest.restoreAllMocks()
})

it('preserves real feedback and detects intervention subjects for OCR', async () => {
  const create = jest.fn(() => ({ save: async () => ({ completed: true }) }))
  apiClient.type.mockReturnValue({ create })
  const feedbackMeta = { T1: [{ success: true }] }
  await submitChoiceClassification({ ...args, subject: { ...args.subject, displays: [], metadata: { intervention: true } }, feedbackMeta })
  expect(create.mock.calls[0][0].metadata).toMatchObject({ source: 'sugar', feedback: feedbackMeta, subject_dimensions: [] })
})
it('retains the existing non-OCR payload, including language and dimensions behavior', async () => {
  const getSize = jest.spyOn(Image, 'getSize').mockImplementation((url, done) => done(100, 100))
  const create = jest.fn(() => ({ save: async () => ({ completed: true }) }))
  apiClient.type.mockReturnValue({ create })
  await submitChoiceClassification({ ...args, workflow: { ...args.workflow, tasks: { T0: { type: 'single' }, T1: { type: 'multiple' } } } })
  const payload = create.mock.calls[0][0]
  expect(payload.annotations).toEqual(args.annotations)
  expect(payload.metadata).toEqual({
    workflow_version: '1', started_at: undefined, finished_at: expect.any(String),
    user_agent: 'ios Mobile App', user_language: 'en',
    utc_offset: (new Date().getTimezoneOffset() * 60).toString(),
    subject_dimensions: [{ naturalWidth: 100, naturalHeight: 100, clientWidth: 100, clientHeight: 100 }, {}],
    viewport: undefined, session: undefined
  })
  getSize.mockRestore()
})
