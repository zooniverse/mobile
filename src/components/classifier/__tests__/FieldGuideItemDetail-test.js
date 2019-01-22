import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import FieldGuideItemDetail from '../FieldGuideItemDetail'

// Stub out animated functions
jest.mock('Animated', () => {                                                                                                                                                                         
  const ActualAnimated = require.requireActual('Animated');                                                                                                                                           
  return {                                                                                                                                                                                            
    ...ActualAnimated,                                                                                                                                                                                
    timing: () => {                                                                                                                                                                      
      return {                                                                                                                                                                                        
        start: () => {
        },                                                                                                                                                  
      };                                                                                                                                                                                              
    },                                                                                                                                                                                                
  };                                                                                                                                                                                                  
});
jest.mock('Easing', () => {
  return {
    linear: 'linear',
    bezier: () => 'bezier'
  }
})

const item = {
  title: 'fake_avatar',
  content: 'Nice project',
  icon: '12345',
}

const icons = {
  '12345': {
   src: 'fake_icon.jpg',
  }
}

it('renders correctly', () => {
  const tree = renderer.create(
    <FieldGuideItemDetail item={item} icons={icons} onClose={jest.fn} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
