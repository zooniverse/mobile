import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
jest.mock('WebView', () => 'WebView')
import { Question } from '../Question'

it('renders correctly (without task help)', () => {
  const tree = renderer.create(
    <Question
      question={'Is this this?'}
      questionContainerHeight={25}
      setQuestionContainerHeight={jest.fn}
      />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with task help', () => {
  const tree = renderer.create(
    <Question
      question={'Is this this?'}
      questionContainerHeight={25}
      setQuestionContainerHeight={jest.fn}
      taskHelp={'Halp!'}
      />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
