import React, { Component } from 'react'
import {
    View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Markdown from 'react-native-simple-markdown'
import PropTypes from 'prop-types'

import { markdownImageRule } from '../../utils/markdownUtils'
import * as colorModes from '../../displayOptions/colorModes'

/**
 * Component that wraps the markdown library we use.
 * 
 * There are a few custom things we want to add the the markdown library
 * we use to make it work the way we want. These are:
 * 1) Set Font to Karla
 * 2) Set Font Size
 * 3) Size Images to container
 * 4) Add a rule to recognize our image syntax
 * 
 * This component should be used for all Markdown in the app.
 */
class SizedMarkdown extends Component {
    constructor(props) {
        super(props)

        this.state = {
            viewDimensions: {
                width: 0,
                height: 0
            }
        }

        this.onViewLayout = this.onViewLayout.bind(this)
    }

    onViewLayout({nativeEvent}) {
        this.setState({
            viewLayedOut: true,
            viewDimensions: {
                width: nativeEvent.layout.width,
                height: nativeEvent.layout.width
            }
        })
    }

    // Fixes: https://github.com/zooniverse/mobile/issues/412
    addLineBreak(content) {
        const newContent = content.replace(/\n/g, (m) => {
            return m + m;
        });
        return newContent;
  }

    render() {
        const { viewDimensions } = this.state

        //We limit the width and height so any button images
        const buttonImageHeight = Math.min(viewDimensions.height, 80)
        const buttonImageWidth = Math.min(viewDimensions.width, 100)

        // Stylistic vertical centering options weren't affecting this view
        // so we're vertically centering text manually on buttons.
        // DRAWBACK: text longer than one line will look weird
        const fontSize = isTablet ? 22 : 14

        const customStyles = {
            text: {
                ...{
                    fontFamily: 'Karla',
                    fontSize: fontSize,
                    fontWeight: isTablet ? 'bold' : 'normal',
                    color: 'black',
                    justifyContent: 'center',
                },
                ...this.props.style
            },
            image: {
                width: this.props.forButton ? buttonImageWidth : viewDimensions.width,
                height: this.props.forButton ? buttonImageHeight : viewDimensions.height,
            }
        }

        return (
            <View onLayout={this.onViewLayout}>
                    <Markdown rules={markdownImageRule} styles={customStyles}>
                    {this.addLineBreak(this.props.children)}
                    </Markdown>
            </View>
        )
    }
}

const isTablet = DeviceInfo.isTablet()

SizedMarkdown.propTypes = {
    children: PropTypes.node,
    inMuseumMode: PropTypes.bool,
    forButton: PropTypes.bool,
    style: PropTypes.object,
}

SizedMarkdown.defaultProps = {
    inMuseumMode: false,
    forButton: false
}

export default SizedMarkdown
