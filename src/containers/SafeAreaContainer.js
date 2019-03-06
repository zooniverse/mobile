import React from 'react'
import {
    SafeAreaView,
    View
 } from 'react-native'
import { connect }  from 'react-redux'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'

const SafeAreaContainer = (props) => {
    const backgroundStyle = props.isPreview ? styles.previewBackground : styles.defaultBackground
    return (
        <View style={[styles.container, backgroundStyle]}>
            <SafeAreaView style={[styles.topSafeAreaContainer, backgroundStyle]} />
            <SafeAreaView style={styles.bottomSafeAreaView}>
                { props.children }
            </SafeAreaView>
        </View>
    );
}

const styles = EStyleSheet.create({
    defaultBackground: {
        backgroundColor: '$zooniverseTeal'
    },
    previewBackground: {
        backgroundColor: '$testRed'
    },
    container: {
        flex: 1,
    },
    bottomSafeAreaView: {
        flex: 1,
        backgroundColor: '$backgroundColor'
      },
      topSafeAreaView: {
        flex:0,
      }
})

SafeAreaContainer.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]),
    isPreview: PropTypes.bool
}

const mapStateToProps = (state) => {
    const { navBar } = state
    const pageSettings = navBar.pageSettings[navBar.pageShowing] 
    return { isPreview: pageSettings ? pageSettings.isPreview : false}
}

export default connect(mapStateToProps)(SafeAreaContainer)