import React, { Component } from 'react'
import {
    Alert,
    Platform,
    Modal,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { BlurView } from 'react-native-blur';
import { bindActionCreators } from 'redux'
import R from 'ramda'
import Theme from '../../theme'
import EStyleSheet from 'react-native-extended-stylesheet'
import CloseButton from '../common/CloseButton'
import MarkableImage from './components/MarkableImage'
import DrawingButtons from './components/DrawingButtons'
import InstructionView from './components/InstructionView'

import * as drawingActions from '../../actions/drawing'

const mapStateToProps = state => ({
    canUndo: state.drawing.actions.length > 0,
    shouldConfirmOnClose: !R.isEmpty(state.drawing.shapes) || !R.isEmpty(state.drawing.shapesInProgress)
})

const mapDispatchToProps = dispatch => ({
     drawingActions: bindActionCreators(drawingActions, dispatch)
})

class DrawingModal extends Component {

    constructor(props) {
        super(props)

        this.state = {
            mode: 'draw'
        }

        this.handleDrawingButtonPress = this.handleDrawingButtonPress.bind(this)
        this.onCancel = this.onCancel.bind(this)
        this.onSave = this.onSave.bind(this)
    }

    handleDrawingButtonPress(drawingButton) {
        if (drawingButton === 'undo') {
            this.props.drawingActions.undoMostRecentEdit()
        } else {
            this.setState({
                mode: drawingButton
            })
        }
    }

    onCancel() {
        const onConfirm = () => {
            this.props.drawingActions.clearShapes()
            this.props.onClose()
        }

        if (this.props.shouldConfirmOnClose) {
            Alert.alert(
                'Are you sure?',
                'This will erase all of your annotations.',
                [
                    {text: 'Yes', onPress: onConfirm},
                    {text: 'Cancel', style: 'cancel'},
                ],
                { cancelable: false }
            )
        } else {
            onConfirm()
        }
    }

    onSave() {
        this.props.drawingActions.saveEdits()
        this.props.onClose()
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
                        drawingColor={this.props.tool.color}
                        source={this.props.imageSource}
                        mode={this.state.mode}
                    />
                    <DrawingButtons
                        onButtonSelected={this.handleDrawingButtonPress}
                        highlightedButton={this.state.mode}
                        canUndo={this.props.canUndo}
                    />
                    <InstructionView
                        {... this.props.tool}
                        numberDrawn={0}
                        onCancel={this.onCancel}
                        onSave={this.onSave}
                    />
                </View>
                <CloseButton
                    onPress={this.onCancel}
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
    canUndo: PropTypes.bool,
    shouldConfirmOnClose: PropTypes.bool,
    visible: PropTypes.bool,
    imageSource: PropTypes.string,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    tool: PropTypes.shape({
        max: PropTypes.string,
        min: PropTypes.string,
        type: PropTypes.string,
        color: PropTypes.string,
        label: PropTypes.string,
        details: PropTypes.array,
    }),
    drawingActions: PropTypes.shape({
        saveEdits: PropTypes.func,
        clearShapes: PropTypes.func,
        undoMostRecentEdit: PropTypes.func
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawingModal)