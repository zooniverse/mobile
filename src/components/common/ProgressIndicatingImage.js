import React, { Component } from 'react'
import {
    Animated,
    Image,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import RNFetchBlob from 'rn-fetch-blob'
import EStyleSheet from 'react-native-extended-stylesheet'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import NativeImage from '../../nativeModules/NativeImage'
import * as imageActions from '../../actions/images'
import SubjectLoadingIndicator from './SubjectLoadingIndicator'

const mapDispatchToProps = (dispatch) => ({
    imageActions: bindActionCreators(imageActions, dispatch)
})

class ProgressIndicatingImage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            imageIsLoaded: false,
            imageOpacity: new Animated.Value(0),
            viewDimensions: {
                width: 0,
                height: 0
            },
            imageDimensions: {
                width: 0,
                height: 0
            }
        }
        this.animateImageIfLoaded = this.animateImageIfLoaded.bind(this)
        this.unlinkImageOnLoad = false

        this.animateImageIfLoaded()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.localUri !== this.props.localUri) {
            this.animateImageIfLoaded()
        }
    }

    animateImageIfLoaded() {
        RNFetchBlob.fs.exists(this.props.localUri).then((fileExists) => {
            if (fileExists) {
                new NativeImage(this.props.localUri).getImageSize().then((dimensions) => {
                    this.setState({
                        imageDimensions: dimensions,
                        imageIsLoaded: true,
                    }, () => {
                        Animated.timing( this.state.imageOpacity,
                            {
                                toValue: 1,
                                duration: 300
                            }
                        ).start()
                    })
                })
            }
        })
    }

    renderBorderOverlay() {
        const { viewDimensions, imageDimensions } = this.state
        const aspectRatio = Math.min(viewDimensions.height/imageDimensions.height, viewDimensions.width/imageDimensions.width)
        const borderDimensions = {
            width: imageDimensions.width * aspectRatio,
            height: imageDimensions.height * aspectRatio
        }
        return (
            <View style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center'}}>
                <View style={[styles.borderView, borderDimensions]} />
            </View>
        )
    }

    render() {
        return  (
            <Animated.View  
                onLayout={event => this.setState({viewDimensions: event.nativeEvent.layout})}
                style={[styles.imageContainer, { opacity: this.state.imageOpacity}]}
            >
                {
                    this.state.imageIsLoaded ? 
                        <Image 
                            {...this.props}
                            source={{uri:this.props.localUri}}
                        />
                    :
                        <SubjectLoadingIndicator />
                }
                {
                    this.state.imageIsLoaded && this.renderBorderOverlay()
                }
            </Animated.View>
        )
    }
}

const styles = EStyleSheet.create({
    imageContainer: {
        flex: 1
    },
    borderView: {
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: '#E2E5E9'
    }
})

ProgressIndicatingImage.propTypes = {
    withBorder: PropTypes.bool,
    localUri: PropTypes.string,
    style: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ]),
    onLoadEnd: PropTypes.func,
    imageActions: PropTypes.any,
}

export default connect(null, mapDispatchToProps)(ProgressIndicatingImage)
