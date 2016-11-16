import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { NavBar } from '../NavBar'

const fakeUser={avatar: ''}

it('renders correctly with defaults', () => {
  const tree = renderer.create(
    <NavBar user={fakeUser} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with title', () => {
  const tree = renderer.create(
    <NavBar user={fakeUser} title={'OHai'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
