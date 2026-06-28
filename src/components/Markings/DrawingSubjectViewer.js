/**
 * Prop-driven replacement for the legacy connected `DrawingClassifierSubject`.
 * Owns the container layout and reports displayed dimensions to the parent;
 * renders the drawing tool panel and the `AlreadySeenBanner` overlay.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'

import AlreadySeenBanner from '../classifier/AlreadySeenBanner'
import DrawingToolPanel from './components/DrawingToolPanel'

const DrawingSubjectViewer = ({
    subjectDimensions,
    imageIsLoaded,
    onImageLayout,
    alreadySeen,
    showDrawingButtons,
    onUndoButtonSelected,
    maxShapesDrawn,
    drawingColor,
    imageSource,
    canUndo,
    showHelpButton,
    onHelpButtonPressed,
    inMuseumMode,
    shapes,
    onShapeAdded,
    onShapeRemoved,
    onShapeMutated,
}) => {
    const [containerDimensions, setContainerDimensions] = useState({ width: 1, height: 1 })

    const onContainerLayout = useCallback((dims) => {
        setContainerDimensions(dims)
    }, [])

    // Mirrors legacy `componentDidUpdate`: whenever the natural subject size
    // or the on-screen container size changes, recompute the displayed (client)
    // dimensions and report them up so drawing submission uses the right
    // coordinate basis.
    useEffect(() => {
        const { naturalHeight, naturalWidth } = subjectDimensions || {}
        if (!naturalHeight || !naturalWidth) return
        const { height: containerHeight, width: containerWidth } = containerDimensions
        const aspectRatio = Math.min(
            containerHeight / naturalHeight,
            containerWidth / naturalWidth
        )
        const clientHeight = naturalHeight * aspectRatio
        const clientWidth = naturalWidth * aspectRatio
        if (onImageLayout) {
            onImageLayout({ clientHeight, clientWidth })
        }
    }, [subjectDimensions, containerDimensions, onImageLayout])

    return (
        <View style={styles.container}>
            <View style={styles.container}>
                <DrawingToolPanel
                    showHelpButton={showHelpButton}
                    onHelpButtonPressed={onHelpButtonPressed}
                    imageIsLoaded={imageIsLoaded}
                    onContainerLayout={onContainerLayout}
                    onUndoButtonSelected={onUndoButtonSelected}
                    maxShapesDrawn={maxShapesDrawn}
                    drawingColor={drawingColor}
                    imageSource={imageSource}
                    canUndo={canUndo}
                    showDrawingButtons={showDrawingButtons}
                    canDraw={showDrawingButtons}
                    inMuseumMode={inMuseumMode}
                    subjectDimensions={subjectDimensions}
                    shapes={shapes}
                    onShapeAdded={onShapeAdded}
                    onShapeRemoved={onShapeRemoved}
                    onShapeMutated={onShapeMutated}
                />
            </View>
            {!inMuseumMode && alreadySeen && imageIsLoaded && <AlreadySeenBanner />}
        </View>
    )
}

const styles = {
    container: { flex: 1 },
}

DrawingSubjectViewer.propTypes = {
    subjectDimensions: PropTypes.shape({
        naturalWidth: PropTypes.number,
        naturalHeight: PropTypes.number,
    }),
    imageIsLoaded: PropTypes.bool,
    onImageLayout: PropTypes.func,
    alreadySeen: PropTypes.bool,
    showDrawingButtons: PropTypes.bool,
    onUndoButtonSelected: PropTypes.func,
    maxShapesDrawn: PropTypes.bool,
    drawingColor: PropTypes.string,
    imageSource: PropTypes.string,
    canUndo: PropTypes.bool,
    showHelpButton: PropTypes.bool,
    onHelpButtonPressed: PropTypes.func,
    inMuseumMode: PropTypes.bool,
    shapes: PropTypes.object,
    onShapeAdded: PropTypes.func,
    onShapeRemoved: PropTypes.func,
    onShapeMutated: PropTypes.func,
}

export default DrawingSubjectViewer
