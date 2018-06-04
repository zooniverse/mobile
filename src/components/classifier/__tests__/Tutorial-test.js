import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { Tutorial } from '../Tutorial'

jest.mock('WebView', () => 'WebView')
jest.mock('../../SizedImage', () => 'SizedImage');

const tutorial = {
  steps:
   [ { content: '### Welcome to Planet Four: Ridges\n----------\nThis brief tutorial will teach you how to discover polygonal ridges on Mars. By mapping these features, you are helping to explore Mars\' past. \n',
       media: '6324307' },
     { content: 'You will be presented with a cutout from an image taken by the Context Camera aboard Mars Reconnaissance Orbiter. All you need to do is spot the polygonal ridges, if any are present in the image. \n\n\n###### Image(c) : NASA/JPL/University of Arizona',
       media: '6193916' },
     { content: 'Polygonal ridges are intersecting, creating spider-web like patterns. Notice how the ridges intersect to form closed shapes of varying sizes. ',
       media: '6324305' } ],
  mediaResources: {
    6324307: {
      src: 'http://notvalid'
    },
    6193916: {
      src: 'http://notvalid'
    },
    6324305: {
      src: 'http://notvalid'
    }
  }
}

const tutorialNoMedia = {
  steps: [
    { content: '### Welcome to Planet Four: Ridges\n----------\nThis brief tutorial will teach you how to discover polygonal ridges on Mars. By mapping these features, you are helping to explore Mars\' past. \n',
      media: '' },
    { content: 'You will be presented with a cutout from an image taken by the Context Camera aboard Mars Reconnaissance Orbiter. All you need to do is spot the polygonal ridges, if any are present in the image. \n\n\n###### Image(c) : NASA/JPL/University of Arizona',
      media: '' },
    { content: 'Polygonal ridges are intersecting, creating spider-web like patterns. Notice how the ridges intersect to form closed shapes of varying sizes. ',
      media: ''  } ]

}

it('renders correctly', () => {
  const tree = renderer.create(
    <Tutorial
      tutorial={tutorial}
      projectName={'Awesome project'}
      finishTutorial={jest.fn}
      isInitialTutorial={false}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders header if initial tutorial', () => {
  const tree = renderer.create(
    <Tutorial
      tutorial={tutorial}
      projectName={'Awesome project'}
      finishTutorial={jest.fn}
      isInitialTutorial={true}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders with no media', () => {
  const tree = renderer.create(
    <Tutorial
      tutorial={tutorialNoMedia}
      projectName={'Awesome project'}
      finishTutorial={jest.fn}
      isInitialTutorial={false}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
