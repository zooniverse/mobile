import React from 'react'
import ShallowRenderer from 'react-test-renderer/shallow';
import { Provider } from 'react-redux'
import { createStore } from 'redux'

const store = createStore(() => {}, ['test'])

import { SwipeClassifier } from '../SwipeClassifier'

const task = {
  question: 'What was that?',
  answers: [
    { label: 'Yes' },
    { label: 'No' },
  ]
}

const workflow = {
  first_task: 'T0',
  tasks: {
    T0: task
  },
  configuration: {
    pan_and_zoom: true
  }
}

const subject = {
  id: '23432432',
  display: {
    src: 'blah.jpg'
  }
}

const project = {
  display_name: 'Awesome project'
}

const subjectSizes={resizedWidth: 100, resizedHeight: 100}

const seenThisSession=[]

// Stub out actions
const navBarActions = { 
  setTitleForPage() {},
  setNavbarColorForPageToDefault() {}
}

const classifierActions = {
  startNewClassification() {},
  setClassifierTestMode() {}
}

const renderer = new ShallowRenderer();

it('renders correctly', () => {
  const tree = renderer.render(
    <Provider store={store}>
      <SwipeClassifier
      task={task}
      isFetching={false}
      setIsFetching={jest.fn}
      startNewClassification={jest.fn}
      saveClassification={jest.fn}
      saveAnnotation={jest.fn}
      project={project}
      workflow={workflow}
      workflowID={'1'}
      subject={subject}
      subjectSizes={subjectSizes}
      seenThisSession={seenThisSession}
      navBarActions={navBarActions}
      classifierActions={classifierActions} />
    </Provider>
  )
  expect(tree).toMatchSnapshot()
})

it('renders spinner if fetching', () => {
  const tree = renderer.render(
    <Provider store={store}>
      <SwipeClassifier
        task={task}
        isFetching={true}
        setIsFetching={jest.fn}
        startNewClassification={jest.fn}
        project={project}
        workflow={workflow}
        workflowID={'1'}
        subject={subject}
        subjectSizes={subjectSizes}
        seenThisSession={seenThisSession}
        navBarActions={navBarActions}
        classifierActions={classifierActions} />
    </Provider>
    
  )
  expect(tree).toMatchSnapshot()
})

it('renders tutorial if needed', () => {
  const tree = renderer.render(
    <Provider store={store}>
      <SwipeClassifier
        task={task} 
        isFetching={false}
        setIsFetching={jest.fn}
        startNewClassification={jest.fn}
        needsTutorial={true}
        project={project}
        workflow={workflow}
        workflowID={'1'}
        subject={subject}
        subjectSizes={subjectSizes}
        seenThisSession={seenThisSession}
        navBarActions={navBarActions}
        classifierActions={classifierActions} />
    </Provider>
  )
  expect(tree).toMatchSnapshot()
})
