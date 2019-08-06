import React, { Component } from 'react'
import {
    View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Markdown from 'react-native-simple-markdown'
import PropTypes from 'prop-types'

import { markdownImageRule } from '../../utils/markdownUtils'
import * as colorModes from '../../actions/colorModes'

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

    render() {
        const { viewDimensions } = this.state
        const customStyles = {
            text: {
                fontFamily: 'Karla',
                fontSize: isTablet ? 22 : 14,
                color: colorModes.textColorFor(this.props.inMuseumMode)
            },
            image: {
                width: viewDimensions.width,
                height: viewDimensions.height
            }
        }
        return (
            <View onLayout={this.onViewLayout}>
                <Markdown rules={markdownImageRule} styles={customStyles}>
                    { this.props.children }
                </Markdown>
            </View>
        )
    }
}

const isTablet = DeviceInfo.isTablet()

SizedMarkdown.propTypes = {
    children: PropTypes.node,
    inMuseumMode: PropTypes.bool,
}

SizedMarkdown.defaultProps = {
    inMuseumMode: false
}

export default SizedMarkdown
