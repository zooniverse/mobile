import React from 'react'
import {
  StyleSheet,
  View
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
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
import { append, contains, isEmpty, reverse, uniq } from 'ramda'
import * as classifierActions from '../actions/classifier'
import * as navBarActions from '../actions/navBar'
import Theme from '../theme'


const mapStateToProps = (state, ownProps) => ({
  isSuccess: state.classifier.isSuccess,
  isFailure: state.classifier.isFailure,
  isFetching: state.classifier.isFetching,
  annotations: state.classifier.annotations[ownProps.workflow.id] || {},
  guide: state.classifier.guide[ownProps.workflow.id] || {},
  tutorial: state.classifier.tutorial[ownProps.workflow.id] || {},
  needsTutorial: state.classifier.needsTutorial[ownProps.workflow.id] || false,
  subject: state.classifier.subject[ownProps.workflow.id] || {},
  nextSubject: state.classifier.nextSubject[ownProps.workflow.id] || {},
  subjectDisplayWidth: state.main.device.subjectDisplayWidth,
  subjectDisplayHeight: state.main.device.subjectDisplayHeight,
  seenThisSession: state.classifier.seenThisSession[ownProps.workflow.id] || [],
})

const mapDispatchToProps = (dispatch) => ({
  classifierActions: bindActionCreators(classifierActions, dispatch),
  navBarActions: bindActionCreators(navBarActions, dispatch)
})

const PAGE_KEY = 'SwipeClassifier';
export class SwipeClassifier extends React.Component {
  constructor(props) {
    super(props)
    this.setQuestionVisibility = this.setQuestionVisibility.bind(this)
    this.state = {
      isQuestionVisible: true,
      showFullSize: false,
    }
    this.props.classifierActions.startNewClassification(this.props.workflow, this.props.project)
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

  onAnswered = (answer) => {
    const { id, first_task } = this.props.workflow
    this.props.classifierActions.addAnnotationToTask(id, first_task, answer, false)
    this.props.classifierActions.saveThenStartNewClassification(this.props.workflow)
  }

  onUnlinkedTaskAnswered = (task, value) => {
    const taskAnnotations = this.props.annotations[task] || []
    const { id } = this.props.workflow
    if (contains(value, taskAnnotations)) {
      this.props.classifierActions.removeAnnotationFromTask(id, task, value)
    } else {
      this.props.classifierActions.addAnnotationToTask(id, task, value, true)
    }
  }

  componentDidMount() {
    const { display_name, inTestMode, navBarActions, classifierActions } = this.props
    navBarActions.setTitleForPage(display_name, PAGE_KEY)
    classifierActions.setClassifierTestMode(inTestMode)
    if (inTestMode) {
      navBarActions.setNavbarColorForPage(Theme.$testRed, PAGE_KEY)
    } else {
      navBarActions.setNavbarColorForPageToDefault(PAGE_KEY)
    }
  }

  static renderNavigationBar() {
    return <NavBar pageKey={PAGE_KEY} showBack={true} />;
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
            workflowID={this.props.workflow.id}
            taskHelp={task.help}
          />
          <View style={[styles.subjectContainer, { width: this.props.subjectDisplayWidth, height: this.props.subjectDisplayHeight }]}>
            { isEmpty(this.props.nextSubject) ? null : backSubject }
          </View>
        </View>

      const swipeableSubject =
        <Swipeable
          key={this.props.subject.id}
          workflow={this.props.workflow}
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
      this.props.isFetching || !this.props.isSuccess ? <OverlaySpinner overrideVisibility={this.props.isFetching} /> : renderClassifierOrTutorial()
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
  inTestMode: PropTypes.bool,
  isFetching: PropTypes.bool,
  isSuccess: PropTypes.bool,
  annotations: PropTypes.object,
  workflowID: PropTypes.string,
  display_name: PropTypes.string,
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
  subjectDisplayWidth: PropTypes.number,
  subjectDisplayHeight: PropTypes.number,
  seenThisSession: PropTypes.array,
  project: PropTypes.shape({
    display_name: PropTypes.string,
    id: PropTypes.string
  }),
  tutorial: PropTypes.object,
  needsTutorial: PropTypes.bool,
  guide: PropTypes.object,
  classifierActions: PropTypes.any,
  navBarActions: PropTypes.any
}

export default connect(mapStateToProps, mapDispatchToProps)(SwipeClassifier)
