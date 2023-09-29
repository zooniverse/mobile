import React, { Component } from 'react'
import {
    Platform,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'
import RNFetchBlob from 'rn-fetch-blob'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'


import * as imageActions from '../../actions/images'
import AlreadySeenBanner from './AlreadySeenBanner'
import SubjectOptionsBar from './SubjectOptionsBar'
import SwipeableSubject from './SwipeableSubject';

import * as colorModes from '../../displayOptions/colorModes'

const mapDispatchToProps = (dispatch) => ({
  imageActions: bindActionCreators(imageActions, dispatch)
})

class SwipeCard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            nativeImageDimensions: {
                width: 1,
                height: 1,
            },
            overlayViewWidth: props.subjectDisplayWidth,
            overlayViewHeight: props.subjectDisplayHeight,
            overlayAnswerIndex: 0,
            localUris: [],
            displayImageUri: '',
        }
        this.unlinkImageOnLoad = false

        this.updateOverlayImageForImageDimensions = this.updateOverlayImageForImageDimensions.bind(this)
    }

    componentDidMount() {

        // Load all images to cache
        const loadImagePromises = this.props.subject.displays.map( ({src}) => {
            return this.props.imageActions.loadImageToCache(src)
        })
        Promise.all(loadImagePromises).then((localUris) => {
            localUris.forEach( uri => {
                if (this.unlinkImageOnLoad) {
                    RNFetchBlob.fs.unlink(uri)
                }
            })
            this.setState({
                localUris,
            })
        })
    }

    componentDidUpdate(prevProps) {
        const widthChanged = prevProps.subjectDisplayWidth !== this.props.subjectDisplayWidth
        const heightChanged = prevProps.subjectDisplayHeight !== this.props.subjectDisplayHeight
        if (widthChanged || heightChanged) {
            this.updateOverlayImageForImageDimensions(this.state.nativeImageDimensions)
        }
    }

    updateOverlayImageForImageDimensions({width, height}) {
        const aspectRatio = Math.min(this.props.subjectDisplayWidth / width, this.props.subjectDisplayHeight / height)
        this.setState({
            overlayViewHeight: height * aspectRatio,
            overlayViewWidth: width * aspectRatio,
            nativeImageDimensions: {width, height},
        });
    }

    componentWillUnmount() {
        // Dimensions.removeEventListener('change', this.handleDimensionsChange)

        this.state.localUris.forEach((uri) => {
            RNFetchBlob.fs.exists(uri)
            .then((fileExists) => {
                if (fileExists) {
                    this.props.imageActions.deleteImageLocation(uri)
                    RNFetchBlob.fs.unlink(uri)
                } else {
                    this.unlinkImageOnLoad = true
                }
            })  
        })      
    }

    render() {
        const { 
            localUris,
            overlayAnswerIndex,
            displayImageUri
        } = this.state;

        const { 
            panX,
            subject,
            seenThisSession,
            inMuseumMode,
            answers,
            subjectDisplayWidth,
            subjectDisplayHeight,
            onExpandButtonPressed
        } = this.props;

        const alreadySeen = (subject.already_seen || seenThisSession)
    

        const dimensionsStyle = {width: subjectDisplayWidth, height: subjectDisplayHeight}
        const video = displayImageUri.slice(displayImageUri.length - 4).match('.mp4')
        const hideSubjectOptionsBar = video && Platform.OS === 'ios'

        return (
            <View style={[styles.cardBackground, dimensionsStyle, colorModes.contentBackgroundColorFor(inMuseumMode)]}>
                <SwipeableSubject
                    imageUris={localUris.map((uri) => `file://${uri}`)}
                    hasMultipleSubjects={subject.displays.length > 1}
                    onDisplayImageChange={(uri) => this.setState({ displayImageUri: uri })}
                />
                {hideSubjectOptionsBar ?
                    null : 
                    <View style={styles.optionsBarContainer}>
                        <SubjectOptionsBar
                            numberOfSelections={subject.displays.length}
                            onExpandButtonPressed={() => onExpandButtonPressed(displayImageUri)}
                        />
                    </View>
                }
                <View style={styles.overlayContainer} pointerEvents="none">
                    { alreadySeen && !inMuseumMode ? <AlreadySeenBanner /> : null }
                </View>
            </View>
        )
    }
}

export default connect(null, mapDispatchToProps)(SwipeCard)

const styles = EStyleSheet.create({
    container: {
        flex: 1
    },
    cardBackground: {
        borderWidth: 1,
        borderColor: '#E2E5E9',
    },
    imageShadow: {
        backgroundColor: 'transparent',
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOpacity: 1,
        shadowRadius: 20,
        shadowOffset: {
            height: 10,
            width: 0,
        },
    },
    optionsBarContainer: {
        width: '100%'
    },
    image: {
        borderRadius: 2,
        flex: 1
    },
    cardContainer: {
        flex: 1,
        flexDirection: 'row'
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
    inMuseumMode: PropTypes.bool,
    panX: PropTypes.object,
    shouldAnimateOverlay: PropTypes.bool,
    answers: PropTypes.array,
    imageActions: PropTypes.any,
    onExpandButtonPressed: PropTypes.any,
    subjectDisplayWidth: PropTypes.number,
    subjectDisplayHeight: PropTypes.number,
}
