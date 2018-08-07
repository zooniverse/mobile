import React, { Component } from 'react'
import {
    ActivityIndicator,
    View,
    WebView
} from 'react-native'
import FontedText from './common/FontedText'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'

class WebViewScreen extends Component {

    constructor(props) {
        super(props)

        this.renderLoadingScreen = this.renderLoadingScreen.bind(this)
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
    loadingText: PropTypes.string
}

export default WebViewScreen