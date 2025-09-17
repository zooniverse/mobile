import React, { Component } from 'react'
import {
    Animated,
    Platform,
    View
} from 'react-native'
import PropTypes from 'prop-types'

import { filledInFormUrl } from '../../utils/googleFormUtils'
import TaskHelpModal from './TaskHelpModal'
import FieldGuide from './FieldGuide'
import PageKeys from '../../constants/PageKeys'
import { navRef } from '../../navigation/RootNavigator';
import { Translation } from 'react-i18next'
import { getCurrentProjectLanguage } from '../../i18n'

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

        this.displayHelpModal = this.displayHelpModal.bind(this)
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

        const fieldGuide =
            <FieldGuide
                guide={this.props.guide}
                isVisible={this.state.isFieldGuideVisible}
                inMuseumMode={this.props.inMuseumMode}
                onClose={() => this.setState({isFieldGuideVisible: false})}
            />


        return (
            <Translation ns="project">
                 { (t) => (
                    <View style={[styles.container]}>
                        {this.props.children}
                        <TaskHelpModal
                            text={t('workflow.tasks.T0.help', this.props.help, { ns: 'project', lng: getCurrentProjectLanguage() })}
                            isVisible={this.state.helpModalIsVisible}
                            inMuseumMode={this.props.inMuseumMode}
                            onCloseRequested={ () => this.setState({helpModalIsVisible: false}) }
                        />
                        { this.state.isFieldGuideVisible ? fieldGuide : null }
                    </View>
                )}
            </Translation>

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