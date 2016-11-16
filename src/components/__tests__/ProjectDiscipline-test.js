import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { ProjectDisciplines } from '../ProjectDisciplines'

it('renders correctly when connected', () => {
  const user ={ display_name: 'Fake User' }
  const tree = renderer.create(
    <ProjectDisciplines user={user} isConnected={true} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('does not render when not connected', () => {
  const user ={ display_name: 'Fake User' }
  const tree = renderer.create(
    <ProjectDisciplines user={user} isConnected={false} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
