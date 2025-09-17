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

const PaginationBar = (props) => {
    const paginationDots = []
    for (let count = 0; count < props.totalPages; count++) {
        paginationDots.push(
            <FontAwesome5
                key={`PAGINATION_DOT_${count}`}
                solid
                size={dotSize}
                name="circle"
                style={[
                    props.vertical ? styles.verticalDotPadding : styles.dotPadding,
                    count !== props.pageIndex ? styles.iconGrey : null
                ]}
            />
        )
    }

    const orientationStyle = { flexDirection: props.vertical ? 'column' : 'row'}
    return (
        <View style={[styles.container, orientationStyle]}>
            {   
                props.showArrows &&
                    <TouchableOpacity 
                        onPress={props.onPageBackwardPressed}
                        disabled={props.pageIndex === 0}
                    >
                        <SimpleLineIcons
                            style={[styles.arrowIcon, props.pageIndex === 0 ? styles.iconGrey : null]}
                            size={chevronSize}
                            name={ props.vertical ? 'arrow-up' : 'arrow-left'}
                        />
                    </TouchableOpacity>
            }
            { paginationDots }
            {
                props.showArrows &&
                    <TouchableOpacity 
                        onPress={props.onPageForwardPressed}
                        disabled={props.pageIndex === props.totalPages - 1}
                    >
                        <SimpleLineIcons 
                            style={[styles.arrowIcon, props.pageIndex === props.totalPages - 1 ? styles.iconGrey : null]}
                            size={chevronSize}
                            name={ props.vertical ? 'arrow-down' : 'arrow-right'}
                        />
                    </TouchableOpacity>
            }
        </View>
    )
}

const styles = EStyleSheets.create({
    container: {
        paddingHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: '$classifierGrey'
    },
    iconGrey: {
        color: '$mediumGrey'
    },
    verticalDotPadding: {
        paddingHorizontal: 1,
        paddingVertical: 2
    },
    dotPadding: {
        paddingHorizontal: 4
    },
    arrowIcon: {
        paddingVertical: 5,
        paddingHorizontal: 5
    }
})

PaginationBar.propTypes = {
    onPageForwardPressed: PropTypes.func,
    onPageBackwardPressed: PropTypes.func,
    pageIndex: PropTypes.number,
    totalPages: PropTypes.number,
    vertical: PropTypes.bool,
    showArrows: PropTypes.bool
}

PaginationBar.defaultProps = {
    showArrows: false,
    vertical: false
}

export default PaginationBar