import React from 'react'
import { Image, TouchableOpacity } from 'react-native'

import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';

import FontedText from '../common/FontedText';

const FieldGuideItemRow = (props) => {
    const itemIcon = props.icons[props.item.icon]
    return (
        <TouchableOpacity
            onPress={props.onPress}
            style={styles.itemRow}>
            {itemIcon !== undefined && itemIcon.src ?
            <Image style={styles.itemIcon} source={{uri: itemIcon.src}}/> : null}
            <FontedText style={styles.itemRowTitle} numberOfLines={1}>{props.item.title}</FontedText>
        </TouchableOpacity>
    )
}

const styles = EStyleSheet.create({
    $iconSize: 50,
    itemRow: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 90,
        paddingVertical: 3,
        paddingHorizontal: 10,
    },
    itemRowTitle: {
        color: '#00979D',
        fontWeight: '600',
    },
    itemIcon: {
        width: '$iconSize',
        height: '$iconSize',
        borderRadius: '0.5 * $iconSize',
        marginBottom: 8,
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
