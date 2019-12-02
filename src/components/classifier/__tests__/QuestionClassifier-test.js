import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import SwipeTabs from '../SwipeTabs'

const guide = {
    items: [
        {
            title: 'fake_avatar',
            content: 'Nice project',
            icon: '12345',
        },
        {
            title: 'fake_avatar2',
            content: 'Another Nice project',
            icon: '123456',
        },
    ],
    icons:{
        '12345': { src: 'fake_icon.jpg' },
        '123456': { src: 'fake_icon.jpg' }
    }
}

const answers=[]

it('renders correctly and with no button if no field guide', () => {
    const tree = renderer.create(
        ={jest.fn} answers={answers} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
})

