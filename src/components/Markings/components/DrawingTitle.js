import React from 'react'
import {
    View,
} from 'react-native'
import FontedText from '../../common/FontedText'
import {
    Rect,
    Svg
} from 'react-native-svg'
import PropTypes from 'prop-types'

export const DrawingTitle = ({color, shape, text, style}) => {
    return (
        <View {...style}>
            <View style={styles.container}>
                <Svg width="30" height="30">
                    {renderShape(shape, color)}
                </Svg>
                <FontedText style={styles.text}> {text} </FontedText>
            </View>
        </View>
    )
}

const renderShape = (shape, color) => {
    switch (shape) {
        case 'rect':
            return  <Rect
                        width="30"
                        height="30"
                        fill="rgba(0, 0, 0, .10)"
                        stroke={color}
                        strokeWidth="6"
                    />
        default: 
            return null
    }
}

DrawingTitle.propTypes = {
    color: PropTypes.string,
    // We only support box for now
    shape: PropTypes.PropTypes.oneOf(['rect']),
    text: PropTypes.string,
    style: PropTypes.object
}

const styles = {
    text: {
        alignSelf: 'center',
        color: 'white',
        fontSize: 16
    },
    container: {
        flexDirection: 'row'
    }
}
