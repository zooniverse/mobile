import React, { Component } from 'react'
import {
    Animated,
    TouchableOpacity,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'

import LoadableMedia from '../common/LoadableMedia'
import AutoPlayMultiImage from './AutoPlayMultiImage'

class TappableSubject extends Component {
    constructor(props) {
        super(props)

        this.state = {
            scrollViewOffset: new Animated.Value(0),
            imageIndex: 0
        }

    }

    componentDidMount() {
        this.state.scrollViewOffset.addListener(({value}) => {
            const nearestIndex = Math.round(value / (this.props.width - 40))
            if (this.state.imageIndex !== nearestIndex) {
                this.setState({
                    imageIndex: nearestIndex
                })
            }
        })
    }

    componentWillUnmount() {
        this.state.scrollViewOffset.removeAllListeners()
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.subject !== prevProps.subject) {
            if (this.scrollView) {
                this.scrollView.scrollTo({x: 0})
            }
            this.setState({
                imageIndex: 0
            })
        }
      }

    render() {
        const {
            onPress,
            height,
            width,
            subject
        } = this.props
        
        if (width === 0) {
            return <View style={{height, width}}/>
        }
        const imageUris = subject.displays.map(d => ({ uri: d.src }));

        if (imageUris.length === 1) {
            return <TouchableOpacity style={styles.imageContainer} onPress={() => onPress(subject.displays[0].src)}>
                <LoadableMedia
                    source={{uri: imageUris[0]}}
                    style={{height, width}}
                />
            </TouchableOpacity> 
        } else if (imageUris.length > 1) {
            return <AutoPlayMultiImage
                images={imageUris}
                subjectDisplayWidth={width}
                subjectDisplayHeight={height}
                expandImage={onPress}
                swiping={false}
                currentCard={true}
            />  
        }
    }
}

const styles = EStyleSheet.create({
    scrollViewContainer: {
        flexGrow: 1
    },
    imageBackground: {
        backgroundColor: 'transparent'
    },
    imageContainer: {
        flex: 1
    },
    paginationContainer: {
        marginTop: 10
    }
})

TappableSubject.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    subject: PropTypes.object,
    onPress: PropTypes.func,
    imageStyle: PropTypes.object,
    alreadySeen: PropTypes.bool,
    inMuseumMode: PropTypes.bool,
}

export default TappableSubject