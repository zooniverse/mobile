import {isComplete, sortUnfinishedFirst, mobileWorkflowsCompleteFor} from '../projectDisplay'

const incompleteProjectMultipleWorkflows = {
    "title": "incompleteProjectMultipleWorkflows",
    "workflows" : [
        {"completeness": "0.01",},
        {"completeness": "1.0",},
    ]
}
const completeProjectMultipleWorkflows = {
    "title": "completeProjectMultipleWorkflows",
    "workflows" : [
        {"completeness": "1.0",},
        {"completeness": "1.0",},
    ]
}
const incompleteProjectOneWorkflow = {
    "title": "incompleteProjectOneWorkflow",
    "workflows" : [
        {"completeness": "0.01",},
    ]
}
const completeProjectOneWorkflow = {
    "title": "completeProjectOneWorkflow",
    "workflows" : [
        {"completeness": "1.0"},
    ]
}
const projectNoWorkflows = {
    "title": "projectNoWorkflows",
    "workflows" : []
}

it('evaluates the completeness score', () => {
    expect(isComplete("0.86475842858515")).toEqual(false)
    expect(isComplete("1")).toEqual(true)
    expect(isComplete("1.0")).toEqual(true)
    expect(isComplete("0.605204421920542")).toEqual(false)
})

it('identifies which projects are complete', () => {
    expect(mobileWorkflowsCompleteFor(incompleteProjectOneWorkflow)).toEqual(false)
    expect(mobileWorkflowsCompleteFor(incompleteProjectMultipleWorkflows)).toEqual(false)

    expect(mobileWorkflowsCompleteFor(completeProjectOneWorkflow)).toEqual(true)
    expect(mobileWorkflowsCompleteFor(completeProjectMultipleWorkflows)).toEqual(true)

    expect(mobileWorkflowsCompleteFor(projectNoWorkflows)).toEqual(true)
})

it('sorts the projects so incomplete ones appear before complete ones', () => {
    const projects = [
        completeProjectMultipleWorkflows,
        incompleteProjectMultipleWorkflows,
        completeProjectOneWorkflow,
        incompleteProjectOneWorkflow,
        projectNoWorkflows,
    ]

    const sortedProjects = sortUnfinishedFirst(projects)
    expect(sortedProjects.map((project) => project.title))
        .toEqual([
            "incompleteProjectMultipleWorkflows",
            "incompleteProjectOneWorkflow",
            "completeProjectMultipleWorkflows",
            "completeProjectOneWorkflow",
            "projectNoWorkflows"
        ])
})


