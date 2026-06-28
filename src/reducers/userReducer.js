import * as ActionConstants from '../constants/actions';
import * as R from 'ramda';

const InitialUserState = { 
    isGuestUser: true,
    projects: {}
};

export default function user(state=InitialUserState, action) {
    switch (action.type) {
        case ActionConstants.SET_USER_AVATAR: {
            return R.set(R.lensPath(['avatar']), action.avatar, state);
        }
        case ActionConstants.SET_USER_PROJECT_DATA: {
            return R.set(R.lensPath(['projects', action.projectId]), action.projectData, state);
        }
        case ActionConstants.SET_USER_TOTAL_CLASSIFICATIONS: {
            return R.set(R.lensPath(['totalClassifications']), action.totalClassifications, state);
        }
        case ActionConstants.SET_IS_GUEST_USER: {
            return R.set(R.lensPath(['isGuestUser']), action.isGuestUser, state);
        }
        case ActionConstants.SET_USER: {
            return action.user;
        }
        case ActionConstants.SIGN_OUT: {
            return InitialUserState
        }
        case ActionConstants.SET_PUSH_PROMPTED: {
            return R.set(R.lensPath(['pushPrompted']), action.value, state);
        }
        case ActionConstants.SET_TUTORIAL_COMPLETE: {
            const modifiedState = R.set(R.lensPath(['projects', action.projectId, 'tutorials_completed_at', action.tutorialId]), action.completionTime, state);
            return modifiedState;
        }
        case ActionConstants.SET_MINICOURSE_OPT_OUT: {
            return R.set(
                R.lensPath(['projects', action.projectId, 'minicourses', 'opt_out', `id_${action.miniCourseId}`]),
                action.value,
                state
            );
        }
        case ActionConstants.SET_MINICOURSE_STEP_PROGRESS: {
            return R.set(
                R.lensPath(['projects', action.projectId, 'minicourses', 'slide_to_start', `id_${action.miniCourseId}`]),
                action.slideIndex,
                state
            );
        }
        case ActionConstants.SET_MINICOURSE_COMPLETED: {
            return R.set(
                R.lensPath(['projects', action.projectId, 'minicourses', 'completed_at', `id_${action.miniCourseId}`]),
                action.completedAt,
                state
            );
        }
        default:
            return state;
    }
}
