import React, { Component } from 'react'
import {
    ActivityIndicator,
    View,
} from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'
import { connect } from 'react-redux'

import FontedText from './common/FontedText'
import PageKeys from '../constants/PageKeys'
import { setNavbarSettingsForPage } from '../actions/navBar'
import WebView from 'react-native-webview'

class WebViewScreen extends Component {

    constructor(props) {
        super(props)

        this.renderLoadingScreen = this.renderLoadingScreen.bind(this)
    }

    componentDidMount() {
        this.props.setNavbarSettings({
            title: '',
            showBack: true,
            centerType: 'title'
        })
    }

    renderLoadingScreen() {
        return (
            <View style={styles.loadingScreenContainer} >
                <View style={styles.loadingIndicatorContainer}>
                    <FontedText style={styles.loadingFont}>
                        { this.props.loadingText }
                    </FontedText>
                    <ActivityIndicator size="large"/>
                </View>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <WebView
                    source={{uri: this.props.uri}}
                    startInLoadingState
                    renderLoading={this.renderLoadingScreen}
                />
            </View>
        )
    }

}

const styles = EStyleSheet.create({
    container: {
        flex: 1
    },
    loadingScreenContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    loadingIndicatorContainer: {
        flexDirection: 'column',
        height: 50
    },
    loadingFont: {
        fontSize: 18,
        marginBottom: 10
    }
})

WebViewScreen.propTypes = {
    uri: PropTypes.string.isRequired,
    loadingText: PropTypes.string,
    setNavbarSettings: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
    setNavbarSettings: (settings) => dispatch(setNavbarSettingsForPage(settings, PageKeys.WebView))
})

export default connect(null, mapDispatchToProps)(WebViewScreen)