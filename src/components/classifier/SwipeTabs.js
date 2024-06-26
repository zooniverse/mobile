import React, {Component} from 'react'
import {View} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import {GuideButton} from './ClassifierButton';
import ButtonAnswer from './ButtonAnswer';

export class SwipeTabs extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isFieldGuideVisible: false,
        }
    }
    

    render() {
        const fullWidthAnswers = this.props.answers.some(a => a.label.length >= 25)
        const answerContainerStyles = fullWidthAnswers ? {} : { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' };
        const leftButton =
            <ButtonAnswer
                onPress={this.props.onLeftButtonPressed}
                text={this.props.answers[0].label}
                fullWidth={fullWidthAnswers}
            />

        const rightButton =
            <ButtonAnswer
                onPress={this.props.onRightButtonPressed}
                text={this.props.answers[1].label}
                fullWidth={fullWidthAnswers}
            />

        return (
            <View style={[styles.container, answerContainerStyles]}>
                {leftButton}
                {rightButton}
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        marginHorizontal: 12,
        paddingVertical: 16,
    },
    leftButtonPadding: {
        marginRight: 20
    },
    growing: {
        flex: 1
    }
})

SwipeTabs.propTypes = {
    inMuseumMode: PropTypes.bool,
    guide: PropTypes.object,
    onLeftButtonPressed: PropTypes.func,
    onRightButtonPressed: PropTypes.func,
    onFieldGuidePressed: PropTypes.func,
    answers: PropTypes.arrayOf(PropTypes.object)
}

export default SwipeTabs
