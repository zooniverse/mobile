import React, { Component } from 'react'
import EStyleSheet from 'react-native-extended-stylesheet'
import {
    TouchableOpacity,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import R from 'ramda'
import DeviceInfo from 'react-native-device-info';

import Theme from '../../theme'
import ClassificationPanel from '../classifier/ClassificationPanel'
import DrawingClassifierSubject from './DrawingClassifierSubject'
import Question from '../classifier/Question'
import Tutorial from '../classifier/Tutorial'
import * as imageActions from '../../actions/images'
import * as classifierActions from '../../actions/classifier'
import * as navBarActions from '../../actions/navBar'
import * as drawingActions from '../../actions/drawing'
import ClassificationContainer from '../classifier/ClassifierContainer'
import NeedHelpButton from '../classifier/NeedHelpButton'
import OverlaySpinner from '../OverlaySpinner'
import ClassifierButton from '../classifier/ClassifierButton'
import Separator from '../common/Separator'
import NavBar from '../NavBar'
import DrawingModal from './DrawingModal'
import NativeImage from '../../nativeModules/NativeImage'
import ShapeInstructionsView from './components/ShapeInstructionsView';

const mapStateToProps = (state, ownProps) => {
    const subjectDimensions = state.classifier.subject ? state.classifier.subjectDimensions[state.classifier.subject.id] : null

    return {
        isSuccess: state.classifier.isSuccess,
        isFailure: state.classifier.isFailure,
        isFetching: state.classifier.isFetching,
        guide: state.classifier.guide[ownProps.workflow.id] || {},
        tutorial: state.classifier.tutorial[ownProps.workflow.id] || {},
        needsTutorial: state.classifier.needsTutorial[ownProps.workflow.id] || false,
        subject: state.classifier.subject,
        shapes: DeviceInfo.isTablet() ? state.drawing.shapesInProgress : state.drawing.shapes,
        workflowOutOfSubjects: state.classifier.workflowOutOfSubjects,
        numberOfShapesDrawn: R.keys(state.drawing.shapesInProgress).length,
        subjectDimensions: subjectDimensions ? subjectDimensions : {naturalHeight: 1, naturalWidth: 1},
        canUndo: state.drawing.actions.length > 0,
    }
}

const mapDispatchToProps = (dispatch) => ({
    imageActions: bindActionCreators(imageActions, dispatch),
    classifierActions: bindActionCreators(classifierActions, dispatch),
    navBarActions: bindActionCreators(navBarActions, dispatch),
    drawingActions: bindActionCreators(drawingActions, dispatch)
})

const PAGE_KEY = 'DrawingScreen'

class DrawingClassifier extends Component {

    constructor(props) {
        super(props)

        this.state = {
            imageIsLoaded: false,
            localImagePath: '',
            isQuestionVisible: !props.needsTutorial,
            isModalVisible: false,
            subjectDimensions: {
                clientHeight: 1,
                clientWidth: 1
            },
            modalHasBeenClosedOnce: false,
            showBlurView: true
        }

        this.finishTutorial = this.finishTutorial.bind(this)
        this.setQuestionVisibility = this.setQuestionVisibility.bind(this)
        this.onImageLayout = this.onImageLayout.bind(this)
        this.submitClassification = this.submitClassification.bind(this)
    }

    static renderNavigationBar() {
        return <NavBar pageKey={PAGE_KEY} showBack={true} />;
    }

    componentDidMount() {
        const { display_name, inPreviewMode, navBarActions, classifierActions } = this.props
        navBarActions.setTitleForPage(display_name, PAGE_KEY)
        classifierActions.setClassifierTestMode(inPreviewMode)
        if (inPreviewMode) {
          navBarActions.setNavbarColorForPage(Theme.$testRed, PAGE_KEY)
        } else {
          navBarActions.setNavbarColorForPageToDefault(PAGE_KEY)
        }
    }

    submitClassification() {
        this.props.classifierActions.submitDrawingClassification(this.props.shapes, this.props.workflow, this.props.subject, this.state.subjectDimensions)
        this.setState({
            modalHasBeenClosedOnce: false,
            imageIsLoaded: false
        })
    }

    componentDidUpdate(prevProps) {
        const { subject } = this.props
        if (prevProps.subject !== subject && subject) {
            this.props.imageActions.loadImageToCache(subject.display.src).then(localImagePath => {
                new NativeImage(localImagePath).getImageSize().then(({width, height}) => {
                    this.props.classifierActions.setSubjectSizeInWorkflow(subject.id, {width, height})
                    this.setState({
                        imageIsLoaded: true,
                        localImagePath
                    })
                })
            })
        }
    }

    setQuestionVisibility(isVisible) {
        this.setState({ isQuestionVisible: isVisible })
    }

    finishTutorial() {
        if (this.props.needsTutorial) {
            this.props.classifierActions.setTutorialCompleted(this.props.workflow.id, this.props.project.id)
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
            return <OverlaySpinner overrideVisibility={this.props.isFetching} />
        }

        // We validate that tools has at least one element earlier
        const tool = this.props.tools[0]
        const warnForRequirements = this.state.modalHasBeenClosedOnce && R.keys(this.props.shapes).length < tool.min

        const tutorial =
            <Tutorial
                projectName={this.props.project.display_name}
                isInitialTutorial={this.props.needsTutorial}
                tutorial={this.props.tutorial}
                finishTutorial={() => this.finishTutorial()}
            />

        const classification =
            <View style={styles.classificationContainer}>
                <Question
                    question={this.props.instructions}
                    workflowID={this.props.workflow.id}
                    taskHelp={this.props.help}
                />
                <ShapeInstructionsView
                    { ...tool }
                    numberDrawn={this.props.numberOfShapesDrawn}
                    warnForRequirements={warnForRequirements}
                />
                <TouchableOpacity disabled={DeviceInfo.isTablet()} onPress={() => this.setState({isModalVisible: true})} style={styles.container} >
                    <DrawingClassifierSubject
                        showDrawingButtons={DeviceInfo.isTablet()}
                        onUndoButtonSelected={this.props.drawingActions.undoMostRecentEdit}
                        maxShapesDrawn={this.props.numberOfShapesDrawn >= tool.max}
                        drawingColor={tool.color}
                        imageIsLoaded={this.state.imageIsLoaded}
                        imageSource={this.state.localImagePath}
                        canUndo={this.props.canUndo}
                        onImageLayout={this.onImageLayout}
                        showBlurView={!DeviceInfo.isTablet() && R.isEmpty(this.props.shapes)}
                        alreadySeen={this.props.subject.already_seen}
                        subjectDimensions={this.props.subjectDimensions}
                        displayToNativeRatio={this.props.subjectDimensions.naturalWidth/this.state.subjectDimensions.clientWidth}
                    />
                </TouchableOpacity>
            </View>

        const fieldGuideButton = 
            <View style={styles.fieldGuideContainer}>
                <ClassifierButton
                    onPress={() => this.classificationContainer.displayFieldGuide()}
                    type="guide"
                    text="Field Guide"
                    style={styles.fieldGuideButton}
                />
                <Separator style={styles.separator}/>
            </View>

        const submitButton = 
            <ClassifierButton
                disabled={R.keys(this.props.shapes).length < tool.min}
                onPress={this.submitClassification}
                style={styles.submitButton}
                type="answer"
                text="Submit"
            />

        const { isQuestionVisible } = this.state
        const classificationBottomPadding = isQuestionVisible ? {} : styles.classificationBottomMargin
        const classificationView =
            <View style={[styles.container, classificationBottomPadding]}>
                <ClassificationPanel
                    isFetching={this.props.isFetching}
                    hasTutorial={!R.isEmpty(this.props.tutorial)}
                    isQuestionVisible={isQuestionVisible}
                    setQuestionVisibility={this.setQuestionVisibility}
                >
                    {isQuestionVisible ? classification : tutorial}
                </ClassificationPanel>
                {isQuestionVisible && !R.isEmpty(this.props.help) && <NeedHelpButton onPress={() => this.classificationContainer.displayHelpModal()} /> }
                {isQuestionVisible && !R.empty(this.props.guide) && fieldGuideButton}
                { isQuestionVisible && submitButton }
            </View>


        return (
            <View style={styles.container}>
                <ClassificationContainer
                    project={this.props.project}
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
                    imageSource={this.state.localImagePath}
                    onClose={() => this.setState({isModalVisible: false, modalHasBeenClosedOnce: true})}
                    warnForRequirements={this.state.modalHasBeenClosedOnce}
                />
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    classificationBottomMargin: {
        marginBottom: 25
    },
    classificationContainer: {
        flex: 1
    },
    container: {
        flex: 1,
    },
    subjectContainer: {
        width: '100%',
        backgroundColor: 'blue',
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
    },
    submitButton: {
        marginHorizontal: 25,
        marginVertical: 20
    },
    separator: {
        marginTop: 20
    },
    fieldGuideContainer: {
        marginHorizontal: 25,
    },
    fieldGuideButton: {
        height: 40
    }
})

DrawingClassifier.propTypes = {
    workflowOutOfSubjects: PropTypes.bool,
    subject: PropTypes.object,
    shapes: PropTypes.object,
    isSuccess: PropTypes.bool,
    isFailure: PropTypes.bool,
    isFetching: PropTypes.bool,
    guide: PropTypes.shape({}),
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
    display_name: PropTypes.string,
    project: PropTypes.shape({
        display_name: PropTypes.string,
        id: PropTypes.string
    }),
    workflow: PropTypes.shape({
        id: PropTypes.string
    }),
    inBetaMode: PropTypes.bool,
    inPreviewMode: PropTypes.bool,
    navBarActions: PropTypes.shape({
        setTitleForPage: PropTypes.func,
        setNavbarColorForPage: PropTypes.func,
        setNavbarColorForPageToDefault: PropTypes.func
    }),
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

export default connect(mapStateToProps, mapDispatchToProps)(DrawingClassifier)