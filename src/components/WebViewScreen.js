import React, { Component } from 'react'
import {
    View,
    WebView
} from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'

class WebViewScreen extends Component {

  render() {
      return (
        <View style={styles.container}>
            <WebView
                source={{uri: this.props.uri}}
            />
        </View>
      )
  }

}

const styles = EStyleSheet.create({
    container: {
        flex: 1
    }
})

WebViewScreen.propTypes = {
    uri: PropTypes.string
}

export default WebViewScreen