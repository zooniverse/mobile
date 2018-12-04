import React, { Component } from 'react'
import {
    Dimensions,
    ScrollView,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import Markdown from 'react-native-simple-markdown'
import DeviceInfo from 'react-native-device-info'

import { markdownImageRule } from '../../utils/markdownUtils'
import FittedImage from '../common/FittedImage' 

const ImageWidth = Dimensions.get('window').width - 100
class TutorialStep extends Component {

    constructor(props) {
        super(props)

        this.state = {
            width: 1,
            displayStep: this.props.mediaUri === null
        }

        this.onLayout = this.onLayout.bind(this)
    }

    onLayout({nativeEvent}) {
        this._scrollView.flashScrollIndicators()
        this.setState({
            width: nativeEvent.layout.width
        })
    }

    render() {
        return (
            <ScrollView ref={ref => this._scrollView = ref} style={styles.container}>
                <View style={styles.container}>
                    <View style={styles.contentContainer} onLayout={this.onLayout}>
                        {
                            this.props.mediaUri ?
                                <FittedImage 
                                    maxWidth={ImageWidth}
                                    maxHeight={ImageWidth}
                                    source={{ uri: this.props.mediaUri }}
                                    onLoad={() => this.setState({displayStep: true})}
                                />
                            : null
                        }

                        <View style={styles.markdown} >
                            <Markdown rules={markdownImageRule} styles={markdownStyles}>
                                { this.props.markdownContent }
                            </Markdown>
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
    }
}

const markdownStyles = {
    text: {
      fontSize: DeviceInfo.isTablet() ? 22 : 14
    }
}

const styles = {
    markdown: {
        flex: 1,
        marginTop: 15
      },
      container: {
          flex: 1
      },
      contentContainer: {
          flex: 1,
          margin: 25
      }
}

TutorialStep.propTypes = {
    markdownContent: PropTypes.string,
    mediaUri: PropTypes.string,
    width: PropTypes.number
}

export default TutorialStep        