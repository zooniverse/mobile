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
import DeviceInfo from 'react-native-device-info';
import ImageSize from 'react-native-image-size'

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
import {
    GuideButton,
    SubmitButton
} from '../classifier/ClassifierButton'
import Separator from '../common/Separator'
import DrawingModal from './DrawingModal'
import ShapeInstructionsView from './components/ShapeInstructionsView';
import DrawingHeader from './components/DrawingHeader'

import * as colorModes from '../../displayOptions/colorModes'

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
            showBlurView: true
        }

        this.finishTutorial = this.finishTutorial.bind(this)
        this.setQuestionVisibility = this.setQuestionVisibility.bind(this)
        this.onImageLayout = this.onImageLayout.bind(this)
        this.submitClassification = this.submitClassification.bind(this)
    }

    componentDidMount() {
        const {inPreviewMode, classifierActions} = this.props
        classifierActions.setClassifierTestMode(inPreviewMode)
    }

    submitClassification() {
        this.props.classifierActions.submitDrawingClassification(
            this.props.shapes,
            this.props.workflow,
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
                    ImageSize.getSize(localImagePath).then(size => {
                        const width = size.width
                        const height = size.height

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
    }

    setQuestionVisibility(isVisible) {
        this.setState({isQuestionVisible: isVisible})
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
            return <OverlaySpinner overrideVisibility={this.props.isFetching}/>
        }

        // We validate that tools has at least one element earlier
        const tool = this.props.tools[0]
        const warnForRequirements = this.state.modalHasBeenClosedOnce && R.keys(this.props.shapes).length < tool.min

        const tutorial =
            <Tutorial
                projectName={this.props.project.display_name}
                inMuseumMode={this.props.project.in_museum_mode}
                isInitialTutorial={this.props.needsTutorial}
                tutorial={this.props.tutorial}
                finishTutorial={() => this.finishTutorial()}
            />

        const classification =
            <View
                style={[styles.classificationContainer, colorModes.contentBackgroundColorFor(this.props.project.in_museum_mode)]}>
                <DrawingHeader
                    inMuseumMode={this.props.project.in_museum_mode}
                    horizontal={DeviceInfo.isTablet()}
                    question={
                        <Question
                            question={this.props.instructions}
                            inMuseumMode={this.props.project.in_museum_mode}
                        />
                    }
                    instructions={
                        <ShapeInstructionsView
                            {...tool}
                            numberDrawn={this.props.numberOfShapesDrawn}
                            warnForRequirements={warnForRequirements}
                            inMuseumMode={this.props.project.in_museum_mode}
                        />
                    }
                />
                <TouchableOpacity disabled={DeviceInfo.isTablet()} onPress={() => this.setState({isModalVisible: true})}
                                  style={styles.subjectDisplayContainer}>
                    <DrawingClassifierSubject
                        showHelpButton={DeviceInfo.isTablet() && !R.isEmpty(this.props.help)}
                        onHelpButtonPressed={() => this.classificationContainer.displayHelpModal()}
                        showDrawingButtons={DeviceInfo.isTablet()}
                        inMuseumMode={this.props.project.in_museum_mode}
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
                        displayToNativeRatio={this.props.subjectDimensions.naturalWidth / this.state.subjectDimensions.clientWidth}
                    />
                </TouchableOpacity>
            </View>

        const fieldGuideButton =
            <View style={styles.fieldGuideContainer}>
                <GuideButton
                    inMuseumMode={this.props.project.in_museum_mode}
                    onPress={() => this.classificationContainer.displayFieldGuide()}
                    type="guide"
                    text="Field Guide"
                    style={[styles.fieldGuideButton, this.state.orientation === 'portrait' ? [] : styles.wideFieldGuide]}
                />
            </View>

        const submitButton =
            <SubmitButton
                inMuseumMode={this.props.project.in_museum_mode}
                disabled={R.keys(this.props.shapes).length < tool.min || !this.state.imageIsLoaded}
                onPress={this.submitClassification}
                style={[styles.submitButton, this.state.orientation === 'portrait' ? [] : styles.wideSubmit]}
                text="Submit"
            />

        const {isQuestionVisible, orientation} = this.state
        const classificationBottomPadding = isQuestionVisible ? {} : styles.classificationBottomMargin

        const classificationPanel = <ClassificationPanel
            containerStyle={[styles.container]}
            isFetching={this.props.isFetching}
            hasTutorial={!R.isEmpty(this.props.tutorial)}
            isQuestionVisible={isQuestionVisible}
            setQuestionVisibility={this.setQuestionVisibility}
            inMuseumMode={this.props.project.in_museum_mode}
        >
            {isQuestionVisible ? classification : tutorial}
        </ClassificationPanel>;


        const buttonView = <View
            style={[orientation === 'portrait' ? styles.stacked : styles.sideBySide]}>
            {this.props.guide.href && fieldGuideButton}
            {submitButton}
        </View>


        const needHelpButton =
            <NeedHelpButton
                onPress={() => this.classificationContainer.displayHelpModal()}
                inMuseumMode={this.props.project.in_museum_mode}
            />;

        const classificationView =
            <View style={[styles.container, classificationBottomPadding]}>
                {classificationPanel}
                {isQuestionVisible && !R.isEmpty(this.props.help) && !DeviceInfo.isTablet() && needHelpButton}
                {isQuestionVisible && buttonView}
                <Separator style={styles.separator}/>
            </View>

        return (
            <View style={[styles.container, colorModes.framingBackgroundColorFor(this.props.project.in_museum_mode)]}>
                <ClassificationContainer
                    inMuseumMode={this.props.project.in_museum_mode}
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
                    inMuseumMode={this.props.project.in_museum_mode}
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
        backgroundColor: 'blue',
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
    wideFieldGuide: {
        width: '50%'
    },
    subjectDisplayContainer: {
        flex: 1,
        margin: 10
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
        justifyContent: 'space-around'
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

export default connect(mapStateToProps, mapDispatchToProps)(DrawingClassifier)