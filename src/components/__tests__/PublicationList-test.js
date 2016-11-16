import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { PublicationList } from '../PublicationList'

const disciplines = ['science']
const publications = {
  'science': {
    'projects': {}
  }
}

it('renders correctly', () => {
  const tree = renderer.create(
    <PublicationList
      isConnected={true}
      disciplines={disciplines}
      selectedDiscipline={'science'}
      publications={publications}
      fetchPublications={jest.fn}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
