import 'react-native'
import { isValidEmail } from '../is-valid-email'
import { isValidLogin } from '../is-valid-login'
import { generateSessionID } from '../session'
import getSubjectLocation from '../get-subject-location'

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
