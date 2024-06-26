import React, { Component } from 'react'
import {
    Alert,
    Platform,
    Modal,
    View,
    SafeAreaView
} from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { BlurView } from '@react-native-community/blur';
import { bindActionCreators } from 'redux'
import R from 'ramda'
import EStyleSheet from 'react-native-extended-stylesheet'
import DrawingToolView from './components/DrawingToolView'

import * as drawingActions from '../../actions/drawing'
import ButtonsDrawingModal from '../classifier/ButtonsDrawingModal';
import ToolNameDrawCount from './ToolNameDrawCount';

const mapStateToProps = state => ({
    numberOfShapesDrawn: R.keys(state.drawing.shapesInProgress).length,
    canUndo: state.drawing.actions.length > 0,
    shouldConfirmOnClose: !R.isEmpty(state.drawing.shapes) || !R.isEmpty(state.drawing.shapesInProgress)
})

const mapDispatchToProps = dispatch => ({
     drawingActions: bindActionCreators(drawingActions, dispatch)
})

class DrawableSubject extends Component {

    constructor(props) {
        super(props)

        this.onCancel = this.onCancel.bind(this)
        this.onSave = this.onSave.bind(this)
    }

    onCancel({justClearInProgress}) {
        const onConfirm = () => {
            if (justClearInProgress) {
                this.props.drawingActions.clearShapesInProgress()
            } else {
                this.props.drawingActions.clearShapes()
            }
            this.props.onClose()
        }

        if (this.props.shouldConfirmOnClose) {
            Alert.alert(
                'Are you sure?',
                `This will erase ${justClearInProgress ? 'your most recent edits' : 'all of your annotations.'}`,
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
                <View style={styles.modal}>
                    {
                        Platform.OS === 'ios' ?
                            <BlurView style={styles.blurView} blurType="light" />
                        :
                            <View style={ [styles.blurView, styles.androidBlurView] } />
                    }
                    <View style={styles.modalContainer}>
                        <DrawingToolView
                            onUndoButtonSelected={this.props.drawingActions.undoMostRecentEdit}
                            maxShapesDrawn={this.props.numberOfShapesDrawn >= this.props.tool.max}
                            drawingColor={this.props.tool.color}
                            imageSource={this.props.imageSource}
                            canUndo={this.props.canUndo}
                            inMuseumMode={this.props.inMuseumMode}
                        />
                        <SafeAreaView style={styles.bottomContainer}>
                            <ToolNameDrawCount label={this.props.tool.label} number={this.props.numberOfShapesDrawn} />
                            <ButtonsDrawingModal onCancel={() => this.onCancel({ justClearInProgress: true })} onSave={this.onSave} />
                        </SafeAreaView>
                    </View>
                </View>
            </Modal>
        )
    }
}

const styles = EStyleSheet.create({
    bottomContainer: {
        backgroundColor: '#FFFFFD',
        justifyContent: 'flex-end',
        paddingTop: 40,
        height: 140,
    },
    blurView: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    androidBlurView: {
        backgroundColor: '#272727'
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
        backgroundColor: '#272727',
        flex: 1,
    },
    modal: {
        flex: 1,
        width: '100%',
        paddingBottom: 20,
        backgroundColor: 'white',
    }

})

DrawableSubject.propTypes = {
    canUndo: PropTypes.bool,
    shouldConfirmOnClose: PropTypes.bool,
    inMuseumMode: PropTypes.bool,
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
        undoMostRecentEdit: PropTypes.func,
        clearShapesInProgress: PropTypes.func
    }),
    warnForRequirements: PropTypes.bool,
    numberOfShapesDrawn: PropTypes.number
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawableSubject)
