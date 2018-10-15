import React, { Component } from 'react'
import {
    Platform,
    Modal,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { BlurView } from 'react-native-blur';
import Theme from '../../theme'
import EStyleSheet from 'react-native-extended-stylesheet'
import CloseButton from '../common/CloseButton'
import MarkableImage from './components/MarkableImage'
import DrawingButtons from './components/DrawingButtons'
import InstructionView from './components/InstructionView'

class DrawingModal extends Component {

    constructor(props) {
        super(props)

        this.state = {
            mode: 'unselected'
        }

        this.handleDrawingButtonPress = this.handleDrawingButtonPress.bind(this)
    }

    handleDrawingButtonPress(drawingButton) {
        this.setState({
            mode: drawingButton
        })
    }

    render() {
        return (
            <Modal
                onRequestClose={this.props.onClose}
                presentationStyle="overFullScreen"
                animationType="fade"
                visible={this.props.visible}
                transparent
            >
                { 
                    Platform.OS === 'ios' ?
                        <BlurView style={styles.blurView} blurType="light" />
                    :
                        <View style={ [styles.blurView, styles.androidBlurView] } />
                }
                <View style={styles.modalContainer}>
                    <MarkableImage
                        source={this.props.imageSource}
                    />
                    <DrawingButtons
                        onButtonSelected={this.handleDrawingButtonPress}
                        highlightedButton={this.state.mode}
                    />
                    <InstructionView
                        {... this.props.tool}
                        numberDrawn={0}
                        onCancel={this.props.onClose}
                        onSave={this.props.onClose}
                    />
                </View>
                <CloseButton
                    onPress={this.props.onClose}
                    style={styles.closeButton}
                    color={Theme.$zooniverseTeal}
                    backgroundColor="white"
                    size={34}
                />
            </Modal>
        )
    }
}

const styles = EStyleSheet.create({
    blurView: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    androidBlurView: {
        backgroundColor: 'rgba(255,255,255, 0.8)'
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 25
    },
    circle: {
        position: 'absolute',
        right: 12,
        top: 30,
        height: 25,
        width: 25,
        borderRadius: 25,
        backgroundColor: 'white'
    },
    modalContainer: {
        backgroundColor: 'rgba(237,240,243,1)',
        flex: 1,
        marginHorizontal: 25,
        marginBottom: 25,
        marginTop: 40
    }

})

DrawingModal.propTypes = {
    visible: PropTypes.bool,
    imageSource: PropTypes.string,
    onClose: PropTypes.func,
    tool: PropTypes.shape({
        max: PropTypes.string,
        min: PropTypes.string,
        type: PropTypes.string,
        color: PropTypes.string,
        label: PropTypes.string,
        details: PropTypes.array,
    })
}

export default connect(null, null)(DrawingModal)