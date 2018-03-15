import React from 'react'
import {
  Alert,
  Linking,
  Platform,
  View,
  WebView
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import NavBar from './NavBar'
import { setState, setIsFetching } from '../actions/index'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {Actions} from 'react-native-router-flux'
import OverlaySpinner from './OverlaySpinner'
import PropTypes from 'prop-types';
import * as navBarActions from '../actions/navBar'

const WEBVIEW_REF = 'WEBVIEW_REF'
const zooniverseURL = 'https://www.zooniverse.org/projects/'

const mapStateToProps = (state) => ({
  webViewNavCounter: state.main.webViewNavCounter || 0
})

const mapDispatchToProps = (dispatch) => ({
  updateNavCounter(newVal) {
    dispatch(setState('webViewNavCounter', newVal))
  },
  setIsFetching(isFetching) {
    dispatch(setIsFetching(isFetching))
  },
  navBarActions: bindActionCreators(navBarActions, dispatch)
})

const PAGE_NAME = 'ZooWebView';

class ZooWebView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { canGoBack: false }
  }

  static renderNavigationBar() {
    return <NavBar pageKey={PAGE_NAME} showBack={true} />
  }

  componentWillMount() {
    this.props.setIsFetching(true)
  }

  componentDidMount() {
    this.props.navBarActions.setTitleForPage(this.props.project.display_name, PAGE_NAME)
  }

  render() {
    const zurl = `${zooniverseURL}${this.props.project.slug}`

    let jsCode = `
      (function () {
        if (WebViewBridge) {
          WebViewBridge.onMessage = function (message) {
            if (message === "get-links") {
              tagLinks();
            }
          };

          function tagLinks(){
            var links = document.querySelectorAll('a');
            for (i = 0; i < links.length; i++) {
              links[i].addEventListener('click', function() {
                WebViewBridge.send('{"link":"' + this + '"}');
              });
            }
          }
        }
      }());
    `

    return (
      <View style={styles.container}>
        <WebView
          ref={WEBVIEW_REF}
          source={{uri: zurl}}
          onLoadEnd={this.onLoadEnd}
          injectedJavaScript={jsCode}
          dataDetectorTypes='all'
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          renderLoading={this.renderLoading}
          onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
          onNavigationStateChange={this.onNavigationStateChange}
        />
      </View>
    )
  }

  renderLoading = () => {
    return <OverlaySpinner />
  }

  onBack() {
    this.props.updateNavCounter(this.props.webViewNavCounter - 1)

    if ((this.state.canGoBack) && (this.props.webViewNavCounter > 1)){
      this.refs[WEBVIEW_REF].goBack()
    } else {
      Actions.pop()
    }
  }

  onBridgeMessage(messageJSON){
    const message = JSON.parse(messageJSON)
    if (message.link) {
      if (this.isInternalLink(message.link)) {
        this.props.updateNavCounter(this.props.webViewNavCounter + 1)
      }
    }
  }

  onShouldStartLoadWithRequest = (event) => {
    if (this.isInternalLink(event.url)) {
      this.props.updateNavCounter(this.props.webViewNavCounter + 1)
      return true
    } else {
      if (Platform.OS === 'android') {
        this.refs[WEBVIEW_REF].stopLoading()
      }
      this.props.setIsFetching(false)
      this.handleExternalLink(event.url)
      return false
    }
  }

  isInternalLink(url) {
    return url.indexOf(zooniverseURL) >= 0
  }

  onNavigationStateChange = (navState) => {
    if (Platform.OS === 'android') {
      this.onShouldStartLoadWithRequest(navState)
    }

    this.setState({ canGoBack: navState.canGoBack })
  }

  onLoadEnd  = () => {
    this.props.setIsFetching(false)
  }

  handleExternalLink(url) {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Sorry, but it looks like you are unable to open this link in your default browser.')
      }
    })
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
})


ZooWebView.propTypes = {
  project: PropTypes.object,
  webViewNavCounter: PropTypes.number,
  updateNavCounter: PropTypes.func,
  setIsFetching: PropTypes.func,
  navBarActions: PropTypes.shape({
    setTitleForPage: PropTypes.func
  })
}


export default connect(mapStateToProps, mapDispatchToProps)(ZooWebView)
