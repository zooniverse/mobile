import React from 'react'
import {
    View
} from 'react-native'
import PropTypes from 'prop-types'
import {DrawingButton} from './DrawingButton'

const DrawingButtons = (props) => {
    return (
        <View style={styles.container} >
            <DrawingButton
                disabled={!props.canUndo}
                type="undo"
                activated={false}
                onPress={() => props.onUndoButtonSelected()}
            />
            <View style={styles.drawingButtonsContainer}>
                <DrawingButton 
                    style={styles.buttonPadding}
                    type="draw"
                    activated={props.highlightedButton === 'draw'}
                    onPress={() => props.onModeButtonSelected('draw')}
                />
                <DrawingButton
                    type="erase"
                    activated={props.highlightedButton === 'erase' || props.aShapeIsOutOfBounds}
                    onPress={() => props.onModeButtonSelected('erase')}
                />
            </View>
        </View>
    )
}

const styles = {
    container: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
    },
    drawingButtonsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    buttonPadding: {
        paddingRight: 15
    }
}

DrawingButtons.propTypes = {
    onModeButtonSelected: PropTypes.func,
    onUndoButtonSelected: PropTypes.func,
    highlightedButton: PropTypes.oneOf(['draw', 'erase', 'unselected']),
    canUndo: PropTypes.bool,
    aShapeIsOutOfBounds: PropTypes.bool
}

export default DrawingButtons