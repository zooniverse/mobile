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

import Theme from '../../theme'
import ClassificationPanel from '../classifier/ClassificationPanel'
import ImageWithSvgOverlay from './ImageWithSvgOverlay'
import Question from '../classifier/Question'
import Tutorial from '../classifier/Tutorial'
import * as imageActions from '../../actions/images'
import * as classifierActions from '../../actions/classifier'
import ClassificationContainer from '../classifier/ClassifierContainer'
import NeedHelpButton from '../classifier/NeedHelpButton'
import OverlaySpinner from '../OverlaySpinner'
import ClassifierButton from '../classifier/ClassifierButton'
import Separator from '../common/Separator'
import NavBar from '../NavBar'
import * as navBarActions from '../../actions/navBar'
import DrawingModal from './DrawingModal'
import NativeImage from '../../nativeModules/NativeImage'
import ShapeInstructionsView from './components/ShapeInstructionsView';

const mapStateToProps = (state, ownProps) => {
    return {
        isSuccess: state.classifier.isSuccess,
        isFailure: state.classifier.isFailure,
        isFetching: state.classifier.isFetching,
        guide: state.classifier.guide[ownProps.workflow.id] || {},
        tutorial: state.classifier.tutorial[ownProps.workflow.id] || {},
        needsTutorial: state.classifier.needsTutorial[ownProps.workflow.id] || false,
        subject: state.classifier.subject,
        shapes: state.drawing.shapes,
        workflowOutOfSubjects: state.classifier.workflowOutOfSubjects
    }
}

const mapDispatchToProps = (dispatch) => ({
    imageActions: bindActionCreators(imageActions, dispatch),
    classifierActions: bindActionCreators(classifierActions, dispatch),
    navBarActions: bindActionCreators(navBarActions, dispatch)
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
        this.props.classifierActions.submitDrawingClassification(this.props.workflow, this.props.subject, this.state.subjectDimensions)
        this.setState({
            modalHasBeenClosedOnce: false,
        })
    }

    componentDidUpdate(prevProps) {
        const { subject } = this.props
        if (prevProps.subject !== subject && subject) {
            this.props.imageActions.loadImageToCache(subject.display.src).then(localImagePath => {
                new NativeImage(localImagePath).getImageSize().then(({width, height}) => {
                    this.props.classifierActions.setSubjectSizeInWorkflow(subject.id, {width, height})
                })
                this.setState({
                    imageIsLoaded: true,
                    localImagePath
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

        const warnForRequirements = this.state.modalHasBeenClosedOnce && R.keys(this.props.shapes).length < this.props.tools[0].min

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
                    { ...this.props.tools[0] }
                    numberDrawn={this.props.numberOfShapesDrawn}
                    warnForRequirements={warnForRequirements}
                />
                <TouchableOpacity style={styles.container} onPress={() => this.setState({isModalVisible: true})}>
                    <ImageWithSvgOverlay
                        shapes={this.props.shapes}
                        imageIsLoaded={this.state.imageIsLoaded}
                        uri={this.state.localImagePath}
                        onImageLayout={this.onImageLayout}
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
                {isQuestionVisible && this.props.guide && fieldGuideButton}
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
                    // We validate that tools has at least one element earlier
                    tool={this.props.tools[0]}
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
        marginTop: 15
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
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawingClassifier)