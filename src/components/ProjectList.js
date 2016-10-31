import React from 'react'
import {
  Alert,
  ListView,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import { MOBILE_PROJECTS } from '../constants/mobile_projects'
import Project from './Project'
import NavBar from './NavBar'
import apiClient from 'panoptes-client/lib/api-client'
import { connect } from 'react-redux'
import GoogleAnalytics from 'react-native-google-analytics-bridge'

GoogleAnalytics.trackEvent('view', 'Project')

const mapStateToProps = (state) => ({
  user: state.user,
  isConnected: state.isConnected
})

class ProjectList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      })
    }
  }

  componentDidMount() {
    if (this.state.dataSource.getRowCount() === 0){
      this.getProjects()
    }
  }

  getDataSource(projects: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(projects);
  }

  getProjects(){
    apiClient.type('projects').get({id: MOBILE_PROJECTS, cards: true, tags: this.props.tag, sort: 'display_name'})
      .then((projects) => {
        this.setState({
          dataSource: this.getDataSource(projects),
        });
      })
      .catch((error) => {
        Alert.alert(
          'Error',
          'The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,
        )
      })
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
        dataSource={this.state.dataSource}
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
  tag: React.PropTypes.string
}

export default connect(mapStateToProps)(ProjectList)
