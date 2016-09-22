import React, {Component} from 'react';
import ProjectList from '../components/ProjectList';
import { setUser } from '../actions/index';
import { connect } from 'react-redux';

class ZooniverseApp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ProjectList />
    );
  }
}

const mapStateToProps = (state) => ({
  userID: state.userID
})

const mapDispatchToProps = (dispatch) => ({
  setUser(id) {
    dispatch(setUser(id))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(ZooniverseApp)
