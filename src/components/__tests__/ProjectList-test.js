import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { ProjectList } from '../ProjectList'

const project = {
  avatar_src: 'fake_avatar',
  display_name: 'Nice project',
  workflows: [{swipe_verified: true}],
  tags: ['nature'],
}

const selectedProjectTag = 'nature'
const projectList = [project]

it('renders correctly', () => {
  const tree = renderer.create(
    <ProjectList projectList={projectList} selectedProjectTag={selectedProjectTag} color='#AFA48C' />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
