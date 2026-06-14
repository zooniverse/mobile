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
import PageKeys from '../../constants/PageKeys'

import theme from '../../theme'
import { withTranslation } from 'react-i18next'
import i18next from 'i18next';
import { loadProjectListTranslations } from '../../i18n'
import languageOptions from '../../i18n/languages';
import * as projectActions from '../../actions/projects'

const mapStateToProps = (state, ownProps) => {
    const { selectedProjectTag } = ownProps.route.params;
    const categoryKey = selectedProjectTag === 'translated projects'
        ? `${selectedProjectTag}:${state.languageSettings.platformLanguage}`
        : selectedProjectTag;
    const inPreviewMode = selectedProjectTag === 'preview'
    const inBetaMode = selectedProjectTag === 'beta'
    const projectList = state.projects.categoryProjects[categoryKey] || []

    return {
        swipeEnabledProjects: projectList,
        nonSwipeEnabledProjects: [],
        promptForWorkflow: state.main.settings.promptForWorkflow || false,
        isLoading: state.projects.categoryLoading[categoryKey] || false,
        loadError: state.projects.categoryErrors[categoryKey],
        inPreviewMode,
        inBetaMode,
        platformLanguage: state.languageSettings.platformLanguage
    };
}

const mapDispatchToProps = (dispatch) => ({
    navBarActions: bindActionCreators(navBarActions, dispatch),
    projectActions: bindActionCreators(projectActions, dispatch),
})

const ColumnNumbers = DeviceInfo.isTablet() ? 2 : 1

class ProjectList extends Component {

    constructor(props) {
        super(props)

        this.renderItem = this.renderItem.bind(this)
    }

    componentDidMount() {
      const { navBarActions, inPreviewMode, platformLanguage } = this.props;
      const { selectedProjectTag } = this.props.route.params;

        const translation = GLOBALS.DISCIPLINES.find((element) => element.value === selectedProjectTag)?.translation;
        let title = GLOBALS.DISCIPLINES.find((element) => element.value === selectedProjectTag).label

        if (selectedProjectTag === 'translated projects') {
            const nativeLanguage = languageOptions[platformLanguage];
            const projectsTranslation = this.props.t(translation, '');
            if (nativeLanguage && projectsTranslation) {
            title = `${projectsTranslation} ${nativeLanguage}`;
            }
        } else if (translation) {
            title =  this.props.t(translation, title)
        }

        navBarActions.setNavbarSettingsForPage({
            title,
            showBack: true,
            isPreview: inPreviewMode, //TODO: Decouple preview mode from the color of the safe area container
            backgroundColor: inPreviewMode ? theme.$testRed : theme.$zooniverseTeal,
            centerType: 'title',
        }, PageKeys.ProjectList)

        this.props.projectActions
            .fetchProjectsForCategory(selectedProjectTag, platformLanguage)
            .catch(() => {})
    }

    emptyText() {
        if (this.props.loadError) {
            return 'Unable to load projects. Please go back and try again.'
        }
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

    // FlatList uses spacer cells to keep the final tablet row aligned.
    render() {
        const fillLineWithSpacers = (projects) => {
            while (projects.length % ColumnNumbers !== 0) {
                projects.push({displayType: 'spacer'})
            }
        }

        const tagAsProject = (project) => R.set(R.lensProp('displayType'), 'project', project)
        const {inPreviewMode, swipeEnabledProjects, nonSwipeEnabledProjects } = this.props
        let projects = []
        if (inPreviewMode) {
            projects = [...projects, ...swipeEnabledProjects.map(tagAsProject)]
            fillLineWithSpacers(projects)
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
        const translateProjects = projects.filter(p => !!p?.id).map(p => p.id);
        if (i18next.language !== 'en') {
            loadProjectListTranslations(i18next.language, translateProjects)
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
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ProjectList))
