import React from 'react'
import {
  StyleSheet,
  View
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import { connect } from 'react-redux'
import ClassificationPanel from './ClassificationPanel'
import Question from './Question'
import Tutorial from './Tutorial'
import Swipeable from './Swipeable'
import SwipeSubject from './SwipeSubject'
import SwipeTabs from './SwipeTabs'
import OverlaySpinner from './OverlaySpinner'
import NavBar from './NavBar'
import FullScreenImage from './FullScreenImage'
import UnlinkedTask from './UnlinkedTask'
import { setState } from '../actions/index'
import {
  startNewClassification,
  setTutorialCompleted,
  saveAnnotation,
  saveThenStartNewClassification,
  removeAnnotationValue
} from '../actions/classifier'
import { append, contains, isEmpty, reverse, uniq } from 'ramda'

const mapStateToProps = (state, ownProps) => ({
  isFetching: state.main.classifier.isFetching,
  annotations: state.main.classifier.annotations[ownProps.workflowID] || {},
  workflow: state.main.classifier.workflow[ownProps.workflowID] || {},
  project: state.main.classifier.project[ownProps.workflowID] || {},
  guide: state.main.classifier.guide[ownProps.workflowID] || {},
  tutorial: state.main.classifier.tutorial[ownProps.workflowID] || {},
  needsTutorial: state.main.classifier.needsTutorial[ownProps.workflowID] || false,
  subject: state.main.classifier.subject[ownProps.workflowID] || {},
  nextSubject: state.main.classifier.nextSubject[ownProps.workflowID] || {},
  subjectDisplayWidth: state.main.device.subjectDisplayWidth,
  subjectDisplayHeight: state.main.device.subjectDisplayHeight,
  seenThisSession: state.main.classifier.seenThisSession[ownProps.workflowID] || [],
})

const mapDispatchToProps = (dispatch) => ({
  startNewClassification(workflowID) {
    dispatch(startNewClassification(workflowID))
  },
  setTutorialCompleted() {
    dispatch(setTutorialCompleted())
  },
  setIsFetching(isFetching) {
    dispatch(setState('classifier.isFetching', isFetching))
  },
  saveAnnotation(task, value) {
    dispatch(saveAnnotation(task, value))
  },
  saveThenStartNewClassification(answerIndex) {
    dispatch(saveThenStartNewClassification(answerIndex))
  },
  removeAnnotationValue(task, value) {
    dispatch(removeAnnotationValue(task, value))
  },
})

export class SwipeClassifier extends React.Component {
  constructor(props) {
    super(props)
    this.setQuestionVisibility = this.setQuestionVisibility.bind(this)
    this.state = {
      isQuestionVisible: true,
      showFullSize: false,
    }
    this.props.setIsFetching(true)
    this.props.startNewClassification(this.props.workflowID)
  }

  setQuestionVisibility(isVisible) {
    this.setState({isQuestionVisible: isVisible})
  }

  finishTutorial() {
    if (this.props.needsTutorial) {
      this.props.setTutorialCompleted()
    } else {
      this.setQuestionVisibility(true)
    }
  }

  onAnswered = (answer) => {
    this.props.saveAnnotation(this.props.workflow.first_task, answer)
    this.props.saveThenStartNewClassification()
  }

  onUnlinkedTaskAnswered = (task, value) => {
    const taskAnnotations = this.props.annotations[task] || []
    if (contains(value, taskAnnotations)) {
      this.props.removeAnnotationValue(task, value)
    } else {
      this.props.saveAnnotation(task, uniq(append(value, taskAnnotations)))
    }
  }

  static renderNavigationBar() {
    return <NavBar title={'Classify'} showBack={true} />;
  }

  render() {
    const renderClassifierOrTutorial = () => {
      const key = this.props.workflow.first_task //always just one task
      const task = this.props.workflow.tasks[key]
      const answers = reverse(task.answers)  //Yes is listed first in project, but we need No listed first (on left)
      const allowPanAndZoom = this.props.workflow.configuration.pan_and_zoom

      const unlinkedTask = task.unlinkedTask
        ? <UnlinkedTask
            unlinkedTaskKey={ task.unlinkedTask }
            unlinkedTask={ this.props.workflow.tasks[task.unlinkedTask] }
            annotation={ this.props.annotations[task.unlinkedTask] }
            onAnswered={ this.onUnlinkedTaskAnswered }/>
        : null
      const subjectSizes = {
        resizedHeight: this.props.subjectDisplayHeight,
        resizedWidth: this.props.subjectDisplayWidth
      }
      const backSubject =
        <SwipeSubject
          inFront={false}
          subject={this.props.nextSubject}
          subjectSizes={subjectSizes}
          seenThisSession={this.props.seenThisSession}
          setImageSizes={() => {}}
        />

      const classification =
        <View>
          <Question
            question={task.question}
            workflowID={this.props.workflowID}
            taskHelp={task.help}
          />
          <View style={[styles.subjectContainer, { width: this.props.subjectDisplayWidth, height: this.props.subjectDisplayHeight }]}>
            { isEmpty(this.props.nextSubject) ? null : backSubject }
          </View>
        </View>

      const swipeableSubject =
        <Swipeable
          key={this.props.subject.id}
          workflowID={this.props.workflowID}
          onAnswered={this.onAnswered}
          answers={answers}
          showFullSize={() => this.setState({showFullSize: true})}
        />

      const swipeTabs =
        <SwipeTabs
          guide={this.props.guide}
          onAnswered={this.onAnswered}
          answers={answers}
        />

      const tutorial =
        <Tutorial
          projectName={this.props.project.display_name}
          isInitialTutorial={this.props.needsTutorial}
          tutorial={this.props.tutorial}
          finishTutorial={() => this.finishTutorial()}
        />

      //swipeable subject needs to be outside the Classification Panel because of Android
      //the swipeable area is cut off to the panel otherwise
      const classificationPanel =
        <View style={{...StyleSheet.absoluteFillObject}}>
          <ClassificationPanel
            isFetching={ this.props.isFetching }
            hasTutorial = { !isEmpty(this.props.tutorial) }
            isQuestionVisible = {this.state.isQuestionVisible }
            setQuestionVisibility = { this.setQuestionVisibility }>
            { this.state.isQuestionVisible ? classification : tutorial }
            { this.state.isQuestionVisible ? unlinkedTask :null }
          </ClassificationPanel>
          { this.state.isQuestionVisible ? swipeableSubject : null }
          { this.state.isQuestionVisible ? swipeTabs : null }
          <FullScreenImage
            source={{uri: this.props.subject.display.src}}
            isVisible={this.state.showFullSize}
            allowPanAndZoom={allowPanAndZoom}
            handlePress={() => this.setState({ showFullSize: false })} />
        </View>

      return (
        this.props.needsTutorial ? tutorial : classificationPanel
      )
    }

    return (
      this.props.isFetching || isEmpty(this.props.workflow) ? <OverlaySpinner overrideVisibility={this.props.isFetching} /> : renderClassifierOrTutorial()
    )
  }
}

const styles = EStyleSheet.create({
  subjectContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
})

SwipeClassifier.propTypes = {
  isFetching: PropTypes.bool,
  annotations: PropTypes.object,
  workflowID: PropTypes.string,
  workflow: PropTypes.shape({
    first_task: PropTypes.string,
    tasks: PropTypes.object,
    configuration: PropTypes.object,
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
  subjectDisplayWidth: PropTypes.number,
  subjectDisplayHeight: PropTypes.number,
  seenThisSession: PropTypes.array,
  startNewClassification: PropTypes.func,
  saveThenStartNewClassification: PropTypes.func,
  saveAnnotation: PropTypes.func,
  removeAnnotationValue:  PropTypes.func,
  setIsFetching: PropTypes.func,
  project: PropTypes.shape({
    display_name: PropTypes.string,
  }),
  tutorial: PropTypes.object,
  needsTutorial: PropTypes.bool,
  guide: PropTypes.object,
  setTutorialCompleted: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(SwipeClassifier)
