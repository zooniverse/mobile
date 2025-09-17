import React from 'react'
import {
    View
} from 'react-native'
import PropTypes from 'prop-types'

import CircleIconButton from '../common/CircleIconButton'

const SubjectOptionsBar = (props) => {
    return (
        <View>
            <View style={styles.contentContainer}>
                {/* TODO: Add this in a future PR
                <CircleIconButton
                    style={styles.shareButtonPadding}
                    onPress={props.onExpandButtonPressed}
                    type={'share'}
                    radius={15}
                /> */}
                <CircleIconButton
                    onPress={props.onExpandButtonPressed}
                    type={'expand'}
                    radius={15}
                />
            </View>
        </View>
    )
}

const styles = {
    contentContainer: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: '#EBEBEB',
    },
    expandButtonIconStyle: {
        marginRight: 0,
        margin: 0
    },
    shareButtonPadding: {
        paddingRight: 15
    }
}

SubjectOptionsBar.propTypes = {
    onExpandButtonPressed: PropTypes.func,
    selectionIndex: PropTypes.number,
    numberOfSelections: PropTypes.number,
    onLeftChevronSelected: PropTypes.func,
    onRightChevronSelected: PropTypes.func
}

export default SubjectOptionsBar