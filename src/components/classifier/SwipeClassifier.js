import React from 'react'
import {
  Dimensions,
  View
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ClassificationPanel from './ClassificationPanel'
import Question from './Question'
import Separator from '../common/Separator'
import Tutorial from './Tutorial'
import SwipeTabs from './SwipeTabs'
import NeedHelpButton from './NeedHelpButton'
import OverlaySpinner from '../OverlaySpinner'
import NavBar from '../NavBar'
import FullScreenImage from '../FullScreenImage'
import UnlinkedTask from './UnlinkedTask'
import Swiper from 'react-native-deck-swiper'
import R from 'ramda'
import * as classifierActions from '../../actions/classifier'
import * as navBarActions from '../../actions/navBar'
import SwipeCard from './SwipeCard'
import { getTaskFromWorkflow, getAnswersFromWorkflow } from '../../utils/workflow-utils'
import { markdownContainsImage } from '../../utils/markdownUtils'
import Theme from '../../theme'
import ClassifierContainer from './ClassifierContainer'

const subjectClassifierPadding = {
  height: 380,
  width: 80
}

export const subjectDisplayHeight = Dimensions.get('window').height - subjectClassifierPadding.height
export const subjectDisplayWidth = Dimensions.get('window').width - subjectClassifierPadding.width

const mapStateToProps = (state, ownProps) => {
  return {
    task: getTaskFromWorkflow(ownProps.workflow),
    answers: R.reverse(getAnswersFromWorkflow(ownProps.workflow)),
    isSuccess: state.classifier.isSuccess,
    isFailure: state.classifier.isFailure,
    isFetching: state.classifier.isFetching,
    annotations: state.classifier.annotations[ownProps.workflow.id] || {},
    guide: state.classifier.guide[ownProps.workflow.id] || {},
    tutorial: state.classifier.tutorial[ownProps.workflow.id] || {},
    needsTutorial: state.classifier.needsTutorial[ownProps.workflow.id] || false,
    subjectDisplayWidth: state.main.device.subjectDisplayWidth,
    subjectDisplayHeight: state.main.device.subjectDisplayHeight,
    subjectLists: state.classifier.subjectLists[ownProps.workflow.id] || [],
    subjectsSeenThisSession: state.classifier.seenThisSession[ownProps.workflow.id] || []
 }
}

const mapDispatchToProps = (dispatch) => ({
  classifierActions: bindActionCreators(classifierActions, dispatch),
  navBarActions: bindActionCreators(navBarActions, dispatch)
})

const PAGE_KEY = 'SwipeClassifier';
export class SwipeClassifier extends React.Component {
  constructor(props) {
    super(props)
    this.setQuestionVisibility = this.setQuestionVisibility.bind(this)
    this.state = {
      isQuestionVisible: true,
      showFullSize: false,
      isModalVisible: false,
      swiperIndex: 0,
      fullScreenImageSource: '',
      fullScreenQuestion: '',
      hasImageInQuestion: markdownContainsImage(this.props.task.question),
      panX: null,
    }
    
    this.onAnswered = this.onAnswered.bind(this)
    this.onSwiped = this.onSwiped.bind(this)
    this.onTapCard = this.onTapCard.bind(this)
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

  onAnswered = (answer, subject) => {
    const { id, first_task } = this.props.workflow
    this.props.classifierActions.addAnnotationToTask(id, first_task, answer, false)
    this.props.classifierActions.saveClassification(this.props.workflow, subject)
  }

  onSwiped = (subjectIndex) => {
    this.setState({ swiperIndex: this.state.swiperIndex + 1 })
    if (subjectIndex > this.props.subjectLists.length - 8) {
      this.props.classifierActions.addSubjectsForWorklow(this.props.workflow.id)
    }
  }

  onTapCard = (subject) => {
    this.setState({
      showFullSize: true,
      fullScreenImageSource: subject.display.src
    })
  }

  renderCard = (subject) => {
      const seenThisSession = R.indexOf(subject.id, this.props.subjectsSeenThisSession) >= 0
      const shouldAnimateOverlay = this.props.subjectLists[this.state.swiperIndex].id === subject.id

      return this.state.panX ? (
          <SwipeCard 
            subject={subject}
            seenThisSession={seenThisSession}
            panX={this.state.panX}
            shouldAnimateOverlay={shouldAnimateOverlay}
            answers={this.props.answers}
            onPress={this.onTapCard}
          />
      ) : <View />
  }

  onUnlinkedTaskAnswered = (task, value) => {
    const taskAnnotations = this.props.annotations[task] || []
    const { id } = this.props.workflow
    if (R.contains(value, taskAnnotations)) {
      this.props.classifierActions.removeAnnotationFromTask(id, task, value)
    } else {
      this.props.classifierActions.addAnnotationToTask(id, task, value, true)
    }
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

  static renderNavigationBar() {
    return <NavBar pageKey={PAGE_KEY} showBack={true} />;
  }

  render() {
    if (this.props.isFetching || !this.props.isSuccess) {
      return <OverlaySpinner overrideVisibility={this.props.isFetching} />
    }

    const tutorial =
      <Tutorial
        projectName={this.props.project.display_name}
        isInitialTutorial={this.props.needsTutorial}
        tutorial={this.props.tutorial}
        finishTutorial={() => this.finishTutorial()}
      />

    const classification =
      <View>
        <Question
          question={this.props.task.question}
          workflowID={this.props.workflow.id}
          onHeightCalculated={this.questionHeightReceived}
          onPressImage={(src, question) => {
            this.setState({ 
              showFullSize: true,
              fullScreenImageSource: src,
              fullScreenQuestion: question
            })}
          }
        />
        {
          this.state.hasImageInQuestion ? 
            <Separator style={styles.questionSeparator} />
          :
            null
        }
        <View style={{ height: subjectDisplayHeight + 300, width: Dimensions.get('window').width}}>
          <Swiper
            ref={swiper => this.swiper = swiper}
            cardHorizontalMargin={15}
            keyExtractor={cardData => cardData.id}
            cards={this.props.subjectLists}
            renderCard={this.renderCard}
            cardVerticalMargin={15}
            marginTop={15}
            backgroundColor="transparent"
            onSwiped={this.onSwiped}
            onSwipedRight={(cardIndex) => this.onAnswered(0, this.props.subjectLists[cardIndex])}
            onSwipedLeft={(cardIndex) => this.onAnswered(1, this.props.subjectLists[cardIndex])}
            cardIndex={this.state.swiperIndex}
            disableTopSwipe
            disableBottomSwipe
            outputRotationRange={['-30deg', '0deg', '30deg']}
            nextCardYOffset={-15}
            panXListener={(panX) => this.setState({ panX }) }
            swipeAnimationDuration={500}
          />
        </View>
      </View>

    const unlinkedTask = this.props.task.unlinkedTask ?
      <View style={styles.unlinkedTaskContainer}>
        <UnlinkedTask
          unlinkedTaskKey={ this.props.task.unlinkedTask }
          unlinkedTask={ this.props.workflow.tasks[this.props.task.unlinkedTask] }
          annotation={ this.props.annotations[this.props.task.unlinkedTask] }
          onAnswered={ this.onUnlinkedTaskAnswered }
        />
      </View>
      : null

    const swipeTabs =
      <SwipeTabs
        guide={this.props.guide}
        onLeftButtonPressed={ () => { this.swiper.swipeLeft() } }
        onRightButtonPressed={ () => { this.swiper.swipeRight() }}
        onFieldGuidePressed={ () => this.classifierContainer.displayFieldGuide() }
        answers={this.props.answers}
      />

    const classificationPanel =
      <View style={styles.classificationPanel}>
        <ClassificationPanel
          isFetching={ this.props.isFetching }
          hasTutorial = { !R.isEmpty(this.props.tutorial) }
          isQuestionVisible = {this.state.isQuestionVisible }
          setQuestionVisibility = { this.setQuestionVisibility }
        >
          { this.state.isQuestionVisible ? classification : tutorial }
          { this.state.isQuestionVisible ? unlinkedTask :null }
        </ClassificationPanel>
        { this.state.isQuestionVisible && this.props.task.help ? <NeedHelpButton onPress={() => this.classifierContainer.displayHelpModal()} /> : null }
        { this.state.isQuestionVisible ? swipeTabs : null }
        <FullScreenImage
          source={{uri: this.state.fullScreenImageSource}}
          isVisible={this.state.showFullSize}
          handlePress={() => this.setState({ fullScreenQuestion: '', showFullSize: false })}
          question={this.state.fullScreenQuestion}
        />
      </View>

    return (
      <View style={styles.container}>
        <ClassifierContainer
          inBetaMode={this.props.inBetaMode}
          project={this.props.project}
          help={this.props.task.help}
          guide={this.props.guide}
          ref={ref => this.classifierContainer = ref}
        >
          { this.props.needsTutorial ? tutorial : classificationPanel }
        </ClassifierContainer>
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1
  },
  classificationPanel: { 
    flex: 1,
    overflow: 'visible'
  },
  subjectContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  unlinkedTaskContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
  needHelpText: {
    textAlign: 'center',
    marginTop: 15,
    color: 'rgba(0,93,105,1)'
  },
  separator: {
    paddingTop: 10,
    paddingHorizontal: 15
  }
})

SwipeClassifier.propTypes = {
  inPreviewMode: PropTypes.bool,
  inBetaMode: PropTypes.bool,
  isFetching: PropTypes.bool,
  isSuccess: PropTypes.bool,
  annotations: PropTypes.object,
  workflowID: PropTypes.string,
  display_name: PropTypes.string,
  workflow: PropTypes.shape({
    first_task: PropTypes.string,
    tasks: PropTypes.object,
    configuration: PropTypes.object,
    id: PropTypes.string
  }),
  subject: PropTypes.shape({
    id: PropTypes.string,
    display: PropTypes.shape({
      src: PropTypes.string
    })
  }),
  nextSubject: PropTypes.shape({
    id: PropTypes.string
  }),
  subjectDisplayWidth: PropTypes.number,
  subjectDisplayHeight: PropTypes.number,
  seenThisSession: PropTypes.array,
  project: PropTypes.shape({
    display_name: PropTypes.string,
    id: PropTypes.string
  }),
  tutorial: PropTypes.object,
  needsTutorial: PropTypes.bool,
  guide: PropTypes.object,
  classifierActions: PropTypes.any,
  navBarActions: PropTypes.any,
  subjectLists: PropTypes.array,
  subjectsSeenThisSession: PropTypes.array,
  answers: PropTypes.array,
  task: PropTypes.object
}

export default connect(mapStateToProps, mapDispatchToProps)(SwipeClassifier)
