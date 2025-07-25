import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  TouchableOpacity,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';
import Markdown from 'react-native-simple-markdown'
import { connect } from 'react-redux'
import DeviceInfo from 'react-native-device-info'

import SizedMarkdown from '../common/SizedMarkdown'
import { setQuestionContainerHeight } from '../../actions/classifier'
import {
  extractFirstLinkedImageFrom,
  removeImagesFrom
} from '../../utils/markdownUtils'
import { withTranslation } from 'react-i18next';
import { getCurrentProjectLanguage } from '../../i18n';

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

  constructor(props) {
    super(props)
  }


  render() {
    const translationLocation = this.props.isDrawClassifier ? 'workflow.tasks.T0.instruction' : 'workflow.tasks.T0.question';
    const questionTranslated = this.props.t(translationLocation, this.props.backupText, {ns: 'project', lng: getCurrentProjectLanguage()})
    const imageSource = extractFirstLinkedImageFrom(questionTranslated)
    const question = removeImagesFrom(questionTranslated)

    return (
      <View style={styles.questionContainer}>
          <View>
            <SizedMarkdown inMuseumMode={this.props.inMuseumMode}>
              {question}
            </SizedMarkdown>
          </View>
          {
            imageSource ? 
              <TouchableOpacity 
                onPress={() => {this.props.onPressImage(imageSource, question)}}
                style={styles.image}
              >
                <Image 
                  style={styles.markdown} 
                  source={{ uri: imageSource }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            :
              null
          }
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  image: {
    flex: 1,
    paddingLeft: 15,
    paddingBottom: 10,
    width: 100,
    height: 100
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 10,
    marginHorizontal: 20,
  },
  question: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100% - 80',
  },
})

Question.propTypes = {
  question: PropTypes.string,
  workflowID: PropTypes.string,
  taskHelp: PropTypes.string,
  setQuestionContainerHeight: PropTypes.func,
  questionContainerHeight: PropTypes.number,
  onPressImage: PropTypes.func,
  inMuseumMode: PropTypes.bool,
}

Question.defaultProps = {
  inMuseumMode: false,
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(Question))
