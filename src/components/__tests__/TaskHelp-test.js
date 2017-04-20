import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
jest.mock('WebView', () => 'WebView')
import TaskHelp from '../TaskHelp'

it('renders', () => {
  const tree = renderer.create(
    <TaskHelp text={'O Hai!'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('goes visible', () => {
  const tree = renderer.create(
    <TaskHelp text={'O Hai!'} />
  )

  tree.getInstance().setVisibility(true)

  expect(tree.toJSON()).toMatchSnapshot()
})
