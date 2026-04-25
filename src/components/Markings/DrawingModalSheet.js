/**
 * Prop-driven replacement for the legacy connected `DrawableSubject`. A
 * full-screen modal that hosts the drawing tool for focused mark-up, with
 * save / cancel actions and a confirmation dialog for destructive cancels.
 */

import React, { useCallback } from 'react'
import { Alert, Platform, Modal, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import PropTypes from 'prop-types'
import { BlurView } from '@react-native-community/blur'
import EStyleSheet from 'react-native-extended-stylesheet'
import { useTranslation } from 'react-i18next'

import DrawingToolPanel from './components/DrawingToolPanel'
import ButtonsDrawingModal from '../classifier/ButtonsDrawingModal'
import ToolNameDrawCount from './ToolNameDrawCount'

const DrawingModalSheet = ({
    visible,
    onClose,
    tool,
    imageSource,
    inMuseumMode,
    canUndo,
    numberOfShapesDrawn,
    shouldConfirmOnClose,
    onSaveEdits,
    onClearShapes,
    onClearShapesInProgress,
    onUndoMostRecentEdit,
    subjectDimensions,
    shapes,
    onShapeAdded,
    onShapeRemoved,
    onShapeMutated,
}) => {
    const { t } = useTranslation()

    const handleCancel = useCallback(
        ({ justClearInProgress }) => {
            const onConfirm = () => {
                if (justClearInProgress) {
                    onClearShapesInProgress?.()
                } else {
                    onClearShapes?.()
                }
                onClose?.()
            }

            if (shouldConfirmOnClose) {
                const cancelText = t('tasks.survey.cancel', 'Cancel')
                const eraseConfirmMessage = justClearInProgress
                    ? t(
                          'Mobile.classifier.eraseRecentEdits',
                          'This will erase your most recent edits'
                      )
                    : t(
                          'Mobile.classifier.eraseAllAnnotations',
                          'This will erase all of your annotations'
                      )
                Alert.alert(
                    t('Mobile.classifier.areYouSure', 'Are you sure?'),
                    eraseConfirmMessage,
                    [
                        { text: t('Mobile.classifier.yes', 'Yes'), onPress: onConfirm },
                        { text: cancelText, style: 'cancel' },
                    ],
                    { cancelable: false }
                )
            } else {
                onConfirm()
            }
        },
        [shouldConfirmOnClose, onClearShapes, onClearShapesInProgress, onClose, t]
    )

    const handleSave = useCallback(() => {
        onSaveEdits?.()
        onClose?.()
    }, [onSaveEdits, onClose])

    return (
        <Modal
            onRequestClose={onClose}
            presentationStyle="overFullScreen"
            animationType="fade"
            visible={visible}
            transparent
        >
            <View style={styles.modal}>
                {Platform.OS === 'ios' ? (
                    <BlurView style={styles.blurView} blurType="light" />
                ) : (
                    <View style={[styles.blurView, styles.androidBlurView]} />
                )}
                <View style={styles.modalContainer}>
                    <DrawingToolPanel
                        onUndoButtonSelected={onUndoMostRecentEdit}
                        maxShapesDrawn={numberOfShapesDrawn >= tool?.max}
                        drawingColor={tool?.color}
                        imageSource={imageSource}
                        canUndo={canUndo}
                        inMuseumMode={inMuseumMode}
                        subjectDimensions={subjectDimensions}
                        shapes={shapes}
                        onShapeAdded={onShapeAdded}
                        onShapeRemoved={onShapeRemoved}
                        onShapeMutated={onShapeMutated}
                    />
                    <SafeAreaView style={styles.bottomContainer}>
                        <ToolNameDrawCount
                            label={tool?.label}
                            number={numberOfShapesDrawn}
                        />
                        <ButtonsDrawingModal
                            onCancel={() => handleCancel({ justClearInProgress: true })}
                            onSave={handleSave}
                        />
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    )
}

const styles = EStyleSheet.create({
    bottomContainer: {
        backgroundColor: '#FFFFFD',
        justifyContent: 'flex-end',
        paddingTop: 40,
        height: 140,
        paddingBottom: 20,
    },
    blurView: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    androidBlurView: {
        backgroundColor: '#272727',
    },
    modalContainer: {
        backgroundColor: '#272727',
        flex: 1,
    },
    modal: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white',
    },
})

DrawingModalSheet.propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    tool: PropTypes.shape({
        max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        type: PropTypes.string,
        color: PropTypes.string,
        label: PropTypes.string,
        details: PropTypes.array,
    }),
    imageSource: PropTypes.string,
    inMuseumMode: PropTypes.bool,
    canUndo: PropTypes.bool,
    numberOfShapesDrawn: PropTypes.number,
    shouldConfirmOnClose: PropTypes.bool,
    onSaveEdits: PropTypes.func,
    onClearShapes: PropTypes.func,
    onClearShapesInProgress: PropTypes.func,
    onUndoMostRecentEdit: PropTypes.func,
    subjectDimensions: PropTypes.shape({
        naturalWidth: PropTypes.number,
        naturalHeight: PropTypes.number,
    }),
    shapes: PropTypes.any,
    onShapeAdded: PropTypes.func,
    onShapeRemoved: PropTypes.func,
    onShapeMutated: PropTypes.func,
}

export default DrawingModalSheet
