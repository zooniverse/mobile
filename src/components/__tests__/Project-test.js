import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Project from '../Project'
jest.useFakeTimers();


const project = {
  avatar_src: 'fake_avatar',
  display_name: 'Nice project',
}

const projectNoAvatar = {
  avatar_src: '',
  display_name: 'Nice project'
}

it('renders correctly', () => {
  const tree = renderer.create(
    <Project project={project} color={'#AFA48C'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders wallpaper if no avatar', () => {
  const tree = renderer.create(
    <Project project={projectNoAvatar} color={'#AFA48C'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})


it('renders mobile icon for mobile projects', () => {
  const tree = renderer.create(
    <Project project={project} color={'#AFA48C'} mobileWorkflows={[{workflowID: 1}]}/>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})


it('renders workflow rows for multi mobile projects', () => {
  const tree = renderer.create(
    <Project project={project} color={'#AFA48C'} mobileWorkflows={[{workflowID: 1}, {workflowID: 2}]}/>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
