import React, { Component } from 'react'
import {
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import SizedMarkdown from '../common/SizedMarkdown'
import PropTypes from 'prop-types';
import Modal from "react-native-modal";

import ButtonLarge from './ButtonLarge'
import FontedText from '../common/FontedText'
import Icon from 'react-native-vector-icons/Fontisto'


export class TaskHelpModal extends Component {
  constructor(props) {
    super(props)
    this.setVisibility = this.setVisibility.bind(this)
  }

  setVisibility(isVisible) {
    if (!isVisible) {
        this.props.onCloseRequested()
    }
  }

  render() {
    return (
      <View >
        <Modal isVisible={this.props.isVisible} >
          <View style={styles.modalContainer}>
            <View style={styles.helpCloseContainer}>
              <FontedText style={styles.helpText}>HELP</FontedText>
              <TouchableOpacity onPress={this.props.onCloseRequested}>
                <Icon name="close" color="#005D69" size={22} />
              </TouchableOpacity>
            </View>
            <ScrollView style={[styles.markdownContainer]}>
              <SizedMarkdown
                  inMuseumMode={this.props.inMuseumMode}
              >
                {this.props.text}
              </SizedMarkdown>
            </ScrollView>
            <View style={styles.closeBtnContainer}>
              <ButtonLarge text="Close" onPress={this.props.onCloseRequested}  />
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  markdownContainer: {
    paddingVertical: 5,
  },
  buttonStyle: {
    textAlign: 'center'
  },
  helpText: {
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.05,
    lineHeight: 21.04,
    color: '#005D69'
  },
  modalContainer: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 18,
    maxHeight: '80%'
  },
  helpCloseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  closeBtnContainer: {
    width: 190,
    marginTop: 16,
    alignSelf: 'center'
  }
})

TaskHelpModal.propTypes = {
    isVisible: PropTypes.bool,
    text: PropTypes.string,
    onCloseRequested: PropTypes.func,
    inMuseumMode: PropTypes.bool,
}

export default TaskHelpModal
