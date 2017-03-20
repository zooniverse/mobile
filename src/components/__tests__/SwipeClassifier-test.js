import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'

jest.mock('WebView', () => 'WebView')
jest.mock('../OverlaySpinner', () => 'OverlaySpinner')
jest.mock('../Question', () => 'Question')
jest.mock('../Tutorial', () => 'Tutorial')

import { SwipeClassifier } from '../SwipeClassifier'

const workflow = {
  first_task: 'T0',
  tasks: {
    T0: {
      question: 'What was that?'
    }
  }
}

const project = {
  display_name: 'Awesome project'
}

it('renders correctly', () => {
  const tree = renderer.create(
    <SwipeClassifier
      isFetching={false}
      setIsFetching={jest.fn}
      startNewClassification={jest.fn}
      project={project}
      workflow={workflow}
      workflowID={'1'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders spinner if fetching', () => {
  const tree = renderer.create(
    <SwipeClassifier
      isFetching={true}
      setIsFetching={jest.fn}
      startNewClassification={jest.fn}
      project={project}
      workflow={workflow}
      workflowID={'1'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders tutorial if needed', () => {
  const tree = renderer.create(
    <SwipeClassifier
      isFetching={false}
      setIsFetching={jest.fn}
      startNewClassification={jest.fn}
      needsTutorial={true}
      project={project}
      workflow={workflow}
      workflowID={'1'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
