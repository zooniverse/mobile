import React, {Component} from 'react'
import {
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import FontedText from '../common/FontedText'
import FieldGuide from './FieldGuide'
import {length} from 'ramda'
import {
    GuideButton,
    SwipeButton
} from './ClassifierButton';

export class SwipeTabs extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isFieldGuideVisible: false,
        }
    }

    render() {
        const leftButton =
            <SwipeButton
                onPress={this.props.onLeftButtonPressed}
                style={[styles.growing, styles.leftButtonPadding]}
                text={this.props.answers[0].label}
            />

        const rightButton =
            <SwipeButton
                onPress={this.props.onRightButtonPressed}
                style={styles.growing}
                text={this.props.answers[1].label}
            />

        const fieldGuideButton =
            <GuideButton
                onPress={this.props.onFieldGuidePressed}
                style={styles.leftButtonPadding}
                text="Field Guide"
            />

        return (
            <View>
                <View style={styles.container}>
                    {leftButton}
                    {length(this.props.guide.items) > 0 ? fieldGuideButton : null}
                    {rightButton}
                </View>
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        marginHorizontal: 25,
        marginTop: 15,
        marginBottom: 5,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    leftButtonPadding: {
        marginRight: 20
    },
    growing: {
        flex: 1
    }
})

SwipeTabs.propTypes = {
    guide: PropTypes.object,
    onLeftButtonPressed: PropTypes.func,
    onRightButtonPressed: PropTypes.func,
    onFieldGuidePressed: PropTypes.func,
    answers: PropTypes.arrayOf(PropTypes.object)
}

export default SwipeTabs
