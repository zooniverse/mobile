

export function isComplete(completenessString) {
    const completenessFloat = Number.parseFloat(completenessString)
    const isComplete = !Number.isNaN(completenessFloat) && completenessFloat >= 1
    return isComplete
}

export function mobileWorkflowsCompleteFor(project) {
    let workflowsOutOfData = true
    if (project.workflows.length > 1) {
        const allWorkflowsComplete = project.workflows.every( w => isComplete(w.completeness))
        workflowsOutOfData = allWorkflowsComplete
    } else if (project.workflows.length === 1) {
        const projectIsComplete = isComplete(project.workflows[0].completeness)
        workflowsOutOfData = projectIsComplete
    }
    return workflowsOutOfData
}

export function sortUnfinishedFirst(projects) {
    return projects.sort(function(firstProject, secondProject) {
            if (!mobileWorkflowsCompleteFor(firstProject) && mobileWorkflowsCompleteFor(secondProject)) {
                return -1;
            }
            if (!mobileWorkflowsCompleteFor(secondProject) && mobileWorkflowsCompleteFor(firstProject)) {
                return 1;
            }
            return 0;
        }
    )
}