import React from 'react'
import {
    View
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import ClassificationPanel from './ClassificationPanel'
import Question from './Question'
import Separator from '../common/Separator'
import Tutorial from './Tutorial'
import SwipeTabs from './SwipeTabs'
import NeedHelpButton from './NeedHelpButton'
import OverlaySpinner from '../OverlaySpinner'
import FullScreenMedia from '../FullScreenMedia'
import UnlinkedTask from './UnlinkedTask'
import Swiper from 'react-native-deck-swiper'
import R from 'ramda'
import * as classifierActions from '../../actions/classifier'
import SwipeCard from './SwipeCard'
import {getTaskFromWorkflow, getAnswersFromWorkflow} from '../../utils/workflow-utils'
import {markdownContainsImage} from '../../utils/markdownUtils'
import ClassifierContainer from './ClassifierContainer'

import * as colorModes from '../../displayOptions/colorModes'

const mapStateToProps = (state, ownProps) => {
    return {
        task: getTaskFromWorkflow(ownProps.workflow),
        answers: R.reverse(getAnswersFromWorkflow(ownProps.workflow)),
        isSuccess: state.classifier.isSuccess,
        isFailure: state.classifier.isFailure,
        isFetching: state.classifier.isFetching,
        annotations: state.classifier.annotations[ownProps.workflow.id] || {},
        guide: state.classifier.guide[ownProps.workflow.id] || {},
        tutorial: state.classifier.tutorial[ownProps.workflow.id] || {},
        needsTutorial: state.classifier.needsTutorial[ownProps.workflow.id] || false,
        subjectLists: state.classifier.subjectLists[ownProps.workflow.id] || [],
        subjectsSeenThisSession: state.classifier.seenThisSession[ownProps.workflow.id] || []
    }
}

const mapDispatchToProps = (dispatch) => ({
    classifierActions: bindActionCreators(classifierActions, dispatch),
})

export class SwipeClassifier extends React.Component {
    constructor(props) {
        super(props)
        this.setQuestionVisibility = this.setQuestionVisibility.bind(this)
        this.state = {
            isQuestionVisible: true,
            showFullSize: false,
            swiperIndex: 0,
            fullScreenImageSource: '',
            fullScreenQuestion: '',
            hasImageInQuestion: markdownContainsImage(this.props.task.question),
            panX: null,
            swiperDimensions: {
                width: 1,
                height: 1
            }
        }

        this.onAnswered = this.onAnswered.bind(this)
        this.onSwiped = this.onSwiped.bind(this)
        this.expandImage = this.expandImage.bind(this)
    }

    onClassifierLayout({nativeEvent}) {
        const {width, height} = nativeEvent.layout
        this.setState({
            swiperDimensions: {width, height},
        })
    }

    setQuestionVisibility(isVisible) {
        this.setState({isQuestionVisible: isVisible})
    }

    finishTutorial() {
        if (this.props.needsTutorial) {
            this.props.classifierActions.setTutorialCompleted(this.props.workflow.id, this.props.project.id)
        } else {
            this.setQuestionVisibility(true)
        }
    }

    onAnswered = (answer, subject) => {
        const {id, first_task} = this.props.workflow
        this.props.classifierActions.addAnnotationToTask(id, first_task, answer, false)
        this.props.classifierActions.saveClassification(this.props.workflow, subject, this.state.swiperDimensions)
    }

    onSwiped = (subjectIndex) => {
        this.setState({swiperIndex: this.state.swiperIndex + 1})
        if (subjectIndex > this.props.subjectLists.length - 8) {
            this.props.classifierActions.addSubjectsForWorklow(this.props.workflow.id)
        }
    }

    expandImage = (imageSource) => {
        this.setState({
            showFullSize: true,
            fullScreenImageSource: imageSource
        })
    }

    renderCard = (subject) => {
        const seenThisSession = R.indexOf(subject.id, this.props.subjectsSeenThisSession) >= 0
        const shouldAnimateOverlay = this.props.subjectLists[this.state.swiperIndex].id === subject.id

        return this.state.panX ? (
            <SwipeCard
                subject={subject}
                seenThisSession={seenThisSession}
                inMuseumMode={this.props.project.in_museum_mode}
                panX={this.state.panX}
                shouldAnimateOverlay={shouldAnimateOverlay}
                answers={this.props.answers}
                onExpandButtonPressed={this.expandImage}
                subjectDisplayWidth={this.state.swiperDimensions.width}
                subjectDisplayHeight={this.state.swiperDimensions.height}
            />
        ) : <View/>
    }

    onUnlinkedTaskAnswered = (task, value) => {
        const taskAnnotations = this.props.annotations[task] || []
        const {id} = this.props.workflow
        if (R.contains(value, taskAnnotations)) {
            this.props.classifierActions.removeAnnotationFromTask(id, task, value)
        } else {
            this.props.classifierActions.addAnnotationToTask(id, task, value, true)
        }
    }

    componentDidMount() {
        const {inPreviewMode, classifierActions} = this.props
        classifierActions.setClassifierTestMode(inPreviewMode)

    }

    render() {
        if (this.props.isFetching || !this.props.isSuccess) {
            return <OverlaySpinner overrideVisibility={this.props.isFetching}/>
        }

        const tutorial =
            <Tutorial
                projectName={this.props.project.display_name}
                inMuseumMode={this.props.project.in_museum_mode}
                isInitialTutorial={this.props.needsTutorial}
                tutorial={this.props.tutorial}
                finishTutorial={() => this.finishTutorial()}
            />

        const question =
            <View style={colorModes.contentBackgroundColorFor(this.props.project.in_museum_mode)}>
                <Question
                    question={this.props.task.question}
                    inMuseumMode={this.props.project.in_museum_mode}
                    workflowID={this.props.workflow.id}
                    onPressImage={(src, question) => {
                        this.setState({
                            showFullSize: true,
                            fullScreenImageSource: src,
                            fullScreenQuestion: question
                        })
                    }
                    }
                />
                {
                    this.state.hasImageInQuestion ?
                        <Separator style={styles.questionSeparator}/>
                        :
                        null
                }
            </View>

        const classifier =
            <View style={styles.classifier} onLayout={this.onClassifierLayout.bind(this)}>
                <Swiper
                    verticalInitiation={false}
                    ref={swiper => this.swiper = swiper}
                    cardHorizontalMargin={0}
                    keyExtractor={cardData => cardData.id}
                    cards={this.props.subjectLists}
                    renderCard={this.renderCard}
                    cardVerticalMargin={0}
                    marginTop={0}
                    backgroundColor="transparent"
                    onSwiped={this.onSwiped}
                    onSwipedRight={(cardIndex) => this.onAnswered(0, this.props.subjectLists[cardIndex])}
                    onSwipedLeft={(cardIndex) => this.onAnswered(1, this.props.subjectLists[cardIndex])}
                    cardIndex={this.state.swiperIndex}
                    disableTopSwipe
                    disableBottomSwipe
                    outputRotationRange={['-30deg', '0deg', '30deg']}
                    nextCardYOffset={-15}
                    panXListener={(panX) => this.setState({panX})}
                    swipeAnimationDuration={500}
                />
            </View>

        const unlinkedTask = this.props.task.unlinkedTask ?
            <View>
                <UnlinkedTask
                    unlinkedTaskKey={this.props.task.unlinkedTask}
                    unlinkedTask={this.props.workflow.tasks[this.props.task.unlinkedTask]}
                    annotation={this.props.annotations[this.props.task.unlinkedTask]}
                    onAnswered={this.onUnlinkedTaskAnswered}
                />
            </View>
            : null

        const swipeTabs =
            <SwipeTabs
                inMuseumMode={this.props.project.in_museum_mode}
                guide={this.props.guide}
                onLeftButtonPressed={() => {
                    this.swiper.swipeLeft()
                }}
                onRightButtonPressed={() => {
                    this.swiper.swipeRight()
                }}
                onFieldGuidePressed={() => this.classifierContainer.displayFieldGuide()}
                answers={this.props.answers}
            />

        const classificationPanel =
            <View style={styles.classificationPanel}>
                <ClassificationPanel
                    containerStyle={[styles.container, styles.dropShadow]}
                    isFetching={this.props.isFetching}
                    hasTutorial={!R.isEmpty(this.props.tutorial)}
                    isQuestionVisible={this.state.isQuestionVisible}
                    setQuestionVisibility={this.setQuestionVisibility}
                    inMuseumMode={this.props.project.in_museum_mode}
                >
                    {
                        this.state.isQuestionVisible ?
                            <View style={styles.container}>
                                {question}
                                {classifier}
                                {unlinkedTask}
                            </View>
                            :
                            tutorial
                    }
                </ClassificationPanel>
                {this.state.isQuestionVisible ? swipeTabs : null}
                {this.state.isQuestionVisible && this.props.task.help ? <NeedHelpButton
                    onPress={() => this.classifierContainer.displayHelpModal()}
                    inMuseumMode={this.props.project.in_museum_mode}
                /> : null}
                <FullScreenMedia
                    source={{uri: this.state.fullScreenImageSource}}
                    isVisible={this.state.showFullSize}
                    handlePress={() => this.setState({fullScreenQuestion: '', showFullSize: false})}
                    question={this.state.fullScreenQuestion}
                />
            </View>

        return (
            <View style={[styles.container, colorModes.framingBackgroundColorFor(this.props.project.in_museum_mode)]}>
                <ClassifierContainer
                    inBetaMode={this.props.inBetaMode}
                    inMuseumMode={this.props.project.in_museum_mode}
                    project={this.props.project}
                    help={this.props.task.help}
                    guide={this.props.guide}
                    ref={ref => this.classifierContainer = ref}
                >
                    {this.props.needsTutorial ? tutorial : classificationPanel}
                </ClassifierContainer>
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
    },
    dropShadow: {
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    classificationPanel: {
        flex: 1,
        overflow: 'visible',
        marginBottom: 15
    },
    subjectContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    unlinkedTaskContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0
    },
    needHelpText: {
        textAlign: 'center',
        marginTop: 15,
        color: 'rgba(0,93,105,1)'
    },
    separator: {
        paddingTop: 10,
        paddingHorizontal: 15
    },
    classifier: {
        flex: 1,
        margin: 15,
    }
})

SwipeClassifier.propTypes = {
    inPreviewMode: PropTypes.bool,
    inBetaMode: PropTypes.bool,
    isFetching: PropTypes.bool,
    isSuccess: PropTypes.bool,
    annotations: PropTypes.object,
    workflowID: PropTypes.string,
    workflow: PropTypes.shape({
        first_task: PropTypes.string,
        tasks: PropTypes.object,
        configuration: PropTypes.object,
        id: PropTypes.string
    }),
    subject: PropTypes.shape({
        id: PropTypes.string,
        display: PropTypes.shape({
            src: PropTypes.string
        })
    }),
    nextSubject: PropTypes.shape({
        id: PropTypes.string
    }),
    seenThisSession: PropTypes.array,
    project: PropTypes.shape({
        display_name: PropTypes.string,
        in_museum_mode: PropTypes.bool,
        id: PropTypes.string
    }),
    tutorial: PropTypes.object,
    needsTutorial: PropTypes.bool,
    guide: PropTypes.object,
    classifierActions: PropTypes.any,
    subjectLists: PropTypes.array,
    subjectsSeenThisSession: PropTypes.array,
    answers: PropTypes.array,
    task: PropTypes.object
}

export default connect(mapStateToProps, mapDispatchToProps)(SwipeClassifier)
