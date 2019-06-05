import React, { Component } from 'react';
import {
    ScrollView,
    View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import R from 'ramda';

import { getTaskFromWorkflow, getAnswersFromWorkflow } from '../../utils/workflow-utils'
import { markdownContainsImage } from '../../utils/markdownUtils'
import * as classifierActions from '../../actions/classifier'
import ClassifierContainer from './ClassifierContainer'
import ClassificationPanel from './ClassificationPanel'
import NeedHelpButton from './NeedHelpButton'
import Tutorial from './Tutorial';
import OverlaySpinner from '../OverlaySpinner'
import Question from './Question'
import Separator from '../common/Separator'
import ClassifierButton from './ClassifierButton'
import FullScreenImage from '../FullScreenImage'
import TapableSubject from './TapableSubject';

class MultiAnswerClassifier extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isQuestionVisible: true,
            showFullSize: false,
            fullScreenImageSource: { uri: '' },
            fullScreenQuestion: '',
            imageDimensions: { width: 0, height: 0 },
            answersSelected: []
        }
    }

    setQuestionVisibility() {
        return (isVisible) => {
            this.setState({isQuestionVisible: isVisible})
        }
    }

    finishTutorial() {
      if (this.props.needsTutorial) {
        this.props.classifierActions.setTutorialCompleted(this.props.workflow.id, this.props.project.id)
      } else {
        this.setQuestionVisibility()(true)
      }
    }

    onOptionSelected(answersSelected, index) {
      return () => {
        var addedAnswer = answersSelected.concat(index)
        this.setState({
            answersSelected: addedAnswer
        })

        setTimeout(() => this.scrollView.scrollToEnd(), 300)
      }
    }

    submitClassification() {
      return () => {
        const {
          classifierActions,
          workflow,
          subject
        } = this.props
        const { id, first_task } = workflow
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
        project,
        workflow,
        subject,
        subjectsSeenThisSession,
        task,
        inBetaMode,
        guide,
        answers
      } = this.props

      const {
        answersSelected,
        imageDimensions,
        isQuestionVisible,
        fullScreenImageSource,
        fullScreenQuestion,
        showFullSize
      } = this.state

      if (isFetching || !isSuccess) {
          return <OverlaySpinner overrideVisibility={isFetching} />
      }

      const renderTutorial = () =>
          <View style={styles.tutorialContainer}>
              <Tutorial
                  projectName={project.display_name}
                  isInitialTutorial={needsTutorial}
                  tutorial={tutorial}
                  finishTutorial={() => this.finishTutorial()}
              />
          </View>

      const question =
          <View>
            <Question
              question={task.question}
              workflowID={workflow.id}
              onPressImage={(src, question) => {
                this.setState({
                  showFullSize: true,
                  fullScreenImageSource: ({uri: src}),
                  fullScreenQuestion: question
                })}
              }
            />
            {
              markdownContainsImage(task.question) ?
                <Separator style={styles.questionSeparator} />
              :
                null
            }
          </View>

      const seenThisSession = R.indexOf(subject.id, subjectsSeenThisSession) >= 0
      const classificationPanel =
          <View style={styles.classificationPanel}>
            <ClassificationPanel
              hasTutorial = { !R.isEmpty(tutorial) }
              isQuestionVisible = {isQuestionVisible }
              setQuestionVisibility = { this.setQuestionVisibility() }
            >
              {
                isQuestionVisible &&
                  <View>
                    { question }
                  </View>
              }
            </ClassificationPanel>
            {
              isQuestionVisible ?
                <ScrollView
                  style={styles.scrollView}
                  ref={ref => this.scrollView = ref}
                >
                  <View style={styles.backgroundView} />
                  <View style={styles.classifierContainer}>
                    <View onLayout={({nativeEvent}) => this.setState({imageDimensions: {width: nativeEvent.layout.width, height: nativeEvent.layout.height}})}>
                      <TapableSubject
                        height={300}
                        width={imageDimensions.width}
                        subject={subject}
                        alreadySeen={seenThisSession}
                        onPress={(imageSource) => this.setState({
                          showFullSize: true,
                          fullScreenImageSource: {uri: imageSource}})}
                      />
                    </View>
                    {
                      answers.map((answer, index) =>
                        <View key={index} style={styles.buttonContainer}>
                          <ClassifierButton
                            selected={answersSelected.includes(index)}
                            blurred={!answersSelected.includes(index)}
                            type="answer"
                            text={answer.label}
                            onPress={this.onOptionSelected(answersSelected, index)}
                          />
                        </View>
                      )
                    }
                  </View>
                  <View style={styles.buttonContainer}>
                    <ClassifierButton
                      disabled={answersSelected === []}
                      type="answer"
                      text="Submit"
                      onPress={this.submitClassification()}
                    />
                  </View>
                  {
                    (task.help || R.length(guide.items) > 0) &&
                      <Separator style={styles.separator}/>
                  }
                  {
                    task.help &&
                      <NeedHelpButton
                        onPress={() => this.classifierContainer.displayHelpModal()}
                      />
                  }
                  {
                    R.length(guide.items) > 0 &&
                      <ClassifierButton
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
            <FullScreenImage
              source={fullScreenImageSource}
              isVisible={showFullSize}
              handlePress={() => this.setState({ fullScreenQuestion: '', showFullSize: false })}
              question={fullScreenQuestion}
            />
          </View>

        return (
                <View style={styles.container}>
                    <ClassifierContainer
                        inBetaMode={inBetaMode}
                        project={project}
                        help={task.help}
                        guide={guide}
                        ref={ref => this.classifierContainer = ref}
                    >
                        { needsTutorial ? renderTutorial() : classificationPanel }
                    </ClassifierContainer>
                </View>
        );
    }
}

MultiAnswerClassifier.propTypes = {
    project: PropTypes.object,
    workflow: PropTypes.object,
    display_name: PropTypes.string,
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
    classificationPanel: {
        flex: 1,
        overflow: 'visible',
        marginBottom: 15,
	},
	classifierContainer: {
		paddingHorizontal: 15,
		paddingVertical: 15,
		backgroundColor: 'white'
  },
  tutorialContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 25
  },
  scrollView: {
    flex: 1,
    marginHorizontal: 25
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
      task: getTaskFromWorkflow(ownProps.workflow),
      answers: getAnswersFromWorkflow(ownProps.workflow),
      isSuccess: state.classifier.isSuccess,
      isFailure: state.classifier.isFailure,
      isFetching: state.classifier.isFetching,
      annotations: state.classifier.annotations[ownProps.workflow.id] || {},
      guide: state.classifier.guide[ownProps.workflow.id] || {},
      tutorial: state.classifier.tutorial[ownProps.workflow.id] || {},
      needsTutorial: state.classifier.needsTutorial[ownProps.workflow.id] || false,
      subject: state.classifier.subject || {},
      subjectsSeenThisSession: state.classifier.seenThisSession[ownProps.workflow.id] || []
   }
  }

  const mapDispatchToProps = (dispatch) => ({
    classifierActions: bindActionCreators(classifierActions, dispatch),
  })

export default connect(mapStateToProps, mapDispatchToProps)(MultiAnswerClassifier);