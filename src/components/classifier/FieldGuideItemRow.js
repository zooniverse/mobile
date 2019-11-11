import React from 'react'
import {
    Image,
    StyleSheet,
    TouchableOpacity
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';
import StyledText from '../StyledText'

import * as colorModes from '../../actions/colorModes'

const FieldGuideItemRow = (props) => {
    const itemIcon = props.icons[props.item.icon]
    return (
        <TouchableOpacity
            onPress={props.onPress}
            style={styles.itemRow}>
            {itemIcon !== undefined && itemIcon.src ?
                <Image style={styles.itemIcon} source={{uri: itemIcon.src}}/> : null}
            <StyledText
                additionalStyles={[
                    styles.itemRowTitle,
                    colorModes.selectedTextColorFor(props.inMuseumMode)
                    ]}
                text={props.item.title}
                numberOfLines={1}
                ellipsizeMode={'tail'}
            />
        </TouchableOpacity>
    )
}

const styles = EStyleSheet.create({
    $iconSize: 50,
    $iconRightMargin: 10,
    $iconTotalWidth: '$iconSize + $iconRightMargin',
    $rightIconWidth: 50,
    $totalToSubtract: '$iconTotalWidth + $rightIconWidth',
    itemRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 60,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '$mediumGrey',
        paddingVertical: 3,
        paddingHorizontal: 10,
    },
    itemRowTitle: {
        width: '100% - $totalToSubtract',
    },
    itemIcon: {
        width: '$iconSize',
        height: '$iconSize',
        borderRadius: '0.5 * $iconSize',
        marginRight: 10,
    },
});

FieldGuideItemRow.propTypes = {
    item: PropTypes.shape({
        title: PropTypes.string,
        content: PropTypes.string,
        icon: PropTypes.string,
    }),
    icons: PropTypes.object,
    setContentHeight: PropTypes.func,
    setHeaderHeight: PropTypes.func,
    onPress: PropTypes.func,
    inMuseumMode: PropTypes.bool,
}

export default FieldGuideItemRow
