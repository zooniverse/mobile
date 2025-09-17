import 'react-native'
import reducers, { initialState } from '../index.js'
import { setUser, setState } from '../../actions/index'

it('sets user', () => {
  let fakeUser = { avatar: 'Some avatar', display_name: 'Me'}
  expect(reducers(initialState, setUser(fakeUser))).toMatchSnapshot()
})

it('unsets user', () => {
  expect(reducers(initialState, setUser({}))).toMatchSnapshot()
})

it('sets state from initial state', () => {
  expect(reducers(initialState, setState('isConnected', true))).toMatchSnapshot()
})

it('sets a new state', () => {
  expect(reducers(initialState, setState('bobLoblaw', 'Has a law blog'))).toMatchSnapshot()
})
