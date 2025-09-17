import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Workflow from '../Workflow'

const workflow = {
  id: '1',
  display_name: 'Nice workflow',
}

it('renders correctly', () => {
  const tree = renderer.create(
    <Workflow workflow={workflow} color={'#AFA48C'} openMobileProject={jest.fn}/>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
