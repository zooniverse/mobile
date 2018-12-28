import React from 'react'
import {
    TouchableOpacity,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheets from 'react-native-extended-stylesheet'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import DeviceInfo from 'react-native-device-info'

const dotSize = DeviceInfo.isTablet() ? 15 : 10
const chevronSize = DeviceInfo.isTablet() ? 25 : 16

const VerticalPaginationBar = (props) => {
    const paginationDots = []
    for (let count = 0; count < props.totalPages; count++) {
        paginationDots.push(
            <FontAwesome5
                key={`PAGINATION_DOT_${count}`}
                solid
                size={dotSize}
                name="circle"
                style={[styles.dotPadding, count !== props.pageIndex ? styles.iconGrey : null]}
            />
        )
    }
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                onPress={props.onScrollUpPressed}
                disabled={props.pageIndex === 0}
            >
                <SimpleLineIcons
                    style={[styles.arrowIcon, props.pageIndex === 0 ? styles.iconGrey : null]}
                    size={chevronSize}
                    name="arrow-up"
                />
            </TouchableOpacity>
            { paginationDots }
            <TouchableOpacity 
                onPress={props.onScrollDownPressed}
                disabled={props.pageIndex === props.totalPages - 1}
            >
                <SimpleLineIcons 
                    style={[styles.arrowIcon, props.pageIndex === props.totalPages - 1 ? styles.iconGrey : null]}
                    size={chevronSize}
                    name="arrow-down"
                />
            </TouchableOpacity>
        </View>
    )
}
//textLayer.textColor = UIColor.black

const styles = EStyleSheets.create({
    container: {
        flexDirection: 'column',
        paddingHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: '$classifierGrey'
    },
    iconGrey: {
        color: '$mediumGrey'
    },
    dotPadding: {
        paddingHorizontal: 1,
        paddingVertical: 2
    },
    arrowIcon: {
        paddingVertical: 5
    }
})

VerticalPaginationBar.propTypes = {
    onScrollDownPressed: PropTypes.func,
    onScrollUpPressed: PropTypes.func,
    pageIndex: PropTypes.number,
    totalPages: PropTypes.number,
}

export default VerticalPaginationBar