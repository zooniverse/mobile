import React, {Component} from 'react'
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    PanResponder,
    Platform,
    ScrollView,
    TouchableOpacity,
    View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import FieldGuideItemDetail from './FieldGuideItemDetail'
import FieldGuideItemRow from './FieldGuideItemRow'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import PropTypes from 'prop-types';
import {isEmpty} from 'ramda'

import FieldGuideBtn from './FieldGuideBtn'

const MAX_DEFAULT_HEIGHT = Dimensions.get('window').height * .6
const MIN_HEIGHT = 33
const MAX_DRAG_HEIGHT = Dimensions.get('window').height - (Platform.OS === 'ios' ? 100 : 110)

export class FieldGuide extends Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedItem: {},
            heightAnim: new Animated.Value(0),
            height: 0,
            headerHeight: 0
        }

        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            onPanResponderGrant: () => {
                this.state.heightAnim.setOffset(this.state.heightAnim._value);
                this.state.heightAnim.setValue(0);
            },
            onPanResponderMove: (e, gestureState) => {
                const newVal = gestureState.dy * -1

                Animated.event([
                    null, {dy: this.state.heightAnim}
                ], {useNativeDriver: false})(e, {dy: newVal});
            },
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: () => {
                this.state.heightAnim.flattenOffset();

                if (this.state.heightAnim._value < 20) {
                    this.close()
                } else {
                    let adjustToHeight = false
                    if (this.state.heightAnim._value < MIN_HEIGHT) {
                        adjustToHeight = MIN_HEIGHT
                    } else if (this.state.heightAnim._value > this.state.height) {
                        adjustToHeight = this.state.height
                    } else if (this.state.heightAnim._value > MAX_DRAG_HEIGHT) {
                        adjustToHeight = MAX_DRAG_HEIGHT
                    }

                    if (adjustToHeight) {
                        Animated.timing(this.state.heightAnim, {
                            toValue: adjustToHeight,
                            easing: Easing.out(Easing.ease),
                            duration: 100,
                            useNativeDriver: false,
                        }).start()
                    }
                }
            },
        })

    }

    componentDidUpdate(nextProps) {
        if ((this.props.isVisible !== nextProps.isVisible) && (nextProps.isVisible === true)) {
            this.open()
        }
    }

    open() {
        this.state.heightAnim.setValue(0)
        this.animateHeight(150)
    }

    close() {
        this.animateHeight(0, 200)
        setTimeout(() => {
            this.setState({selectedItem: {}, headerHeight: 0})
            this.props.onClose()
        }, 200)
    }

    openDetail(item) {
        this.setState({selectedItem: item})
        this.animateHeight(150)
    }

    closeDetail() {
        this.setState({selectedItem: {}, headerHeight: 0})
        this.animateHeight(150)
    }

    toggleOpenClose = () => {
        this.closeDetail();
    }

    animateHeight(toHeight, duration = 300) {
        Animated.timing(
            this.state.heightAnim,
            {
                toValue: toHeight,
                easing: Easing.linear,
                duration: duration,
                useNativeDriver: false,
            }
        ).start()
    }

    setHeight(height) {
        const newHeight = height + this.state.headerHeight + 32
        this.setState({height: newHeight})
        this.animateHeight(newHeight < MAX_DEFAULT_HEIGHT ? newHeight : MAX_DEFAULT_HEIGHT)
    }

    render() {
        const {items, icons} = this.props.guide
        const closeIcon =
            <Animated.View style={[styles.close]}>
                <TouchableOpacity
                    onPress={() => this.close()}
                    activeOpacity={0.5}
                    style={styles.navIconContainer}>
                    <Icon name='chevron-down' size={30} style={styles.navIcon}/>
                </TouchableOpacity>
            </Animated.View>

        const backIcon =
            <Animated.View style={[styles.back]}>
                <TouchableOpacity
                    onPress={() => this.closeDetail()}
                    activeOpacity={0.5}>
                    <Icon name='chevron-left' size={30} style={styles.navIcon}/>
                </TouchableOpacity>
            </Animated.View>

        const dragBar =
            <Animated.View
                style={[styles.dragBarContainer, {bottom: this.state.heightAnim}]}
                hitSlop={{top: 10, bottom: 10, left: 0, right: 0}}
                {...this._panResponder.panHandlers}>
                <View style={{top: 1}}>
                    <FieldGuideBtn onPress={this.toggleOpenClose} />
                </View>
            </Animated.View>

        const fieldGuide =
            <ScrollView>
                <View style={styles.fieldGuideContainer} onLayout={(event) => this.setHeight(event.nativeEvent.layout.height)}>
                    <FlatList
                        data={items}
                        numColumns={2}
                        renderItem={({ item, index }) => <FieldGuideItemRow
                            onPress={() => this.openDetail(item)}
                            key={index}
                            item={item}
                            icons={icons}
                            inMuseumMode={this.props.inMuseumMode}
                            />
                        }
                    />
                </View>
            </ScrollView>

        const itemDetail =
            <FieldGuideItemDetail
                item={this.state.selectedItem}
                inMuseumMode={this.props.inMuseumMode}
                icons={icons}
                heightAnim={this.state.heightAnim}
                onClose={() => this.closeDetail()}
                setHeaderHeight={(event) => {
                    this.setState({headerHeight: event.nativeEvent.layout.height + 70})
                }}
                setContentHeight={(newHeight) => {
                    this.setHeight(newHeight)
                }}
            />

        const showFieldGuideItemDetail = !isEmpty(this.state.selectedItem)

        return (
            <View style={styles.container}>
                <Animated.View style={[
                    styles.guideContainer,
                    {height: this.state.heightAnim},
                ]}>
                    <View style={styles.backCloseContainer}>
                        {showFieldGuideItemDetail ? backIcon : null}
                        {closeIcon}
                    </View>
                    {showFieldGuideItemDetail ? itemDetail : fieldGuide}
                </Animated.View>
                {dragBar}
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    backCloseContainer: {
        height: 40
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    guideContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 0,
        borderTopWidth: 1,
        borderColor: '#00979D',
        backgroundColor: '#fff'
    },
    dragBarContainer: {
        backgroundColor: 'transparent',
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    navIcon: {
        color: '$darkTeal',
    },
    back: {
        position: 'absolute',
        left: 4,
        top: 4,
        backgroundColor: 'transparent',
    },
    close: {
        position: 'absolute',
        right: 4,
        top: 4,
        backgroundColor: 'transparent',
    },
    fieldGuideContainer: {
        paddingBottom: 12
    }
})

FieldGuide.propTypes = {
    guide: PropTypes.shape({
        items: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string,
            content: PropTypes.string,
            icon: PropTypes.string,
        })),
        icons: PropTypes.object,
    }),
    inMuseumMode: PropTypes.bool,
    isVisible: PropTypes.bool,
    onClose: PropTypes.func,
}

FieldGuide.defaultProps = {
    guide: {
        items: [],
        icons: {}
    }
}

export default FieldGuide
