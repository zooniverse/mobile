import { fetchCaesarRectangleShapes } from '../drawingCaesar'
import { constructDrawingAnnotations } from '../annotationUtils'
import { isValidMobileWorkflow } from '../workflow-utils'
import reducer from '../../reducers/drawingReducer'
import * as actions from '../../actions/drawing'

const tools = [
  { type: 'rectangle', color: 'green' },
  { type: 'rectangle', color: 'yellow' },
]
const workflow = (caesar = true) => ({
  id: '12', first_task: 'T0',
  configuration: { enable_caesar_data_fetching: caesar },
  tasks: { T0: { type: 'drawing', instruction: 'Draw boxes', tools } },
})
const rectangle = { x_center: 50, y_center: 60, width: 20, height: 10 }
const fetchShapes = (value = workflow()) => fetchCaesarRectangleShapes({
  workflow: value, subjectId: '34', taskKey: 'T0', tools,
})
const originalFetch = global.fetch
beforeEach(() => { global.fetch = jest.fn() })
afterEach(() => { global.fetch = originalFetch })
const respond = (marks) => global.fetch.mockResolvedValue({
  ok: true,
  json: async () => ({ data: { workflow: { subject_reductions: [{ data: { data: marks } }] } } }),
})

it('does not request Caesar for ordinary drawing', async () => {
  expect(await fetchShapes(workflow(false))).toBeNull()
  expect(global.fetch).not.toHaveBeenCalled()
})
it('accepts unlabelled boxes and explicit step/tool routing', async () => {
  respond([rectangle, { ...rectangle, stepKey: 'S0', taskIndex: 0, toolIndex: 1 }])
  expect(await fetchShapes()).toEqual({
    0: { x: 40, y: 55, width: 20, height: 10, toolIndex: 0, color: 'green', type: 'rect' },
    1: { x: 40, y: 55, width: 20, height: 10, toolIndex: 1, color: 'yellow', type: 'rect' },
  })
})
it('ignores boxes for other tasks/tools or invalid coordinates', async () => {
  respond([{ ...rectangle, stepKey: 'S4' }, { ...rectangle, toolIndex: 3 }, { ...rectangle, width: -1 }])
  expect(await fetchShapes()).toEqual({})
})
it('accepts an empty reduction without treating it as a failure', async () => {
  respond([])
  expect(await fetchShapes()).toEqual({})
})
it.each([
  { ok: false, status: 503 },
  { ok: true, json: async () => ({ errors: [{ message: 'Unavailable' }] }) },
  { ok: true, json: async () => ({ data: { workflow: null } }) },
])('reports request/response failures so the screen can offer retry', async response => {
  global.fetch.mockResolvedValue(response)
  await expect(fetchShapes()).rejects.toThrow()
})
it('does not convert network failure into an empty canvas', async () => {
  global.fetch.mockRejectedValue(new Error('Offline'))
  await expect(fetchShapes()).rejects.toThrow('Offline')
})
it.each([1, 2])('accepts %i rectangle tools without Caesar', count => {
  const value = workflow(false)
  value.tasks.T0.tools = tools.slice(0, count)
  expect(isValidMobileWorkflow(value)).toBe(true)
  expect(value.type).toBe('drawing')
})
it.each([[[]], [[...tools, { type: 'polygon' }]]])('still rejects unsupported tool configurations', configuredTools => {
  const value = workflow(false)
  value.tasks.T0.tools = configuredTools
  expect(isValidMobileWorkflow(value)).toBe(false)
})
it('submits one task annotation with each box assigned to its tool', () => {
  const annotations = constructDrawingAnnotations({
    a: { x: 20, y: 30, width: -10, height: -5 },
    b: { x: 40, y: 50, width: 5, height: 6, toolIndex: 1 },
  }, tools, 'T0')
  expect(annotations).toEqual([{ task: 'T0', value: [
    { details: 0, frame: 0, tool: 0, x: 10, y: 25, width: 10, height: 5 },
    { details: 0, frame: 0, tool: 1, x: 40, y: 50, width: 5, height: 6 },
  ] }])
  expect(constructDrawingAnnotations({}, tools, 'T0')).toEqual([{ task: 'T0', value: [] }])
})
it('preserves initial boxes through edits, undo/redo, and adding another tool', () => {
  const box = { x: 10, y: 20, width: 30, height: 40, toolIndex: 1, color: 'yellow' }
  let state = reducer(undefined, actions.initializeShapes({ 0: box }))
  state = reducer(state, actions.mutateShapeAtIndex({ dx: 5, dy: 0, dw: 0, dh: 0 }, '0'))
  expect(state.shapesInProgress[0]).toEqual({ ...box, x: 15 })
  state = reducer(state, actions.undoMostRecentEdit())
  expect(state.shapesInProgress[0]).toEqual(box)
  state = reducer(state, actions.redoMostRecentEdit())
  expect(state.shapesInProgress[0].x).toBe(15)
  state = reducer(state, actions.addShape({ ...box, toolIndex: 0 }))
  expect(Object.keys(state.shapesInProgress)).toHaveLength(2)
  state = reducer(state, actions.clearShapes())
  expect(state.shapesInProgress).toEqual({})
})
