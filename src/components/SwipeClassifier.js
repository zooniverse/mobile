import React from 'react'
import { connect } from 'react-redux'
import ClassificationPanel from './ClassificationPanel'
import Question from './Question'
import OverlaySpinner from './OverlaySpinner'
import NavBar from './NavBar'
import { setState } from '../actions/index'
import { startNewClassification } from '../actions/classifier'

const mapStateToProps = (state, ownProps) => ({
  isFetching: state.classifier.isFetching,
  workflow: state.classifier.workflow[ownProps.workflowID] || {},
})

const mapDispatchToProps = (dispatch) => ({
  startNewClassification(workflowID) {
    dispatch(startNewClassification(workflowID))
  },
  setIsFetching(isFetching) {
    dispatch(setState('classifier.isFetching', isFetching))
  },
})

export class SwipeClassifier extends React.Component {
  componentWillMount() {
    this.props.setIsFetching(true)
    this.props.startNewClassification(this.props.workflowID)
  }

  static renderNavigationBar() {
    return <NavBar title={'Classify'} showBack={true} />;
  }

  render() {
    const renderClassifier = () => {
      const key = this.props.workflow.first_task //always just one task
      const task = this.props.workflow.tasks[key]
      return (
        <ClassificationPanel
          isFetching={ this.props.isFetching }
          hasTutorial = { false }>
          <Question question={task.question} workflowID={this.props.workflowID} />
        </ClassificationPanel>
      )
    }

    return (
        this.props.isFetching ? <OverlaySpinner overrideVisibility={this.props.isFetching} /> : renderClassifier()
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
}

export default connect(mapStateToProps, mapDispatchToProps)(SwipeClassifier)
