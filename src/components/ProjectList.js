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

GoogleAnalytics.trackEvent('view', 'Project')

const mapStateToProps = (state) => ({
  user: state.user,
  projects: state.projectList[state.selectedProjectTag] || [],
  dataSource: dataSource.cloneWithRows(state.projectList[state.selectedProjectTag])
})

const dataSource = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
})

export class ProjectList extends React.Component {
  constructor(props) {
    super(props)
  }

  renderRow(project, color) {
    return (
      <Project project={project} color={color} />
    );
  }

  static renderNavigationBar() {
    return <NavBar title={'Projects'} showBack={true} />;
  }

  render() {
    const projectList =
      <ListView
        dataSource={this.props.dataSource}
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
          { this.props.projects.length > 0 ? projectList : emptyList }
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
  listStyle: {
    paddingTop: 90
  },
  emptyList: {
    marginHorizontal: 20,
    color: 'grey',
    fontStyle: 'italic',
    lineHeight: 24
  }
});

ProjectList.propTypes = {
  user: React.PropTypes.object,
  dataSource: React.PropTypes.object,
  projects: React.PropTypes.array,
  tag: React.PropTypes.string,
  color: React.PropTypes.string,
}

export default connect(mapStateToProps)(ProjectList)
