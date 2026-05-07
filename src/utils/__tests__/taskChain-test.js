import 'react-native'
import {
  isMultiTaskWorkflow,
  getNextTaskKey,
  isLastTaskInChain,
  activePathTaskKeys,
} from '../taskChain'

describe('isMultiTaskWorkflow', () => {
  it('returns false for a single-task single-choice workflow', () => {
    const workflow = {
      first_task: 'T0',
      tasks: {
        T0: {
          type: 'single',
          answers: [{ label: 'Yes' }, { label: 'No' }],
        },
      },
    }
    expect(isMultiTaskWorkflow(workflow)).toBe(false)
  })

  it('returns false for a single-task multi-select workflow', () => {
    const workflow = {
      first_task: 'T0',
      tasks: {
        T0: {
          type: 'multiple',
          answers: [{ label: 'A' }, { label: 'B' }],
        },
      },
    }
    expect(isMultiTaskWorkflow(workflow)).toBe(false)
  })

  it('returns true when a single-choice answer has a `next`', () => {
    const workflow = {
      first_task: 'T0',
      tasks: {
        T0: {
          type: 'single',
          answers: [
            { label: 'Yes', next: 'T1' },
            { label: 'No' },
          ],
        },
        T1: { type: 'multiple', answers: [{ label: 'A' }] },
      },
    }
    expect(isMultiTaskWorkflow(workflow)).toBe(true)
  })

  it('returns true when a task itself declares `next`', () => {
    const workflow = {
      first_task: 'T0',
      tasks: {
        T0: {
          type: 'multiple',
          next: 'T1',
          answers: [{ label: 'A' }],
        },
        T1: { type: 'single', answers: [{ label: 'Yes' }] },
      },
    }
    expect(isMultiTaskWorkflow(workflow)).toBe(true)
  })

  it('ignores per-answer `next` on multi-select tasks (builder does not allow it)', () => {
    // Even if a malformed workflow JSON were to set `next` on a multi-select
    // answer, the helper should not treat it as a branching signal.
    const workflow = {
      first_task: 'T0',
      tasks: {
        T0: {
          type: 'multiple',
          answers: [{ label: 'A', next: 'T1' }],
        },
      },
    }
    expect(isMultiTaskWorkflow(workflow)).toBe(false)
  })

  it('handles missing or empty `tasks` gracefully', () => {
    expect(isMultiTaskWorkflow(null)).toBe(false)
    expect(isMultiTaskWorkflow(undefined)).toBe(false)
    expect(isMultiTaskWorkflow({})).toBe(false)
    expect(isMultiTaskWorkflow({ tasks: {} })).toBe(false)
  })
})

describe('getNextTaskKey', () => {
  it('returns the per-answer next for single-choice', () => {
    const task = {
      type: 'single',
      answers: [
        { label: 'Yes', next: 'T1' },
        { label: 'No' },
      ],
    }
    expect(getNextTaskKey(task, 0)).toBe('T1')
    expect(getNextTaskKey(task, 1)).toBeNull()
  })

  it('falls back to task.next on single-choice when the answer has no next', () => {
    const task = {
      type: 'single',
      next: 'T2',
      answers: [
        { label: 'Yes', next: 'T1' },
        { label: 'No' },
      ],
    }
    expect(getNextTaskKey(task, 0)).toBe('T1') // per-answer wins
    expect(getNextTaskKey(task, 1)).toBe('T2') // fallback
  })

  it('uses task.next for multi-select regardless of answer', () => {
    const task = {
      type: 'multiple',
      next: 'T1',
      answers: [{ label: 'A' }, { label: 'B' }],
    }
    expect(getNextTaskKey(task, [0, 1])).toBe('T1')
    expect(getNextTaskKey(task, [])).toBe('T1')
  })

  it('uses task.next for drawing tasks', () => {
    const task = { type: 'drawing', next: 'T1' }
    expect(getNextTaskKey(task, undefined)).toBe('T1')
  })

  it('returns null when the chain terminates', () => {
    expect(getNextTaskKey({ type: 'single', answers: [{ label: 'Yes' }] }, 0)).toBeNull()
    expect(getNextTaskKey({ type: 'multiple', answers: [] }, [])).toBeNull()
    expect(getNextTaskKey({ type: 'drawing' }, undefined)).toBeNull()
  })

  it('returns null for missing task', () => {
    expect(getNextTaskKey(null, 0)).toBeNull()
    expect(getNextTaskKey(undefined, 0)).toBeNull()
  })
})

describe('isLastTaskInChain', () => {
  it('is true when getNextTaskKey returns null', () => {
    const task = { type: 'single', answers: [{ label: 'No' }] }
    expect(isLastTaskInChain(task, 0)).toBe(true)
  })

  it('is false when there is a next task', () => {
    const task = { type: 'single', answers: [{ label: 'Yes', next: 'T1' }] }
    expect(isLastTaskInChain(task, 0)).toBe(false)
  })
})

describe('activePathTaskKeys', () => {
  it('returns the ordered list of task keys from history entries', () => {
    const history = [
      { taskKey: 'T0', annotation: { task: 'T0', value: 0 } },
      { taskKey: 'T1', annotation: { task: 'T1', value: [0, 1] } },
    ]
    expect(activePathTaskKeys(history)).toEqual(['T0', 'T1'])
  })

  it('handles empty / missing history', () => {
    expect(activePathTaskKeys([])).toEqual([])
    expect(activePathTaskKeys(null)).toEqual([])
    expect(activePathTaskKeys(undefined)).toEqual([])
  })

  it('drops malformed entries without a taskKey', () => {
    const history = [
      { taskKey: 'T0' },
      { annotation: {} },
      null,
      { taskKey: '' },
      { taskKey: 'T1' },
    ]
    expect(activePathTaskKeys(history)).toEqual(['T0', 'T1'])
  })
})
