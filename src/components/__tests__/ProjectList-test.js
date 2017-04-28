import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { ProjectList } from '../ProjectList'
import Project from '../Project'

const project = {
  avatar_src: 'fake_avatar',
  display_name: 'Nice project',
  workflows: [{swipe_verified: true}],
  tags: ['nature']
}

const selectedProjectTag = 'nature'
const projectList = [project]

jest.mock('ListView', () => require('react').createClass({
    statics: {
        DataSource: require.requireActual('ListView').DataSource,
    },
    render() {
        return <Project project={project} color={'#AFA48C'}/>
    },
}))

it('renders correctly', () => {
  const tree = renderer.create(
    <ProjectList projectList={projectList} selectedProjectTag={selectedProjectTag} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
