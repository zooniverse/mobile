import apiClient from 'panoptes-client/lib/api-client'
import * as R from 'ramda'
import { getAuthUser, signOut } from '../actions/auth'
import { saveTutorialAsComplete, setUserProjectData } from '../actions/user';
import * as ActionConstants from '../constants/actions'
import { setMiniCourse } from '../reducers/classifierSlice'

export function fetchFieldGuide(workflowId, projectId) {
  return (dispatch) => {
    return new Promise ((resolve) => {
      apiClient.type('field_guides').get({project_id: projectId}).then(([guide]) => {
        if (R.isEmpty(guide.items)) { //no items (clicked add but didn't add anything)
          return resolve()
        } else {
          let icons = {}
          guide.get('attached_images').then((images) => {
            R.forEach((image) => icons[image.id] = image, images)
            guide.icons = icons
          }).finally(() => {
            dispatch(setGuideForWorkflow(workflowId, guide))
            return resolve()
          })
        }
      }).catch(() => {
        return resolve()
      })
    })
  }
}

export function fetchTutorials(workflowID) {
  return dispatch => {
    return new Promise ((resolve) => {
      apiClient.type('tutorials').get({workflow_id: workflowID}).then((tutorials) => {
        // The /tutorials endpoint returns both tutorials AND mini-courses for
        // a workflow. Filter to standard tutorials only — null `kind` is the
        // legacy backwards-compat case (matches PFE's tutorial.jsx:38–40).
        const onlyStandardTutorials = (tutorials || []).filter(
          (t) => t && (t.kind === 'tutorial' || t.kind === null || t.kind === undefined)
        )
        const tutorialResource = onlyStandardTutorials[0]
        if (!tutorialResource) {
          dispatch(addTutorial(workflowID, {}))
          return resolve()
        }
        let mediaByID = {}
        tutorialResource.get('attached_images').then((mediaResources) => {
          R.forEach((mediaResource) => mediaByID[mediaResource.id] = mediaResource, mediaResources)
        }).finally(() => {
          tutorialResource.mediaResources = mediaByID
          dispatch(addTutorial(workflowID, tutorialResource))
          resolve()
        })
      }).catch(() => { //does not exist for this project, that is OK
        dispatch(addTutorial(workflowID, {}))
        resolve()
      })
    })
  }
}

/**
 * Mini-course fetch. Intentionally NOT sharing code with `fetchTutorials` —
 * mini-courses are a separate feature and must remain so. Skipped entirely
 * for guest users (mini-course is signed-in only, matching PFE).
 *
 * Server-side filter via `kind=mini-course` returns only mini-course
 * tutorial resources. Takes the first result only (matches PFE: a workflow
 * may technically have multiple mini-courses attached but only the first is
 * shown).
 */
export function fetchMiniCourse(workflowID) {
  return (dispatch, getState) => {
    return new Promise((resolve) => {
      if (getState().user.isGuestUser) {
        dispatch(setMiniCourse({ workflowId: workflowID, miniCourse: null }))
        return resolve()
      }

      apiClient
        .type('tutorials')
        .get({ workflow_id: workflowID, kind: 'mini-course' })
        .then(([miniCourse]) => {
          if (!miniCourse) {
            dispatch(setMiniCourse({ workflowId: workflowID, miniCourse: null }))
            return resolve()
          }

          const mediaByID = {}
          miniCourse
            .get('attached_images')
            .then((mediaResources) => {
              R.forEach(
                (mediaResource) => (mediaByID[mediaResource.id] = mediaResource),
                mediaResources
              )
            })
            .catch(() => {
              // No attached images is normal — leave mediaByID empty.
            })
            .finally(() => {
              miniCourse.mediaResources = mediaByID
              dispatch(
                setMiniCourse({ workflowId: workflowID, miniCourse })
              )
              resolve()
            })
        })
        .catch(() => {
          dispatch(setMiniCourse({ workflowId: workflowID, miniCourse: null }))
          resolve()
        })
    })
  }
}

export function setupProjectPreferences(workflowID, project) {
  return (dispatch, getState) => {
    return new Promise ((resolve, reject) => {
      if (getState().user.isGuestUser){
        return resolve()
      }

      getAuthUser().then((userResource)=> {
        // The session expired and could not be refreshed. Sign the user out
        // to the home screen (matching loadUserData / PR #858) and resolve so
        // the classifier does not hang on the loading overlay.
        if (userResource === null) {
          dispatch(signOut(undefined, 'ZooniverseApp'))
          return resolve()
        }

        userResource.get('project_preferences', {project_id: project.id}).then (([projectPreferences]) => {
          //Before being able to classify on a project, the user needs to have their preference created if it doesn't exist
          if (projectPreferences) {
            return resolve()
          }

          const projectPreference = {
            links: { project: project.id },
            preferences: {}
          }

          apiClient.type('project_preferences').create(projectPreference).save().then(() => {
            const projectData = {
              name: project.display_name,
              slug: project.slug,
              activity_count: 0,
              sort_order: '',
              tutorials_completed_at: {}
            };
            dispatch(setUserProjectData(project.id, projectData));
            return resolve()
          }).catch(() => {
            return reject()
          })
        })
      })
      // Any failure above (a rejected auth check, an expired session that
      // 401s on project_preferences, a network drop) must reject. Without
      // this the outer promise never settles and the workflow resources stay
      // behind the "Loading Workflow..." overlay.
      .catch(reject)
    })
  }
}

export function setNeedsTutorial(workflowId, projectId) {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      if (R.isEmpty(getState().classifier.tutorial[workflowId])) {
        dispatch(setNeedsTutorialAction(workflowId, false))
        return resolve()
      }

      const tutorialID = getState().classifier.tutorial[workflowId].id
      let needsTutorial = getState().classifier.needsTutorial[workflowId] !== undefined ? getState().classifier.needsTutorial[workflowId] : true

      if ((!getState().user.isGuestUser) && (getState().user.projects[projectId])) {
        needsTutorial = !getState().user.projects[projectId]['tutorials_completed_at'][tutorialID]
      }

      dispatch(setNeedsTutorialAction(workflowId, needsTutorial))
      return resolve()
    })
  }
}

export function setTutorialCompleted(workflowId, projectId) {
  return (dispatch, getState) => {
    dispatch(setNeedsTutorialAction(workflowId, false))

    if (getState().user.isGuestUser) {
      return
    }
    const now = new Date().toISOString()
    const tutorialId = getState().classifier.tutorial[workflowId].id

    getAuthUser().then((userResourse) => {
      userResourse.get('project_preferences', {project_id: projectId}).then (([projectPreferences]) => {
        if (!projectPreferences.preferences.tutorials_completed_at) {
          projectPreferences.preferences.tutorials_completed_at = {}
        }
        projectPreferences.update({[`preferences.tutorials_completed_at.${tutorialId}`]: now}).save()
        dispatch(saveTutorialAsComplete(projectId, tutorialId, now));
      })
    })
  }
}

/**
 * Mini-course preference writes. All three follow PFE's persistence
 * pattern: a single key under `preferences.minicourses.<field>.id_<id>`
 * on the user's `project_preferences` resource. The `id_` prefix is
 * critical — without it the API serializes as a sparse array and breaks
 * round-tripping (same workaround tutorials use for
 * `tutorials_completed_at`).
 *
 * Each thunk short-circuits for guests as belt-and-suspenders; the modal
 * never opens for them, but matching PFE's three-guard pattern keeps the
 * behavior consistent if the modal is ever forced into view via dev tools
 * or a future test path.
 *
 * Optimistic Redux update: we dispatch immediately and let `.save()` ride
 * along. Matches the existing `setTutorialCompleted` pattern.
 */
export function setMiniCourseOptOut(projectId, miniCourseId, value) {
  return (dispatch, getState) => {
    if (getState().user.isGuestUser) return

    dispatch({
      type: ActionConstants.SET_MINICOURSE_OPT_OUT,
      projectId,
      miniCourseId,
      value,
    })

    getAuthUser().then((userResource) => {
      userResource.get('project_preferences', { project_id: projectId }).then(
        ([projectPreferences]) => {
          if (!projectPreferences) return
          projectPreferences
            .update({
              [`preferences.minicourses.opt_out.id_${miniCourseId}`]: value,
            })
            .save()
        }
      )
    })
  }
}

export function setMiniCourseStepProgress(projectId, miniCourseId, slideIndex) {
  return (dispatch, getState) => {
    if (getState().user.isGuestUser) return

    dispatch({
      type: ActionConstants.SET_MINICOURSE_STEP_PROGRESS,
      projectId,
      miniCourseId,
      slideIndex,
    })

    getAuthUser().then((userResource) => {
      userResource.get('project_preferences', { project_id: projectId }).then(
        ([projectPreferences]) => {
          if (!projectPreferences) return
          projectPreferences
            .update({
              [`preferences.minicourses.slide_to_start.id_${miniCourseId}`]: slideIndex,
            })
            .save()
        }
      )
    })
  }
}

export function setMiniCourseCompleted(projectId, miniCourseId) {
  return (dispatch, getState) => {
    if (getState().user.isGuestUser) return

    const completedAt = new Date().toISOString()

    dispatch({
      type: ActionConstants.SET_MINICOURSE_COMPLETED,
      projectId,
      miniCourseId,
      completedAt,
    })

    getAuthUser().then((userResource) => {
      userResource.get('project_preferences', { project_id: projectId }).then(
        ([projectPreferences]) => {
          if (!projectPreferences) return
          projectPreferences
            .update({
              [`preferences.minicourses.completed_at.id_${miniCourseId}`]: completedAt,
            })
            .save()
        }
      )
    })
  }
}

/**
 * Restart a mini-course: clear opt-out, reset to step 0, clear completed.
 * Mirrors PFE's `MiniCourse.restart`. Writes all three prefs in a single
 * API update + save so the server-side state is consistent.
 *
 * Returns the save Promise so the caller can chain "open the modal" after
 * the write completes (matches PFE's `.save().then(@start ...)`).
 */
export function restartMiniCourse(projectId, miniCourseId) {
  return (dispatch, getState) => {
    if (getState().user.isGuestUser) return Promise.resolve()

    // Optimistic Redux mirror — reuses the same three reducer cases as
    // the individual setters so there's a single source of truth for
    // mini-course pref state shape.
    dispatch({
      type: ActionConstants.SET_MINICOURSE_OPT_OUT,
      projectId,
      miniCourseId,
      value: false,
    })
    dispatch({
      type: ActionConstants.SET_MINICOURSE_STEP_PROGRESS,
      projectId,
      miniCourseId,
      slideIndex: 0,
    })
    dispatch({
      type: ActionConstants.SET_MINICOURSE_COMPLETED,
      projectId,
      miniCourseId,
      completedAt: null,
    })

    return getAuthUser().then((userResource) =>
      userResource
        .get('project_preferences', { project_id: projectId })
        .then(([projectPreferences]) => {
          if (!projectPreferences) return
          return projectPreferences
            .update({
              [`preferences.minicourses.opt_out.id_${miniCourseId}`]: false,
              [`preferences.minicourses.slide_to_start.id_${miniCourseId}`]: 0,
              [`preferences.minicourses.completed_at.id_${miniCourseId}`]: null,
            })
            .save()
        })
    )
  }
}

export const addAnnotationToTask = (workflowId, task, annotation, asList) => ({
  type: ActionConstants.ADD_ANNOTATION_TO_TASK,
  workflowId,
  task,
  annotation,
  asList
})

export const removeAnnotationFromTask = (workflowId, task, annotation) => ({
  type: ActionConstants.REMOVE_ANNOTATION_FROM_TASK,
  workflowId,
  task,
  annotation,
})

export const clearClassifierData = () => ({
  type: ActionConstants.CLEAR_CLASSIFIER_DATA
})

export const setClassifierTestMode = (isTestMode) => ({
  type: ActionConstants.SET_CLASSIFIER_TEST_MODE,
  isTestMode
})

export const setSubjectStartTimeForWorkflow = (workflowId) => ({
  type: ActionConstants.SET_SUBJECT_START_TIME,
  workflowId
})

export const setSubjectSizeInWorkflow = (subjectId, {width, height}) => ({
  type: ActionConstants.SET_SUBJECT_DIMENSIONS,
  subjectId,
  subjectDimensions: {naturalWidth: width, naturalHeight: height}
})

const addTutorial = (workflowId, tutorial) => ({
  type: ActionConstants.ADD_CLASSIFIER_TUTORIAL,
  workflowId,
  tutorial
})

const setNeedsTutorialAction = (workflowId, needsTutorial) => ({
  type: ActionConstants.ADD_WORKFLOW_NEEDS_TUTORIAL,
  workflowId,
  needsTutorial
})

const setGuideForWorkflow = (workflowId, guide) => ({
  type: ActionConstants.SET_CLASSIFIER_GUIDE,
  workflowId,
  guide
})
