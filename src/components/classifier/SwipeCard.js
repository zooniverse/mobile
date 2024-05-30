import React, { Component } from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'
import RNFetchBlob from 'rn-fetch-blob'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'


import * as imageActions from '../../actions/images'
import AlreadySeenBanner from './AlreadySeenBanner'
import SwipeableSubject from './SwipeableSubject';


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
            displayImageUri: '',
        }
        this.unlinkImageOnLoad = false

        this.updateOverlayImageForImageDimensions = this.updateOverlayImageForImageDimensions.bind(this)
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


    render() {

        const { 
            subject,
            seenThisSession,
            inMuseumMode,
            subjectDisplayWidth,
            subjectDisplayHeight,
            onExpandButtonPressed,
            swiping,
            currentCard
        } = this.props;

        const alreadySeen = (subject.already_seen || seenThisSession)
    

        const dimensionsStyle = {width: subjectDisplayWidth, height: subjectDisplayHeight}   
        
        return (
            <View style={dimensionsStyle}>
                <SwipeableSubject
                    imageUris={this.props.subject.displays.map(i => i?.src)}
                    hasMultipleSubjects={subject.displays.length > 1}
                    onDisplayImageChange={(uri) => this.setState({ displayImageUri: uri })}
                    onExpandButtonPressed={(uri) => onExpandButtonPressed(uri)}
                    swiping={swiping}
                    currentCard={currentCard}
                />
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
    answers: PropTypes.array,
    imageActions: PropTypes.any,
    onExpandButtonPressed: PropTypes.any,
    subjectDisplayWidth: PropTypes.number,
    subjectDisplayHeight: PropTypes.number,
    swiping: PropTypes.bool,
    currentCard: PropTypes.bool
}
