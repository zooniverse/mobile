import React, {Component} from 'react';
import {
    ScrollView,
    View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import PropTypes from 'prop-types'
import R from 'ramda';

import {getTaskFromWorkflow, getAnswersFromWorkflow} from '../../utils/workflow-utils'
import {markdownContainsImage} from '../../utils/markdownUtils'
import * as classifierActions from '../../actions/classifier'
import ClassifierContainer from './ClassifierContainer'
import ClassificationPanel from './ClassificationPanel'
import NeedHelpButton from './NeedHelpButton'
import Tutorial from './Tutorial';
import OverlaySpinner from '../OverlaySpinner'
import Question from './Question'
import Separator from '../common/Separator'
import {
    AnswerButton,
    GuideButton,
    SubmitButton
} from './ClassifierButton';

import FullScreenMedia from '../FullScreenMedia'
import TappableSubject from './TappableSubject';

import * as colorModes from '../../displayOptions/colorModes'

class QuestionClassifier extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isQuestionVisible: true,
            showFullSize: false,
            fullScreenImageSource: {uri: ''},
            fullScreenQuestion: '',
            imageDimensions: {width: 0, height: 0},
            answerSelected: -1
        }
    }

    setQuestionVisibility() {
        return (isVisible) => {
            this.setState({isQuestionVisible: isVisible})
        }
    }

    finishTutorial() {
        if (this.props.needsTutorial) {
            this.props.classifierActions.setTutorialCompleted(this.props.route.params.workflow.id, this.props.route.params.project.id)
        } else {
            this.setQuestionVisibility()(true)
        }
    }

    onOptionSelected(index) {
        return () => {
            this.setState({
                answerSelected: index
            })

            setTimeout(() => this.scrollView.scrollToEnd(), 300)
        }
    }

    submitClassification() {
        return () => {
            const {
                classifierActions,
                subject
            } = this.props

            const { workflow } = this.props.route.params;
            const {id, first_task} = workflow
            const {
                answerSelected,
                imageDimensions
            } = this.state

            this.scrollView.scrollTo({x: 0, y: 0})
            classifierActions.addAnnotationToTask(id, first_task, answerSelected, false)
            classifierActions.saveClassification(workflow, subject, imageDimensions)

            this.setState({
                answerSelected: -1
            })
        }
    }

    render() {
        const {
            isFetching,
            isSuccess,
            needsTutorial,
            tutorial,
            subject,
            subjectsSeenThisSession,
            task,
            guide,
            answers
        } = this.props
        const { project, workflow, inBetaMode } = this.props.route.params;

        const {
            answerSelected,
            imageDimensions,
            isQuestionVisible,
            fullScreenImageSource,
            fullScreenQuestion,
            showFullSize
        } = this.state

        if (isFetching || !isSuccess) {
            return <OverlaySpinner overrideVisibility={isFetching}/>
        }

        const renderTutorial = () =>
            <View style={styles.tutorialContainer}>
                <Tutorial
                    projectName={project.display_name}
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                    isInitialTutorial={needsTutorial}
                    tutorial={tutorial}
                    finishTutorial={() => this.finishTutorial()}
                />
            </View>

        const question =
            <View style={colorModes.contentBackgroundColorFor(this.props.route.params.project.in_museum_mode)}>
                <Question
                    question={task.question}
                    workflowID={workflow.id}
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                    onPressImage={(src, question) => {
                        this.setState({
                            showFullSize: true,
                            fullScreenImageSource: ({uri: src}),
                            fullScreenQuestion: question
                        })
                    }
                    }
                />
                {
                    markdownContainsImage(task.question) ?
                        <Separator style={styles.questionSeparator}/>
                        :
                        null
                }
            </View>

        const seenThisSession = R.indexOf(subject.id, subjectsSeenThisSession) >= 0
        const classificationPanel =
            <View
                style={[styles.classificationPanel, colorModes.framingBackgroundColorFor(this.props.route.params.project.in_museum_mode)]}>
                <ClassificationPanel
                    hasTutorial={!R.isEmpty(tutorial)}
                    isQuestionVisible={isQuestionVisible}
                    setQuestionVisibility={this.setQuestionVisibility()}
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                >
                    {
                        isQuestionVisible &&
                        <View>
                            {question}
                        </View>
                    }
                </ClassificationPanel>
                {
                    isQuestionVisible ?
                        <ScrollView
                            style={styles.scrollView}
                            ref={ref => this.scrollView = ref}
                        >
                            <View style={styles.backgroundView}/>
                            <View
                                style={[styles.classifierContainer, colorModes.contentBackgroundColorFor(this.props.route.params.project.in_museum_mode)]}>
                                <View onLayout={({nativeEvent}) => this.setState({
                                    imageDimensions: {
                                        width: nativeEvent.layout.width,
                                        height: nativeEvent.layout.height
                                    }
                                })}>
                                    <TappableSubject
                                        height={300}
                                        width={imageDimensions.width}
                                        subject={subject}
                                        alreadySeen={seenThisSession}
                                        inMuseumMode={this.props.route.params.project.in_museum_mode}
                                        onPress={(imageSource) => this.setState({
                                            showFullSize: true,
                                            fullScreenImageSource: {uri: imageSource}
                                        })}
                                    />
                                </View>
                                {
                                    answers.map((answer, index) =>
                                        <View key={index} style={styles.buttonContainer}>
                                            <AnswerButton
                                                selected={index === answerSelected}
                                                inMuseumMode={this.props.route.params.project.in_museum_mode}
                                                deselected={answerSelected !== -1 && index !== answerSelected}
                                                text={answer.label}
                                                onPress={this.onOptionSelected(index)}
                                            />
                                        </View>
                                    )
                                }
                            </View>
                            <View style={styles.buttonContainer}>
                                <SubmitButton
                                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                                    disabled={answerSelected === -1}
                                    text="Submit"
                                    onPress={this.submitClassification()}
                                />
                            </View>
                            {
                                (task.help || R.length(guide.items) > 0) &&
                                <Separator style={styles.separator}/>
                            }
                            {
                                task.help !== null &&
                                <NeedHelpButton
                                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                                    onPress={() => this.classifierContainer.displayHelpModal()}
                                />
                            }
                            {
                                R.length(guide.items) > 0 &&
                                <GuideButton
                                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                                    onPress={() => this.classifierContainer.displayFieldGuide()}
                                    style={styles.guideButton}
                                    text="Field Guide"
                                    type="guide"
                                />
                            }
                        </ScrollView>
                        :
                        renderTutorial()
                }
                <FullScreenMedia
                    source={fullScreenImageSource}
                    isVisible={showFullSize}
                    handlePress={() => this.setState({fullScreenQuestion: '', showFullSize: false})}
                    question={fullScreenQuestion}
                />
            </View>

        return (
            <View style={[styles.container, styles.dropshadow]}>
                <ClassifierContainer
                    inBetaMode={inBetaMode}
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                    project={project}
                    help={task.help}
                    guide={guide}
                    ref={ref => this.classifierContainer = ref}
                >
                    {needsTutorial ? renderTutorial() : classificationPanel}
                </ClassifierContainer>
            </View>
        );
    }
}

QuestionClassifier.propTypes = {
    workflow: PropTypes.object,
    project: PropTypes.shape({
        id: PropTypes.number,
        display_name: PropTypes.string,
        in_museum_mode: PropTypes.bool,
    }),
    inPreviewMode: PropTypes.bool,
    inBetaMode: PropTypes.bool,
    guide: PropTypes.object,
    isFetching: PropTypes.bool,
    isSuccess: PropTypes.bool,
    needsTutorial: PropTypes.bool,
    tutorial: PropTypes.object,
    subject: PropTypes.object,
    subjectsSeenThisSession: PropTypes.array,
    task: PropTypes.object,
    answers: PropTypes.array,
    classifierActions: PropTypes.any
}

const styles = EStyleSheet.create({
    container: {
        flex: 1
    },
    dropShadow: {
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 3.84,
        elevation: 5
    },
    classificationPanel: {
        flex: 1,
        overflow: 'visible',
        marginBottom: 15,
    },
    classifierContainer: {
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    tutorialContainer: {
        flex: 1,
        marginHorizontal: 25
    },
    scrollView: {
        flex: 1,
        marginHorizontal: 25
    },
    backgroundView: {
        height: 200,
        position: 'absolute',
        top: -200,
        left: 0,
        right: 0,
    },
    buttonContainer: {
        marginTop: 10
    },
    separator: {
        marginTop: 25
    },
    guideButton: {
        marginTop: 15
    }
})

const mapStateToProps = (state, ownProps) => {
    return {
        task: getTaskFromWorkflow(ownProps.route.params.workflow),
        answers: getAnswersFromWorkflow(ownProps.route.params.workflow),
        isSuccess: state.classifier.isSuccess,
        isFailure: state.classifier.isFailure,
        isFetching: state.classifier.isFetching,
        annotations: state.classifier.annotations[ownProps.route.params.workflow.id] || {},
        guide: state.classifier.guide[ownProps.route.params.workflow.id] || {},
        tutorial: state.classifier.tutorial[ownProps.route.params.workflow.id] || {},
        needsTutorial: state.classifier.needsTutorial[ownProps.route.params.workflow.id] || false,
        subject: state.classifier.subject || {},
        subjectsSeenThisSession: state.classifier.seenThisSession[ownProps.route.params.workflow.id] || []
    }
}

const mapDispatchToProps = (dispatch) => ({
    classifierActions: bindActionCreators(classifierActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(QuestionClassifier);