import React, {Component} from 'react'
import {Platform, StyleSheet, View} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Swiper from 'react-native-swiper';
import {addIndex, length, map} from 'ramda'
import PropTypes from 'prop-types';

import TutorialStep from './TutorialStep'
import FontedText from '../common/FontedText';

import ButtonLarge from './ButtonLarge';
import PaginateDot from './PaginateDot';

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
                    isActive={this.state.step === index}
                />
            )
        })


        const hasNextStep = (this.state.step + 1) < totalSteps

        const renderCircle = (currentStep, index) => {
            return (
                <PaginateDot 
                    onPress={() => this.swiper.scrollBy(index - this.state.step, false)}
                    active={currentStep === index}
                />
            )
        }

        const Navigation = () => {
            const justifyContent = steps.length > 9 ? 'flex-start' : 'center';
      
            return (
              <View style={[styles.navigation, { justifyContent }]}>
                {addIndex(map)((step, idx) => {
                  return renderCircle(this.state.step, idx);
                }, steps)}
              </View>
            );
          };

        const finishedButton =
            <ButtonLarge 
                text="Let's Go!"
                onPress={this.props.finishTutorial}
            />

        const tutorialHeader =
            <FontedText style={[styles.tutorialHeader]}>TUTORIAL</FontedText>

        return (
            <View style={styles.container}>
                {this.props.isInitialTutorial ? tutorialHeader : null}
                <View style={styles.container}>
                    <Swiper
                        ref={ref => this.swiper = ref}
                        showsPagination={false}
                        loop={false}
                        onIndexChanged={(index) => this.setState({ step: index })}
                        loadMinimal={true}
                    >
                        {tutorialSteps}
                    </Swiper>
                </View>
                <View style={styles.footer}>
                    <View style={styles.line}/>
                    {!hasNextStep && finishedButton}
                    {totalSteps > 0 ? <Navigation /> : null}
                </View>
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EBEBEB',
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
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    navigation: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        marginVertical: 16,
        minHeight: 16,
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
        fontSize: 18,
        marginHorizontal: 30,
        marginTop: 10,
        marginBottom: 10,
        paddingTop: topPadding,
        paddingBottom: 0,
        fontWeight: '600',
        letterSpacing: 0.05,
        color: '#005D69'
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
