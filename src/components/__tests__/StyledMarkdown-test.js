import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'

jest.mock('WebView', () => 'WebView')

import StyledMarkdown from '../StyledMarkdown'

it('renders correctly', () => {
  const tree = renderer.create(
    <StyledMarkdown markdown={'What?'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})


it('renders extraCSS', () => {
  const tree = renderer.create(
    <StyledMarkdown markdown={'who?'} extraCSS={'font-size: 30;'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
