import 'react-native'
import reducer, {
  reset,
  setSubjectStartTime,
  startChain,
  recordAnnotation,
  advanceTo,
  goBack,
  selectActiveAnnotations,
} from '../classifierSlice'

const initialState = {
  subjectStartTime: null,
  currentTaskKey: null,
  taskHistory: [],
  annotationsByTask: {},
}

describe('classifierSlice', () => {
  it('returns initial state for an unknown action', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('setSubjectStartTime updates the timestamp', () => {
    const next = reducer(initialState, setSubjectStartTime('2026-04-25T00:00:00Z'))
    expect(next.subjectStartTime).toBe('2026-04-25T00:00:00Z')
  })

  it('startChain seeds currentTaskKey and clears chain state', () => {
    const dirty = {
      ...initialState,
      currentTaskKey: 'OLD',
      taskHistory: [{ taskKey: 'OLD', answerValue: 0 }],
      annotationsByTask: { OLD: { task: 'OLD', value: 0 } },
    }
    const next = reducer(dirty, startChain({ taskKey: 'T0' }))
    expect(next.currentTaskKey).toBe('T0')
    expect(next.taskHistory).toEqual([])
    expect(next.annotationsByTask).toEqual({})
  })

  it('recordAnnotation stores by taskKey', () => {
    const annotation = { task: 'T0', value: 1 }
    const next = reducer(initialState, recordAnnotation({ taskKey: 'T0', annotation }))
    expect(next.annotationsByTask).toEqual({ T0: annotation })
  })

  it('advanceTo pushes history and updates currentTaskKey', () => {
    const seeded = reducer(initialState, startChain({ taskKey: 'T0' }))
    const withAnnotation = reducer(
      seeded,
      recordAnnotation({ taskKey: 'T0', annotation: { task: 'T0', value: 0 } })
    )
    const advanced = reducer(
      withAnnotation,
      advanceTo({ fromTaskKey: 'T0', answerValue: 0, toTaskKey: 'T1' })
    )
    expect(advanced.currentTaskKey).toBe('T1')
    expect(advanced.taskHistory).toEqual([{ taskKey: 'T0', answerValue: 0 }])
    expect(advanced.annotationsByTask).toEqual({ T0: { task: 'T0', value: 0 } })
  })

  it('goBack pops history and restores currentTaskKey, preserving prior annotations', () => {
    let state = reducer(initialState, startChain({ taskKey: 'T0' }))
    state = reducer(state, recordAnnotation({ taskKey: 'T0', annotation: { task: 'T0', value: 0 } }))
    state = reducer(state, advanceTo({ fromTaskKey: 'T0', answerValue: 0, toTaskKey: 'T1' }))
    state = reducer(state, goBack())

    expect(state.currentTaskKey).toBe('T0')
    expect(state.taskHistory).toEqual([])
    // The prior annotation must remain so the body can pre-select.
    expect(state.annotationsByTask).toEqual({ T0: { task: 'T0', value: 0 } })
  })

  it('goBack is a no-op when history is empty', () => {
    const state = reducer(initialState, startChain({ taskKey: 'T0' }))
    const after = reducer(state, goBack())
    expect(after.currentTaskKey).toBe('T0')
    expect(after.taskHistory).toEqual([])
  })

  it('advanceTo prunes annotations for tasks no longer on the active path (rebranch)', () => {
    // Walk T0 → T1, then back to T0, then re-pick a different answer that branches to T2.
    let state = reducer(initialState, startChain({ taskKey: 'T0' }))
    state = reducer(state, recordAnnotation({ taskKey: 'T0', annotation: { task: 'T0', value: 0 } }))
    state = reducer(state, advanceTo({ fromTaskKey: 'T0', answerValue: 0, toTaskKey: 'T1' }))
    state = reducer(state, recordAnnotation({ taskKey: 'T1', annotation: { task: 'T1', value: [0, 1] } }))
    // Simulate user pressing Back from T1.
    state = reducer(state, goBack())
    expect(state.annotationsByTask).toEqual({
      T0: { task: 'T0', value: 0 },
      T1: { task: 'T1', value: [0, 1] },
    })

    // User re-picks a different answer that branches elsewhere.
    state = reducer(state, recordAnnotation({ taskKey: 'T0', annotation: { task: 'T0', value: 1 } }))
    state = reducer(state, advanceTo({ fromTaskKey: 'T0', answerValue: 1, toTaskKey: 'T2' }))

    expect(state.currentTaskKey).toBe('T2')
    expect(state.taskHistory).toEqual([{ taskKey: 'T0', answerValue: 1 }])
    // T1 is no longer on the active path -> pruned. T2 has no annotation yet.
    expect(state.annotationsByTask).toEqual({ T0: { task: 'T0', value: 1 } })
  })

  it('advanceTo preserves a downstream annotation when the user re-picks the same branch', () => {
    let state = reducer(initialState, startChain({ taskKey: 'T0' }))
    state = reducer(state, recordAnnotation({ taskKey: 'T0', annotation: { task: 'T0', value: 0 } }))
    state = reducer(state, advanceTo({ fromTaskKey: 'T0', answerValue: 0, toTaskKey: 'T1' }))
    state = reducer(state, recordAnnotation({ taskKey: 'T1', annotation: { task: 'T1', value: [0] } }))
    state = reducer(state, goBack())
    // Re-advance via the same branch.
    state = reducer(state, recordAnnotation({ taskKey: 'T0', annotation: { task: 'T0', value: 0 } }))
    state = reducer(state, advanceTo({ fromTaskKey: 'T0', answerValue: 0, toTaskKey: 'T1' }))

    expect(state.currentTaskKey).toBe('T1')
    // T1's prior annotation is on the active path now; it survives.
    expect(state.annotationsByTask).toEqual({
      T0: { task: 'T0', value: 0 },
      T1: { task: 'T1', value: [0] },
    })
  })

  it('reset clears chain state', () => {
    let state = reducer(initialState, startChain({ taskKey: 'T0' }))
    state = reducer(state, setSubjectStartTime('2026-04-25T00:00:00Z'))
    state = reducer(state, recordAnnotation({ taskKey: 'T0', annotation: { task: 'T0', value: 0 } }))
    const cleared = reducer(state, reset())
    expect(cleared).toEqual(initialState)
  })
})

describe('selectActiveAnnotations', () => {
  const buildState = (slice) => ({ classification: { ...initialState, ...slice } })

  it('returns annotations in chain order: history first, then current', () => {
    const state = buildState({
      currentTaskKey: 'T1',
      taskHistory: [{ taskKey: 'T0', answerValue: 0 }],
      annotationsByTask: {
        T0: { task: 'T0', value: 0 },
        T1: { task: 'T1', value: [0, 1] },
      },
    })
    expect(selectActiveAnnotations(state)).toEqual([
      { task: 'T0', value: 0 },
      { task: 'T1', value: [0, 1] },
    ])
  })

  it('omits tasks that have no recorded annotation yet', () => {
    const state = buildState({
      currentTaskKey: 'T1',
      taskHistory: [{ taskKey: 'T0', answerValue: 0 }],
      annotationsByTask: {
        T0: { task: 'T0', value: 0 },
      },
    })
    expect(selectActiveAnnotations(state)).toEqual([{ task: 'T0', value: 0 }])
  })

  it('returns [] when the slice is missing', () => {
    expect(selectActiveAnnotations({})).toEqual([])
  })
})
