import React, { Component } from 'react'
import {
  Dimensions,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledModal from '../StyledModal'
import StyledMarkdown from '../StyledMarkdown'
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
          isVisible={this.props.isVisible}
          setVisibility={this.setVisibility}>

          <View style={styles.markdownContainer}>
            <StyledMarkdown
              extraCSS={'p{margin-top: 10px;}'}
              markdown={this.props.text}
              width={Dimensions.get('window').width - 80}
            />
          </View>

          <Button
            handlePress={this.props.onCloseRequested}
            buttonStyle={'navyButton'}
            text={'Close'} />

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
