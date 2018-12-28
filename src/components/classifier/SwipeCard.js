import React, { Component } from 'react'
import {
    Animated,
    Dimensions,
    Platform,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'
import RNFetchBlob from 'rn-fetch-blob'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import R from 'ramda'
import VerticalViewPager from 'react-native-vertical-view-pager';


import * as imageActions from '../../actions/images'
import ProgressIndicatingImage from '../common/ProgressIndicatingImage'
import FontedText from '../common/FontedText'
import AlreadySeenBanner from './AlreadySeenBanner'
import SubjectOptionsBar from './SubjectOptionsBar'
import VerticalPaginationBar from './VerticalPaginationBar'

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
            pagerDimensions: {
                width: 1,
                height: 1
            },
            overlayViewWidth: props.subjectDisplayWidth,
            overlayViewHeight: props.subjectDisplayHeight,
            overlayAnswerIndex: 0,
            localUris: [],
            imageIndex: 0
        }
        this.unlinkImageOnLoad = false

        this.updateOverlayImageForImageDimensions = this.updateOverlayImageForImageDimensions.bind(this)
        this.handleDimensionsChange = this.handleDimensionsChange.bind(this)
    }

    handleDimensionsChange() {
        if (this.pager) {
            setTimeout(() => this.pager.scrollTo({y: 0}), 300)
        }
    }

    componentDidMount() {
        this.listenerId = this.props.panX.addListener((value) => {
                this.setState({ overlayAnswerIndex: value.value < 0 ? 0 : 1})
        })

        Dimensions.addEventListener('change', this.handleDimensionsChange.bind(this))

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
                localUris
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
            dimensionPropsReceived: true
        });
    }

    componentWillUnmount() {
        this.props.panX.removeListener(this.listenerId)
        Dimensions.removeEventListener('change', this.handleDimensionsChange.bind(this))

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
        const windowWidth = Dimensions.get('window').width
        const opacity = this.props.panX.interpolate({
            inputRange: [-windowWidth/4, 0, windowWidth/4],
            outputRange: [1, 0, 1]
          })
        const alreadySeen = (this.props.subject.already_seen || this.props.seenThisSession)
    
        const overlay =
            <Animated.View style={[styles.overlayContainer, styles.overlayBackground, { opacity }]}>
                <FontedText style={styles.overlayText}>
                    { this.props.answers[this.state.overlayAnswerIndex].label }
                </FontedText>
            </Animated.View >

        const pathPrefix = Platform.OS === 'android' ? 'file://' : ''
        const dimensionsStyle = {width: this.props.subjectDisplayWidth, height: (this.props.subjectDisplayHeight - 50)}
        const opacityStyle = { opacity: this.props.dimensionsLoaded ? 1 : 0 }
        const { imageIndex, localUris, pagerDimensions} = this.state
        console.log(dimensionsStyle)
        return (
            <View style={[styles.cardBackground, dimensionsStyle, opacityStyle]}>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        {
                            this.props.subject.displays.length > 1 && 
                                <VerticalPaginationBar
                                    onScrollDownPressed={() => this.pager.scrollTo({y: (imageIndex + 1) * pagerDimensions.height})}
                                    onScrollUpPressed={() => this.pager.scrollTo({y: (imageIndex - 1) * pagerDimensions.height})}
                                    totalPages={this.props.subject.displays.length} 
                                    pageIndex={imageIndex}
                                />
                        }
                        <View style={{flex: 1}} onLayout={event => this.setState({
                                pagerDimensions: {
                                    width: event.nativeEvent.layout.width,
                                    height: event.nativeEvent.layout.height
                                }
                            })}>
                            <VerticalViewPager
                                bounces={false}
                                showsVerticalScrollIndicator={false}
                                ref={ref => this.pager = ref}
                                key={localUris.length}
                                // Make this happen while scrolling
                                onScroll={({nativeEvent}) => {
                                    this.setState({
                                        imageIndex: Math.round(nativeEvent.contentOffset.y/pagerDimensions.height)
                                    })
                                }}
                            >
                                {
                                    pagerDimensions.height > 1 && (R.isEmpty(localUris) ? this.props.subject.displays : localUris).map( (uri, index) => {
                                        return (
                                            <View style={{flex: 1, ...pagerDimensions}} key={`SWIPER_IMAGE_${index}`}>
                                                <ProgressIndicatingImage
                                                    withBorder
                                                    localUri={pathPrefix + uri}
                                                    style={[styles.image, styles.imageShadow]}
                                                    resizeMethod="resize" 
                                                    resizeMode="contain"
                                                />
                                            </View>
                                        )
                                    })
                                }
                            </VerticalViewPager>
                        </View>
                    </View>
                    
                    <View style={{width: '100%'}}>
                        <SubjectOptionsBar
                            numberOfSelections={this.props.subject.displays.length}
                            selectionIndex={imageIndex}
                            onExpandButtonPressed={() => this.props.onExpandButtonPressed(this.props.subject.displays[imageIndex].src)}
                        />
                    </View>
                    <View style={styles.overlayContainer} pointerEvents="none">
                        { this.props.shouldAnimateOverlay ? overlay : null }
                        { alreadySeen ? <AlreadySeenBanner /> : null }
                    </View>
            </View>
        )
    }
}

export default connect(null, mapDispatchToProps)(SwipeCard)

const styles = EStyleSheet.create({
    cardBackground: {
        borderWidth: 1,
        borderColor: '#E2E5E9',
        backgroundColor: 'white'
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
    onExpandButtonPressed: PropTypes.any,
    subjectDisplayWidth: PropTypes.number,
    subjectDisplayHeight: PropTypes.number,
    dimensionsLoaded: PropTypes.bool
}
