import React, { Component } from 'react'
import {
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Spinner from 'react-native-loading-spinner-overlay'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';


const mapStateToProps = (state) => ({
  isFetching: state.isFetching,
  loadingText: state.loadingText || 'Loading...'
})

export class OverlaySpinner extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Spinner
          visible={this.props.isFetching || this.props.overrideVisibility}
          textContent={this.props.loadingText}
          textStyle={styles.text}
        />
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: '$transluscentWhite',
    fontSize: 14,
    fontFamily: 'OpenSans',
  }

})

OverlaySpinner.propTypes = {
  isFetching: PropTypes.bool,
  loadingText: PropTypes.string,
  overrideVisibility: PropTypes.bool
}

OverlaySpinner.defaultProps = {
  overrideVisibility: false
}

export default connect(mapStateToProps)(OverlaySpinner)
