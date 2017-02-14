import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { ProjectNotification } from '../ProjectNotification'

jest.mock('Switch', () => 'Switch');

it('renders checked', () => {
  const tree = renderer.create(
    <ProjectNotification id={'1'} name={'test'} notification={true} updateProjectNotification={jest.fn} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders not checked', () => {
  const tree = renderer.create(
    <ProjectNotification id={'1'} name={'test'} notification={false} updateProjectNotification={jest.fn} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
