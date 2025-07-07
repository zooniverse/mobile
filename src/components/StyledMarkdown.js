import React from 'react'
import {
  Dimensions,
  Linking,
  Platform,
} from 'react-native'
import { WebView } from 'react-native-webview';
import EStyleSheet from 'react-native-extended-stylesheet'
import defaultHTML from '../utils/default-md-html'
import PropTypes from 'prop-types';

import {removeMDTab} from '../utils/remove-md-tab'

const MarkdownIt = require('markdown-it'),
    md = new MarkdownIt({linkify: true, breaks: true}).use(removeMDTab)

class StyledMarkdown extends React.Component {
    webview = null

    constructor(props) {
        super(props)
        this.state = {height: 0}

    }

    onShouldStartLoadWithRequest = (event) => {
        if (event.url.indexOf('http') >= 0) {
            this.webview.stopLoading()
            Linking.openURL(event.url)
            return false
        } else {
            return true
        }
    }

    onNavigationStateChange = (navState) => {
        if (Platform.OS === 'android') {
            this.onShouldStartLoadWithRequest(navState)
        }
        if (Number(navState.title) > 0) {
            const htmlHeight = Number(navState.title) //convert to number
            this.setState({height: htmlHeight})
            this.props.onReceivedHeight(htmlHeight)
        }
    }

    render() {
        //Markdownz uses markdown-it-imsize for image sizes, however this package
        //requires fs, which is a node core module and not available natively
        //Also, we can't use the image sizes.  This regexp removes them, prior to
        //being sent to renderer, or else they're interpreted as links
        let markdown = this.props.markdown.replace(/ =[0-9]+x[0-9]*\)/g, '\)')
        let result = md.render(markdown)

    const resultHTML = defaultHTML
      .replace('$body', result)
      .replace('$extraCSS', this.props.extraCSS)

        const displayWidth = this.props.width || Dimensions.get('window').width - 30

        const webviewComponent =
            <WebView
                ref={webview => {
                    this.webview = webview
                }}
                style={[styles.webview, {height: this.state.height, width: displayWidth}]}
                source={{
                    html: resultHTML,
                    baseUrl: 'about:blank'
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                automaticallyAdjustContentInsets={true}
                scalesPageToFit={true}
                onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                onNavigationStateChange={this.onNavigationStateChange}
            />

        return (
            resultHTML ? webviewComponent : null
        )
    }
}

const styles = EStyleSheet.create({
    webview: {
        backgroundColor: 'transparent'
    },
})

StyledMarkdown.propTypes = {
    markdown: PropTypes.string,
    onReceivedHeight: PropTypes.func,
    extraCSS: PropTypes.string,
    width: PropTypes.number,
    inMuseumMode: PropTypes.bool,
}

StyledMarkdown.defaultProps = {
    markdown: '',
    extraCSS: '',
    onReceivedHeight: () => {
    },
}

export default StyledMarkdown
