import React from 'react'
import {
  Dimensions,
  ListView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Orientation from 'react-native-orientation'
import apiClient from 'panoptes-client/lib/api-client'
import Project from './Project'
import {MOBILE_PROJECTS} from './constants/mobile_projects'

var {height, width} = Dimensions.get('window');

var ProjectList = React.createClass({
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      })
    };
  },

  componentDidMount() {
    this.getProjects()
    Orientation.lockToPortrait
  },

  getDataSource(projects: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(projects);
  },

  getProjects(){
    apiClient.type('projects').get({id: MOBILE_PROJECTS, cards: true, sort: 'display_name'})
      .then((projects) => {
        this.setState({
          dataSource: this.getDataSource(projects),
        });
      })
      .catch((error) => {
        console.error(error);
      })
  },

  renderRow(project) {
    return (
      <Project project={project}/>
    );
  },

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Zooniverse
          </Text>
        </View>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            Mobile-friendly Projects
          </Text>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
        />
      </View>
    );
  }
});

const styles = EStyleSheet.create({
  container: {
    flex: 1
  },
  titleContainer: {
    backgroundColor: '$backgroundColor',
    justifyContent: 'center',
    paddingBottom: 10,
    paddingTop: 32,
    alignItems: 'center',
    width: width
  },
  title: {
    color: '$textColor',
    fontSize: 22
  },
  subtitleContainer: {
    borderBottomColor: '$borderColor',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 15
  },
  subtitle: {
    color: '$textColor',
    fontSize: 24,
    padding: 15,
  }
});

module.exports = ProjectList
