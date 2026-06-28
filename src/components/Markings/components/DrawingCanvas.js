/**
 * Prop-driven replacement for the legacy connected `MarkableImage`. Renders
 * the subject image with an SVG overlay for drawing shapes.
 *
 * The legacy version pulls `subject`, `subjectDimensions`, and `shapes` from
 * Redux and dispatches drawing actions directly. This component accepts all
 * of that via props so the new classifier flow can own the data in local
 * state without contaminating a shared component.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ImageBackground, Platform, View } from 'react-native'
import PropTypes from 'prop-types'

import SvgOverlay from './SvgOverlay'

const DEFAULT_DIMENSIONS = { naturalWidth: 200, naturalHeight: 260 }

const DrawingCanvas = ({
    subjectDimensions = DEFAULT_DIMENSIONS,
    drawingColor,
    shapes,
    maxShapesDrawn,
    mode,
    source,
    onContainerLayout,
    onShapeIsOutOfBoundsUpdates,
    canDraw,
    onShapeAdded,
    onShapeRemoved,
    onShapeMutated,
}) => {
    const { naturalHeight, naturalWidth } = subjectDimensions
    const [clientHeight, setClientHeight] = useState(1)
    const [clientWidth, setClientWidth] = useState(1)
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const containerRef = useRef({ height: 0, width: 0 })

    const onImageLayout = useCallback(
        ({ nativeEvent }) => {
            const { height: containerHeight, width: containerWidth } = nativeEvent.layout
            containerRef.current = { height: containerHeight, width: containerWidth }
            const aspectRatio = Math.min(
                containerHeight / naturalHeight,
                containerWidth / naturalWidth
            )
            const nextClientHeight = naturalHeight * aspectRatio
            const nextClientWidth = naturalWidth * aspectRatio
            if (onContainerLayout) {
                onContainerLayout({ height: nextClientHeight, width: nextClientWidth })
            }
            setClientHeight(nextClientHeight)
            setClientWidth(nextClientWidth)
            setIsImageLoaded(true)
        },
        [naturalHeight, naturalWidth, onContainerLayout]
    )

    // Mirrors legacy `componentDidUpdate`: if the subject's natural
    // dimensions change after the container has already laid out, recompute
    // the displayed size so shapes stay aligned.
    useEffect(() => {
        const { height: containerHeight, width: containerWidth } = containerRef.current
        if (containerWidth <= 0) return
        const aspectRatio = Math.min(
            containerHeight / naturalHeight,
            containerWidth / naturalWidth
        )
        const nextClientHeight = naturalHeight * aspectRatio
        const nextClientWidth = naturalWidth * aspectRatio
        if (onContainerLayout) {
            onContainerLayout({ height: nextClientHeight, width: nextClientWidth })
        }
        setClientHeight(nextClientHeight)
        setClientWidth(nextClientWidth)
    }, [naturalHeight, naturalWidth, onContainerLayout])

    const pathPrefix = Platform.OS === 'android' ? 'file://' : ''

    return (
        <View style={styles.svgContainer}>
            <ImageBackground
                onLayout={onImageLayout}
                style={styles.svgOverlayContainer}
                source={{ uri: pathPrefix + source }}
                resizeMode="contain"
            >
                {isImageLoaded ? (
                    <SvgOverlay
                        canDraw={canDraw}
                        nativeWidth={naturalWidth}
                        nativeHeight={naturalHeight}
                        shapes={shapes}
                        color={drawingColor}
                        height={clientHeight}
                        width={clientWidth}
                        drawingShape="rect"
                        mode={mode}
                        maxShapesDrawn={maxShapesDrawn}
                        onShapeCreated={onShapeAdded}
                        onShapeDeleted={onShapeRemoved}
                        onShapeModified={onShapeMutated}
                        onShapeIsOutOfBoundsUpdates={onShapeIsOutOfBoundsUpdates}
                    />
                ) : null}
            </ImageBackground>
        </View>
    )
}

const styles = {
    svgContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    svgOverlayContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
}

DrawingCanvas.propTypes = {
    subjectDimensions: PropTypes.shape({
        naturalWidth: PropTypes.number,
        naturalHeight: PropTypes.number,
    }),
    drawingColor: PropTypes.string,
    shapes: PropTypes.any,
    maxShapesDrawn: PropTypes.bool,
    mode: PropTypes.oneOf(['draw', 'erase', 'view']),
    source: PropTypes.string,
    onContainerLayout: PropTypes.func,
    onShapeIsOutOfBoundsUpdates: PropTypes.func,
    canDraw: PropTypes.bool,
    onShapeAdded: PropTypes.func,
    onShapeRemoved: PropTypes.func,
    onShapeMutated: PropTypes.func,
}

export default DrawingCanvas
