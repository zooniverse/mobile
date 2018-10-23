import React from 'react'
import {
    View
} from 'react-native'
import FontedText from '../../common/FontedText'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'

const ShapeInstructionsView = (props) => {
    const warningStyle = props.warnForRequirements ? styles.warningText : {}
    return (
        <View style={styles.instructionsContainer} >
            <ShapePreview type={props.type} color={props.color} />
            <View style={styles.textContainer} >
                <FontedText style={styles.label}>
                    {props.label}
                </FontedText>
                <FontedText style={styles.infoText}> 
                    <FontedText style={warningStyle}>
                        {`${props.numberDrawn} of ${props.min} required`}
                    </FontedText>
                    { props.max ? `, ${props.max} maximum` : '' }
                </FontedText>
            </View>
        </View>
    )
}

ShapeInstructionsView.propTypes = {
    type: PropTypes.oneOf(['rectangle']),
    color: PropTypes.string,
    label: PropTypes.string,
    min: PropTypes.string,
    max: PropTypes.string,
    numberDrawn: PropTypes.number,
    warnForRequirements: PropTypes.bool
}

/**
 * Component that displays the shape the user will draw
 * @param {type, color}  
 */
const ShapePreview = ({type, color}) => {
    switch (type) {
        case 'rectangle':
            return <View style={[styles.rectangleShape, {borderColor: color}]} />
        default:
            return <View />
    }
}
ShapePreview.propTypes = {
    type: PropTypes.oneOf(['rectangle']),
    color: PropTypes.string
}

const styles = EStyleSheet.create({
    container: {
        backgroundColor: 'white'
    },
    instructionsContainer: {
        flexDirection: 'row',
        padding: 20
    },
    textContainer: {
        flexDirection: 'column',
        flex: 1,
        paddingLeft: 15
    },
    label: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    infoText: {
        fontSize: 14,
        color: '$headerGrey'
    },
    warningText: {
        fontWeight: 'bold',
        color: '$testRed'
    },
    rectangleShape: {
        width: 30,
        height: 30,
        borderWidth: 2
    }
})

export default ShapeInstructionsView