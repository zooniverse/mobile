import React, { Component } from 'react'
import {
  SectionList,
  View,
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import PropTypes from 'prop-types';
import R from 'ramda'

import ProjectTile from './ProjectTile';
import NavBar from '../NavBar'
import FontedText from '../common/FontedText'
import * as navBarActions from '../../actions/navBar'
import { GLOBALS } from '../../constants/globals'

GoogleAnalytics.trackEvent('view', 'Project')

const mapStateToProps = (state) => {
    const { selectedProjectTag } = state.main;
    let projectList = []
    
    // Grab all of the projects from the selected Project Tag
    if (selectedProjectTag === 'recent') {
      const activeProjects = R.filter((project) => { return project.activity_count > 0 }, state.user.projects);
      projectList = state.projects.projectList.filter((project) => R.keys(activeProjects).includes(project.id));
    } else {
        projectList = state.projects.projectList.filter((project) => R.contains(selectedProjectTag, project.tags))
    }

    // Seperate out of the native workflows and non-native workflows    
    const swipeEnabledProjects = projectList.filter((project) => R.any((workflow) => workflow.swipe_verified)(project.workflows))
    const nonSwipeEnabledProjects = projectList.filter((project) => R.all((workflow) => !workflow.swipe_verified)(project.workflows))

    return {
        selectedProjectTag,
        swipeEnabledProjects,
        nonSwipeEnabledProjects,
        promptForWorkflow: state.main.settings.promptForWorkflow || false,
        isLoading: state.projects.isLoading,
    };
}

const mapDispatchToProps = (dispatch) => ({
    navBarActions: bindActionCreators(navBarActions, dispatch)
})

const PAGE_KEY = 'ProjectList';

class ProjectList extends Component {
    
    static renderNavigationBar() {
        return <NavBar pageKey={PAGE_KEY} showBack={true} />;
    }

    componentDidMount() {
        const title = GLOBALS.DISCIPLINES.find((element) => element.value === this.props.selectedProjectTag).label
        this.props.navBarActions.setTitleForPage(title, PAGE_KEY);
    }

    _emptyText() {
        if (!this.props.isLoading) {
            return 'Sorry, but you have no mobile friendly projects to display'
        } else {
            return 'Loading Projects...'
        }
    }
    
    _seperatorHeightStyle(data) {
        return {height: !!data.leadingItem && !!data.trailingSection ? 50 : 0}
    }

    render() {
        let sections = []
        if (this.props.swipeEnabledProjects.length > 0) {
            sections.push({data: this.props.swipeEnabledProjects, title: 'Made For Mobile'});
        }

        if (this.props.nonSwipeEnabledProjects.length > 0) {
            sections.push({data: this.props.nonSwipeEnabledProjects, title: 'In-Browser Experience'})
        }

        return (
            <SectionList
                contentContainerStyle={styles.contentContainer}
                stickySectionHeadersEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separatorView} />}
                SectionSeparatorComponent={(data) => <View style={this._seperatorHeightStyle(data)} />}
                renderItem={({item}) => <ProjectTile project={item} />}
                renderSectionHeader={({section}) => <FontedText style={styles.sectionHeader}> { section.title } </FontedText>}
                sections={sections}
                ListEmptyComponent={() => <FontedText style={styles.emptyComponent}> {this._emptyText()} </FontedText>}
                keyExtractor={(item, index) => index}
            />
        );
    }
}

const styles = EStyleSheet.create({
    contentContainer: {
        paddingBottom: 25,
        paddingTop: 35
    },
    separatorView: {
        height: 25
    },
    sectionHeader: {
        fontSize: 26, 
        marginLeft: 25, 
        marginBottom: 20, 
        color: '$headerGrey'
    },
    emptyComponent: {
        fontStyle: 'italic', 
        marginHorizontal: 20, 
        color: '$headerGrey'
    }

});

ProjectList.propTypes = {
    swipeEnabledProjects: PropTypes.array,
    nonSwipeEnabledProjects: PropTypes.array,
    recentsList: PropTypes.array,
    promptForWorkflow: PropTypes.bool,
    isLoading: PropTypes.bool,
    isSuccess: PropTypes.bool,
    selectedProjectTag: PropTypes.string,
    navBarActions: PropTypes.any
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList)