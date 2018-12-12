import React, { Component } from 'react'
import {
    Animated,
    View
} from 'react-native'
import PropTypes from 'prop-types'

import MarkableImage from './MarkableImage'
import DrawingButtons from './DrawingButtons'
import SubjectLoadingIndicator from '../../common/SubjectLoadingIndicator'

class DrawingToolView extends Component {
    
    constructor(props) {
        super(props)

        this.state = {
            scale: new Animated.Value(1),
            mode: 'draw',
            aShapeIsOutOfBounds: false
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.imageIsLoaded !== this.props.imageIsLoaded) {
            if (!this.props.imageIsLoaded) {
                this.setState({scale: new Animated.Value(0.8)})
            } else {
                this.animateScale()
            }
        }
    }

    animateScale() {
        Animated.spring(
            this.state.scale,
            {
                toValue: 1
            }
        ).start()
    }
    
    render() {
        return (
            <View style={styles.container}>
                {
                    this.props.imageIsLoaded ? 
                        <Animated.View style={[styles.container, {transform: [{scale: this.state.scale}]}]} >
                            <MarkableImage
                                onContainerLayout={this.props.onContainerLayout}
                                drawingColor={this.props.drawingColor}
                                source={this.props.imageSource}
                                mode={this.props.canDraw ? this.state.mode : 'view'}
                                maxShapesDrawn={this.props.maxShapesDrawn}
                                onShapeIsOutOfBoundsUpdates={(aShapeIsOutOfBounds) => this.setState({aShapeIsOutOfBounds})}
                            />
                        </Animated.View>
                    :
                        <SubjectLoadingIndicator />
                }
                {
                    this.props.showDrawingButtons && 
                        <DrawingButtons
                            onUndoButtonSelected={this.props.onUndoButtonSelected}
                            onModeButtonSelected={buttonType => this.setState({mode: buttonType})}
                            highlightedButton={this.state.mode}
                            canUndo={this.props.canUndo}
                            aShapeIsOutOfBounds={this.state.aShapeIsOutOfBounds}
                        />
                }
            </View>
        )
    }
}

const styles = {
    container: {flex: 1}
}

DrawingToolView.propTypes = {
    maxShapesDrawn: PropTypes.bool,
    drawingColor: PropTypes.string,
    imageSource: PropTypes.string,
    canUndo: PropTypes.bool,
    onUndoButtonSelected: PropTypes.func,
    onContainerLayout: PropTypes.func,
    showDrawingButtons: PropTypes.bool,
    imageIsLoaded: PropTypes.bool,
    animateImage: PropTypes.func,
    canDraw: PropTypes.bool
}

DrawingToolView.defaultProps = {
    imageIsLoaded: true,
    showDrawingButtons: true,
    canDraw: true
}

export default DrawingToolView