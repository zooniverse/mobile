import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
jest.mock('../SwipeSubject', () => 'SwipeSubject')

import { Swipeable } from '../Swipeable'

const workflow = {
  first_task: 'T0',
  tasks: {
    T0: {
      question: 'Is it?',
      answers: [ { label: 'Yes' }, { label: 'No' } ],
    }
  }
}
const subjectSizes = {
  resizedWidth: 100,
  resizedHeight: 100
}
const subject = {
    id: '3424'
}
const nextSubject = {
    id: '234'
}

const answers=[
  { label: 'No' },
  { label: 'Yes' },
]

it('renders correctly', () => {
  const tree = renderer.create(
    <Swipeable
      saveAnnotation={jest.fn}
      saveThenStartNewClassification={jest.fn}
      workflow={workflow}
      subjectSizes={subjectSizes}
      subject={subject}
      nextSubject={nextSubject}
      onAnswered={jest.fn}
      answers={answers}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
