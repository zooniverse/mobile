import React, { Component } from 'react'
import {
    Animated,
    Platform,
    View
} from 'react-native'
import PropTypes from 'prop-types'

import BetaFeedbackView from './BetaFeedbackView'
import { filledInFormUrl } from '../../utils/googleFormUtils'
import TaskHelpModal from './TaskHelpModal'
import FieldGuide from './FieldGuide'
import PageKeys from '../../constants/PageKeys'
import { navRef } from '../../navigation/RootNavigator';

/**
 * This class handles all of the shared functionality between different classifiers
 */
class ClassifierContainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            feedbackViewHeight: new Animated.Value(0),
            helpModalIsVisible: false
        }

        this.onFeedbackViewLayout = this.onFeedbackViewLayout.bind(this)
        this.navigateToFeedback = this.navigateToFeedback.bind(this)
        this.displayHelpModal = this.displayHelpModal.bind(this)
    }

    /**
     * The following methods handle the beta feedback view functionality
     */

    navigateToFeedback() {
        const url = filledInFormUrl(
          this.props.project.display_name,
          this.props.project.id,
            Platform.OS)
        navRef.navigate(PageKeys.WebView, { uri: url, loadingText: 'Loading Feedback Form' })
      }
    
    onFeedbackViewLayout({nativeEvent}) {
        const { height } = nativeEvent.layout
        if (height !== this.state.feedbackViewHeight) {
          Animated.timing(this.state.feedbackViewHeight, {
            duration: 300,
            delay: 500,
            toValue: height,
            useNativeDriver: false,
          }).start()
        }
    }

    /**
     * The following functions handle the modal functionality
     */

    displayHelpModal() {
        this.setState({
            helpModalIsVisible: true
        })
    }

    displayFieldGuide() {
        this.setState({
            isFieldGuideVisible: true
        })
    }

    render() {

        const feedbackView = 
            <Animated.View style={{height: this.state.feedbackViewHeight}}>
                <BetaFeedbackView
                    onLayout={this.onFeedbackViewLayout}
                    onPress={this.navigateToFeedback}
                />
            </Animated.View>

        const fieldGuide =
            <FieldGuide
                guide={this.props.guide}
                isVisible={this.state.isFieldGuideVisible}
                inMuseumMode={this.props.inMuseumMode}
                onClose={() => this.setState({isFieldGuideVisible: false})}
            />


        return (
            <View style={[styles.container]}>
                {this.props.children}
                { this.props.inBetaMode ? feedbackView : null }
                <TaskHelpModal
                    text={this.props.help}
                    isVisible={this.state.helpModalIsVisible}
                    inMuseumMode={this.props.inMuseumMode}
                    onCloseRequested={ () => this.setState({helpModalIsVisible: false}) }
                />
                { this.state.isFieldGuideVisible ? fieldGuide : null }
            </View>
        )
    }

}

const styles = {
    container: {
        flex: 1,
    }
}

ClassifierContainer.propTypes = {
    inMuseumMode: PropTypes.bool,
    inBetaMode: PropTypes.bool.isRequired,
    children: PropTypes.element.isRequired,
    project: PropTypes.shape({
        id: PropTypes.string,
        display_name: PropTypes.string
    }),
    help: PropTypes.string,
    guide: PropTypes.shape({
        
    })
}

ClassifierContainer.defaultProps = {
    inMuseumMode: false
}

export default ClassifierContainer