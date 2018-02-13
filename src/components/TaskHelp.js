import React, { Component } from 'react'
import {
  Dimensions,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledModal from './StyledModal'
import StyledMarkdown from './StyledMarkdown'
import Button from './Button'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types';


export class TaskHelp extends Component {
  constructor(props) {
    super(props)
    this.setVisibility = this.setVisibility.bind(this)
    this.state = {
      isVisible: false
    }
  }

  setVisibility(isVisible) {
    this.setState({isVisible})
  }

  render() {
    return (
      <View>
        <Icon name='question-circle'
          style={styles.helpIcon}
          onPress={() => this.setVisibility(true)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} />
        <StyledModal
          isVisible={this.state.isVisible}
          setVisibility={this.setVisibility}>

          <View style={styles.markdownContainer}>
            <StyledMarkdown
              extraCSS={'p{margin-top: 10px;}'}
              markdown={this.props.text}
              width={Dimensions.get('window').width - 80}
            />
          </View>

          <Button
            handlePress={() => this.setVisibility(false)}
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
  },
  helpIcon: {
    fontSize: 20,
    color: 'black',
    paddingTop: 5
  },
  helpText: {
    color: 'black'
  }
})

TaskHelp.propTypes = {
  text: PropTypes.string,
}

export default TaskHelp
