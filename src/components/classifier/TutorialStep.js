import React, { Component } from 'react'
import {
    Dimensions,
    ScrollView,
    View
} from 'react-native'
import PropTypes from 'prop-types'

import FittedImage from '../common/FittedImage' 
import SizedMarkdown from '../common/SizedMarkdown'
import VideoPlayer from 'react-native-video-controls';

const ImageWidth = Math.min(Dimensions.get('window').width - 100, 400)
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
        const isVideo = this.props.mediaUri && this.props.mediaUri.slice(this.props.mediaUri.length - 4).match('.mp4');
        return (
            <ScrollView ref={ref => this._scrollView = ref} style={styles.container}>
                <View style={styles.container}>
                    <View style={styles.contentContainer} onLayout={this.onLayout}>
                        {
                            isVideo ? (
                                <View style={styles.videoContainer}>
                                    <VideoPlayer
                                        source={{uri: this.props.mediaUri}}
                                        style={{
                                            width: ImageWidth,
                                            height: (ImageWidth / 4) * 3.4
                                        }}
                                        controls={true}
                                        repeat={true}
                                        resizeMode='contain'
                                        disableFullscreen
                                        disableBack
                                        disableVolume
                                        paused={!this.props.isActive}
                                    />
                                </View>)
                            : this.props?.mediaUri ? 
                                <FittedImage 
                                    maxWidth={ImageWidth}
                                    maxHeight={ImageWidth}
                                    source={{ uri: this.props.mediaUri }}
                                    onLoad={() => this.setState({displayStep: true})}
                                />
                            : null
                        }

                        <View style={styles.markdown} >
                            <SizedMarkdown
                                inMuseumMode={this.props.inMuseumMode}
                            >
                                { this.props.markdownContent }
                            </SizedMarkdown>
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
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
    },
    videoContainer: {
        alignSelf: 'center',
        width: ImageWidth
    }
}

TutorialStep.propTypes = {
    markdownContent: PropTypes.string,
    mediaUri: PropTypes.string,
    width: PropTypes.number,
    inMuseumMode: PropTypes.bool,
    isActive: PropTypes.bool
}

export default TutorialStep        