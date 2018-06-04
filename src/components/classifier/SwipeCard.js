import React, { Component } from 'react'
import {
    Animated,
    Dimensions,
    Image,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'
import { subjectDisplayWidth, subjectDisplayHeight } from './SwipeClassifier'

import FontedText from '../common/FontedText'

class SwipeCard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            overlayViewWidth: subjectDisplayWidth,
            overlayViewHeight: subjectDisplayHeight,
            overlayAnswerIndex: 0,
            imageIsVisible: false,
        }
    }

    componentDidMount() {
        this.props.panX.addListener((value) => {
            this.setState({
                overlayAnswerIndex: value.value < 0 ? 0 : 1
            })
        })
        Image.getSize(this.props.subject.display.src, (width, height) => {
            const aspectRatio = Math.min(subjectDisplayWidth / width, subjectDisplayHeight / height)
            this.setState({
                overlayViewHeight: height * aspectRatio,
                overlayViewWidth: width * aspectRatio
            });
        });
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
    
        const alreadySeenBanner =
            <View style={styles.alreadySeen}>
                <FontedText style={styles.alreadySeenText} >
                    ALREADY SEEN!
                </FontedText>
            </View>

        const overlay =
            <View>
                <Animated.View style={[imageDimensionStyle, styles.overlayContainer, styles.overlayBackground, { opacity }]}>
                    <FontedText style={styles.overlayText}>
                        { this.props.answers[this.state.overlayAnswerIndex].label }
                    </FontedText>
                </Animated.View >
            </View>

        return (
            <View style={{width: subjectDisplayWidth, height: subjectDisplayHeight}}>
                <Image
                    onLoadEnd={() => this.setState({imageIsVisible: true})}
                    source={{uri: this.props.subject.display.src}}
                    style={[styles.image, styles.imageShadow]}
                    resizeMethod="resize" 
                    resizeMode="contain"
                />
                <View style={styles.overlayContainer}>
                    <View style={imageDimensionStyle}>
                        { this.props.shouldAnimateOverlay ? overlay : null }
                        { alreadySeen ? alreadySeenBanner : null }
                    </View>
                </View>
            </View>
        )
    }
}

export default SwipeCard

const styles = EStyleSheet.create({
    alreadySeen: {
        elevation: 2,
        position: 'absolute',
        top: 16,
        right: 0,
        backgroundColor: '$darkOrange',
        paddingVertical: 2,
        paddingHorizontal: 5,
        transform: [{ rotate: '20deg'}]
    },
    alreadySeenText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
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
    answers: PropTypes.array
}