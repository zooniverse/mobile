import React from 'react'
import {
  Dimensions,
  Linking,
  Platform,
  WebView,
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import defaultHTML from '../utils/default-md-html'

import { removeMDTab } from '../utils/remove-md-tab'

const MarkdownIt = require('markdown-it'),
    md = new MarkdownIt({ linkify: true, breaks: true }).use(removeMDTab)

const WEBVIEW_REF = 'WEBVIEW_REF'

class StyledMarkdown extends React.Component {
  constructor(props) {
    super(props)
    this.state = { height: 0 }
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

    const displayWidth = this.props.width || Dimensions.get('window').width - 40

    const webviewComponent =
      <WebView
        ref={WEBVIEW_REF}
        style={ [styles.webview, { height: this.state.height, width: displayWidth }] }
				source={{
					html: resultHTML,
					baseUrl: 'about:blank'
				}}
        javaScriptEnabled={ true }
        domStorageEnabled={ true }
				automaticallyAdjustContentInsets={ true }
        scalesPageToFit={ true }
        onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
        onNavigationStateChange={this.onNavigationStateChange}
			/>

    return (
      resultHTML ? webviewComponent : null
    )
  }

  onShouldStartLoadWithRequest = (event) => {
    if (event.url.indexOf('http') >= 0 ) {
      this.refs[WEBVIEW_REF].stopLoading()
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
      this.props.onResize(htmlHeight)
    }
  }
}

const styles = EStyleSheet.create({
  webview: {
    backgroundColor: 'transparent'
  },
})

StyledMarkdown.propTypes = {
  markdown: React.PropTypes.string,
  onResize: React.PropTypes.func,
  extraCSS: React.PropTypes.string,
  width: React.PropTypes.number,
}

StyledMarkdown.defaultProps = {
  markdown: '',
  extraCSS: '',
  onResize: () => {},
}

export default StyledMarkdown
