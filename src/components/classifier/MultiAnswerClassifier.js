import React, {Component} from 'react';
import {
    Platform,
    ScrollView,
    View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import PropTypes from 'prop-types'
import R from 'ramda';
import Video from 'react-native-video'

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
import FullScreenMedia from '../FullScreenMedia'
import TappableSubject from './TappableSubject';
import SubjectOptionsBar from './SubjectOptionsBar'

import * as colorModes from '../../displayOptions/colorModes'
import FieldGuideBtn from './FieldGuideBtn';
import ClassifierHeader from '../../navigation/ClassifierHeader';
import ButtonAnswer from './ButtonAnswer';
import ButtonLarge from './ButtonLarge';

class MultiAnswerClassifier extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isQuestionVisible: true,
            showFullSize: false,
            fullScreenImageSource: {uri: ''},
            fullScreenQuestion: '',
            imageDimensions: {width: 0, height: 0},
            answersSelected: [],
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

    onOptionSelected(answersSelected, index) {
        return () => {
            var updatedSelection = []
            if (answersSelected.includes(index)) {
                updatedSelection = answersSelected.filter(function (element) {
                    return element !== index
                })
            } else {
                updatedSelection = answersSelected.concat(index)
            }

            this.setState({
                answersSelected: updatedSelection
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
          const workflow = this.props.route.params.workflow;
            const {id, first_task} = workflow
            const {
                answersSelected,
                imageDimensions
            } = this.state

            this.scrollView.scrollTo({x: 0, y: 0})
            classifierActions.addAnnotationToTask(id, first_task, answersSelected, false)
            classifierActions.saveClassification(workflow, subject, imageDimensions)

            this.setState({
                answersSelected: []
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
        const { workflow, project, inBetaMode } = this.props.route.params;

        const {
            answersSelected,
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
            <View style={[styles.tutorialContainer, colorModes.contentBackgroundColorFor(this.props.route.params.project.in_museum_mode)]}>
                <Tutorial
                    projectName={project.display_name}
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                    isInitialTutorial={needsTutorial}
                    tutorial={tutorial}
                    finishTutorial={() => this.finishTutorial()}
                />
            </View>


        const question =
            <View style={styles.questionContainer}>
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

        const uri = subject.displays[0].src
        const video = uri.slice(uri.length - 4).match('.mp4')
        const showSubjectOptionsBar = video && Platform.OS === 'android'
        const fullWidthAnswers = answers.some(a => a.label.length >= 25)
        const answerContainerStyles = fullWidthAnswers ? {} : { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' };

        const classificationPanel =
            <View style={styles.classificationPanel}>
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
                        <>
                            <View style={styles.flex}  onLayout={({nativeEvent}) => this.setState({
                                imageDimensions: {
                                    width: nativeEvent.layout.width,
                                    height: nativeEvent.layout.height
                                }
                            })}>
                                {video ?
                                    <View key={`MULTI_ANSWER_VIDEO_${uri}`}>
                                        <Video
                                            source={{ uri: uri }}
                                            style={{
                                                width: imageDimensions.width,
                                                height: 300
                                            }}
                                            controls={true}
                                            repeat={true}
                                            resizeMode='contain'
                                        />
                                        {showSubjectOptionsBar ?
                                            <View style={styles.optionsBarContainer}>
                                                <SubjectOptionsBar
                                                    numberOfSelections={subject.displays.length}
                                                    onExpandButtonPressed={() => this.setState({
                                                        showFullSize: true,
                                                        fullScreenImageSource: {uri: uri}
                                                    })}
                                                />
                                            </View>
                                            : null
                                        }
                                    </View>
                                    :                                    
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
                                }
                            </View>
                    <View style={styles.scrollView}>
                        <ScrollView
                            ref={ref => this.scrollView = ref}
                        >
                            <View
                                style={[styles.classifierContainer]}>
                                
                                <View style={[styles.answerButtonContainer, answerContainerStyles]}>
                                {
                                    answers.map((answer, index) =>
                                    <View key={index} >
                                        <ButtonAnswer
                                            selected={answersSelected.includes(index)}
                                            text={answer.label}
                                            onPress={this.onOptionSelected(answersSelected, index)}
                                            fullWidth={fullWidthAnswers}
                                        />   
                                    </View>
                                    )
                                }
                                </View>
                            </View>
                            <View style={styles.buttonContainer}>
                                <ButtonLarge
                                    text="Submit"
                                    onPress={this.submitClassification()}
                                />
                            </View>
                            </ScrollView>
                            {
                                task.help !== null &&
                                <View style={styles.needHelpContainer}>
                                    <NeedHelpButton
                                        onPress={() => this.classifierContainer.displayHelpModal()}
                                        inMuseumMode={this.props.route.params.project.in_museum_mode}
                                        />
                                </View>
                            }
                            {
                                R.length(guide.items) > 0 &&

                                <View style={styles.fieldGuideBtnContainer}>
                                    <FieldGuideBtn onPress={() => this.classifierContainer.displayFieldGuide()} />
                                </View>
                            }
                        </View>
                        </>
                       
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
            <View style={[styles.container, styles.dropShadow, colorModes.framingBackgroundColorFor(this.props.route.params.project.in_museum_mode)]}>
                <ClassifierHeader project={project} />
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

MultiAnswerClassifier.propTypes = {
    workflow: PropTypes.object,
    project: PropTypes.shape({
        display_name: PropTypes.string,
        in_museum_mode: PropTypes.bool,
        id: PropTypes.string
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
    classifierActions: PropTypes.any,
}

const styles = EStyleSheet.create({
    answerButtonContainer: {
        marginHorizontal: 12,
        paddingVertical: 16,
    },
    container: {
        flex: 1,
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
        backgroundColor: '#EBEBEB',
    },
    classifierContainer: {
        paddingVertical: 15,
    },
    tutorialContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#EBEBEB',
    },
    backgroundView: {
        backgroundColor: 'white',
        height: 200,
        position: 'absolute',
        top: -200,
        left: 0,
        right: 0,
    },
    buttonContainer: {
        marginTop: 10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    separator: {
        marginTop: 25
    },
    guideButton: {
        marginTop: 15
    },
    needHelpContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    questionContainer: {
        backgroundColor: '#EBEBEB',
        paddingVertical: 16
    },
    flex: {
        flex: 1,
    },
    fieldGuideBtnContainer: {
        alignItems: 'center',
        marginTop: 20,
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

export default connect(mapStateToProps, mapDispatchToProps)(MultiAnswerClassifier);