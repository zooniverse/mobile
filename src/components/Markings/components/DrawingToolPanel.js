/**
 * Prop-driven replacement for the legacy connected `DrawingToolView`. Holds
 * the image + overlay (`DrawingCanvas`) and the draw/erase/undo buttons.
 * No Redux reads; everything comes from props.
 */

import React, { useState } from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'

import DrawingCanvas from './DrawingCanvas'
import SubjectLoadingIndicator from '../../common/SubjectLoadingIndicator'
import ButtonsDrawing from '../../classifier/ButtonsDrawing'

const DrawingToolPanel = ({
    maxShapesDrawn,
    drawingColor,
    imageSource,
    canUndo,
    onUndoButtonSelected,
    onContainerLayout,
    showDrawingButtons = true,
    imageIsLoaded = true,
    canDraw = true,
    subjectDimensions,
    shapes,
    onShapeAdded,
    onShapeRemoved,
    onShapeMutated,
}) => {
    const [mode, setMode] = useState('draw')
    // Preserved so `DrawingCanvas` can report out-of-bounds updates. The
    // flag isn't consumed locally today but is kept in case a future
    // parent wants to react to it.
    const [, setAShapeIsOutOfBounds] = useState(false)

    return (
        <View style={styles.container}>
            {imageIsLoaded ? (
                <View style={styles.container}>
                    <DrawingCanvas
                        onContainerLayout={onContainerLayout}
                        drawingColor={drawingColor}
                        source={imageSource}
                        mode={canDraw ? mode : 'view'}
                        onShapeIsOutOfBoundsUpdates={setAShapeIsOutOfBounds}
                        maxShapesDrawn={maxShapesDrawn}
                        canDraw={canDraw}
                        subjectDimensions={subjectDimensions}
                        shapes={shapes}
                        onShapeAdded={onShapeAdded}
                        onShapeRemoved={onShapeRemoved}
                        onShapeMutated={onShapeMutated}
                    />
                </View>
            ) : (
                <SubjectLoadingIndicator />
            )}
            {showDrawingButtons && (
                <ButtonsDrawing
                    canUndo={canUndo}
                    onUndo={onUndoButtonSelected}
                    onDraw={() => setMode('draw')}
                    onDelete={() => setMode('erase')}
                />
            )}
        </View>
    )
}

const styles = {
    container: { flex: 1 },
}

DrawingToolPanel.propTypes = {
    maxShapesDrawn: PropTypes.bool,
    drawingColor: PropTypes.string,
    imageSource: PropTypes.string,
    canUndo: PropTypes.bool,
    onUndoButtonSelected: PropTypes.func,
    onContainerLayout: PropTypes.func,
    showDrawingButtons: PropTypes.bool,
    imageIsLoaded: PropTypes.bool,
    canDraw: PropTypes.bool,
    subjectDimensions: PropTypes.shape({
        naturalWidth: PropTypes.number,
        naturalHeight: PropTypes.number,
    }),
    shapes: PropTypes.any,
    onShapeAdded: PropTypes.func,
    onShapeRemoved: PropTypes.func,
    onShapeMutated: PropTypes.func,
}

export default DrawingToolPanel
