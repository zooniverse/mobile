import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Project from '../Project'

it('renders correctly', () => {
  const project = {
    avatar_src: 'fake_avatar',
    display_name: 'Nice project'
  }
  const tree = renderer.create(
    <Project project={project} color={'#AFA48C'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
