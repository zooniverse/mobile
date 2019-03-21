import React, { Component } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    View
} from 'react-native';
import PropTypes from 'prop-types';
import R from 'ramda';
import EStyleSheet from 'react-native-extended-stylesheet';

import SubjectLoadingIndicator from '../common/SubjectLoadingIndicator'
import PaginationBar from './PaginationBar'

class SwipeCardSubjectsView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pagerDimensions: {
                width: 1,
                height: 1
            },
            imageIndex: 0
        }
        this.handleDimensionsChange = this.handleDimensionsChange.bind(this)
    }

    handleDimensionsChange() {
        if (this.pager) {
            setTimeout(() => this.pager.scrollTo({y: 0}), 300)
        }
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.handleDimensionsChange);
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.handleDimensionsChange)
    }

    componentDidUpdate(prevProps) {
        if (R.isEmpty(prevProps.imageUris) && !R.isEmpty(this.props.imageUris)) {
            this.props.onDisplayImageChange(this.props.imageUris[0]);
        }
    }

    render() {
        const { pagerDimensions, imageIndex } = this.state;
        const { imageUris, hasMultipleSubjects, onDisplayImageChange } = this.props;
        const imagesAreLoaded = !R.isEmpty(imageUris);
        return (
            <View style={styles.cardContainer}>
                {
                    imagesAreLoaded && hasMultipleSubjects && 
                        <PaginationBar
                            onPageForwardPressed={() => {
                                if (imageIndex + 1 < imageUris.length) {
                                    this.pager.scrollTo({y: (imageIndex + 1) * pagerDimensions.height})
                                }
                            }}
                            onPageBackwardPressed={() => {
                                if (imageIndex - 1 >= 0) {
                                    this.pager.scrollTo({y: (imageIndex - 1) * pagerDimensions.height})
                                }
                            }}
                            totalPages={imageUris.length} 
                            pageIndex={imageIndex}
                            vertical
                            showArrows
                        />
                }
                <View style={styles.container} onLayout={event => this.setState({
                        pagerDimensions: {
                            width: event.nativeEvent.layout.width,
                            height: event.nativeEvent.layout.height
                        }
                    })}>
                    <ScrollView
                        contentContainerStyle={imagesAreLoaded ? {} : styles.scrollContainer}
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        ref={ref => this.pager = ref}
                        key={imageUris.length}
                        scrollEventThrottle={16}
                        pagingEnabled
                        overScrollMode="never"
                        onScroll={({nativeEvent}) => {
                            const newImageIndex = Math.round(nativeEvent.contentOffset.y/pagerDimensions.height)
                            if (newImageIndex !== this.state.imageIndex) {
                                this.setState({
                                    imageIndex: newImageIndex,
                                })
                                onDisplayImageChange(imageUris[newImageIndex])
                            }
                        }}
                    >
                        {
                            imagesAreLoaded ?
                                imageUris.map((uri, index) =>
                                    <View 
                                        style={[styles.borderView, pagerDimensions]}
                                        key={`SWIPER_IMAGE_${index}`}
                                    >
                                            <Image
                                                style={[styles.image, styles.imageShadow]}
                                                source={{uri}}
                                                resizeMethod="resize" 
                                                resizeMode="contain"
                                            />
                                    </View>
                                )
                            :
                                <SubjectLoadingIndicator multipleSubjects={hasMultipleSubjects} />
                        }
                    </ScrollView>
                </View>
            </View>
        );
    }
}

SwipeCardSubjectsView.propTypes = {
    imageUris: PropTypes.array,
    hasMultipleSubjects: PropTypes.bool,
    onDisplayImageChange: PropTypes.func,
}

const styles = EStyleSheet.create({
    container: {
        flex: 1
    },
    cardContainer: {
        flex: 1,
        flexDirection: 'row'
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
    borderView: {
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: '#E2E5E9'
    },
    scrollContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default SwipeCardSubjectsView;