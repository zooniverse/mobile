import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { ProjectDisciplines } from '../ProjectDisciplines'

it('renders correctly', () => {
  const user ={ display_name: 'Fake User' }
  const tree = renderer.create(
    <ProjectDisciplines user={user} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
