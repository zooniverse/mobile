import React, { Component } from 'react'
import {
    Animated,
    Dimensions,
    Platform,
    TouchableOpacity,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'
import RNFetchBlob from 'rn-fetch-blob'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import NativeImage from '../../nativeModules/NativeImage'
import * as imageActions from '../../actions/images'
import { subjectDisplayWidth, subjectDisplayHeight } from './SwipeClassifier'
import ProgressIndicatingImage from '../common/ProgressIndicatingImage'
import FontedText from '../common/FontedText'
import AlreadySeenBanner from './AlreadySeenBanner'

const mapDispatchToProps = (dispatch) => ({
  imageActions: bindActionCreators(imageActions, dispatch)
})

class SwipeCard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            overlayViewWidth: subjectDisplayWidth,
            overlayViewHeight: subjectDisplayHeight,
            overlayAnswerIndex: 0,
            imageIsVisible: false,
            localUri: ''
        }
        this.unlinkImageOnLoad = false

        this.updateOverlayImageForImageDimensions = this.updateOverlayImageForImageDimensions.bind(this)
    }

    componentDidMount() {
        this.listenerId = this.props.panX.addListener((value) => {
                this.setState({ overlayAnswerIndex: value.value < 0 ? 0 : 1})
        })

        const remoteUri = this.props.subject.display.src
        this.props.imageActions.loadImageToCache(remoteUri).then((localUri) => {
            if (this.unlinkImageOnLoad) {
                RNFetchBlob.fs.unlink(localUri)
                return
            }

            const nativeImage = new NativeImage(localUri)
            nativeImage.getImageSize().then(this.updateOverlayImageForImageDimensions)

            this.setState({
                localUri
            })
        })
    }

    updateOverlayImageForImageDimensions({width, height}) {
        const aspectRatio = Math.min(subjectDisplayWidth / width, subjectDisplayHeight / height)
        this.setState({
            overlayViewHeight: height * aspectRatio,
            overlayViewWidth: width * aspectRatio
        });
    }

    componentWillUnmount() {
        this.props.panX.removeListener(this.listenerId)

        RNFetchBlob.fs.exists(this.state.localUri)
        .then((fileExists) => {
            if (fileExists) {
                this.props.imageActions.deleteImageLocation(this.state.localUri)
                RNFetchBlob.fs.unlink(this.state.localUri)
            } else {
                this.unlinkImageOnLoad = true
            }
        })        
    }

    render() {
        const windowWidth = Dimensions.get('window').width
        const opacity = this.props.panX.interpolate({
            inputRange: [-windowWidth/4, 0, windowWidth/4],
            outputRange: [1, 0, 1]
          })

        const imageDimensionStyle = {
            width: this.state.overlayViewWidth,
            height: this.state.overlayViewHeight
          }
        const alreadySeen = (this.props.subject.already_seen || this.props.seenThisSession) && this.state.imageIsVisible
    
        const overlay =
            <View>
                <Animated.View style={[imageDimensionStyle, styles.overlayContainer, styles.overlayBackground, { opacity }]}>
                    <FontedText style={styles.overlayText}>
                        { this.props.answers[this.state.overlayAnswerIndex].label }
                    </FontedText>
                </Animated.View >
            </View>

        const pathPrefix = Platform.OS === 'android' ? 'file://' : ''
        return (
            <TouchableOpacity 
                style={{width: subjectDisplayWidth, height: subjectDisplayHeight}} 
                onPress={() => this.props.onPress(this.props.subject)}
                activeOpacity={0.9}
            >
                <ProgressIndicatingImage
                    onLoadEnd={() => this.setState({imageIsVisible: true})}
                    localUri={pathPrefix + this.state.localUri}
                    style={[styles.image, styles.imageShadow]}
                    resizeMethod="resize" 
                    resizeMode="contain"
                />
                <View style={styles.overlayContainer}>
                    <View style={imageDimensionStyle}>
                        { this.props.shouldAnimateOverlay ? overlay : null }
                        { alreadySeen ? <AlreadySeenBanner /> : null }
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

export default connect(null, mapDispatchToProps)(SwipeCard)

const styles = EStyleSheet.create({
    imageShadow: {
        backgroundColor: 'transparent',
        shadowColor: 'rgba(0, 0, 0, 0.24)',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 2,
        },
    },
    image: {
        borderRadius: 2,
        flex: 1
    },
    overlayContainer: {
        position: 'absolute',
        top:0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    overlayBackground: {
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    overlayText: {
        fontSize: 50,
        color: 'white',
        fontFamily: 'Karla',
        textAlign: 'center'
    },
})

SwipeCard.propTypes = {
    subject: PropTypes.any,
    seenThisSession: PropTypes.bool,
    panX: PropTypes.object,
    shouldAnimateOverlay: PropTypes.bool,
    answers: PropTypes.array,
    imageActions: PropTypes.any,
    onPress: PropTypes.any
}