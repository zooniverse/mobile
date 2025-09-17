import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { OverlaySpinner } from '../OverlaySpinner'

it('renders for isFetching', () => {
  const tree = renderer.create(
    <OverlaySpinner isFetching={true} loadingText={'Loading!'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders nothing for isFetching false', () => {
  const tree = renderer.create(
    <OverlaySpinner isFetching={false} loadingText={''} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
