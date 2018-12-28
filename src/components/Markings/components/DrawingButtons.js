import React from 'react'
import {
    View
} from 'react-native'
import PropTypes from 'prop-types'
import DeviceInfo from 'react-native-device-info';

import CircleIconButton from '../../common/CircleIconButton'

const circleRadius = DeviceInfo.isTablet() ? 20 : 15

const DrawingButtons = (props) => {
    return (
        <View style={styles.container} >
            <CircleIconButton
                disabled={!props.canUndo}
                type="undo"
                activated={false}
                onPress={() => props.onUndoButtonSelected()}
                radius={circleRadius}
            />
            <View style={styles.drawingButtonsContainer}>
                <CircleIconButton 
                    style={styles.buttonPadding}
                    type="draw"
                    activated={props.highlightedButton === 'draw'}
                    onPress={() => props.onModeButtonSelected('draw')}
                    radius={circleRadius}
                />
                <CircleIconButton 
                    style={styles.buttonPadding}
                    type="edit"
                    activated={props.highlightedButton === 'edit'}
                    onPress={() => props.onModeButtonSelected('edit')}
                    radius={circleRadius}
                />
                <CircleIconButton
                    type="erase"
                    activated={props.highlightedButton === 'erase' || props.aShapeIsOutOfBounds}
                    onPress={() => props.onModeButtonSelected('erase')}
                    radius={circleRadius}
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