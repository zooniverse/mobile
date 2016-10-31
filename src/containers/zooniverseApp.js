import React, {Component} from 'react'
import {
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import ProjectDisciplines from '../components/ProjectDisciplines'
import NavBar from '../components/NavBar'
import { connect } from 'react-redux'

const mapStateToProps = (state) => ({
  user: state.user,
  isFetching: state.isFetching,
  isConnected: state.isConnected,
})

class ZooniverseApp extends Component {
  constructor(props) {
    super(props);
  }

  static renderNavigationBar() {
    return <NavBar showAvatar={true} />;
  }

  render() {
    return (
      <View style={styles.container}>
        { this.props.isFetching ? null : <ProjectDisciplines /> }
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
});

ZooniverseApp.propTypes = {
  user: React.PropTypes.object,
  isFetching: React.PropTypes.bool.isRequired,
  isConnected: React.PropTypes.bool,
}

export default connect(mapStateToProps)(ZooniverseApp)
