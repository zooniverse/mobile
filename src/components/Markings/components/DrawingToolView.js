import React, { Component } from 'react'
import {
    Animated,
    View
} from 'react-native'
import PropTypes from 'prop-types'

import MarkableMedia from './MarkableImage'
import SubjectLoadingIndicator from '../../common/SubjectLoadingIndicator'
import ButtonsDrawing from '../../classifier/ButtonsDrawing'

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
                            <MarkableMedia
                                onContainerLayout={this.props.onContainerLayout}
                                drawingColor={this.props.drawingColor}
                                source={this.props.imageSource}
                                mode={this.props.canDraw ? this.state.mode : 'view'}
                                onShapeIsOutOfBoundsUpdates={(aShapeIsOutOfBounds) => this.setState({aShapeIsOutOfBounds})}
                                maxShapesDrawn={this.props.maxShapesDrawn}
                                canDraw={this.props.canDraw}
                            />
                        </Animated.View>
                    :
                        <SubjectLoadingIndicator />
                }
                {
                    this.props.showDrawingButtons &&
                    <ButtonsDrawing
                        canUndo={this.props.canUndo}
                        onUndo={this.props.onUndoButtonSelected}
                        onDraw={() => this.setState({ mode: 'draw' })}
                        onDelete={() => this.setState({ mode: 'erase' })}
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
    canDraw: PropTypes.bool,
    onHelpButtonPressed: PropTypes.func,
    showHelpButton: PropTypes.bool,
    inMuseumMode: PropTypes.bool,
}

DrawingToolView.defaultProps = {
    imageIsLoaded: true,
    showDrawingButtons: true,
    canDraw: true
}

export default DrawingToolView