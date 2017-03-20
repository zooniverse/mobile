import React, { Component } from 'react';
import {
  Dimensions,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledMarkdown from './StyledMarkdown'
import { connect } from 'react-redux'
import { setState } from '../actions/index'

//questionContainerHeight is stored in redux because the swipeable component needs
//to be absolutely positioned outside of the ContainerPanel for Android
//This is to help calculate that height

const mapStateToProps = (state, ownProps) => ({
  questionContainerHeight: state.classifier.questionContainerHeight[ownProps.workflowID] || 0,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setQuestionContainerHeight(height) {
    dispatch(setState(`classifier.questionContainerHeight.${ownProps.workflowID}`, height))
  },
})

export class Question extends Component {
  render() {
    return (
      <View style={[styles.questionContainer, { height: this.props.questionContainerHeight }]}>
        <View style={styles.question}>
          <StyledMarkdown
            extraCSS={ 'p {font-size: 14px; font-weight: 500; margin: 5px 0 0;}' }
            markdown={ this.props.question }
            width={ Dimensions.get('window').width - 100 }
            onResize={ (newHeight) => this.props.setQuestionContainerHeight(newHeight) }
          />
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
    flex: 1,
    width: '100%',
  },
})

Question.propTypes = {
  question: React.PropTypes.string,
  workflowID: React.PropTypes.string,
  setQuestionContainerHeight: React.PropTypes.func,
  questionContainerHeight: React.PropTypes.number,
}

export default connect(mapStateToProps, mapDispatchToProps)(Question)
