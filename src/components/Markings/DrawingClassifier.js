import React, {Component} from 'react'
import {Dimensions, Image, Platform} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import {
    TouchableOpacity,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import R from 'ramda'

import ClassificationPanel from '../classifier/ClassificationPanel'
import DrawingClassifierSubject from './DrawingClassifierSubject'
import Question from '../classifier/Question'
import Tutorial from '../classifier/Tutorial'
import * as imageActions from '../../actions/images'
import * as classifierActions from '../../actions/classifier'
import * as drawingActions from '../../actions/drawing'
import ClassificationContainer from '../classifier/ClassifierContainer'
import NeedHelpButton from '../classifier/NeedHelpButton'
import OverlaySpinner from '../OverlaySpinner'
import DrawingModal from './DrawableSubject'
import ShapeInstructionsView from './components/ShapeInstructionsView';
import DrawingHeader from './components/DrawingHeader'

import ClassifierHeader from '../../navigation/ClassifierHeader'
import ButtonLarge from '../classifier/ButtonLarge'
import FieldGuideBtn from '../classifier/FieldGuideBtn'
import DrawingModeButton from './DrawingModeButton'
import ToolNameDrawCount from './ToolNameDrawCount'
import { getCurrentProjectLanguage, getPreferredLanguageFromProject, loadProjectTranslations } from '../../i18n'
import { withTranslation } from 'react-i18next'
import TranslationsLoadingIndicator from '../common/TranslationsLoadingIndicator'

const mapStateToProps = (state, ownProps) => {
    const subjectDimensions = state.classifier.subject ? state.classifier.subjectDimensions[state.classifier.subject.id] : null

    return {
        isSuccess: state.classifier.isSuccess,
        isFailure: state.classifier.isFailure,
        isFetching: state.classifier.isFetching,
        guide: state.classifier.guide[ownProps.route.params.workflow.id] || {},
        tutorial: state.classifier.tutorial[ownProps.route.params.workflow.id] || {},
        needsTutorial: state.classifier.needsTutorial[ownProps.route.params.workflow.id] || false,
        subject: state.classifier.subject,
        shapes: state.drawing.shapesInProgress,
        workflowOutOfSubjects: state.classifier.workflowOutOfSubjects,
        numberOfShapesDrawn: R.keys(state.drawing.shapesInProgress).length,
        subjectDimensions: subjectDimensions ? subjectDimensions : {naturalHeight: 1, naturalWidth: 1},
        canUndo: state.drawing.actions.length > 0,
    }
}

const mapDispatchToProps = (dispatch) => ({
    imageActions: bindActionCreators(imageActions, dispatch),
    classifierActions: bindActionCreators(classifierActions, dispatch),
    drawingActions: bindActionCreators(drawingActions, dispatch)
})

class DrawingClassifier extends Component {

    constructor(props) {
        super(props)

        const isPortrait = () => {
            const dim = Dimensions.get('screen');
            return dim.height >= dim.width;
        };
        Dimensions.addEventListener('change', () => {
            this.setState({
                orientation: isPortrait() ? 'portrait' : 'landscape'
            });
        });


        this.state = {
            orientation: isPortrait() ? 'portrait' : 'landscape',
            imageIsLoaded: false,
            localImagePath: '',
            isQuestionVisible: !props.needsTutorial,
            isModalVisible: false,
            subjectDimensions: {
                clientHeight: 1,
                clientWidth: 1
            },
            modalHasBeenClosedOnce: false,
            showBlurView: true,
            translationsLoading: false,
        }

        this.finishTutorial = this.finishTutorial.bind(this)
        this.setQuestionVisibility = this.setQuestionVisibility.bind(this)
        this.onImageLayout = this.onImageLayout.bind(this)
        this.submitClassification = this.submitClassification.bind(this)
        this.loadedTranslationsRef = React.createRef();
    }

    // Update the loadProjectTranslations method
    async loadTranslations(language, project, workflow, guide, tutorial) {
        try {

            this.setState({
                translationsLoading: true,
            })

            await loadProjectTranslations(
                language, 
                project, 
                workflow, 
                guide, 
                tutorial
            );

        } catch (error) {
            console.warn('Error loading project translations:', error);
        } finally {
            this.setState({
                translationsLoading: false,
            })
        }
    }

    componentDidMount() {
        const {inPreviewMode, classifierActions} = this.props
        classifierActions.setClassifierTestMode(inPreviewMode)
    }

    submitClassification() {
        this.props.classifierActions.submitDrawingClassification(
            this.props.shapes,
            this.props.route.params.workflow,
            this.props.subject,
            this.state.subjectDimensions
        )
        this.setState({
            modalHasBeenClosedOnce: false,
            imageIsLoaded: false
        })
    }

    componentDidUpdate(prevProps) {
        const {subject} = this.props
        if (prevProps.subject !== subject && subject) {
            this.props.imageActions.loadImageToCache(subject.displays[0].src).then(localImagePath => {
                if (Platform.OS === 'android') {
                    // This isn't using the cache because Image.getSize can't fetch from a local
                    // path on Android. We tried EVERYTHING.
                    Image.getSize(subject.displays[0].src, (width, height) => {
                        this.props.classifierActions.setSubjectSizeInWorkflow(subject.id, {width, height})
                    })
                } else {    //this is the appropriate behavior. It's just broken on Android right now.
                    Image.getSize(localImagePath, (width, height) => {
                        this.props.classifierActions.setSubjectSizeInWorkflow(subject.id, {width, height})
                    })
                }

                this.setState({
                    imageIsLoaded: true,
                    localImagePath
                })
            })
        }

        const { project, workflow } = this.props.route.params;
        const guide = this.props.guide;
        const tutorial = this.props.tutorial;
        const languages = project?.available_languages ?? [];
        
        if (project?.id && workflow?.id && guide?.id && tutorial?.id && !this.loadedTranslationsRef.current) {
            this.loadedTranslationsRef.current = true;
            const defaultLanguage = getPreferredLanguageFromProject(languages);
            this.loadTranslations(defaultLanguage, project, workflow, guide, tutorial)
        }
    }

    setQuestionVisibility(isVisible) {
        this.setState({isQuestionVisible: isVisible})
    }

    finishTutorial() {
        if (this.props.needsTutorial) {
            this.props.classifierActions.setTutorialCompleted(this.props.route.params.workflow.id, this.props.route.params.project.id)
        } else {
            this.setQuestionVisibility(true)
        }
    }

    onImageLayout({clientHeight, clientWidth}) {
        this.setState({
            subjectDimensions: {
                clientHeight,
                clientWidth
            }
        })
    }

    render() {
        if (this.props.isFetching || !this.props.isSuccess) {
            return <OverlaySpinner overrideVisibility={this.props.isFetching}/>
        }

        // We validate that tools has at least one element earlier
        const tool = this.props.route.params.tools[0]
        const warnForRequirements = this.state.modalHasBeenClosedOnce && R.keys(this.props.shapes).length < tool.min

        const tutorial =
            <Tutorial
                projectName={this.props.route.params.project.display_name}
                inMuseumMode={this.props.route.params.project.in_museum_mode}
                isInitialTutorial={this.props.needsTutorial}
                tutorial={this.props.tutorial}
                finishTutorial={() => this.finishTutorial()}
            />

        const classification =
            <View
                style={styles.classificationContainer}>
                <DrawingHeader
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                    horizontal={false}
                    question={
                        <View style={styles.questionContainer}>
                            <Question
                                question={this.props.t('workflow.tasks.T0.instruction', this.props.route.params.instructions, {ns: 'project', lng: getCurrentProjectLanguage()})}
                                inMuseumMode={this.props.route.params.project.in_museum_mode}
                            />
                        </View>
                    }
                    instructions={
                        <ShapeInstructionsView
                            {...tool}
                            numberDrawn={this.props.numberOfShapesDrawn}
                            warnForRequirements={warnForRequirements}
                            inMuseumMode={this.props.route.params.project.in_museum_mode}
                        />
                    }
                />
                <TouchableOpacity
                    onPress={() => this.setState({ isModalVisible: true })}
                    style={styles.subjectDisplayContainer}
                >
                    <DrawingClassifierSubject
                        showHelpButton={false}
                        onHelpButtonPressed={() => this.classificationContainer.displayHelpModal()}
                        showDrawingButtons={false}
                        inMuseumMode={this.props.route.params.project.in_museum_mode}
                        onUndoButtonSelected={this.props.drawingActions.undoMostRecentEdit}
                        maxShapesDrawn={this.props.numberOfShapesDrawn >= tool.max}
                        drawingColor={tool.color}
                        imageIsLoaded={this.state.imageIsLoaded}
                        imageSource={this.state.localImagePath}
                        canUndo={this.props.canUndo}
                        onImageLayout={this.onImageLayout}
                        showBlurView={R.isEmpty(this.props.shapes)}
                        alreadySeen={this.props.subject.already_seen}
                        subjectDimensions={this.props.subjectDimensions}
                        displayToNativeRatio={this.props.subjectDimensions.naturalWidth / this.state.subjectDimensions.clientWidth}
                    />
                </TouchableOpacity>
                <View style={styles.toolNameDrawCountContainer}>
                    <ToolNameDrawCount label={tool.label} number={this.props.numberOfShapesDrawn} />
                </View>
                <View style={styles.drawingModeContainer}>
                    <DrawingModeButton onPress={() => this.setState({isModalVisible: true})}/>
                </View>
                <View style={styles.buttonContainer}>
                    <ButtonLarge
                        disabled={R.keys(this.props.shapes).length < tool.min || !this.state.imageIsLoaded}
                        text={this.props.t('Mobile.classifier.submit', 'Submit')}
                        onPress={this.submitClassification}
                    />
                </View>
                {this.props.help && !R.isEmpty(this.props.help) &&
                    <View style={styles.needHelpContainer}>
                        <NeedHelpButton
                            onPress={() => this.classificationContainer.displayHelpModal()}
                            inMuseumMode={this.props.route.params.project.in_museum_mode}
                        />
                    </View>
                }
                {this.props.guide.href && (
                    <View style={styles.fieldGuideBtnContainer}>
                        <FieldGuideBtn
                        onPress={() => this.classificationContainer.displayFieldGuide()}
                        />
                    </View>
                )}
            </View>


        const {isQuestionVisible, orientation} = this.state

        const classificationPanel = <ClassificationPanel
            containerStyle={[styles.classificationPanel]}
            isFetching={this.props.isFetching}
            hasTutorial={!R.isEmpty(this.props.tutorial)}
            isQuestionVisible={isQuestionVisible}
            setQuestionVisibility={this.setQuestionVisibility}
            inMuseumMode={this.props.route.params.project.in_museum_mode}
        >
            {isQuestionVisible ? classification : tutorial}
        </ClassificationPanel>;



        const classificationView =
            <View style={styles.classificationView}>
                {classificationPanel}
            </View>

        return (
            <View style={[styles.container]}>
                <ClassifierHeader project={this.props.route?.params?.project} />
                {this.state.translationsLoading && (
                    <TranslationsLoadingIndicator />
                )}
                <ClassificationContainer
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                    project={this.props.route.params.project}
                    inBetaMode={this.props.inBetaMode}
                    help={this.props.help}
                    ref={(ref => this.classificationContainer = ref)}
                    guide={this.props.guide}
                >
                    {this.props.needsTutorial ? tutorial : classificationView}
                </ClassificationContainer>
                <DrawingModal
                    tool={tool}
                    visible={this.state.isModalVisible}
                    inMuseumMode={this.props.route.params.project.in_museum_mode}
                    imageSource={this.state.localImagePath}
                    onClose={() => this.setState({isModalVisible: false, modalHasBeenClosedOnce: true})}
                    warnForRequirements={this.state.modalHasBeenClosedOnce}
                />
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    buttonContainer: {
        marginHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    classificationContainer: {
        flex: 1,
        backgroundColor: '#EBEBEB',
    },
    classificationPanel: {
        flex: 1,
        overflow: 'visible',
    },
    classificationView: {
        flex: 1,
    },
    container: {
        flex: 1,
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    subjectContainer: {
        width: '100%',
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
    },
    submitButton: {
        height: 45,
        marginVertical: 20,
    },
    wideSubmit: {
        width: '70%'
    },
    separator: {
        marginTop: 20
    },
    fieldGuideContainer: {},
    fieldGuideButton: {
        height: 45
    },
    needHelpContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    questionContainer: {
        backgroundColor: '#EBEBEB',
        paddingVertical: 16
    },
    wideFieldGuide: {
        width: '50%'
    },
    subjectDisplayContainer: {
        flex: 1,
        margin: 10,
    },
    sideBySide: {
        marginTop: 15,
        marginHorizontal: 20,
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
    },
    stacked: {
        marginHorizontal: 25,
        marginTop: 20,
        flexDirection: 'column',
        justifyContent: 'space-around',
    },
    fieldGuideBtnContainer: {
        alignItems: 'center',
    },
    toolNameDrawCountContainer: {
        height: 60
    },
    drawingModeContainer: {
        marginBottom: 32,
        marginHorizontal: 16,
        marginTop: 8,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

DrawingClassifier.propTypes = {
    workflowOutOfSubjects: PropTypes.bool,
    subject: PropTypes.object,
    shapes: PropTypes.object,
    isSuccess: PropTypes.bool,
    isFailure: PropTypes.bool,
    isFetching: PropTypes.bool,
    guide: PropTypes.shape({
        href: PropTypes.string,
    }),
    tutorial: PropTypes.shape({}),
    needsTutorial: PropTypes.bool,
    usableSubjects: PropTypes.array,
    imageActions: PropTypes.any,
    classifierActions: PropTypes.shape({
        submitDrawingClassification: PropTypes.func,
        setClassifierTestMode: PropTypes.func,
        setTutorialCompleted: PropTypes.func,
        setSubjectSizeInWorkflow: PropTypes.func,
        addSubjectsForWorklow: PropTypes.func
    }),
    help: PropTypes.string,
    tools: PropTypes.arrayOf(
        PropTypes.shape({
            max: PropTypes.string,
            min: PropTypes.string,
            type: PropTypes.string,
            color: PropTypes.string,
            label: PropTypes.string,
            details: PropTypes.array,
        })
    ),
    instructions: PropTypes.string,
    project: PropTypes.shape({
        display_name: PropTypes.string,
        in_museum_mode: PropTypes.bool,
        id: PropTypes.string
    }),
    workflow: PropTypes.shape({
        id: PropTypes.string
    }),
    inBetaMode: PropTypes.bool,
    inPreviewMode: PropTypes.bool,
    numberOfShapesDrawn: PropTypes.number,
    subjectDimensions: PropTypes.shape({
        naturalHeight: PropTypes.number,
        naturalWidth: PropTypes.number
    }),
    canUndo: PropTypes.bool,
    drawingActions: PropTypes.shape({
        undoMostRecentEdit: PropTypes.func
    })
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(DrawingClassifier))
