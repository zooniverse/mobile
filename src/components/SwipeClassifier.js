import React from 'react'
import { connect } from 'react-redux'
import ClassificationPanel from './ClassificationPanel'
import Question from './Question'
import Tutorial from './Tutorial'
import OverlaySpinner from './OverlaySpinner'
import NavBar from './NavBar'
import { setState } from '../actions/index'
import { startNewClassification, setTutorialCompleted } from '../actions/classifier'
import { isEmpty } from 'ramda'

const mapStateToProps = (state, ownProps) => ({
  isFetching: state.classifier.isFetching,
  workflow: state.classifier.workflow[ownProps.workflowID] || {},
  project: state.classifier.project[ownProps.workflowID] || {},
  tutorial: state.classifier.tutorial[ownProps.workflowID] || {},
  needsTutorial: state.classifier.needsTutorial[ownProps.workflowID] || false,
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
})

export class SwipeClassifier extends React.Component {
  constructor(props) {
    super(props)
    this.setQuestionVisibility = this.setQuestionVisibility.bind(this)
    this.state = {
      isQuestionVisible: true,
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

  static renderNavigationBar() {
    return <NavBar title={'Classify'} showBack={true} />;
  }

  render() {
    const renderClassifierOrTutorial = () => {
      const key = this.props.workflow.first_task //always just one task
      const task = this.props.workflow.tasks[key]

      const classifier =
        <Question question={task.question} workflowID={this.props.workflowID} />

      const tutorial =
        <Tutorial
          projectName={this.props.project.display_name}
          isInitialTutorial={this.props.needsTutorial}
          tutorial={this.props.tutorial}
          finishTutorial={() => this.finishTutorial()} />

      const classifierOrTutorial = this.state.isQuestionVisible ? classifier : tutorial

      const classificationPanel =
        <ClassificationPanel
          isFetching={ this.props.isFetching }
          hasTutorial = { !isEmpty(this.props.tutorial) }
          isQuestionVisible = {this.state.isQuestionVisible }
          setQuestionVisibility = { this.setQuestionVisibility }>
          { classifierOrTutorial }
        </ClassificationPanel>

      return (
        this.props.needsTutorial ? tutorial : classificationPanel
      )
    }

    const renderSpinner = this.props.isFetching || this.props.workflow === undefined
    return (
      renderSpinner ? <OverlaySpinner overrideVisibility={renderSpinner} /> : renderClassifierOrTutorial()
    )
  }
}

SwipeClassifier.propTypes = {
  isFetching: React.PropTypes.bool,
  workflowID: React.PropTypes.string,
  workflow: React.PropTypes.shape({
    first_task: React.PropTypes.string,
    tasks: React.PropTypes.object,
  }),
  startNewClassification: React.PropTypes.func,
  setIsFetching: React.PropTypes.func,
  project: React.PropTypes.shape({
    display_name: React.PropTypes.string,
  }),
  tutorial: React.PropTypes.object,
  needsTutorial: React.PropTypes.bool,
  setTutorialCompleted: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(SwipeClassifier)
