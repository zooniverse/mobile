import 'react-native'
import { isValidEmail } from '../is-valid-email'
import { isValidLogin } from '../is-valid-login'

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
