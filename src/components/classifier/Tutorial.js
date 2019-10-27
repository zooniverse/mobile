import React, {Component} from 'react'
import {
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/FontAwesome'
import Swiper from 'react-native-swiper';
import {addIndex, length, map} from 'ramda'
import PropTypes from 'prop-types';

import Button from '../Button'
import TutorialStep from './TutorialStep'
import FontedText from '../common/FontedText';

import * as colorModes from '../../actions/colorModes'

const topPadding = (Platform.OS === 'ios') ? 10 : 0

export class Tutorial extends Component {
    constructor(props) {
        super(props)
        this.state = {
            step: 0,
        }
    }

    render() {
        const steps = this.props.tutorial.steps
        const totalSteps = length(steps)
        const tutorialSteps = steps.map((step, index) => {
            return (
                <TutorialStep
                    key={`TUTORIAL_STEP_${index}`}
                    markdownContent={step.content}
                    inMuseumMode={this.props.inMuseumMode}
                    mediaUri={this.props.tutorial.mediaResources && this.props.tutorial.mediaResources[step.media] ? this.props.tutorial.mediaResources[step.media].src : null}
                />
            )
        })

        const hasPreviousStep = this.state.step > 0
        const previousStep =
            <TouchableOpacity
                onPress={() => this.swiper.scrollBy(-1, false)}
                style={styles.navIconContainer}>
                <Icon name='chevron-left' style={styles.navIcon}/>
            </TouchableOpacity>

        const disabledPrevious =
            <View style={styles.navIconContainer}>
                <Icon name='chevron-left' style={[styles.navIcon, styles.disabledIcon]}/>
            </View>

        const hasNextStep = (this.state.step + 1) < totalSteps
        const nextStep =
            <TouchableOpacity
                onPress={() => this.swiper.scrollBy(1, false)}
                style={styles.navIconContainer}>
                <Icon name='chevron-right' style={styles.navIcon}/>
            </TouchableOpacity>

        const disabledNext =
            <View style={styles.navIconContainer}>
                <Icon name='chevron-right' style={[styles.navIcon, styles.disabledIcon]}/>
            </View>

        const renderCircle = (currentStep, index) => {
            return (
                <TouchableOpacity
                    key={`PAGINATION_DOT_${index}`}
                    onPress={() => this.swiper.scrollBy(index - this.state.step, false)}>
                    <Icon
                        name={currentStep === index ? 'circle' : 'circle-thin'}
                        style={styles.circleIcon}/>
                </TouchableOpacity>
            )
        }

        const navigation =
            <View style={styles.navigation}>
                {hasPreviousStep ? previousStep : disabledPrevious}
                {addIndex(map)(
                    (step, idx) => {
                        return renderCircle(this.state.step, idx)
                    },
                    steps
                )}
                {hasNextStep ? nextStep : disabledNext}
            </View>

        const continueButton =
            <Button
                handlePress={() => this.swiper.scrollBy(1, false)}
                additionalStyles={[styles.tealButton]}
                additionalTextStyles={[styles.whiteText]}
                text={'Continue'}/>

        const finishedButton =
            <Button
                handlePress={this.props.finishTutorial}
                additionalStyles={[styles.orangeButton]}
                additionalTextStyles={[styles.blackText]}
                text={'Let\s Go!'}/>

        const tutorialHeader =
            <FontedText style={[styles.tutorialHeader, {color: colorModes.textColorFor(this.props.inMuseumMode)}]}>
                {`${this.props.projectName} - Tutorial`}
            </FontedText>

        return (
            <View style={[styles.container, colorModes.contentBackgroundColorFor(this.props.inMuseumMode)]}>
                {this.props.isInitialTutorial ? tutorialHeader : null}
                <View style={styles.container}>
                    <Swiper
                        ref={ref => this.swiper = ref}
                        showsPagination={false}
                        loop={false}
                        onIndexChanged={(index) => this.setState({step: index})}
                    >
                        {tutorialSteps}
                    </Swiper>
                </View>
                <View style={styles.footer}>
                    <View style={styles.line}/>
                    {hasNextStep ? continueButton : finishedButton}
                    {totalSteps > 0 ? navigation : null}
                </View>
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1
    },
    firstTutorialContainer: {
        flex: 1,
        paddingTop: topPadding,
        paddingBottom: 0,
    },
    content: {
        height: '100% - 300',
        marginHorizontal: 25,
        backgroundColor: 'white'
    },
    scrollViewContainerStyle: {
        padding: 15
    },
    footer: {
        height: 110,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    navigation: {
        alignSelf: 'stretch',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    circleIcon: {
        fontSize: 12,
        color: 'black',
        paddingHorizontal: 3,
        paddingVertical: 10,
        backgroundColor: 'transparent',
    },
    navIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    navIcon: {
        fontSize: 16,
        color: '$darkGrey',
        padding: 10,
        backgroundColor: 'transparent',
    },
    disabledIcon: {
        color: '$disabledIconColor',
    },
    emptyNav: {
        height: 36,
        width: 36
    },
    orangeButton: {
        backgroundColor: '$orange',
        marginBottom: 0,
    },
    tealButton: {
        backgroundColor: '$zooniverseTeal',
        marginBottom: 0,
    },
    whiteText: {
        color: 'white',
    },
    blackText: {
        color: 'black',
    },
    line: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '$lightGreyBackground',
    },
    tutorialHeader: {
        fontSize: 20,
        marginHorizontal: 30,
        marginTop: 10,
        marginBottom: 0,
        paddingTop: topPadding,
        paddingBottom: 0,
    },
    markdown: {
        flex: 1,
        marginTop: 15
    }
})

Tutorial.propTypes = {
    tutorial: PropTypes.object,
    projectName: PropTypes.string,
    finishTutorial: PropTypes.func,
    isInitialTutorial: PropTypes.bool,
    inMuseumMode: PropTypes.bool,
}

Tutorial.defaultProps = {
    inMuseumMode: false,
}

export default Tutorial
