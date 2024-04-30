import React from 'react'
import {
    SafeAreaView,
    View
 } from 'react-native'
import { connect, useSelector }  from 'react-redux'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'

const SafeAreaContainer = (props) => {
    const { pageShowing } = useSelector(state => state.navBar)

    // Apply different colors for preview, classifier, and everything else.
    let backgroundStyle = props.isPreview ? styles.previewBackground : styles.defaultBackground
    let bottomBackgroundColor = styles.bottomDefaultColor
    const classifierPages = ['QuestionClassifier', 'SwipeClassifier', 'MultiAnswerClassifier', 'DrawingClassifier']
    if (classifierPages.includes(pageShowing)) {
        backgroundStyle = styles.classifier;
        bottomBackgroundColor = styles.bottomClassiferColor;
    }
    return (
        <View style={[styles.container, backgroundStyle]}>
            <SafeAreaView style={[styles.topSafeAreaContainer, backgroundStyle]} />
            <SafeAreaView style={[styles.bottomSafeAreaView, bottomBackgroundColor]}>
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
    classifier: {
        backgroundColor: 'black', // Black top safe area for classifier screens
    },
    container: {
        flex: 1,
    },
    bottomSafeAreaView: {
        flex: 1,
    },
    bottomDefaultColor: {
        backgroundColor: '$backgroundColor',
    },
    bottomClassiferColor: {
        backgroundColor: 'white', // White bottom safe area to blend with Field Guide button.
    },
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