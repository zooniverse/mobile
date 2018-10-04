import React from 'react'
import {
    View
} from 'react-native'
import PropTypes from 'prop-types'
import {DrawingButton} from './DrawingButton'

const DrawingButtons = (props) => {
    return (
        <View style={styles.container}>
            <DrawingButton 
                style={styles.buttonPadding}
                type="draw"
                enabled={props.highlightedButton === 'draw'}
                onPress={() => props.onButtonSelected('draw')}
            />
            <DrawingButton 
                style={styles.buttonPadding}
                type="edit"
                enabled={props.highlightedButton === 'edit'}
                onPress={() => props.onButtonSelected('edit')}
            />
            <DrawingButton
                type="erase"
                enabled={props.highlightedButton === 'erase'}
                onPress={() => props.onButtonSelected('erase')}
            />
        </View>
    )
}

const styles = {
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 12,
        paddingRight: 20
    },
    buttonPadding: {
        paddingRight: 15
    }
}

DrawingButtons.propTypes = {
    onButtonSelected: PropTypes.func,
    highlightedButton: PropTypes.oneOf(['draw', 'edit', 'erase', 'unselected'])
}

export default DrawingButtons