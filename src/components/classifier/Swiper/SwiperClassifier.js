/**
 * Main orchestrator for the Swiper classifier. Coordinates the subject queue,
 * image prefetching, gesture handling, and classification submission.
 *
 * Uses Redux only for shared classifier data (tutorial, field guide, etc.).
 * See refactor.md for history.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useSelector, useDispatch } from 'react-redux';
import R from 'ramda';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import useSubjectQueue from '../../../hooks/useSubjectQueue';
import useImagePrefetch from '../../../hooks/useImagePrefetch';
import useSwiperGesture from '../../../hooks/useSwiperGesture';

import SwiperCard from './SwiperCard';
import SwiperTabs from './SwiperTabs';
import ClassificationPanel from '../ClassificationPanel';
import Question from '../Question';
import Separator from '../../common/Separator';
import Tutorial from '../Tutorial';
import NeedHelpButton from '../NeedHelpButton';
import OverlaySpinner from '../../OverlaySpinner';
import FullScreenMedia from '../../FullScreenMedia';
import UnlinkedTask from '../UnlinkedTask';
import ClassifierContainer from '../ClassifierContainer';
import ClassifierHeader from '../../../navigation/ClassifierHeader';
import FieldGuideBtn from '../FieldGuideBtn';
import FeedbackModal from '../FeedbackModal';
import TranslationsLoadingIndicator from '../../common/TranslationsLoadingIndicator';

import * as classifierActions from '../../../actions/classifier';
import { submitSwiperClassification } from '../../../actions/swiperClassification';
import { getTaskFromWorkflow, getAnswersFromWorkflow } from '../../../utils/workflow-utils';
import { markdownContainsImage } from '../../../utils/markdownUtils';
import { isFeedbackActive, getDataForFeedbackModal } from '../../../utils/feedback';
import { getPreferredLanguageFromProject, loadProjectTranslations } from '../../../i18n';

const SwiperClassifier = ({ route }) => {
  const { workflow, project, inBetaMode } = route.params;

  const dispatch = useDispatch();

  const task = getTaskFromWorkflow(workflow);
  const answers = R.reverse(getAnswersFromWorkflow(workflow));
  const isSuccess = useSelector((state) => state.classifier.isSuccess);
  const isFetching = useSelector((state) => state.classifier.isFetching);
  const guide = useSelector((state) => state.classifier.guide[workflow.id] || {});
  const tutorial = useSelector((state) => state.classifier.tutorial[workflow.id] || {});
  const needsTutorial = useSelector((state) => state.classifier.needsTutorial[workflow.id] || false);
  const inPreviewMode = useSelector((state) => state.classifier.inPreviewMode);
  const annotations = useSelector((state) => state.classifier.annotations[workflow.id] || {});
  const viewport = useSelector((state) => ({
    width: state.app.device.width,
    height: state.app.device.height,
  }));
  const sessionId = useSelector((state) => state.main.session?.id);

  const [isQuestionVisible, setIsQuestionVisible] = useState(true);
  const [showFullSize, setShowFullSize] = useState(false);
  const [fullScreenImageSource, setFullScreenImageSource] = useState('');
  const [fullScreenQuestion, setFullScreenQuestion] = useState('');
  const [feedbackModal, setFeedbackModal] = useState({});
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [cardDimensions, setCardDimensions] = useState({ width: 1, height: 1 });

  const subjectStartTimeRef = useRef(null);
  const loadedTranslationsRef = useRef(false);
  const classifierContainerRef = useRef(null);
  const prevSubjectIdRef = useRef(null);

  const hasImageInQuestion = markdownContainsImage(task.question);
  const hasDimensions = cardDimensions.width > 1 && cardDimensions.height > 1;

  const {
    queue,
    currentIndex,
    currentSubject,
    nextSubject,
    hasSubjects,
    fetchMoreSubjects,
    advanceToNextSubject,
    resetQueue,
  } = useSubjectQueue(workflow.id);

  const { isReady, getDimensions } = useImagePrefetch(queue, currentIndex);

  // Submits classification and advances the queue.
  // IMPORTANT: Must be defined BEFORE handleClassification. Babel transforms
  // const to var, so if this were defined after, handleClassification's dependency
  // array would see doSubmit as undefined and never detect changes.
  const doSubmit = useCallback(
    (answer, subject, startTime, feedbackMeta = null) => {
      submitSwiperClassification({
        workflow,
        subject,
        answer,
        startTime,
        subjectDimensions: getDimensions(subject.id),
        displayDimensions: cardDimensions,
        viewport,
        sessionId,
        feedbackMeta,
        isPreviewMode: inPreviewMode,
      });

      advanceToNextSubject();
      subjectStartTimeRef.current = new Date().toISOString();
    },
    [
      workflow,
      getDimensions,
      cardDimensions,
      viewport,
      sessionId,
      inPreviewMode,
      advanceToNextSubject,
    ]
  );

  // Checks for feedback, then submits and advances.
  const handleClassification = useCallback(
    (answer, subject) => {
      const startTime = subjectStartTimeRef.current;

      const feedbackActive = isFeedbackActive(project, subject, workflow);
      if (feedbackActive) {
        const modalData = getDataForFeedbackModal(subject, workflow, answer);
        if (modalData) {
          const onClose = () => {
            setFeedbackModal({});
            doSubmit(answer, subject, startTime, modalData.feedbackMeta);
          };
          setFeedbackModal({ ...modalData, onClose });
          return;
        }
      }

      doSubmit(answer, subject, startTime);
    },
    [project, workflow, doSubmit]
  );

  // Called when a swipe animation finishes. Maps direction to answer index
  // and kicks off classification. resetCard happens in the useEffect below
  // after the subject changes, so the new subject is in place before the
  // card snaps back to center.
  const onSwipeComplete = useCallback(
    (direction) => {
      if (!currentSubject) return;
      const answer = direction === 'right' ? 0 : 1;
      handleClassification(answer, currentSubject);
    },
    [currentSubject, handleClassification]
  );

  const { translateX, isSwiping, panGesture, triggerSwipe, resetCard } = useSwiperGesture({
    onSwipeComplete,
    enabled: hasSubjects && hasDimensions,
  });

  useEffect(() => {
    dispatch(classifierActions.setClassifierTestMode(inPreviewMode));
  }, []);

  // Fetch subjects once Redux says the classifier data is ready
  useEffect(() => {
    if (isSuccess && !hasSubjects) {
      fetchMoreSubjects();
    }
  }, [isSuccess, hasSubjects, fetchMoreSubjects]);

  useEffect(() => {
    if (currentSubject && !subjectStartTimeRef.current) {
      subjectStartTimeRef.current = new Date().toISOString();
    }
  }, [currentSubject]);

  // After a classification, the subject changes. Reset the card position
  // so it reappears at center with the new subject already rendered.
  useEffect(() => {
    if (currentSubject && prevSubjectIdRef.current !== null &&
        currentSubject.id !== prevSubjectIdRef.current) {
      resetCard();
    }
    if (currentSubject) {
      prevSubjectIdRef.current = currentSubject.id;
    }
  }, [currentSubject, resetCard]);

  useEffect(() => {
    const languages = project?.available_languages ?? [];
    if (project?.id && workflow?.id && guide?.id && tutorial?.id && !loadedTranslationsRef.current) {
      loadedTranslationsRef.current = true;
      const defaultLanguage = getPreferredLanguageFromProject(languages);
      loadTranslations(defaultLanguage, project, workflow, guide, tutorial);
    }
  }, [project, workflow, guide, tutorial]);

  const loadTranslations = async (language, proj, wf, gd, tut) => {
    try {
      setTranslationsLoading(true);
      await loadProjectTranslations(language, proj, wf, gd, tut);
    } catch (error) {
      console.warn('Error loading project translations:', error);
    } finally {
      setTranslationsLoading(false);
    }
  };

  const expandImage = useCallback((imageSource) => {
    setShowFullSize(true);
    setFullScreenImageSource(imageSource);
  }, []);

  const onCardAreaLayout = useCallback(({ nativeEvent }) => {
    const { width, height } = nativeEvent.layout;
    setCardDimensions((prev) => {
      if (width !== prev.width || height !== prev.height) {
        return { width, height };
      }
      return prev;
    });
  }, []);

  const onUnlinkedTaskAnswered = useCallback(
    (taskKey, value) => {
      const taskAnnotations = annotations[taskKey] || [];
      if (R.contains(value, taskAnnotations)) {
        dispatch(classifierActions.removeAnnotationFromTask(workflow.id, taskKey, value));
      } else {
        dispatch(classifierActions.addAnnotationToTask(workflow.id, taskKey, value, true));
      }
    },
    [annotations, workflow.id, dispatch]
  );

  const finishTutorial = useCallback(() => {
    if (needsTutorial) {
      dispatch(classifierActions.setTutorialCompleted(workflow.id, project.id));
    } else {
      setIsQuestionVisible(true);
    }
  }, [needsTutorial, workflow.id, project.id, dispatch]);

  if (isFetching || !isSuccess) {
    return <OverlaySpinner overrideVisibility={isFetching} />;
  }

  const alreadySeen = currentSubject?.already_seen || false;

  const tutorialView = (
    <Tutorial
      projectName={project.display_name}
      inMuseumMode={project.in_museum_mode}
      isInitialTutorial={needsTutorial}
      tutorial={tutorial}
      finishTutorial={finishTutorial}
    />
  );

  const questionView = (
    <View style={styles.questionContainer}>
      <Question
        backupText={task.question}
        isDrawClassifier={false}
        inMuseumMode={project.in_museum_mode}
        workflowID={workflow.id}
        onPressImage={(src, question) => {
          setShowFullSize(true);
          setFullScreenImageSource(src);
          setFullScreenQuestion(question);
        }}
      />
      {hasImageInQuestion ? <Separator style={styles.questionSeparator} /> : null}
    </View>
  );

  // Render both cards as the same component type, keyed by subject ID.
  // When a subject moves from next to current, React preserves the component
  // instance (and its Video/image state) because the key stays the same.
  const cards = [nextSubject, currentSubject].filter(Boolean);

  const cardArea = (
    <View style={styles.swiperWrapper} onLayout={onCardAreaLayout}>
      {hasDimensions && (
        <GestureHandlerRootView style={styles.gestureRoot}>
          {cards.map((subject) => {
            const isCurrent = subject.id === currentSubject?.id;
            return (
              <SwiperCard
                key={subject.id}
                subject={subject}
                isCurrent={isCurrent}
                isImageReady={isReady(subject.id)}
                panGesture={panGesture}
                translateX={translateX}
                isSwiping={isSwiping}
                answers={answers}
                alreadySeen={isCurrent ? alreadySeen : false}
                inMuseumMode={project.in_museum_mode}
                onExpandImage={expandImage}
                containerDimensions={cardDimensions}
              />
            );
          })}
        </GestureHandlerRootView>
      )}
    </View>
  );

  const unlinkedTask = task.unlinkedTask ? (
    <View>
      <UnlinkedTask
        unlinkedTaskKey={task.unlinkedTask}
        unlinkedTask={workflow.tasks[task.unlinkedTask]}
        annotation={annotations[task.unlinkedTask]}
        onAnswered={onUnlinkedTaskAnswered}
      />
    </View>
  ) : null;

  const swiperTabs = (
    <SwiperTabs
      inMuseumMode={project.in_museum_mode}
      guide={guide}
      onLeftButtonPressed={() => triggerSwipe('left')}
      onRightButtonPressed={() => triggerSwipe('right')}
      onFieldGuidePressed={() => classifierContainerRef.current?.displayFieldGuide()}
      answers={answers}
    />
  );

  const classificationPanel = (
    <View style={styles.classificationPanel}>
      <ClassificationPanel
        containerStyle={[styles.classificationContainer]}
        isFetching={isFetching}
        hasTutorial={!R.isEmpty(tutorial)}
        isQuestionVisible={isQuestionVisible}
        setQuestionVisibility={setIsQuestionVisible}
        inMuseumMode={project.in_museum_mode}
      >
        {isQuestionVisible ? (
          <View style={styles.container}>
            {questionView}
            {cardArea}
            {unlinkedTask}
            {isQuestionVisible ? swiperTabs : null}
            {isQuestionVisible && task.help ? (
              <View style={styles.needHelpContainer}>
                <NeedHelpButton
                  onPress={() => classifierContainerRef.current?.displayHelpModal()}
                  inMuseumMode={project.in_museum_mode}
                />
              </View>
            ) : null}
            {guide?.items?.length > 0 && (
              <View style={styles.fieldGuideBtnContainer}>
                <FieldGuideBtn
                  onPress={() => classifierContainerRef.current?.displayFieldGuide()}
                />
              </View>
            )}
          </View>
        ) : (
          tutorialView
        )}
      </ClassificationPanel>

      <FullScreenMedia
        source={{ uri: fullScreenImageSource }}
        isVisible={showFullSize}
        handlePress={() => {
          setFullScreenQuestion('');
          setShowFullSize(false);
        }}
        question={fullScreenQuestion}
      />

      {feedbackModal?.show && (
        <FeedbackModal
          correct={feedbackModal?.correct}
          message={feedbackModal.message}
          onClose={feedbackModal.onClose}
          inMuseumMode={project.in_museum_mode}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ClassifierHeader project={project} />
      {translationsLoading && <TranslationsLoadingIndicator />}
      <ClassifierContainer
        inBetaMode={inBetaMode}
        inMuseumMode={project.in_museum_mode}
        project={project}
        help={task.help}
        guide={guide}
        ref={classifierContainerRef}
      >
        {needsTutorial ? tutorialView : classificationPanel}
      </ClassifierContainer>
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  swiperWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  gestureRoot: {
    flex: 1,
  },
  classificationContainer: {
    flex: 1,
    backgroundColor: '#EBEBEB',
  },
  classificationPanel: {
    flex: 1,
    overflow: 'visible',
  },
  needHelpContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  questionContainer: {
    backgroundColor: '#EBEBEB',
    paddingVertical: 16,
  },
  fieldGuideBtnContainer: {
    alignItems: 'center',
  },
});

export default SwiperClassifier;
