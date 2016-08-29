import React, { Component } from 'react'
import {
  Animated,
  Dimensions,
  ListView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import apiClient from 'panoptes-client/lib/api-client'
import Project from './Project'
import {MOBILE_PROJECTS} from './constants/mobile_projects'

var width = Dimensions.get('window').width
var height = Dimensions.get('window').height

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
  },

  getDataSource(projects: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(projects);
  },

  getProjects(){
    apiClient.type('projects').get(MOBILE_PROJECTS)
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
      <Project title={project.title} />
    );
  },

  render() {
    return (
      <View>
        <Text style={styles.title}>
          Zooniverse
        </Text>
        <Text style={styles.subtitle}>
          Mobile-friendly Projects
        </Text>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
        />
      </View>
    );
  }
});

const styles = StyleSheet.create({
  title: {
    backgroundColor: '#202020',
    color: '#F9F9F9',
    fontSize: 28,
    padding: 15,
    width: width
  },
  subtitle: {
    color: '#F9F9F9',
    fontSize: 24,
    padding: 15,
  },
});

module.exports = ProjectList
