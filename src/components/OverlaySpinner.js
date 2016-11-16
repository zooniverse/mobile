import React, { Component } from 'react'
import {
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Spinner from 'react-native-loading-spinner-overlay'
import { connect } from 'react-redux'


const mapStateToProps = (state) => ({
  isFetching: state.isFetching
})

export class OverlaySpinner extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Spinner visible={this.props.isFetching} />
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
})

OverlaySpinner.propTypes = {
  isFetching: React.PropTypes.bool,
}

export default connect(mapStateToProps)(OverlaySpinner)
