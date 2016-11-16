import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import PublicationFilter from '../PublicationFilter'

const disciplines = ['science']

it('renders correctly', () => {
  const tree = renderer.create(
    <PublicationFilter isConnected={true} disciplines={disciplines} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('does not render when not connected', () => {
  const tree = renderer.create(
    <PublicationFilter isConnected={false} disciplines={disciplines} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders selected discipline', () => {
  const tree = renderer.create(
    <PublicationFilter isConnected={false} disciplines={disciplines} selectedDiscipline={'science'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
