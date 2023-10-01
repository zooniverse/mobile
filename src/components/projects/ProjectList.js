import React, { Component } from 'react'
import {
    FlatList,
    View,
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import R from 'ramda'
import DeviceInfo from 'react-native-device-info'

import ProjectTile from './ProjectTile';
import FontedText from '../common/FontedText'
import * as navBarActions from '../../actions/navBar'
import { GLOBALS } from '../../constants/globals'
import { extractNonSwipeEnabledProjects, extractSwipeEnabledProjects } from '../../utils/projectUtils'
import PageKeys from '../../constants/PageKeys'

import * as projectDisplay from '../../displayOptions/projectDisplay'

import theme from '../../theme'

const mapStateToProps = (state, ownProps) => {
    const { selectedProjectTag } = ownProps.route.params;
    const inPreviewMode = selectedProjectTag === 'preview'
    const inBetaMode = selectedProjectTag === 'beta'
    let projectList

    projectList = projectDisplay.sortUnfinishedFirst(state.projects.projectList)

    // Grab all of the projects from the selected Project Tag
    if (selectedProjectTag === 'recent') {
        const activeProjects = R.filter((project) => {
            return project.activity_count > 0
        }, state.user.projects);
        projectList = projectList.filter((project) => R.keys(activeProjects).includes(project.id));
    } else if (selectedProjectTag === 'all projects') {
        projectList = projectList
    } else if (inPreviewMode) {
        projectList = state.projects.previewProjectList
    } else if (inBetaMode) {
        projectList = state.projects.betaProjectList
    }
    else {
        projectList = projectList.filter((project) => R.contains(selectedProjectTag, project.tags))
    }

    // Seperate out the native workflows and non-native workflows    
    const swipeEnabledProjects = extractSwipeEnabledProjects(projectList)
    const nonSwipeEnabledProjects = state.settings.showAllWorkflows ?
        extractNonSwipeEnabledProjects(projectList)
        : []

    return {
        swipeEnabledProjects,
        nonSwipeEnabledProjects,
        promptForWorkflow: state.main.settings.promptForWorkflow || false,
        isLoading: state.projects.isLoading,
        collaboratorIds: state.projects.collaboratorIds,
        ownerIds: state.projects.ownerIds,
        inPreviewMode,
        inBetaMode
    };
}

const mapDispatchToProps = (dispatch) => ({
    navBarActions: bindActionCreators(navBarActions, dispatch)
})

const ColumnNumbers = DeviceInfo.isTablet() ? 2 : 1

class ProjectList extends Component {

    constructor(props) {
        super(props)

        this.renderItem = this.renderItem.bind(this)
    }

    componentDidMount() {
      const { navBarActions, inPreviewMode } = this.props;
      const { selectedProjectTag } = this.props.route.params;

        const title = GLOBALS.DISCIPLINES.find((element) => element.value === selectedProjectTag).label
        navBarActions.setNavbarSettingsForPage({
            title,
            showBack: true,
            isPreview: inPreviewMode, //TODO: Decouple preview mode from the color of the safe area container
            backgroundColor: inPreviewMode ? theme.$testRed : theme.$zooniverseTeal,
            centerType: 'title',
        }, PageKeys.ProjectList)
    }

    emptyText() {
        if (!this.props.isLoading) {
            return 'Sorry, but you have no mobile friendly projects to display'
        } else {
            return 'Loading Projects...'
        }
    }

    renderItem({item}) {
        switch (item.displayType) {
            case 'project': 
                return <ProjectTile
                    project={item}
                    inPreviewMode={this.props.inPreviewMode}
                    inBetaMode={this.props.inBetaMode}
                    navigation={this.props.navigation}/>
            case 'spacer':
                return <View style={styles.spacer} />
            case 'header':
                return <FontedText style={styles.sectionHeader}> { item.text } </FontedText>
        }
    }

    /**
     * A note on how we are rendering the list view here:
     * 
     * On handset we render the list view with 1 column and on tablet
     * we render it with 2 columns. In addition, the list view requires 
     * two section headers: 
     *      In Preview: 1) Your Projects. 2) Collaborations
     *      In Normal mode: 1) Made for mobile. 2) In Browser experience.
     * 
     * Normally to create a list with section headers, you would use a SectionList,
     * but they don't ship with any column number integrations.
     * 
     * In order to get around this, we use a Flatlist (which does have column number integrations)
     * and push cells that appear to be section headers. We achieve the correct spacing by
     * adding spacer components that will fill in cells for the rest of the line.
     * 
     * For example:
     * 
     * If the first section of the list has 3 projects, our list of items to display would be:
     * [Header, spacer, project, project, project, spacer]
     * 
     * With two columns it will display as:
     * 
     *  Header, Spacer
     *  Project, Project
     *  Project, Spacer
     * 
     * This way when our next section starts, the header will be at the beginning of a line   
     */
    render() {
        const fillLineWithSpacers = (projects) => {
            while (projects.length % ColumnNumbers !== 0) {
                projects.push({displayType: 'spacer'})
            }
        }

        const tagAsProject = (project) => R.set(R.lensProp('displayType'), 'project', project)
        const {inPreviewMode, ownerIds, collaboratorIds, swipeEnabledProjects, nonSwipeEnabledProjects } = this.props
        let projects = []
        if (inPreviewMode) {
            if (!R.isEmpty(ownerIds)) {
                // Add Header
                projects.push({ displayType: 'header', text: 'Your Projects'})
                fillLineWithSpacers(projects)

                // Add Projects
                const ownerProjects = swipeEnabledProjects.filter((project) => ownerIds.includes(project.id)).map(tagAsProject)
                projects = [...projects, ...ownerProjects]
                fillLineWithSpacers(projects)
            }

            if (!R.isEmpty(collaboratorIds)) {
                // Add Header
                projects.push({displayType: 'header', text: 'Collaborations'})
                fillLineWithSpacers(projects)

                // Add Projects
                const collaboratorProjects = swipeEnabledProjects.filter((project) => collaboratorIds.includes(project.id)).map(tagAsProject)
                projects = [...projects, ...collaboratorProjects]
                fillLineWithSpacers(projects)
            }
        } else {
            if (!R.isEmpty(swipeEnabledProjects)) {

                // Add Projects
                projects = [...projects, ...swipeEnabledProjects.map(tagAsProject)]
                fillLineWithSpacers(projects)
            }
    
            if (!R.isEmpty(nonSwipeEnabledProjects)) {
                // Do nothing. For now, we no longer want
                // to show browser-only projects in the mobile app.
                // I am leaving the conditional in because
                // We discovered an issue with WebView on release day
                // and needed to fix this fast, and we didn't seem
                // 100% sure if we wanted to remove browser-only
                // projects forever.
                //TODO in 2021: If we get to 2021 and folks seem happy
                // with the choice to remove the browser projects, let's
                // pull this conditional out.
            }
        }      

        return (
            <FlatList
                numColumns={ColumnNumbers}
                data={projects}
                columnWrapperStyle={DeviceInfo.isTablet() ? styles.columnWrapper : null}
                ListHeaderComponent={this.props.inBetaMode && <ListHeaderComponent />}
                contentContainerStyle={styles.contentContainer}
                ItemSeparatorComponent={() => <View style={styles.separatorView} />}
                renderItem={this.renderItem}
                ListEmptyComponent={() => <FontedText style={styles.emptyComponent}> {this.emptyText()} </FontedText>}
                keyExtractor={(item, index) => `${index}`}
            />
        );
    }
}

const ListHeaderComponent = () => {
    return  (
        <FontedText style={styles.listHeader}>
            {
                'Thank you for volunteering to beta test projects in development.\n\n' +
                'Your feedback here will help new projects join the Zooniverse.'
            }
        </FontedText>
    )
}

const styles = EStyleSheet.create({
    contentContainer: {
        paddingBottom: 25,
        paddingTop: 35
    },
    listHeader: {
        color: '$headerGrey',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'justify',
        marginHorizontal: 25,
        marginBottom: 25
        
    },
    separatorView: {
        height: 25
    },
    sectionHeader: {
        fontSize: 26, 
        marginLeft: 25, 
        marginBottom: 20, 
        fontWeight: 'bold',
        color: '$headerGrey'
    },
    emptyComponent: {
        fontStyle: 'italic', 
        marginHorizontal: 20, 
        color: '$headerGrey'
    },
    spacer: {
        flex: 1,
        marginHorizontal: 15
    },
    columnWrapper: { 
        marginHorizontal: 25
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
    navBarActions: PropTypes.any,
    inPreviewMode: PropTypes.bool,
    inBetaMode: PropTypes.bool,
    collaboratorIds: PropTypes.array,
    ownerIds: PropTypes.array
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList)