import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { NotificationSettings } from '../NotificationSettings'

jest.mock('Switch', () => 'Switch');

const notifications = {
  'general': true
}

it('renders', () => {
  const tree = renderer.create(
    <NotificationSettings notifications={notifications} checkPushPermissions={jest.fn} pushEnabled={true} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders message if push is disabled', () => {
  const tree = renderer.create(
    <NotificationSettings notifications={{}} checkPushPermissions={jest.fn} pushEnabled={false} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
