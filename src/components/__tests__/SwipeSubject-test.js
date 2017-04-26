import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import SwipeSubject from '../SwipeSubject'

const subjectSizes = {
  resizedWidth: 100,
  resizedHeight: 100
}

const subject = {
  id: '3424',
  already_seen: false,
  display: {
    src: 'blah.jpg'
  }
}

const seenThisSession = []

it('renders front subject position correctly', () => {
  const tree = renderer.create(
    <SwipeSubject
      inFront={true}
      subject={subject}
      subjectSizes={subjectSizes}
      seenThisSession={seenThisSession} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders back subject position correctly', () => {
  const tree = renderer.create(
    <SwipeSubject
      inFront={false}
      subject={subject}
      subjectSizes={subjectSizes}
      seenThisSession={seenThisSession} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders already seen if it was seen this session', () => {
  const alreadySeenThisSession = ['3424']
  const tree = renderer.create(
    <SwipeSubject
      inFront={false}
      subject={subject}
      subjectSizes={subjectSizes}
      seenThisSession={alreadySeenThisSession} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders already seen if already_seen is on subject', () => {
  const alreadySeenSubject = {
    id: '3424',
    already_seen: true,
    display: {
      src: 'blah.jpg'
    }
  }
  const tree = renderer.create(
    <SwipeSubject
      inFront={false}
      subject={alreadySeenSubject}
      subjectSizes={subjectSizes}
      seenThisSession={seenThisSession} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
