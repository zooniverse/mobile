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
  isConnected: state.isConnected,
  dataSource: dataSource.cloneWithRows(state.projectList[state.selectedProjectTag])
})

const dataSource = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
})

class ProjectList extends React.Component {
  constructor(props) {
    super(props)
  }

  renderRow(project) {
    return (
      <Project project={project}/>
    );
  }

  static renderNavigationBar() {
    return <NavBar title={'Projects'} showBack={true} />;
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
}

export default connect(mapStateToProps)(ProjectList)
