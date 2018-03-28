import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { ProjectDisciplines } from '../ProjectDisciplines'

jest.useFakeTimers();

const projectActions = {
  fetchProjectsWithTags: () => {}
}

it('renders correctly', () => {
  const user ={ display_name: 'Fake User' }
  const tree = renderer.create(
    <ProjectDisciplines user={user} projectList={[]} projectActions={projectActions} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
