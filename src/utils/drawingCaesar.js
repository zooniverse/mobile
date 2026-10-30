const CAESAR_GRAPHQL_URL = 'https://caesar.zooniverse.org/graphql'
const MACHINE_LEARNT_REDUCER = 'machineLearnt'

const caesarRectangleToShape = (reduction, tools) => {
    const parsedToolIndex = Number(reduction.toolIndex)
    const toolIndex = Number.isFinite(parsedToolIndex) ? parsedToolIndex : 0
    return {
        color: tools?.[toolIndex]?.color || tools?.[0]?.color,
        height: reduction.height,
        toolIndex,
        type: 'rect',
        width: reduction.width,
        x: reduction.x_center - (reduction.width / 2),
        y: reduction.y_center - (reduction.height / 2)
    }
}

const fetchMachineLearntReductions = async ({ subjectId, workflowId }) => {
    const query = `{
        workflow(id: ${workflowId}) {
            subject_reductions(subjectId: ${subjectId}, reducerKey: "${MACHINE_LEARNT_REDUCER}") {
                data
            }
        }
    }`
    const response = await fetch(CAESAR_GRAPHQL_URL, {
        body: JSON.stringify({ query: query.replace(/\s+/g, ' ') }),
        headers: {
            'content-type': 'application/json',
        },
        method: 'POST',
    })
    if (!response.ok) throw new Error(`Caesar request failed: ${response.status}`)
    const result = await response.json()
    if (result.errors?.length || !Array.isArray(result?.data?.workflow?.subject_reductions)) {
        throw new Error('Invalid Caesar response')
    }
    return result?.data?.workflow?.subject_reductions || []
}

export const fetchCaesarRectangleShapes = async ({
    subjectId,
    taskKey,
    tools,
    workflow,
}) => {
    if (!workflow?.configuration?.enable_caesar_data_fetching) return null
    if (!subjectId || !taskKey) return null

    const reductions = await fetchMachineLearntReductions({
        subjectId,
        workflowId: workflow.id,
    })
    // Match web's step ordering for task-based workflows, without changing
    // the mobile workflow itself. Missing routing fields use the first step/tool.
    const tasks = workflow.tasks || {}
    const comboTaskKeys = Object.values(tasks)
        .filter(task => task.type === 'combo').flatMap(task => task.tasks)
    const taskKeys = [workflow.first_task, ...Object.keys(tasks)
        .filter(key => key !== workflow.first_task && !comboTaskKeys.includes(key))]
    const steps = workflow.steps?.length ? workflow.steps : taskKeys
        .map((key, index) => [ `S${index}`, { taskKeys: tasks[key]?.type === 'combo' ? tasks[key].tasks : [key] } ])
        .filter(([_key, step]) => tasks[step.taskKeys[0]]?.type !== 'shortcut')
    const shapes = reductions
        .flatMap(reduction => reduction?.data?.data || [])
        .filter(reduction => {
            const stepKey = reduction.stepKey ?? steps[0]?.[0]
            const step = steps.find(([key]) => key === stepKey)?.[1]
            const targetTaskKey = step?.taskKeys[reduction.taskIndex ?? 0]
            const toolIndex = reduction.toolIndex ?? 0
            return targetTaskKey === taskKey &&
                tasks[targetTaskKey]?.type === 'drawing' &&
                tools?.[toolIndex]?.type === 'rectangle' &&
                [reduction.x_center, reduction.y_center, reduction.width, reduction.height].every(Number.isFinite) &&
                reduction.width > 0 && reduction.height > 0
        })
        .map(reduction => caesarRectangleToShape(reduction, tools))

    return shapes.reduce((memo, shape, index) => ({
        ...memo,
        [index]: shape
    }), {})
}
