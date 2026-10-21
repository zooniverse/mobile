/**
 * Prop-driven replacement for the legacy connected `DrawingToolView`. Holds
 * the image + overlay (`DrawingCanvas`) and the draw/erase/undo buttons.
 * No Redux reads; everything comes from props.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, PanResponder, View } from 'react-native'
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
    handleRadius = 16,
    compactMarks = false,
    drawingMode,
    zoomScale = 1,
    canPan = false,
    onPanAvailabilityChange,
    onPanStateChange,
    showDrawingButtons = true,
    imageIsLoaded = true,
    canDraw = true,
    subjectDimensions,
    shapes,
    onShapeAdded,
    onShapeRemoved,
    onShapeMutated,
}) => {
    const scaleRef = useRef(new Animated.Value(1))
    const panStartRef = useRef({ x: 0, y: 0 })
    const panOffsetRef = useRef({ x: 0, y: 0 })
    const [mode, setMode] = useState('draw')
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
    const [viewportDimensions, setViewportDimensions] = useState({ width: 1, height: 1 })
    // Preserved so `DrawingCanvas` can report out-of-bounds updates. The
    // flag isn't consumed locally today but is kept in case a future
    // parent wants to react to it.
    const [, setAShapeIsOutOfBounds] = useState(false)

    useEffect(() => {
        if (!imageIsLoaded) {
            scaleRef.current.setValue(0.8)
            return
        }
        Animated.spring(scaleRef.current, { toValue: 1 }).start()
    }, [imageIsLoaded])

    const maxPanX = Math.max(0, (viewportDimensions.width * zoomScale - viewportDimensions.width) / 2)
    const maxPanY = Math.max(0, (viewportDimensions.height * zoomScale - viewportDimensions.height) / 2)

    const clampPanOffset = useCallback((offset) => ({
        x: Math.max(-maxPanX, Math.min(maxPanX, offset.x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, offset.y)),
    }), [maxPanX, maxPanY])

    useEffect(() => {
        const clampedOffset = clampPanOffset(panOffsetRef.current)
        panOffsetRef.current = clampedOffset
        setPanOffset(clampedOffset)
    }, [clampPanOffset])

    useEffect(() => {
        const threshold = 1
        const panState = {
            x: panOffset.x,
            y: panOffset.y,
            left: zoomScale > 1 && panOffset.x < maxPanX - threshold,
            right: zoomScale > 1 && panOffset.x > -maxPanX + threshold,
            up: zoomScale > 1 && panOffset.y < maxPanY - threshold,
            down: zoomScale > 1 && panOffset.y > -maxPanY + threshold,
            maxPanX,
            maxPanY,
            viewportHeight: viewportDimensions.height,
            viewportWidth: viewportDimensions.width,
            zoomScale,
        }
        onPanAvailabilityChange?.(panState)
        onPanStateChange?.(panState)
    }, [maxPanX, maxPanY, onPanAvailabilityChange, onPanStateChange, panOffset.x, panOffset.y, zoomScale, viewportDimensions.height, viewportDimensions.width])

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => canPan,
        onStartShouldSetPanResponderCapture: () => canPan,
        onMoveShouldSetPanResponder: () => canPan,
        onMoveShouldSetPanResponderCapture: () => canPan,
        onPanResponderGrant: () => {
            panStartRef.current = panOffsetRef.current
        },
        onPanResponderMove: (_event, gestureState) => {
            const nextPanOffset = clampPanOffset({
                x: panStartRef.current.x + gestureState.dx,
                y: panStartRef.current.y + gestureState.dy,
            })
            panOffsetRef.current = nextPanOffset
            setPanOffset(nextPanOffset)
        },
        onPanResponderTerminationRequest: () => false,
    }), [canPan, clampPanOffset])

    const panHandlers = canPan ? panResponder.panHandlers : {}

    return (
        <View
            style={styles.container}
            onLayout={({ nativeEvent }) => setViewportDimensions(nativeEvent.layout)}
        >
            {imageIsLoaded ? (
                <Animated.View
                    {...panHandlers}
                    style={[styles.container, {
                        transform: [
                            { translateX: panOffset.x },
                            { translateY: panOffset.y },
                            { scale: scaleRef.current },
                            { scale: zoomScale },
                        ]
                    }]}
                >
                    <DrawingCanvas
                        onContainerLayout={onContainerLayout}
                        drawingColor={drawingColor}
                        source={imageSource}
                        mode={drawingMode || (canDraw ? mode : 'view')}
                        onShapeIsOutOfBoundsUpdates={setAShapeIsOutOfBounds}
                        maxShapesDrawn={maxShapesDrawn}
                        handleRadius={handleRadius}
                        compactMarks={compactMarks}
                        canDraw={canDraw}
                        subjectDimensions={subjectDimensions}
                        shapes={shapes}
                        onShapeAdded={onShapeAdded}
                        onShapeRemoved={onShapeRemoved}
                        onShapeMutated={onShapeMutated}
                    />
                </Animated.View>
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
    handleRadius: PropTypes.number,
    compactMarks: PropTypes.bool,
    drawingMode: PropTypes.oneOf(['draw', 'erase', 'view']),
    zoomScale: PropTypes.number,
    canPan: PropTypes.bool,
    onPanAvailabilityChange: PropTypes.func,
    onPanStateChange: PropTypes.func,
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
