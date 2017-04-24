import React from 'react'
import {
  Image,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'

const FieldGuideItemRow = (props) => {
  const itemIcon = props.icons[props.item.icon]
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={styles.itemRow}>
      { itemIcon !== undefined && itemIcon.src ? <Image style={styles.itemIcon} source={{uri:itemIcon.src}} /> : null }
      <StyledText
        additionalStyles={[styles.itemRowTitle]}
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
  item: React.PropTypes.shape({
    title: React.PropTypes.string,
    content: React.PropTypes.string,
    icon: React.PropTypes.string,
  }),
  icons: React.PropTypes.object,
  setContentHeight: React.PropTypes.func,
  setHeaderHeight: React.PropTypes.func,
  onPress: React.PropTypes.func,
}

export default FieldGuideItemRow
