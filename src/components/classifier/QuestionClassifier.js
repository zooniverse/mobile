import React, {Component} from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Platform,
    TouchableOpacity
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

import FullScreenMedia from '../FullScreenMedia'
import TappableSubject from './TappableSubject';

import ClassifierHeader from '../../navigation/ClassifierHeader';
import FieldGuideBtn from './FieldGuideBtn';
import ButtonLarge from './ButtonLarge';
import ButtonAnswer from './ButtonAnswer';
import { getDataForFeedbackModal, isFeedbackActive } from '../../utils/feedback';
import FeedbackModal from './FeedbackModal';
import Video from 'react-native-video'
import ExpandImageIcon from './ExpandImageIcon';
import { getCurrentProjectLanguage, getPreferredLanguageFromProject, loadProjectTranslations } from '../../i18n';
import { withTranslation } from 'react-i18next';
import TranslationsLoadingIndicator from '../common/TranslationsLoadingIndicator';
class QuestionClassifier extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isQuestionVisible: true,
            showFullSize: false,
            fullScreenImageSource: {uri: ''},
            fullScreenQuestion: '',
            imageDimensions: {width: 0, height: 0},
            answerSelected: -1,
            feedbackModal: {},
            translationsLoading: false,
        }

        this.loadedTranslationsRef = React.createRef();
    }

    // Update the loadProjectTranslations method
        async loadTranslations(language, project, workflow, guide, tutorial) {
            try {
                this.setState({
                    translationsLoading: true,
                })
    
                await loadProjectTranslations(
                    language, 
                    project, 
                    workflow, 
                    guide, 
                    tutorial
                );
    
            } catch (error) {
                console.warn('Error loading project translations:', error);
            } finally {
                this.setState({
                    translationsLoading: false,
                })
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

    submitClassificationPressed() {
        const {
            classifierActions,
            subject
        } = this.props
        const {
            answerSelected,
            imageDimensions
        } = this.state
        const { workflow, project } = this.props.route.params;
        const {id, first_task} = workflow
        const feedbackActive = isFeedbackActive(project, subject, workflow);
        if (feedbackActive) {
            const modalData = getDataForFeedbackModal(subject, workflow, answerSelected);
            if (modalData) {
                const onClose = () => {
                    this.setState({ feedbackModal: {} })
                    this.submitClassification(classifierActions, id, first_task, answerSelected, workflow, subject, imageDimensions, modalData.feedbackMeta);
                }
                this.scrollView.scrollTo({x: 0, y: 0})
                this.setState({ feedbackModal: { ...modalData, onClose } })
                return;
            }
        }
        
        this.scrollView.scrollTo({ x: 0, y: 0 })
        this.submitClassification(classifierActions, id, first_task, answerSelected, workflow, subject, imageDimensions);
       
    }

    submitClassification(classifierActions, id, first_task, answerSelected, workflow, subject, imageDimensions, feedbackMeta = null) {
        classifierActions.addAnnotationToTask(id, first_task, answerSelected, false)
        classifierActions.saveClassification(workflow, subject, imageDimensions, feedbackMeta)

        this.setState({
            answerSelected: -1
        })
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
            <View style={styles.flex}>
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
                    backupText={task.question}
                    isDrawClassifier={false}
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
        const uri = subject.displays[0]?.src;
        const video = uri.slice(uri.length - 4).match('.mp4')
        const showSubjectOptionsBar = video && Platform.OS === 'android'

        const seenThisSession = R.indexOf(subject.id, subjectsSeenThisSession) >= 0
        const fullWidthAnswers = answers.some(a => a.label.length >= 25)
        const answerContainerStyles = fullWidthAnswers ? {} : { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' };
        const classificationPanel =
            <View
                style={[styles.classificationPanel]}>
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
                                                <TouchableOpacity onPress={ () => this.setState({
                                                    showFullSize: true,
                                                    fullScreenImageSource: {uri: uri}
                                                })}>
                                                    <ExpandImageIcon />
                                                </TouchableOpacity>
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
                            <View style={styles.flex}>
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
                                                        selected={index === answerSelected}
                                                        text={this.props.t(`workflow.tasks.T0.answers.${index}.label`, answer.label, {ns: 'project', lng: getCurrentProjectLanguage()})}
                                                        onPress={this.onOptionSelected(index)}
                                                        fullWidth={fullWidthAnswers}
                                                    />
                                                </View>
                                            )
                                        }
                                        </View>
                                    </View>
                                    <View style={styles.buttonContainer}>
                                        <ButtonLarge
                                            disabled={answerSelected === -1}
                                            text={this.props.t('Mobile.classifier.submit', 'Submit')}
                                            onPress={() => this.submitClassificationPressed()}
                                        />
                                    </View>
                                </ScrollView>
                                {
                                    task.help &&
                                    <View style={styles.needHelpContainer}>
                                        <NeedHelpButton
                                            inMuseumMode={this.props.route.params.project.in_museum_mode}
                                            onPress={() => this.classifierContainer.displayHelpModal()}
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
            <SafeAreaView style={[styles.flex, styles.dropshadow]}>
                <ClassifierHeader project={project} />
                 {this.state.translationsLoading && (
                    <TranslationsLoadingIndicator />
                )}
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
            </SafeAreaView>
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
    answerButtonContainer: {
        marginHorizontal: 12,
        paddingVertical: 16,
    },
    flex: {
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
    backgroundView: {
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
        marginTop: 15,
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
    },
    optionsBarContainer: {
        position: 'absolute',
        bottom: 16,
        right: 16,
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

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(QuestionClassifier));