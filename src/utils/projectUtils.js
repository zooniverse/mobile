import R from 'ramda'

export const extractSwipeEnabledProjects = projectList => {
    return projectList.filter((project) => R.any((workflow) => workflow.swipe_verified)(project.workflows))
}

export const extractNonSwipeEnabledProjects = projectList => {
    return projectList.filter((project) => R.all((workflow) => !workflow.swipe_verified)(project.workflows))
}