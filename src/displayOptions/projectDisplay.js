

export function isComplete(completenessString) {
    const completenessFloat = Number.parseFloat(completenessString)
    const isComplete = !Number.isNaN(completenessFloat) && completenessFloat >= 1
    return isComplete
}

export function sortUnfinishedFirst(projects) {
    return projects.sort(function(firstProject, secondProject) {
            if (!isComplete(firstProject.completeness) && isComplete(secondProject.completeness)) {
                return -1;
            }
            if (!isComplete(secondProject.completeness) && isComplete(firstProject.completeness)) {
                return 1;
            }
            return 0;
        }
    )
}