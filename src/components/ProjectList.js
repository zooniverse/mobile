import React from 'react'
import {
  ListView,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import Project from './Project'
import NavBar from './NavBar'
import { connect } from 'react-redux'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import { contains, filter } from 'ramda'

GoogleAnalytics.trackEvent('view', 'Project')

const mapStateToProps = (state) => ({
  projectList: state.projectList || [],
  recentsList: state.recentsList || [],
  selectedProjectTag: state.selectedProjectTag || '',
  promptForWorkflow: state.settings.promptForWorkflow || false,
})

const dataSource = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
})

export class ProjectList extends React.Component {
  renderRow(project, color) {
    const workflows = project.workflows || []
    const filterNonSwipe = (workflow) => { return workflow.swipe_verified === false }
    const filterSwipe = (workflow) => { return workflow.swipe_verified === true }
    const nonMobileWorkflows = filter(filterNonSwipe, workflows)
    const mobileWorkflows = filter(filterSwipe, workflows)

    return (
      <Project
        project={project}
        color={color}
        nonMobileWorkflows={nonMobileWorkflows}
        mobileWorkflows={mobileWorkflows}
        promptForWorkflow={this.props.promptForWorkflow}
      />
    );
  }

  static renderNavigationBar() {
    return <NavBar title={'Projects'} showBack={true} />;
  }

  render() {
    const selectedtag = this.props.selectedProjectTag
    let projects = []
    if (selectedtag === 'recent') {
      projects = this.props.recentsList || []
    } else {
      const filterByTag = (project) => { return contains(selectedtag, project.tags) }
      projects = filter(filterByTag, this.props.projectList) || []
    }

    const projectList =
      <ListView
        dataSource={dataSource.cloneWithRows(projects)}
        renderRow={(rowData) => this.renderRow(rowData, this.props.color)}
        enableEmptySections={true}
      />

    const emptyList =
      <StyledText
        additionalStyles={[styles.emptyList]}
        text={'Sorry, but you have no mobile friendly projects to display'} />

    return (
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          { projects.length > 0 ? projectList : emptyList }
        </View>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '$lightGreyBackground'
  },
  innerContainer: {
    flex: 1,
    marginTop: 30
  },
  emptyList: {
    marginHorizontal: 20,
    color: 'grey',
    fontStyle: 'italic',
    lineHeight: 24
  }
});

ProjectList.propTypes = {
  projectList: React.PropTypes.array,
  recentsList: React.PropTypes.array,
  selectedProjectTag: React.PropTypes.string,
  color: React.PropTypes.string,
  promptForWorkflow: React.PropTypes.bool,
  projectWorkflows: React.PropTypes.object,
}

export default connect(mapStateToProps)(ProjectList)
