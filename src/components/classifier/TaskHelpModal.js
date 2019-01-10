import React, { Component } from 'react'
import {
  ScrollView,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledModal from '../StyledModal'
import SizedMarkdown from '../common/SizedMarkdown'
import Button from '../Button'
import PropTypes from 'prop-types';


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
      <View>
        <StyledModal
          title="Help"
          isVisible={this.props.isVisible}
          setVisibility={this.setVisibility}
        >

          <ScrollView style={styles.markdownContainer}>
            <SizedMarkdown>
              {this.props.text}
            </SizedMarkdown>
          </ScrollView>

          <Button
            handlePress={this.props.onCloseRequested}
            buttonStyle={'tealButton'}
            additionalTextStyles={{textAlign: 'center'}}
            text={'Close'} 
          />
        </StyledModal>
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  markdownContainer: {
    flex: 1,
    paddingVertical: 5,
  }
})

TaskHelpModal.propTypes = {
    isVisible: PropTypes.bool,
    text: PropTypes.string,
    onCloseRequested: PropTypes.func
}

export default TaskHelpModal
