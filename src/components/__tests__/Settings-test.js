import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { Settings } from '../Settings'

jest.mock('Switch', () => 'Switch');

const notifications = {
  'general': true
}

const settings = {
  'promptForWorkflow': true
}

it('renders', () => {
  const tree = renderer.create(
    <Settings
      notifications={notifications}
      checkPushPermissions={jest.fn}
      pushEnabled={true}
      settings={settings}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders message if push is disabled', () => {
  const tree = renderer.create(
    <Settings
      notifications={notifications}
      checkPushPermissions={jest.fn}
      pushEnabled={false}
      settings={settings}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
