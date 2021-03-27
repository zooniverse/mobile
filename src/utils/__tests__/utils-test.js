import 'react-native'
import { isValidEmail } from '../is-valid-email'
import { isValidLogin } from '../is-valid-login'
import { generateSessionID } from '../session'
import getSubjectLocation from '../get-subject-location'
import { isValidMobileWorkflow } from '../workflow-utils'

let mockWorkflow = {
  active: true,
  first_task: '',
  id: '1234',
  mobile_friendly: true,
  tasks: {},
}

it('passes a good email', () => {
  let email = 'me@zooniverse.org'
  expect(isValidEmail(email)).toBeTruthy()
})

it('fails a bad email - no @', () => {
  let email = 'me'
  expect(isValidEmail(email)).toBeFalsy()
})

it('fails a bad email - no .', () => {
  let email = 'me@zooniverse'
  expect(isValidEmail(email)).toBeFalsy()
})

it('fails a bad email - nothing after .', () => {
  let email = 'me@zooniverse.'
  expect(isValidEmail(email)).toBeFalsy()
})

it('passes a good login', () => {
  let login = 'GoodLogin'
  expect(isValidLogin(login)).toBeTruthy()
})

it('fails a bad login - contains a space', () => {
  let login = 'Bad Login'
  expect(isValidLogin(login)).toBeFalsy()
})

it('fails a bad login - contains a dash', () => {
  let login = 'Bad-Login'
  expect(isValidLogin(login)).toBeFalsy()
})

it('fails a bad login - contains an apostrophe', () => {
  let login = `Bad'Login`
  expect(isValidLogin(login)).toBeFalsy()
})

it('generates a session ID of 64 chars using crypto', () => {
  expect(generateSessionID().id).toHaveLength(64)
})

it('gets a subject location ', () => {
  let subject = {
    locations: [ { 'image/jpeg': 'https://kitty.org/cat.jpg' }]
  }
  let returnSubject = [{
    type: 'image',
    format: 'jpeg',
    src: 'https://kitty.org/cat.jpg'
  }]
  expect(getSubjectLocation(subject)).toEqual(returnSubject)
})

it('passes a good single question workflow', () => {
  let testWorkflow = Object.assign({}, mockWorkflow)
  testWorkflow.first_task = 'T0'
  testWorkflow.tasks['T0'] = {
    answers: [
      { label: 'Yes' },
      { label: 'No' },
      { label: 'Maybe' }
    ],
    help: 'Good luck!',
    question: 'Cats?',
    type: 'single',
  }
  
  expect(isValidMobileWorkflow(testWorkflow)).toBeTruthy()
})

it('adds workflow type "swipe" to an appropriate workflow', () => {
  let testWorkflow = Object.assign({}, mockWorkflow)
  testWorkflow.first_task = 'T0'
  testWorkflow.tasks['T0'] = {
    answers: [
      { label: 'Yes' },
      { label: 'No' }
    ],
    help: 'Good luck!',
    question: 'Cats?',
    type: 'single',
  }

  expect(isValidMobileWorkflow(testWorkflow)).toBeTruthy()
  expect(testWorkflow.type).toEqual('swipe')
})

it('passes a good multiple question workflow', () => {
  let testWorkflow = Object.assign({}, mockWorkflow)
  testWorkflow.first_task = 'T0'
  testWorkflow.tasks['T0'] = {
    answers: [
      { label: 'Yes' },
      { label: 'No' },
      { label: 'Maybe' }
    ],
    help: 'Good luck!',
    question: 'Cats?',
    type: 'multiple',
  }
  
  expect(isValidMobileWorkflow(testWorkflow)).toBeTruthy()
})

it('fails a bad question workflow with more than one task', () => {
  let testWorkflow = Object.assign({}, mockWorkflow)
  testWorkflow.first_task = 'T0'
  testWorkflow.tasks = {
    T0: {
      answers: [
        { label: 'Yes', next: 'T1' },
        { label: 'No', next: 'T1' },
        { label: 'Maybe', next: 'T1' }
      ],
      help: 'Good luck!',
      question: 'Cats?',
      type: 'multiple',
    },
    T1: {
      answers: [
        { label: 'Yes' },
        { label: 'No' }
      ],
      help: 'Good luck!',
      question: 'Cats?',
      type: 'single',
    },
  }
  
  expect(isValidMobileWorkflow(testWorkflow)).toBeFalsy()
})

it('fails a bad question workflow with undefined first task', () => {
  let testWorkflow = Object.assign({}, mockWorkflow)
  testWorkflow.tasks['T0'] = {
    answers: [
      { label: 'Yes' },
      { label: 'No' }
    ],
    help: 'Good luck!',
    question: 'Cats?',
    type: 'single',
  }
  testWorkflow.first_task = ''
  
  expect(isValidMobileWorkflow(testWorkflow)).toBeFalsy()
})

it('fails a bad question workflow with question length > 200', () => {
  let testWorkflow = Object.assign({}, mockWorkflow)
  testWorkflow.first_task = 'T0'
  testWorkflow.tasks['T0'] = {
    answers: [
      { label: 'Yes' },
      { label: 'No' }
    ],
    help: 'Good luck!',
    question: '?'.repeat(201),
    type: 'single',
  }
  
  expect(isValidMobileWorkflow(testWorkflow)).toBeFalsy()
})

it('fails a bad question workflow with feedback', () => {
  let testWorkflow = Object.assign({}, mockWorkflow)
  testWorkflow.first_task = 'T0'
  testWorkflow.tasks['T0'] = {
    answers: [
      { label: 'Yes' },
      { label: 'No' }
    ],
    feedback: {
      enabled: true
    },
    help: 'Good luck!',
    question: 'Cats?',
    type: 'single',
  }

  expect(isValidMobileWorkflow(testWorkflow)).toBeFalsy()
})
