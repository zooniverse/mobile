import React from 'react'
import {
    Dimensions,
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

import ClassifierHeader from '../../navigation/ClassifierHeader';
import FieldGuideBtn from './FieldGuideBtn';
import { getDataForFeedbackModal, isFeedbackActive } from '../../utils/feedback';
import FeedbackModal from './FeedbackModal';

const mapStateToProps = (state, ownProps) => {
    return {
        task: getTaskFromWorkflow(ownProps.route.params.workflow),
        answers: R.reverse(getAnswersFromWorkflow(ownProps.route.params.workflow)),
        isSuccess: state.classifier.isSuccess,
        isFailure: state.classifier.isFailure,
        isFetching: state.classifier.isFetching,
        annotations: state.classifier.annotations[ownProps.route.params.workflow.id] || {},
        guide: state.classifier.guide[ownProps.route.params.workflow.id] || {},
        tutorial: state.classifier.tutorial[ownProps.route.params.workflow.id] || {},
        needsTutorial: state.classifier.needsTutorial[ownProps.route.params.workflow.id] || false,
        subjectLists: state.classifier.subjectLists[ownProps.route.params.workflow.id] || [],
        subjectsSeenThisSession: state.classifier.seenThisSession[ownProps.route.params.workflow.id] || []
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
            },
            swiping: false,
            feedbackModal: {},
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

        // Need to force update the swiper or else the first image will be height/width 0.
        this.swiper.forceUpdate();
    }

    setQuestionVisibility(isVisible) {
        this.setState({isQuestionVisible: isVisible})
    }

    finishTutorial() {
        if (this.props.needsTutorial) {
            this.props.classifierActions.setTutorialCompleted(this.props.route.params.workflow.id, this.props.route.params.project.id)
        } else {
            this.setQuestionVisibility(true)
        }
    }

    onAnswered = (answer, subject) => {
        const { workflow, project } = this.props.route.params;
        const {id, first_task} = workflow
        const feedbackActive = isFeedbackActive(project, subject, workflow);
        if (feedbackActive) {
            const modalData = getDataForFeedbackModal(subject, workflow, answer);
            if (modalData) {
                const onClose = () => {
                    this.setState({ feedbackModal: {} })
                    this.submitClassification(id, first_task, answer, workflow, subject);
                }
                this.setState({ feedbackModal: { ...modalData, onClose } })
                return;
            }
        }
        this.submitClassification(id, first_task, answer, workflow, subject);
    }

    submitClassification(id, first_task, answer, workflow, subject) {
        this.props.classifierActions.addAnnotationToTask(id, first_task, answer, false)
        this.props.classifierActions.saveClassification(workflow, subject, this.state.swiperDimensions)
        this.setState({swiperIndex: this.state.swiperIndex + 1})
    }

    onSwiped = (subjectIndex) => {
        this.setState({swiperIndex: this.state.swiperIndex + 1})
        if (subjectIndex > this.props.subjectLists.length - 8) {
            this.props.classifierActions.addSubjectsForWorklow(this.props.route.params.workflow.id)
        }
    }

    expandImage = (imageSource) => {
        this.setState({
            showFullSize: true,
            fullScreenImageSource: imageSource
        })
    }

    renderCard = (subject, index) => {
        const seenThisSession = R.indexOf(subject.id, this.props.subjectsSeenThisSession) >= 0
        const shouldAnimateOverlay = this.props.subjectLists[this.state.swiperIndex].id === subject.id

        return <SwipeCard
            subject={subject}
            seenThisSession={seenThisSession}
            inMuseumMode={this.props.route.params.project.in_museum_mode}
            panX={this.state.panX}
            shouldAnimateOverlay={shouldAnimateOverlay}
            answers={this.props.answers}
            onExpandButtonPressed={this.expandImage}
            subjectDisplayWidth={this.state.swiperDimensions.width}
            subjectDisplayHeight={this.state.swiperDimensions.height}
            swiping={this.state.swiping}
            currentCard={index === this.state.swiperIndex}
        />
    }

    onUnlinkedTaskAnswered = (task, value) => {
        const taskAnnotations = this.props.annotations[task] || []
        const {id} = this.props.route.params.workflow
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
                projectName={this.props.route.params.project.display_name}
                inMuseumMode={this.props.route.params.project.in_museum_mode}
                isInitialTutorial={this.props.needsTutorial}
                tutorial={this.props.tutorial}
                finishTutorial={() => this.finishTutorial()}
            />

        const question =
            <View style={styles.questionContainer}>
                <Question
                    question={this.props.task.question}
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                    workflowID={this.props.route.params.workflow.id}
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
        const windowWidth = Dimensions.get('window').width

        const swiperLabelStyle = {
            label: {
                color: 'white',
                fontWeight: 'normal',
            },
            wrapper: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: this.state.swiperDimensions.width,
                height: this.state.swiperDimensions.height,
            },
        };

        const classifier =
            <View style={styles.container} onLayout={this.onClassifierLayout.bind(this)}>
               <Swiper
                    ref={swiper => (this.swiper = swiper)}
                    cardHorizontalMargin={0}
                    keyExtractor={cardData => cardData.id}
                    cards={this.props.subjectLists}
                    renderCard={(cardData, cardIndex) => this.renderCard(cardData, cardIndex)}
                    cardVerticalMargin={0}
                    marginTop={0}
                    backgroundColor="transparent"
                    onSwipedAll={this.onSwiped}
                    onSwipedRight={cardIndex =>
                        this.onAnswered(0, this.props.subjectLists[cardIndex])
                    }
                    onSwipedLeft={cardIndex =>
                        this.onAnswered(1, this.props.subjectLists[cardIndex])
                    }
                    dragStart={() => this.setState({swiping: true})}
                    dragEnd={() => this.setState({swiping: false})}
                    cardIndex={this.state.swiperIndex}
                    disableTopSwipe
                    disableBottomSwipe
                    outputRotationRange={['-30deg', '0deg', '30deg']}
                    overlayOpacityHorizontalThreshold={10}
                    swipeAnimationDuration={500}
                    animateOverlayLabelsOpacity
                    animateCardOpacity
                    inputOverlayLabelsOpacityRangeX={[
                        -windowWidth / 4,
                        0,
                        windowWidth / 4,
                    ]}
                    outputOverlayLabelsOpacityRangeX={[1, 0, 1]}
                    verticalSwipe={false}
                    stackSeparation={-10}
                    stackSize={2}
                    overlayLabels={{
                        left: {
                            title: 'No',
                            style: swiperLabelStyle,
                        },
                        right: {
                            title: 'Yes',
                            style: swiperLabelStyle,
                        },
                    }}
                    loadMinimal={true}
                />
            </View>

        const unlinkedTask = this.props.task.unlinkedTask ?
            <View>
                <UnlinkedTask
                    unlinkedTaskKey={this.props.task.unlinkedTask}
                    unlinkedTask={this.props.route.params.workflow.tasks[this.props.task.unlinkedTask]}
                    annotation={this.props.annotations[this.props.task.unlinkedTask]}
                    onAnswered={this.onUnlinkedTaskAnswered}
                />
            </View>
            : null

        const swipeTabs =
            <SwipeTabs
                inMuseumMode={this.props.route.params.project.in_museum_mode}
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
                    containerStyle={[styles.classificationContainer]}
                    isFetching={this.props.isFetching}
                    hasTutorial={!R.isEmpty(this.props.tutorial)}
                    isQuestionVisible={this.state.isQuestionVisible}
                    setQuestionVisibility={this.setQuestionVisibility}
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                >
                    {
                        this.state.isQuestionVisible ?
                            <View style={styles.container}>
                                {question}
                                {classifier}
                                {unlinkedTask}
                                {this.state.isQuestionVisible ? swipeTabs : null}
                                {this.state.isQuestionVisible && this.props.task.help ? (
                                    <View style={styles.needHelpContainer}>
                                        <NeedHelpButton
                                            onPress={() => this.classifierContainer.displayHelpModal()}
                                            inMuseumMode={this.props.route.params.project.in_museum_mode}
                                        />
                                    </View>
                                ) : null}
                                {this.props?.guide?.items?.length > 0 && (
                                    <View style={styles.fieldGuideBtnContainer}>
                                        <FieldGuideBtn onPress={() => this.classifierContainer.displayFieldGuide()} />
                                    </View>
                                )}
                            </View>
                            :
                            tutorial
                    }
         
                </ClassificationPanel>
                <FullScreenMedia
                    source={{uri: this.state.fullScreenImageSource}}
                    isVisible={this.state.showFullSize}
                    handlePress={() => this.setState({fullScreenQuestion: '', showFullSize: false})}
                    question={this.state.fullScreenQuestion}
                />
                {this.state.feedbackModal?.show && (
                    <FeedbackModal
                        correct={this.state.feedbackModal?.correct}
                        message={this.state.feedbackModal.message}
                        onClose={this.state.feedbackModal.onClose}
                        inMuseumMode={this.props.route.params.project.in_museum_mode}
                    />
                )}
            </View>

        return (
            <View style={styles.container}>
                <ClassifierHeader project={this.props.route?.params?.project}/>
                <ClassifierContainer
                    inBetaMode={this.props.route.params.inBetaMode}
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                    project={this.props.route.params.project}
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
    classificationContainer: {
        flex: 1,
        backgroundColor: '#EBEBEB',
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
    needHelpContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    questionContainer: {
        backgroundColor: '#EBEBEB',
        paddingVertical: 16
    },
    fieldGuideBtnContainer: {
        alignItems: 'center',
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
