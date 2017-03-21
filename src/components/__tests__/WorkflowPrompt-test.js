import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import WorkflowPrompt from '../WorkflowPrompt'

const mobileWorkflows=[
  {id: 1, display_name: 'Mobile 1'},
  {id: 2, display_name: 'Mobile 2'}
]

const nonMobileWorkflows=[
  {id: 1, display_name: 'Non 1'},
  {id: 2, display_name: 'Non 2'}
]

it('renders correctly when visible', () => {
  const tree = renderer.create(
    <WorkflowPrompt
      mobileWorkflows={mobileWorkflows}
      nonMobileWorkflows={nonMobileWorkflows}
      isVisible={true}
      openMobileProject={jest.fn}
      openExternalProject={jest.fn}
      hideWorkflowPrompt={jest.fn}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('passes false to Modal when not visible', () => {
  const tree = renderer.create(
    <WorkflowPrompt
      mobileWorkflows={mobileWorkflows}
      nonMobileWorkflows={nonMobileWorkflows}
      isVisible={false}
      openMobileProject={jest.fn}
      openExternalProject={jest.fn}
      hideWorkflowPrompt={jest.fn}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
