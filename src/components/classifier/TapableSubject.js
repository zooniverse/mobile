import React, { Component } from 'react'
import {
    Animated,
    TouchableOpacity,
    View
} from 'react-native'
import PropTypes from 'prop-types'

import LoadableImage from '../common/LoadableImage'
import AlreadySeenBanner from './AlreadySeenBanner'
import PaginationBar from './PaginationBar';

class TapableSubject extends Component {
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
                this.scrollView.getNode().scrollTo({x: 0})
            }
            this.setState({
                imageIndex: 0
            })
        }
      }

    render() {
        const {
            alreadySeen,
            onPress,
            height,
            width,
            subject
        } = this.props
        
        if (width === 0) {
            return <View style={{height, width}}/>
        }
        return (
            <View>
                {
                    subject.displays.length > 1 ?
                        <Animated.ScrollView
                            ref={ref => this.scrollView = ref}
                            pagingEnabled
                            decelerationRate="fast"
                            snapToInterval={width - 40}
                            horizontal
                            style={{height, width}}
                            contentContainerStyle={{flexGrow: 1}}
                            scrollEventThrottle={1}
                            showsHorizontalScrollIndicator={false}
                            onScroll={Animated.event(
                                [
                                    {
                                        nativeEvent: {
                                            contentOffset: {x: this.state.scrollViewOffset},
                                        },
                                    },
                                ],
                                {useNativeDriver: false},
                            )}
                        >
                            {
                                subject.displays.map((display, index) => {
                                    return (
                                        <Animated.View
                                            key={index}
                                            style={{
                                                paddingHorizontal: this.state.scrollViewOffset.interpolate({
                                                    inputRange: [
                                                        width * index - width,
                                                        width * index,
                                                        width * index + width
                                                    ],
                                                outputRange: [0, 15, 0]
                                                })
                                            }}
                                        >
                                            <TouchableOpacity 
                                                onPress={() => {
                                                    if (index === this.state.imageIndex) {
                                                        onPress(display.src)
                                                    } else {
                                                        index === subject.displays.length - 1 ?
                                                            this.scrollView.getNode().scrollToEnd()
                                                        :
                                                            this.scrollView.getNode().scrollTo({
                                                                x: index * width - 40,
                                                                animated: true
                                                            })
                                                    }
                                                }}
                                            >
                                                <LoadableImage
                                                    source={{uri: display.src}}
                                                    style={{height, width: width - 60, backgroundColor: 'transparent'}}
                                                />
                                            </TouchableOpacity> 
                                        </Animated.View>
                                    )
                                })
                            }
                            { alreadySeen && <AlreadySeenBanner /> }
                        </Animated.ScrollView>
                    :
                        <TouchableOpacity style={{flex: 1}} onPress={() => onPress(subject.displays[0].src)}>
                            <LoadableImage
                                source={{uri: subject.displays[0].src}}
                                style={{height, width}}
                            />
                        </TouchableOpacity> 
                }
                {
                    subject.displays.length > 1 &&
                        <View style={{marginTop: 10}}>
                            <PaginationBar
                                totalPages={subject.displays.length}
                                pageIndex={this.state.imageIndex}
                            />
                        </View>
                }
            </View>
        );
    }
}

TapableSubject.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    subject: PropTypes.object,
    onPress: PropTypes.func,
    imageStyle: PropTypes.object,
    alreadySeen: PropTypes.bool
}

export default TapableSubject