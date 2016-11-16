import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { ProjectList } from '../ProjectList'
import Project from '../Project'

const project = {
  avatar_src: 'fake_avatar',
  display_name: 'Nice project'
}

jest.mock('ListView', () => require('react').createClass({
    statics: {
        DataSource: require.requireActual('ListView').DataSource,
    },
    render() {
        return <Project project={project} />
    },
}))

it('renders correctly', () => {
  const tree = renderer.create(
    <ProjectList isConnected={true} fetchProjects={jest.fn} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
