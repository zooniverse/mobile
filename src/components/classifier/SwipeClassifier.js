import React from 'react'
import {
    View,
    Text,
    Dimensions
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
import { SwipeableCardStack } from 'react-native-swipeable-card-stack'
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated'
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
import { getPreferredLanguageFromProject, loadProjectTranslations } from '../../i18n'
import TranslationsLoadingIndicator from '../common/TranslationsLoadingIndicator';
import { withTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Card wrapper that adds rotation transform based on swipe position
const AnimatedCardWrapper = ({ xAnimatedPosition, children, width, height }) => {
    const rotationStyle = useAnimatedStyle(() => {
        const rotation = interpolate(
            xAnimatedPosition.value,
            [-1, 0, 1],
            [-30, 0, 30], // Rotate up to 30 degrees (matches original)
            Extrapolation.CLAMP
        );
        return {
            transform: [{ rotate: `${rotation}deg` }]
        };
    });

    return (
        <Animated.View style={[{ width, height }, rotationStyle]}>
            {children}
        </Animated.View>
    );
};

// Overlay component that shows Yes/No labels based on swipe position
// Note: xAnimatedPosition is normalized (-1 to 1), not pixels
const SwipeOverlay = ({ xAnimatedPosition, yesLabel = 'Yes', noLabel = 'No' }) => {
    // Animated style for "Yes" label (swipe right)
    const yesStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            xAnimatedPosition.value,
            [0, 0.15], // Normalized values (0.15 = 15% of screen width)
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    // Animated style for "No" label (swipe left)
    const noStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            xAnimatedPosition.value,
            [0, -0.15], // Normalized values
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    return (
        <>
            {/* Yes overlay - appears when swiping right */}
            <Animated.View style={[overlayStyles.labelContainer, yesStyle]} pointerEvents="none">
                <Text style={overlayStyles.labelText}>{noLabel}</Text>
            </Animated.View>
            {/* No overlay - appears when swiping left */}
            <Animated.View style={[overlayStyles.labelContainer, noStyle]} pointerEvents="none">
                <Text style={overlayStyles.labelText}>{yesLabel}</Text>
            </Animated.View>
        </>
    );
};

const overlayStyles = EStyleSheet.create({
    labelContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    labelText: {
        color: 'white',
        fontSize: 50,
        fontWeight: 'normal',
        fontFamily: 'Karla',
        textAlign: 'center',
    },
});

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
            swipes: [], // Array of swipe directions for the card stack
            fullScreenImageSource: '',
            fullScreenQuestion: '',
            hasImageInQuestion: markdownContainsImage(this.props.task.question),
            swiperDimensions: {
                width: 1,
                height: 1
            },
            feedbackModal: {},
            swiping: false,
            translationsLoading: false,
        }

        this.onAnswered = this.onAnswered.bind(this)
        this.onSwipeEnded = this.onSwipeEnded.bind(this)
        this.expandImage = this.expandImage.bind(this)
        this.loadedTranslationsRef = React.createRef();
    }

    async loadTranslations(language, project, workflow, guide, tutorial) {
        try {
            this.setState({ translationsLoading: true })
            await loadProjectTranslations(language, project, workflow, guide, tutorial);
        } catch (error) {
            console.warn('Error loading project translations:', error);
        } finally {
            this.setState({ translationsLoading: false })
        }
    }

    onClassifierLayout({nativeEvent}) {
        const {width, height} = nativeEvent.layout
        if (width !== this.state.swiperDimensions.width || height !== this.state.swiperDimensions.height) {
            this.setState({ swiperDimensions: {width, height} })
        }
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
                    this.submitClassification(id, first_task, answer, workflow, subject, modalData.feedbackMeta);
                }
                this.setState({ feedbackModal: { ...modalData, onClose } })
                return;
            }
        }
        this.submitClassification(id, first_task, answer, workflow, subject);
    }

    submitClassification(id, first_task, answer, workflow, subject, feedbackMeta = null) {
        this.props.classifierActions.addAnnotationToTask(id, first_task, answer, false)
        this.props.classifierActions.saveClassification(workflow, subject, this.state.swiperDimensions, feedbackMeta)
    }

    onSwipeEnded = (cardData, direction) => {
        const currentIndex = this.state.swipes.length;
        const subject = this.props.subjectLists[currentIndex];

        if (!subject) return;

        // Add swipe to array (controls the card stack)
        this.setState(prev => ({
            swipes: [...prev.swipes, direction]
        }), () => {
            // right = Yes (0), left = No (1)
            const answer = direction === 'right' ? 0 : 1;
            this.onAnswered(answer, subject);

            // Load more subjects when running low
            const newIndex = this.state.swipes.length;
            if (newIndex > this.props.subjectLists.length - 8) {
                this.props.classifierActions.addSubjectsForWorklow(this.props.route.params.workflow.id)
            }
        });
    }

    expandImage = (imageSource) => {
        this.setState({
            showFullSize: true,
            fullScreenImageSource: imageSource
        })
    }

    renderCard = (props) => {
        // Library spreads item data into props, so subject fields are at top level
        // xAnimatedPosition and yAnimatedPosition are also in props
        const { xAnimatedPosition, yAnimatedPosition, ...subject } = props;

        if (!subject || !subject.id) return null;

        const seenThisSession = R.indexOf(subject.id, this.props.subjectsSeenThisSession) >= 0
        const { width, height } = this.state.swiperDimensions;

        // Get answer labels from workflow
        const yesLabel = this.props.answers[0]?.label || 'Yes';
        const noLabel = this.props.answers[1]?.label || 'No';

        // Wrap in AnimatedCardWrapper for rotation, or plain View if no animation
        const CardWrapper = xAnimatedPosition ? AnimatedCardWrapper : View;
        const wrapperProps = xAnimatedPosition
            ? { xAnimatedPosition, width, height }
            : { style: { width, height } };

        return (
            <CardWrapper {...wrapperProps}>
                <SwipeCard
                    subject={subject}
                    seenThisSession={seenThisSession}
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                    panX={null}
                    answers={this.props.answers}
                    onExpandButtonPressed={this.expandImage}
                    subjectDisplayWidth={width}
                    subjectDisplayHeight={height}
                    swiping={this.state.swiping}
                    currentCard={true}
                />
                {xAnimatedPosition && (
                    <SwipeOverlay
                        xAnimatedPosition={xAnimatedPosition}
                        yesLabel={yesLabel}
                        noLabel={noLabel}
                    />
                )}
            </CardWrapper>
        );
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

    componentDidUpdate() {
        const { project, workflow } = this.props.route.params;
        const guide = this.props.guide;
        const tutorial = this.props.tutorial;
        const languages = project?.available_languages ?? [];
        if (project?.id && workflow?.id && guide?.id && tutorial?.id && !this.loadedTranslationsRef.current) {
            this.loadedTranslationsRef.current = true;
            const defaultLanguage = getPreferredLanguageFromProject(languages);
            this.loadTranslations(defaultLanguage, project, workflow, guide, tutorial)
        }
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
                    backupText={this.props.task.question}
                    isDrawClassifier={false}
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                    workflowID={this.props.route.params.workflow.id}
                    onPressImage={(src, question) => {
                        this.setState({
                            showFullSize: true,
                            fullScreenImageSource: src,
                            fullScreenQuestion: question
                        })
                    }}
                />
                {this.state.hasImageInQuestion ? <Separator style={styles.questionSeparator}/> : null}
            </View>

        const { width, height } = this.state.swiperDimensions;
        const hasDimensions = width > 1 && height > 1;

        const currentIndex = this.state.swipes.length;
        const currentSubject = this.props.subjectLists[currentIndex];

        const classifier =
            <View style={styles.swiperWrapper} onLayout={this.onClassifierLayout.bind(this)}>
                {hasDimensions && (
                    <SwipeableCardStack
                        ref={swiper => (this.swiper = swiper)}
                        data={this.props.subjectLists}
                        renderCard={this.renderCard}
                        keyExtractor={cardData => cardData?.id}
                        swipes={this.state.swipes}
                        onSwipeEnded={this.onSwipeEnded}
                        onActiveCardUpdate={({ phase }) => {
                            this.setState({ swiping: phase === 'active' });
                        }}
                        lockedDirections={['top', 'bottom']}
                        numberOfUnswipedCardsToRender={2}
                        horizontalRestingPosition={SCREEN_WIDTH * 1.5}
                    />
                )}
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
                    if (currentSubject) {
                        this.onSwipeEnded(currentSubject, 'left');
                    }
                }}
                onRightButtonPressed={() => {
                    if (currentSubject) {
                        this.onSwipeEnded(currentSubject, 'right');
                    }
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
                    {this.state.isQuestionVisible ?
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
                        : tutorial
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
                <ClassifierHeader project={this.props.route?.params?.project} />
                {this.state.translationsLoading && <TranslationsLoadingIndicator />}
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
    swiperWrapper: {
        flex: 1,
        overflow: 'hidden',
    },
    classificationContainer: {
        flex: 1,
        backgroundColor: '#EBEBEB',
    },
    classificationPanel: {
        flex: 1,
        overflow: 'visible',
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

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SwipeClassifier))
