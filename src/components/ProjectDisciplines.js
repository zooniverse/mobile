import React from 'react'
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import { addIndex, filter, map, propEq } from 'ramda'
import { signOut } from '../actions/index'
import { connect } from 'react-redux'
import {GLOBALS} from '../constants/globals'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import Discipline from './Discipline'
import OverlaySpinner from './OverlaySpinner'

GoogleAnalytics.setTrackerId(GLOBALS.GOOGLE_ANALYTICS_TRACKING)
GoogleAnalytics.trackEvent('view', 'Home')

const mapStateToProps = (state) => ({
  user: state.user,
  isConnected: state.isConnected,
  isFetching: state.isFetching
})

const mapDispatchToProps = (dispatch) => ({
  signOut() {
    dispatch(signOut())
  },
})

class ProjectDisciplines extends React.Component {
  constructor(props) {
    super(props)
    this.handleSignOut = this.handleSignOut.bind(this)
  }

  //this will be moved to the side drawer once implemented
  handleSignOut() {
    this.props.signOut()
  }

  render() {
    const renderDiscipline = ({value, label, color}, idx) => {
      return (
        <Discipline
          icon={value}
          title={label}
          tag={value}
          key={idx}
          color={color} /> )
    }

    const DisciplineList =
      <ScrollView>
        {addIndex(map)(
          (discipline, idx) => { return renderDiscipline(discipline, idx) },
          filter(propEq('display', true), GLOBALS.DISCIPLINES)
        )}
      </ScrollView>

    const noConnection =
      <View style={styles.messageContainer}>
        <StyledText textStyle={'errorMessage'}
          text={'You must have an internet connection to use Zooniverse Mobile'} />
      </View>

    return (
      <View style={styles.container}>
        <View style={styles.subNavContainer}>
          <Text style={styles.userName}>{ this.props.user.display_name }</Text>
          <TouchableOpacity onPress={this.handleSignOut} style={styles.signOut}>
            <Text style={styles.signOutText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.innerContainer}>
          { this.props.isConnected ? DisciplineList : noConnection }
        </View>
        { this.props.isFetching ? <OverlaySpinner /> : null }
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  subNavContainer: {
    borderBottomColor: '$lightGrey',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: 140,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 190
  },
  userName: {
    color: '$darkTextColor',
    fontSize: 14,
    fontWeight: 'bold'
  },
  signOut: {
    backgroundColor: '$transparent',
  },
  signOutText: {
    color: '$darkTextColor',
    fontSize: 11,
  },
  messageContainer: {
    padding: 15,
  },
  innerContainer: {
    flex: 1,
    marginTop: 10,
  }
});

ProjectDisciplines.propTypes = {
  user: React.PropTypes.object,
  isConnected: React.PropTypes.bool,
  isFetching: React.PropTypes.bool,
  signOut: React.PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDisciplines)
