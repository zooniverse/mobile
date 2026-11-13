import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Image, Platform, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import * as R from 'ramda'

import { useTranslation } from 'react-i18next'

import DrawingSubjectViewer from '../../Markings/DrawingSubjectViewer'
import ShapeInstructionsView from '../../Markings/components/ShapeInstructionsView'
import DrawingHeader from '../../Markings/components/DrawingHeader'
import ToolNameDrawCount from '../../Markings/ToolNameDrawCount'
import DrawingToolSelector from '../../Markings/DrawingToolSelector'
import ButtonLarge from '../ButtonLarge'
import ChainBackButton from '../ChainBackButton'
import TaskQuestion from '../TaskQuestion'
import FontAwesome from '@react-native-vector-icons/fontawesome/static'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static'
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static'

import * as imageActions from '../../../actions/images'
import * as classifierActions from '../../../actions/classifier'
import * as drawingActions from '../../../actions/drawing'
import { submitDrawing } from '../../../actions/drawingClassification'
import { isMultiTaskWorkflow, getNextTaskKey } from '../../../utils/taskChain'
import { fetchCaesarRectangleShapes } from '../../../utils/drawingCaesar'
import {
  incrementClassificationCount,
  selectActiveAnnotations,
  startChain,
} from '../../../reducers/classifierSlice'

const DrawingToolButton = ({ active = false, disabled = false, children, onPress, label }) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ selected: active, disabled }}
    disabled={disabled}
    onPress={onPress}
    style={[
      styles.floatingToolButton,
      active && styles.floatingToolButtonActive,
      disabled && styles.floatingToolButtonDisabled,
    ]}
  >
    {children}
  </TouchableOpacity>
)

const EMPTY_TOOLS = []
const DEFAULT_DIMENSIONS = { naturalHeight: 1, naturalWidth: 1 }

const Drawing = ({ subject, task, taskKey, project, workflow, onAdvance, onExpandMedia }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const shapes = useSelector((state) => state.drawing.shapesInProgress)
  const canUndo = useSelector((state) => state.drawing.actions.length > 0)
  const canRedo = useSelector((state) => state.drawing.undoneActions.length > 0)
  // Legacy read `state.classifier.subject.id`, but our new flow doesn't
  // populate that slot (we get the subject from `useSubjectQueue`). Key
  // the dimensions lookup on the subject prop so the displayed→native
  // ratio is computed against the real natural image size rather than
  // the {1,1} fallback.
  const subjectDimensions =
    useSelector((state) =>
      subject?.id ? state.classifier.subjectDimensions?.[subject.id] : null
    ) || DEFAULT_DIMENSIONS
  const isPreviewMode = useSelector((state) => state.classifier.isPreviewMode)
  const isGuestUser = useSelector((state) => state?.user?.isGuestUser)
  const sessionId = useSelector((state) => state?.main?.session?.id)
  const viewport = useSelector((state) => ({
    width: state?.app?.device?.width,
    height: state?.app?.device?.height,
  }))
  // Drawing is restricted to terminal position in a chain (Phase 2 risk
  // call-out: avoids per-task shape-storage refactor). When reached, prior
  // tasks' annotations are passed through to the submission helper.
  const priorAnnotations = useSelector(selectActiveAnnotations)

  const numberOfShapesDrawn = R.keys(shapes).length
  const subjectStartTimeRef = useRef(new Date().toISOString())

  // Refresh the start-time stamp whenever we're looking at a new subject.
  useEffect(() => {
    if (!subject?.id) return
    subjectStartTimeRef.current = new Date().toISOString()
  }, [subject?.id])

  const [imageIsLoaded, setImageIsLoaded] = useState(false)
  const [localImagePath, setLocalImagePath] = useState('')
  const [drawingMode, setDrawingMode] = useState('move')
  const [compactZoomScale, setCompactZoomScale] = useState(1)
  const [compactPanAvailability, setCompactPanAvailability] = useState({
    down: false,
    left: false,
    maxPanX: 0,
    maxPanY: 0,
    right: false,
    up: false,
    viewportHeight: 1,
    viewportWidth: 1,
    x: 0,
    y: 0,
  })
  const [panAffordancesVisible, setPanAffordancesVisible] = useState(false)
  const [clientDimensions, setClientDimensions] = useState({ clientHeight: 1, clientWidth: 1 })
  const panAffordanceTimeoutRef = useRef(null)

  // Legacy parses tools/instructions from `parseDrawingTask(workflow)`, which
  // our simplified navigator no longer provides. Read them off the current
  // task directly.
  const tools = task?.tools || EMPTY_TOOLS
  const canSelectTool = tools.length > 1 && tools.every(item => item.type === 'rectangle')
  const [selectedToolIndex, setSelectedToolIndex] = useState(0)
  const activeToolIndex = canSelectTool ? selectedToolIndex : 0
  const tool = tools[activeToolIndex] || tools[0]
  const toolCounts = tools.map((_item, index) =>
    Object.values(shapes).filter(shape => (shape.toolIndex ?? 0) === index).length)
  const activeToolCount = canSelectTool ? toolCounts[activeToolIndex] : numberOfShapesDrawn
  const requirementsMet = canSelectTool
    ? tools.every((item, index) => toolCounts[index] >= (item.min ?? 0))
    : !(numberOfShapesDrawn < tool?.min)

  useEffect(() => () => {
    if (panAffordanceTimeoutRef.current) {
      clearTimeout(panAffordanceTimeoutRef.current)
    }
  }, [])

  // Legacy behavior: flag preview mode on mount.
  useEffect(() => {
    dispatch(classifierActions.setClassifierTestMode(isPreviewMode))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadKey = `${workflow?.id}:${taskKey}:${subject?.id}`
  const [loadedKey, setLoadedKey] = useState(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const ready = loadedKey === loadKey && imageIsLoaded
  // Keep request inputs current without restarting a request for object-only
  // changes from Redux. A subject/task/workflow change starts a fresh load.
  const loadInputs = useRef(null)
  loadInputs.current = { subject, taskKey, tools, workflow }

  useEffect(() => {
    const inputs = loadInputs.current
    if (!inputs.subject) return
    let cancelled = false
    setLoadedKey(null)
    setLoadFailed(false)
    setImageIsLoaded(false)
    setDrawingMode('move')
    setSelectedToolIndex(0)
    setCompactZoomScale(1)
    setPanAffordancesVisible(false)
    dispatch(drawingActions.clearShapes())

    const load = async () => {
      try {
        const source = inputs.subject.displays[0].src
        const [localPath, initialShapes] = await Promise.all([
          dispatch(imageActions.loadImageToCache(source)),
          fetchCaesarRectangleShapes({ ...inputs, subjectId: inputs.subject.id }),
        ])
        if (cancelled) return
        const sizeSource = Platform.OS === 'android' ? source : localPath
        const dimensions = await new Promise((resolve, reject) => {
          Image.getSize(sizeSource, (width, height) => resolve({ width, height }), reject)
        })
        if (cancelled) return
        dispatch(classifierActions.setSubjectSizeInWorkflow(inputs.subject.id, dimensions))
        if (initialShapes) dispatch(drawingActions.initializeShapes(initialShapes))
        setLocalImagePath(localPath)
        setImageIsLoaded(true)
        setLoadedKey(loadKey)
      } catch (error) {
        if (!cancelled) setLoadFailed(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [dispatch, loadKey, loadAttempt])

  const onImageLayout = useCallback(({ clientHeight, clientWidth }) => {
    setClientDimensions({ clientHeight, clientWidth })
  }, [])

  // Drawing-action callbacks threaded down to the prop-driven drawing
  // subcomponents (MarkableImage, DrawingToolView, DrawableSubject). These
  // wrap the legacy Redux dispatches so none of the children have to read
  // from or write to the store directly.
  const onShapeAdded = useCallback(
    (shape) => dispatch(drawingActions.addShape(canSelectTool
      ? { ...shape, toolIndex: activeToolIndex, color: tool.color }
      : shape)),
    [dispatch, canSelectTool, activeToolIndex, tool?.color]
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
  const onRedoMostRecentEdit = useCallback(
    () => dispatch(drawingActions.redoMostRecentEdit()),
    [dispatch]
  )
  const onCompactPanAvailabilityChange = useCallback((availability) => {
    setCompactPanAvailability(availability)
    setPanAffordancesVisible(true)
    if (panAffordanceTimeoutRef.current) {
      clearTimeout(panAffordanceTimeoutRef.current)
    }
    panAffordanceTimeoutRef.current = setTimeout(() => {
      setPanAffordancesVisible(false)
    }, 1200)
  }, [])

  const handleSubmit = useCallback(() => {
    if (!ready) return
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
      taskKey,
      priorAnnotations: priorAnnotations.filter((a) => a?.task !== taskKey),
    })
    // Clear the shapes so the next subject starts with a fresh canvas.
    // Mirrors what the legacy thunk did internally.
    dispatch(drawingActions.clearShapes())
    setImageIsLoaded(false)
    // Reset chain so the next subject begins at first_task. No-op for
    // single-task drawing workflows.
    dispatch(startChain({ taskKey: workflow.first_task }))
    if (!isGuestUser) dispatch(incrementClassificationCount())
    onAdvance?.()
  }, [
    ready,
    dispatch,
    shapes,
    tools,
    workflow,
    subject,
    taskKey,
    subjectDimensions,
    clientDimensions,
    viewport,
    sessionId,
    isPreviewMode,
    priorAnnotations,
    onAdvance,
    isGuestUser,
  ])

  if (!tool) return null

  const inlineCanDraw = ready && drawingMode !== 'move'
  const inlineDrawingMode = drawingMode === 'erase' ? 'erase' : inlineCanDraw ? 'draw' : 'view'

  const renderCompactBelowImageControls = () => {
    if (!ready) return null

    const iconColor = '#FFFFFF'
    const disabledColor = '#8F8F8F'
    return (
      <View style={styles.compactBelowImageControls}>
        <DrawingToolButton
          label={t('Mobile.classifier.drawingTools.undo', 'Undo')}
          disabled={!canUndo}
          onPress={onUndoMostRecentEdit}
        >
          <FontAwesome5
            iconStyle="solid"
            name="undo"
            color={canUndo ? iconColor : disabledColor}
            size={16}
          />
        </DrawingToolButton>
        <DrawingToolButton
          label={t('Mobile.classifier.drawingTools.redo', 'Redo')}
          disabled={!canRedo}
          onPress={onRedoMostRecentEdit}
        >
          <FontAwesome5
            iconStyle="solid"
            name="redo"
            color={canRedo ? iconColor : disabledColor}
            size={16}
          />
        </DrawingToolButton>
        <DrawingToolButton
          label={t('Mobile.classifier.drawingTools.zoomIn', 'Zoom in')}
          onPress={() => setCompactZoomScale(scale => Math.min(4, scale + 0.2))}
        >
          <FontAwesome name="search-plus" color={iconColor} size={18} />
        </DrawingToolButton>
        <DrawingToolButton
          label={t('Mobile.classifier.drawingTools.zoomOut', 'Zoom out')}
          onPress={() => setCompactZoomScale(scale => Math.max(0.8, scale - 0.2))}
        >
          <FontAwesome name="search-minus" color={iconColor} size={18} />
        </DrawingToolButton>
        <DrawingToolButton
          label={t('Mobile.classifier.drawingTools.pan', 'Move image')}
          active={drawingMode === 'move'}
          onPress={() => setDrawingMode('move')}
        >
          <FontAwesome5
            iconStyle="solid"
            name="hand-paper"
            color={iconColor}
            size={16}
          />
        </DrawingToolButton>
        <DrawingToolButton
          label={t('Mobile.classifier.drawingTools.edit', 'Draw or edit boxes')}
          active={drawingMode === 'annotate'}
          onPress={() => setDrawingMode(
            mode => mode === 'annotate' ? 'move' : 'annotate'
          )}
        >
          <MaterialCommunityIcons
            name="vector-rectangle"
            color={iconColor}
            size={21}
          />
        </DrawingToolButton>
        <DrawingToolButton
          label={t('Mobile.classifier.drawingTools.erase', 'Delete boxes')}
          active={drawingMode === 'erase'}
          onPress={() => setDrawingMode(
            mode => mode === 'erase' ? 'move' : 'erase'
          )}
        >
          <FontAwesome name="trash-o" color={iconColor} size={18} />
        </DrawingToolButton>
      </View>
    )
  }

  const renderPanAffordances = () => {
    if (drawingMode !== 'move' || compactZoomScale <= 1) return null

    const {
      maxPanX,
      maxPanY,
      viewportHeight,
      viewportWidth,
      x,
      y,
    } = compactPanAvailability
    if (!panAffordancesVisible) return null

    const showHorizontalScroll = maxPanX > 0
    const showVerticalScroll = maxPanY > 0
    const trackInset = 18
    const verticalTrackHeight = Math.max(1, viewportHeight - (trackInset * 2))
    const horizontalTrackWidth = Math.max(1, viewportWidth - (trackInset * 2))
    const verticalThumbHeight = Math.max(
      28,
      verticalTrackHeight * (viewportHeight / (viewportHeight + (2 * maxPanY)))
    )
    const horizontalThumbWidth = Math.max(
      28,
      horizontalTrackWidth * (viewportWidth / (viewportWidth + (2 * maxPanX)))
    )
    const verticalProgress = maxPanY > 0 ? (maxPanY - y) / (2 * maxPanY) : 0
    const horizontalProgress = maxPanX > 0 ? (maxPanX - x) / (2 * maxPanX) : 0
    const verticalThumbTop = (verticalTrackHeight - verticalThumbHeight) * verticalProgress
    const horizontalThumbLeft = (horizontalTrackWidth - horizontalThumbWidth) * horizontalProgress

    return (
      <>
        {showVerticalScroll && (
          <View pointerEvents="none" style={styles.verticalScrollTrack}>
            <View style={[
              styles.verticalScrollThumb,
              { height: verticalThumbHeight, top: verticalThumbTop },
            ]} />
          </View>
        )}
        {showHorizontalScroll && (
          <View pointerEvents="none" style={styles.horizontalScrollTrack}>
            <View style={[
              styles.horizontalScrollThumb,
              { left: horizontalThumbLeft, width: horizontalThumbWidth },
            ]} />
          </View>
        )}
      </>
    )
  }

  const warnForRequirements =
    ready && activeToolCount < tool.min
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
            numberDrawn={activeToolCount}
            warnForRequirements={warnForRequirements}
            inMuseumMode={project.in_museum_mode}
          />
        }
      />
      <View
        style={styles.subjectDisplayContainer}
      >
        {ready && <DrawingSubjectViewer
          showHelpButton={false}
          onHelpButtonPressed={() => {}}
          inMuseumMode={project.in_museum_mode}
          onUndoButtonSelected={onUndoMostRecentEdit}
          maxShapesDrawn={activeToolCount >= tool.max}
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
          showDrawingButtons={false}
          canDraw={inlineCanDraw}
          drawingMode={inlineDrawingMode}
          handleRadius={10}
          compactMarks={true}
          zoomScale={compactZoomScale}
          canPan={ready && drawingMode === 'move'}
          onPanAvailabilityChange={onCompactPanAvailabilityChange}
          onPanStateChange={setCompactPanAvailability}
        />}
        {renderPanAffordances()}
      </View>
      {!ready && (
        <View style={styles.loadingContainer}>
          {loadFailed ? <>
            <Text>{t('Mobile.classifier.drawingLoadFailed', 'Unable to load the image or drawing data.')}</Text>
            <ButtonLarge text={t('Mobile.classifier.retry', 'Retry')} onPress={() => setLoadAttempt(attempt => attempt + 1)} />
          </> : <ActivityIndicator accessibilityLabel={t('Mobile.classifier.loading', 'Loading')} />}
        </View>
      )}
      {renderCompactBelowImageControls()}
      <View style={styles.toolNameDrawCountContainer}>
        {canSelectTool ? (
          <DrawingToolSelector taskKey={taskKey} tools={tools} counts={toolCounts} selectedIndex={activeToolIndex} onSelect={setSelectedToolIndex} />
        ) : <ToolNameDrawCount taskKey={taskKey} label={tool.label} number={numberOfShapesDrawn} />}
      </View>
      <View style={styles.buttonContainer}>
        <ChainBackButton />
        <ButtonLarge
          disabled={!requirementsMet || !ready}
          text={
            !isMultiTaskWorkflow(workflow)
              ? t('Mobile.classifier.submit', 'Submit')
              : getNextTaskKey(task) !== null
                ? t('Mobile.classifier.next', 'Next')
                : t('Mobile.classifier.done', 'Done')
          }
          onPress={handleSubmit}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  loadingContainer: { padding: 16, alignItems: 'center' },
  subjectDisplayContainer: {
    flex: 1,
    margin: 10,
    overflow: 'hidden',
  },
  questionContainer: {
    backgroundColor: '#EBEBEB',
    paddingVertical: 16,
  },
  toolNameDrawCountContainer: {
    height: 60,
  },
  compactBelowImageControls: {
    alignSelf: 'center',
    backgroundColor: 'rgba(39, 39, 39, 0.92)',
    borderColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 6,
    marginTop: 0,
    padding: 6,
  },
  floatingToolButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    margin: 1,
    width: 34,
  },
  floatingToolButtonActive: {
    backgroundColor: '#007482',
  },
  floatingToolButtonDisabled: {
    opacity: 0.55,
  },
  verticalScrollTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
    borderRadius: 2,
    bottom: 18,
    position: 'absolute',
    right: 10,
    top: 18,
    width: 5,
    zIndex: 8,
  },
  verticalScrollThumb: {
    backgroundColor: 'rgba(39, 39, 39, 0.78)',
    borderColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 3,
    borderWidth: 1,
    position: 'absolute',
    width: 5,
  },
  horizontalScrollTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
    borderRadius: 2,
    bottom: 10,
    height: 5,
    left: 18,
    position: 'absolute',
    right: 18,
    zIndex: 8,
  },
  horizontalScrollThumb: {
    backgroundColor: 'rgba(39, 39, 39, 0.78)',
    borderColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 3,
    borderWidth: 1,
    height: 5,
    position: 'absolute',
  },
  buttonContainer: {
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
})

export default Drawing
