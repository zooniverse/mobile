import React from 'react'
import {
  ListView,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import { MOBILE_PROJECTS } from '../constants/mobile_projects'
import Project from './Project'
import NavBar from './NavBar'
import { fetchProjects, setProjectList } from '../actions/index'
import { connect } from 'react-redux'
import GoogleAnalytics from 'react-native-google-analytics-bridge'

GoogleAnalytics.trackEvent('view', 'Project')

const mapStateToProps = (state) => ({
  user: state.user,
  isConnected: state.isConnected,
  dataSource: dataSource.cloneWithRows(state.projectList)
})

const mapDispatchToProps = (dispatch) => ({
  fetchProjects(parms) {
    dispatch(fetchProjects(parms))
  },
  resetProjectList() {
    dispatch(setProjectList([]))
  },
})

const dataSource = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
})

class ProjectList extends React.Component {
  constructor(props) {
    super(props)
    const parms = {id: MOBILE_PROJECTS, cards: true, tags: this.props.tag, sort: 'display_name'}
    this.props.fetchProjects(parms)
  }

  componentWillUnmount() {
    this.props.resetProjectList()
  }

  renderRow(project) {
    return (
      <Project project={project}/>
    );
  }

  static renderNavigationBar() {
    return <NavBar title={"Projects"} showBack={true} />;
  }

  render() {
    const projectList =
      <ListView
        dataSource={this.props.dataSource}
        renderRow={this.renderRow}
        enableEmptySections={true}
      />

    const noConnection =
      <View style={styles.messageContainer}>
        <StyledText textStyle={'errorMessage'}
          text={'You must have an internet connection to use Zooniverse Mobile'} />
      </View>

    return (
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          { this.props.isConnected ? projectList : noConnection }
        </View>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  innerContainer: {
    flex: 1,
    marginTop: 30
  },
  listStyle: {
    paddingTop: 90
  },
  messageContainer: {
    padding: 15,
  },
});

ProjectList.propTypes = {
  user: React.PropTypes.object,
  isConnected: React.PropTypes.bool,
  dataSource: React.PropTypes.object,
  tag: React.PropTypes.string,
  fetchProjects: React.PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList)
