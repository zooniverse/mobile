import apiClient from 'panoptes-client/lib/api-client'
import * as R from 'ramda'

import { getAuthUser } from './auth'
import * as ActionConstants from '../constants/actions'
import { isValidMobileWorkflow } from '../utils/workflow-utils'

const PAGE_SIZE = 100
// TEMP: hardcoded HAVI test project bypass. Surfaces the HAVI multi-task project
// in the user's project list and allows all of its active workflows (except
// `[desktop] box adjustment`, `31986`) regardless of the `mobile_friendly`
// backend flag. Remove once HAVI is marked mobile_friendly and
// `isValidMobileWorkflow` is relaxed to accept multi-task chains.
// See mobile/.plans/CLEANUP.md for full context and removal conditions.
const MULTI_TASK_PROJECT_ID = '32778'
const EXCLUDED_MULTI_TASK_WORKFLOW_ID = '31986'

const productionParams = {
    mobile_friendly: true,
    launch_approved: true,
    live: true,
    cards: true,
    sort: 'display_name',
    page_size: PAGE_SIZE,
}

const betaParams = {
    mobile_friendly: true,
    beta_approved: true,
    launch_approved: false,
    live: true,
    cards: true,
    sort: 'display_name',
    page_size: PAGE_SIZE,
}

const ownerParams = {
    mobile_friendly: true,
    live: false,
    cards: true,
    sort: 'display_name',
    current_user_roles: 'owner',
    page_size: PAGE_SIZE,
}

const collaboratorParams = {
    mobile_friendly: true,
    live: false,
    cards: true,
    sort: 'display_name',
    current_user_roles: 'collaborator',
    page_size: PAGE_SIZE,
}

const categoryKeyFor = (category, language) => (
    category === 'translated projects' ? `${category}:${language}` : category
)

const normalizeProjectCard = (project, isPreview = false) => {
    project.isPreview = isPreview
    project.workflows = project.workflows || []
    project.title = project.title || project.display_name
    return project
}

const sortProjectCards = projects => {
    return [...projects].sort((firstProject, secondProject) => {
        const firstComplete = firstProject.workflows.every(
            workflow => Number(workflow.completeness) >= 1
        )
        const secondComplete = secondProject.workflows.every(
            workflow => Number(workflow.completeness) >= 1
        )

        if (firstComplete !== secondComplete) {
            return firstComplete ? 1 : -1
        }

        return (firstProject.display_name || '').localeCompare(
            secondProject.display_name || ''
        )
    })
}

const configureWorkflow = (workflow) => {
    // TEMP: HAVI bypass — force-allow every HAVI workflow except 31986 and
    // set the workflow type ourselves since isValidMobileWorkflow is skipped.
    const isMultiTaskProject = workflow.links?.project === MULTI_TASK_PROJECT_ID
    const isAllowedMultiTaskWorkflow =
        isMultiTaskProject && workflow.id !== EXCLUDED_MULTI_TASK_WORKFLOW_ID

    workflow.mobile_verified =
        isAllowedMultiTaskWorkflow ||
        (workflow.mobile_friendly && isValidMobileWorkflow(workflow))

    if (isAllowedMultiTaskWorkflow) {
        const firstTaskType = workflow.tasks?.[workflow.first_task]?.type
        workflow.type = firstTaskType === 'single' ? 'swipe' : firstTaskType
    }
    return workflow
}

const fetchPaginated = async (resourceType, params, page = 1, accumulated = []) => {
    const resources = await apiClient.type(resourceType).get({ ...params, page })
    const combined = accumulated.concat(resources)
    const meta = resources[0]?.getMeta?.()
    const hasNextPage = meta?.next_page || resources.length === (params.page_size || 20)

    if (hasNextPage) {
        return fetchPaginated(resourceType, params, page + 1, combined)
    }
    return combined
}

const fetchProjectCardsByIds = async (projectIds, params = {}) => {
    const batches = R.splitEvery(PAGE_SIZE, projectIds)
    const projectGroups = await Promise.all(
        batches.map(ids => apiClient.type('projects').get({
            ...params,
            id: ids,
            cards: true,
            page_size: ids.length,
        }))
    )
    return projectGroups.flat()
}

const addSupportedWorkflows = async projects => {
    if (projects.length === 0) return []

    const projectIds = projects.map(project => project.id)
    const workflowGroups = await Promise.all([
        fetchPaginated('workflows', {
            project_id: projectIds,
            mobile_friendly: true,
            active: true,
            sort: 'id',
            page_size: PAGE_SIZE,
        }),
        // TEMP: HAVI bypass — pull all active HAVI workflows regardless of
        // the mobile_friendly flag.
        projectIds.includes(MULTI_TASK_PROJECT_ID)
            ? fetchPaginated('workflows', {
                project_id: MULTI_TASK_PROJECT_ID,
                active: true,
                sort: 'id',
                page_size: PAGE_SIZE,
            })
            : Promise.resolve([]),
    ])

    const workflows = R.uniqBy(
        workflow => workflow.id,
        workflowGroups.flat().map(configureWorkflow)
    ).filter(workflow => workflow.mobile_verified)

    projects.forEach(project => {
        project.workflows = workflows.filter(
            workflow => workflow.links.project === project.id
        )
    })

    return projects.filter(project => project.workflows.length > 0)
}

const fetchPreviewCards = async () => {
    const user = await getAuthUser()
    if (!user) return []

    const [ownerProjects, collaboratorProjects, multiTaskProjects] = await Promise.all([
        fetchPaginated('projects', ownerParams),
        fetchPaginated('projects', collaboratorParams),
        // TEMP: HAVI bypass — fetch the HAVI test project directly so it
        // shows in the preview list even if the user isn't owner/collab.
        apiClient.type('projects').get({ id: MULTI_TASK_PROJECT_ID, cards: true }),
    ])

    const previewProjects = [
        ...ownerProjects,
        ...collaboratorProjects,
        ...multiTaskProjects,
    ].map(project => normalizeProjectCard(project, true))

    return addSupportedWorkflows(R.uniqBy(project => project.id, previewProjects))
}

const fetchRecentCards = async (getState) => {
    const recentProjectIds = Object.keys(getState().user.projects || {})
    if (recentProjectIds.length === 0) return []

    const projects = await fetchProjectCardsByIds(recentProjectIds, {
        mobile_friendly: true,
        launch_approved: true,
        live: true,
    })
    const sortOrder = new Map(recentProjectIds.map((id, index) => [id, index]))
    const recentProjects = projects
        .filter(project => (
            project.launch_approved &&
            project.state !== 'finished'
        ))
        .map(project => normalizeProjectCard(project))
    const supportedProjects = await addSupportedWorkflows(recentProjects)
    return supportedProjects.sort(
        (first, second) => sortOrder.get(first.id) - sortOrder.get(second.id)
    )
}

const fetchTranslatedProjects = async (language) => {
    const fullProjectParams = { ...productionParams }
    delete fullProjectParams.cards
    const projects = await fetchPaginated('projects', {
        ...fullProjectParams,
        include: 'avatar',
    })

    const translatedProjects = await Promise.all(
        projects
            .filter(project => project.available_languages?.includes(language))
            .map(async project => {
            const avatarId = project.links?.avatar?.id
            if (!project.avatar_src && avatarId) {
                const avatar = await apiClient.type('avatars')
                    .get(avatarId)
                    .catch(() => null)
                project.avatar_src = avatar?.src
            }
            return normalizeProjectCard(project)
        })
    )
    return sortProjectCards(await addSupportedWorkflows(translatedProjects))
}

const getCategoryProjects = async (category, language, getState) => {
    if (category === 'preview') return fetchPreviewCards()
    if (category === 'recent') return fetchRecentCards(getState)
    if (category === 'beta') {
        const projects = await fetchPaginated('projects', betaParams)
        const projectCards = projects.map(project => normalizeProjectCard(project))
        return sortProjectCards(await addSupportedWorkflows(projectCards))
    }
    if (category === 'translated projects') {
        return fetchTranslatedProjects(language)
    }

    const params = category === 'all projects'
        ? productionParams
        : { ...productionParams, tags: category }
    const projects = await fetchPaginated('projects', params)
    const projectCards = projects
        .filter(project => project.state !== 'finished')
        .map(project => normalizeProjectCard(project))
    return sortProjectCards(await addSupportedWorkflows(projectCards))
}

export function fetchProjects() {
    return async (dispatch) => {
        dispatch({ type: ActionConstants.PROJECTS_REQUEST })
        dispatch({ type: ActionConstants.PROJECTS_SUCCESS })
        return []
    }
}

export function fetchProjectsForCategory(category, language = 'en', force = false) {
    return async (dispatch, getState) => {
        const categoryKey = categoryKeyFor(category, language)
        const cachedProjects = getState().projects.categoryProjects[categoryKey]
        if (!force && cachedProjects) return cachedProjects

        dispatch({
            type: ActionConstants.CATEGORY_PROJECTS_REQUEST,
            categoryKey,
        })

        try {
            const projects = await getCategoryProjects(category, language, getState)
            dispatch({
                type: ActionConstants.CATEGORY_PROJECTS_SUCCESS,
                categoryKey,
                projects,
            })
            return projects
        } catch (error) {
            dispatch({
                type: ActionConstants.CATEGORY_PROJECTS_FAILURE,
                categoryKey,
                error: error?.message || `${error}`,
            })
            throw error
        }
    }
}

export function fetchProjectsForNotifications(projectIds) {
    return async (dispatch, getState) => {
        const categoryKey = 'notifications'
        const cachedProjects = getState().projects.categoryProjects[categoryKey]
        const cachedIds = cachedProjects?.map(project => project.id) || []
        if (projectIds.every(projectId => cachedIds.includes(projectId))) {
            return cachedProjects
        }

        dispatch({
            type: ActionConstants.CATEGORY_PROJECTS_REQUEST,
            categoryKey,
        })

        try {
            const projects = projectIds.length === 0
                ? []
                : await fetchProjectCardsByIds(projectIds)
            const normalizedProjects = projects.map(project => normalizeProjectCard(project))
            dispatch({
                type: ActionConstants.CATEGORY_PROJECTS_SUCCESS,
                categoryKey,
                projects: normalizedProjects,
            })
            return normalizedProjects
        } catch (error) {
            dispatch({
                type: ActionConstants.CATEGORY_PROJECTS_FAILURE,
                categoryKey,
                error: error?.message || `${error}`,
            })
            throw error
        }
    }
}

const fetchProjectWorkflows = async (project) => {
    const calls = [
        fetchPaginated('workflows', {
            project_id: project.id,
            mobile_friendly: true,
            active: true,
            sort: 'id',
            page_size: PAGE_SIZE,
        }),
    ]

    // TEMP: HAVI bypass — when the project being looked at is HAVI, pull all
    // its active workflows regardless of mobile_friendly.
    if (project.id === MULTI_TASK_PROJECT_ID) {
        calls.push(fetchPaginated('workflows', {
            project_id: MULTI_TASK_PROJECT_ID,
            active: true,
            sort: 'id',
            page_size: PAGE_SIZE,
        }))
    }

    const workflowGroups = await Promise.all(calls)
    return R.uniqBy(
        workflow => workflow.id,
        workflowGroups.flat().map(configureWorkflow)
    ).filter(workflow => workflow.mobile_verified)
}

const fetchOptionalProjectMedia = async (project) => {
    const backgroundId = project.links?.background?.id
    const background = backgroundId
        ? await apiClient.type('backgrounds').get(backgroundId).catch(() => null)
        : null

    if (background) project.background = background
}

export function fetchProjectForClassification(projectCard) {
    return async (dispatch, getState) => {
        const cachedProject = getState().projects.projectDetails[projectCard.id]
        if (cachedProject) {
            cachedProject.isPreview = projectCard.isPreview || cachedProject.isPreview
            return cachedProject
        }

        dispatch({
            type: ActionConstants.PROJECT_DETAILS_REQUEST,
            projectId: projectCard.id,
        })

        try {
            const [project] = await apiClient.type('projects').get({
                id: projectCard.id,
                include: 'background',
            })
            project.isPreview = projectCard.isPreview
            project.avatar_src = projectCard.avatar_src

            const user = await getAuthUser()
            const calls = [
                projectCard.workflows?.length
                    ? Promise.resolve(projectCard.workflows)
                    : fetchProjectWorkflows(project),
                fetchOptionalProjectMedia(project),
            ]
            if (user) {
                calls.push(tagMuseumRoleForProjects([project]))
            }

            const [workflows] = await Promise.all(calls)
            project.workflows = workflows

            dispatch({
                type: ActionConstants.PROJECT_DETAILS_SUCCESS,
                project,
            })
            return project
        } catch (error) {
            dispatch({
                type: ActionConstants.PROJECT_DETAILS_FAILURE,
                projectId: projectCard.id,
            })
            throw error
        }
    }
}

export const tagMuseumRoleForProjects = projects => {
    return Promise.all(projects.map(project => {
        return apiClient.type('projects')
            .get({ id: project.id, current_user_roles: 'museum' })
            .then((museumProjects) => {
                project.in_museum_mode =
                    project.in_museum_mode || museumProjects.some(item => item.id === project.id)
            })
    }))
}
