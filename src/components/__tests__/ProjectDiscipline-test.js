import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { ProjectDisciplines } from '../ProjectDisciplines'

jest.useFakeTimers();

const projectActions = {
  fetchProjects: () => {}
}

jest.mock('Alert', () => 'Alert')

it('renders correctly', () => {
  const user ={ display_name: 'Fake User' }
  const tree = renderer.create(
    <ProjectDisciplines user={user} projectList={[]} projectActions={projectActions} setNavbarSettingsForPage={()=>{}}/>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
