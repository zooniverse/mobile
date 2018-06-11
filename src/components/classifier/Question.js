import React, { Component } from 'react';
import {
  Dimensions,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';
import StyledMarkdown from '../StyledMarkdown'
import Markdown from 'react-native-simple-markdown'
import { connect } from 'react-redux'
import { setQuestionContainerHeight } from '../../actions/classifier'

//questionContainerHeight is stored in redux because the swipeable component needs
//to be absolutely positioned outside of the ContainerPanel for Android
//This is to help calculate that height

const mapStateToProps = (state, ownProps) => ({
  questionContainerHeight: state.classifier.questionContainerHeight[ownProps.workflowID] || 0,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setQuestionContainerHeight(height) {
    dispatch(setQuestionContainerHeight(ownProps.workflowID, height))
  },
})

export class Question extends Component {
  render() {
    return (
      <View style={[styles.questionContainer]}>
        <View style={styles.question}>
          <Markdown>
            {this.props.question}
          </Markdown>
        </View>
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 10,
    marginHorizontal: 20,
  },
  question: {
    backgroundColor: 'transparent',
    flex: 1,
    width: '100% - 80',
  },
})

Question.propTypes = {
  question: PropTypes.string,
  workflowID: PropTypes.string,
  taskHelp: PropTypes.string,
  setQuestionContainerHeight: PropTypes.func,
  questionContainerHeight: PropTypes.number,
}

export default connect(mapStateToProps, mapDispatchToProps)(Question)
