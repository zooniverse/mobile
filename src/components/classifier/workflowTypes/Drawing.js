/**
 * Workflow-type body for drawing ("drawing") workflows — volunteer marks
 * shapes on the subject image with a drawing tool.
 *
 * Owns: drawing header with tool instructions, subject with drawing
 * overlay, tool/shape count, drawing mode button (opens modal), submit
 * button, and the drawing modal itself.
 *
 * Submission uses the legacy `submitDrawingClassification` action, matching
 * the legacy `DrawingClassifier`.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, Image, Platform, TouchableOpacity, View, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import R from 'ramda'

import { useTranslation } from 'react-i18next'

import DrawingSubjectViewer from '../../Markings/DrawingSubjectViewer'
import DrawingModalSheet from '../../Markings/DrawingModalSheet'
import ShapeInstructionsView from '../../Markings/components/ShapeInstructionsView'
import DrawingHeader from '../../Markings/components/DrawingHeader'
import DrawingModeButton from '../../Markings/DrawingModeButton'
import ToolNameDrawCount from '../../Markings/ToolNameDrawCount'
import ButtonLarge from '../ButtonLarge'
import TaskQuestion from '../TaskQuestion'

import * as imageActions from '../../../actions/images'
import * as classifierActions from '../../../actions/classifier'
import * as drawingActions from '../../../actions/drawing'
import { submitDrawing } from '../../../actions/drawingClassification'

const isPortrait = () => {
  const dim = Dimensions.get('screen')
  return dim.height >= dim.width
}

const Drawing = ({ subject, task, taskKey, project, workflow, onAdvance, onExpandMedia }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const shapes = useSelector((state) => state.drawing.shapesInProgress)
  const committedShapes = useSelector((state) => state.drawing.shapes)
  const canUndo = useSelector((state) => state.drawing.actions.length > 0)
  const shouldConfirmOnClose =
    !R.isEmpty(committedShapes) || !R.isEmpty(shapes)
  // Legacy read `state.classifier.subject.id`, but our new flow doesn't
  // populate that slot (we get the subject from `useSubjectQueue`). Key
  // the dimensions lookup on the subject prop so the displayed→native
  // ratio is computed against the real natural image size rather than
  // the {1,1} fallback.
  const subjectDimensions =
    useSelector((state) =>
      subject?.id ? state.classifier.subjectDimensions?.[subject.id] : null
    ) || { naturalHeight: 1, naturalWidth: 1 }
  const isPreviewMode = useSelector((state) => state.classifier.isPreviewMode)
  const sessionId = useSelector((state) => state?.main?.session?.id)
  const viewport = useSelector((state) => ({
    width: state?.app?.device?.width,
    height: state?.app?.device?.height,
  }))

  const numberOfShapesDrawn = R.keys(shapes).length
  const subjectStartTimeRef = useRef(new Date().toISOString())

  // Refresh the start-time stamp whenever we're looking at a new subject.
  useEffect(() => {
    if (!subject?.id) return
    subjectStartTimeRef.current = new Date().toISOString()
  }, [subject?.id])

  const [orientation, setOrientation] = useState(isPortrait() ? 'portrait' : 'landscape')
  const [imageIsLoaded, setImageIsLoaded] = useState(false)
  const [localImagePath, setLocalImagePath] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalHasBeenClosedOnce, setModalHasBeenClosedOnce] = useState(false)
  const [clientDimensions, setClientDimensions] = useState({ clientHeight: 1, clientWidth: 1 })
  const prevSubjectIdRef = useRef(null)

  // Legacy parses tools/instructions from `parseDrawingTask(workflow)`, which
  // our simplified navigator no longer provides. Read them off the current
  // task directly.
  const tools = task?.tools || []
  const tool = tools[0]
  const instructions = task?.instruction

  // Track orientation changes.
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', () => {
      setOrientation(isPortrait() ? 'portrait' : 'landscape')
    })
    return () => {
      sub?.remove?.()
    }
  }, [])

  // Legacy behavior: flag preview mode on mount.
  useEffect(() => {
    dispatch(classifierActions.setClassifierTestMode(isPreviewMode))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load image to cache + capture natural dimensions whenever the subject
  // changes. Mirrors legacy DrawingClassifier.componentDidUpdate.
  useEffect(() => {
    if (!subject) return
    if (prevSubjectIdRef.current === subject.id) return
    prevSubjectIdRef.current = subject.id
    setImageIsLoaded(false)
    setModalHasBeenClosedOnce(false)
    dispatch(drawingActions.clearShapes())

    dispatch(imageActions.loadImageToCache(subject.displays[0].src)).then(
      (localPath) => {
        const sizeSrc =
          Platform.OS === 'android' ? subject.displays[0].src : localPath
        Image.getSize(sizeSrc, (width, height) => {
          dispatch(
            classifierActions.setSubjectSizeInWorkflow(subject.id, { width, height })
          )
        })
        setImageIsLoaded(true)
        setLocalImagePath(localPath)
      }
    )
  }, [subject, dispatch])

  const onImageLayout = useCallback(({ clientHeight, clientWidth }) => {
    setClientDimensions({ clientHeight, clientWidth })
  }, [])

  // Drawing-action callbacks threaded down to the prop-driven drawing
  // subcomponents (MarkableImage, DrawingToolView, DrawableSubject). These
  // wrap the legacy Redux dispatches so none of the children have to read
  // from or write to the store directly.
  const onShapeAdded = useCallback(
    (shape) => dispatch(drawingActions.addShape(shape)),
    [dispatch]
  )
  const onShapeRemoved = useCallback(
    (index) => dispatch(drawingActions.removeShapeAtIndex(index)),
    [dispatch]
  )
  const onShapeMutated = useCallback(
    (mutation, index) =>
      dispatch(drawingActions.mutateShapeAtIndex(mutation, index)),
    [dispatch]
  )
  const onUndoMostRecentEdit = useCallback(
    () => dispatch(drawingActions.undoMostRecentEdit()),
    [dispatch]
  )
  const onSaveEdits = useCallback(
    () => dispatch(drawingActions.saveEdits()),
    [dispatch]
  )
  const onClearShapes = useCallback(
    () => dispatch(drawingActions.clearShapes()),
    [dispatch]
  )
  const onClearShapesInProgress = useCallback(
    () => dispatch(drawingActions.clearShapesInProgress()),
    [dispatch]
  )

  const handleSubmit = useCallback(() => {
    submitDrawing({
      workflow,
      subject,
      shapes,
      tools,
      startTime: subjectStartTimeRef.current,
      subjectDimensions,
      clientDimensions,
      viewport,
      sessionId,
      isPreviewMode,
    })
    // Clear the shapes so the next subject starts with a fresh canvas.
    // Mirrors what the legacy thunk did internally.
    dispatch(drawingActions.clearShapes())
    setModalHasBeenClosedOnce(false)
    setImageIsLoaded(false)
    onAdvance?.()
  }, [
    dispatch,
    shapes,
    tools,
    workflow,
    subject,
    subjectDimensions,
    clientDimensions,
    viewport,
    sessionId,
    isPreviewMode,
    onAdvance,
  ])

  if (!tool) return null

  const warnForRequirements =
    modalHasBeenClosedOnce && numberOfShapesDrawn < tool.min
  const displayToNativeRatio =
    subjectDimensions.naturalWidth / clientDimensions.clientWidth

  return (
    <>
      <DrawingHeader
        inMuseumMode={project.in_museum_mode}
        horizontal={false}
        question={
          <View style={styles.questionContainer}>
            <TaskQuestion
              task={task}
              taskKey={taskKey}
              inMuseumMode={project.in_museum_mode}
              onPressImage={onExpandMedia}
            />
          </View>
        }
        instructions={
          <ShapeInstructionsView
            {...tool}
            numberDrawn={numberOfShapesDrawn}
            warnForRequirements={warnForRequirements}
            inMuseumMode={project.in_museum_mode}
          />
        }
      />
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={styles.subjectDisplayContainer}
      >
        <DrawingSubjectViewer
          showHelpButton={false}
          onHelpButtonPressed={() => {}}
          showDrawingButtons={false}
          inMuseumMode={project.in_museum_mode}
          onUndoButtonSelected={onUndoMostRecentEdit}
          maxShapesDrawn={numberOfShapesDrawn >= tool.max}
          drawingColor={tool.color}
          imageIsLoaded={imageIsLoaded}
          imageSource={localImagePath}
          canUndo={canUndo}
          onImageLayout={onImageLayout}
          alreadySeen={subject?.already_seen}
          subjectDimensions={subjectDimensions}
          displayToNativeRatio={displayToNativeRatio}
          shapes={shapes}
          onShapeAdded={onShapeAdded}
          onShapeRemoved={onShapeRemoved}
          onShapeMutated={onShapeMutated}
        />
      </TouchableOpacity>
      <View style={styles.toolNameDrawCountContainer}>
        <ToolNameDrawCount label={tool.label} number={numberOfShapesDrawn} />
      </View>
      <View style={styles.drawingModeContainer}>
        <DrawingModeButton onPress={() => setIsModalVisible(true)} />
      </View>
      <View style={styles.buttonContainer}>
        <ButtonLarge
          disabled={numberOfShapesDrawn < tool.min || !imageIsLoaded}
          text={t('Mobile.classifier.submit', 'Submit')}
          onPress={handleSubmit}
        />
      </View>
      <DrawingModalSheet
        tool={tool}
        visible={isModalVisible}
        inMuseumMode={project.in_museum_mode}
        imageSource={localImagePath}
        onClose={() => {
          setIsModalVisible(false)
          setModalHasBeenClosedOnce(true)
        }}
        canUndo={canUndo}
        numberOfShapesDrawn={numberOfShapesDrawn}
        shouldConfirmOnClose={shouldConfirmOnClose}
        subjectDimensions={subjectDimensions}
        shapes={shapes}
        onShapeAdded={onShapeAdded}
        onShapeRemoved={onShapeRemoved}
        onShapeMutated={onShapeMutated}
        onUndoMostRecentEdit={onUndoMostRecentEdit}
        onSaveEdits={onSaveEdits}
        onClearShapes={onClearShapes}
        onClearShapesInProgress={onClearShapesInProgress}
      />
    </>
  )
}

const styles = StyleSheet.create({
  subjectDisplayContainer: {
    flex: 1,
    margin: 10,
  },
  questionContainer: {
    backgroundColor: '#EBEBEB',
    paddingVertical: 16,
  },
  toolNameDrawCountContainer: {
    height: 60,
  },
  drawingModeContainer: {
    marginBottom: 32,
    marginHorizontal: 16,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
})

export default Drawing
