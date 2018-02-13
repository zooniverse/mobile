import React, { Component } from 'react'
import {
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledModal from './StyledModal'
import StyledText from './StyledText'
import Button from './Button'
import { addIndex, map } from 'ramda'
import PropTypes from 'prop-types';

export class WorkflowPrompt extends Component {
  render() {
    const renderButtonGroup = (workflows, isSwipe) => {
      return (
        <View style={styles.buttonsContainer}>
          { addIndex(map)(
            (workflow, idx) => {
              return renderButton(workflow, idx, isSwipe)
            },
            workflows
          ) }
        </View>
      )
    }

    const renderButton = (workflow, idx, isMobile) => {
      const chooseWorkflow = (workflow) => {
        this.props.hideWorkflowPrompt()
        if (isMobile) {
          this.props.openMobileProject(workflow.id)
        } else {
          this.props.openExternalProject()
        }
      }
      return (
        <Button
          key={idx}
          text={ workflow.display_name }
          additionalStyles={[styles.button]}
          additionalTextStyles={[styles.buttonText]}
          handlePress={ ()=> { chooseWorkflow(workflow) }}
        />
      )
    }

    return (
      <StyledModal
        isVisible={this.props.isVisible}
        setVisibility={this.props.hideWorkflowPrompt}>
        <StyledText
          additionalStyles={[styles.header]}
          text={ 'Please Choose Workflow' } />

        <StyledText
          textStyle={'headerText'}
          additionalStyles={[styles.prompt]}
          text={ 'FOR MOBILE' } />

        { renderButtonGroup(this.props.mobileWorkflows, true) }

        <StyledText
          textStyle={'headerText'}
          additionalStyles={[styles.prompt]}
          text={ 'OTHER WORKFLOWS' } />

        { renderButtonGroup(this.props.nonMobileWorkflows, false) }

        <Button
          handlePress={ this.props.hideWorkflowPrompt }
          additionalStyles={[styles.cancelButton]}
          buttonStyle={'navyButton'}
          text={'Cancel'} />
      </StyledModal>
    )
  }
}

const styles = EStyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: '500',
    color: '$darkGrey',
  },
  subheader: {
    color: '$grey',
  },
  prompt: {
    fontWeight: '500',
    fontSize: 14,
    marginTop: 20,
  },
  buttonsContainer: {
    marginBottom: 10,
    marginLeft: 8,
  },
  button: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '$darkGreyTextColor'
  },
  buttonText: {
    color: '$darkGreyTextColor'
  },
  link: {
    backgroundColor: 'white',
    borderWidth: 0,
    padding: 5,
    justifyContent: 'flex-start',

  },
  cancelButton: {
    marginTop: 20
  },
});

WorkflowPrompt.propTypes = {
  mobileWorkflows: PropTypes.array,
  nonMobileWorkflows: PropTypes.array,
  isVisible: PropTypes.bool,
  openMobileProject: PropTypes.func.isRequired,
  openExternalProject: PropTypes.func.isRequired,
  hideWorkflowPrompt: PropTypes.func.isRequired,
}

export default WorkflowPrompt
