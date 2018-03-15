import * as ActionConstants from '../../constants/actions';
import projects from '../projectsReducer';

const initialProjectState = {
    isLoading: false,
    isSuccess: false,
    isFailure: false,
    projectList: []
};

test('test Add projects request', () => {

    const action = {
        type: ActionConstants.ADD_PROJECTS_REQUEST,
    };

    const modifiedState = projects(initialProjectState, action);
    expect(modifiedState.projectList).toEqual([]);
    expect(modifiedState.isLoading).toBeTruthy();
})

test('test Add projects success', () => {
    const projectList = [
        { id: '1'},
        { id: '2'}
    ];
    const action = {
        type: ActionConstants.ADD_PROJECTS_SUCCESS,
        projects: projectList
    };

    const modifiedState = projects(initialProjectState, action);
    expect(modifiedState.projectList).toEqual(projectList);
    expect(modifiedState.isLoading).toBeFalsy();
    expect(modifiedState.isSuccess).toBeTruthy();
})

test('test Add projects failure', () => {

    const action = {
        type: ActionConstants.ADD_PROJECTS_FAILURE,
    };

    const modifiedState = projects(initialProjectState, action);
    expect(modifiedState.projectList).toEqual([]);
    expect(modifiedState.isLoading).toBeFalsy();
    expect(modifiedState.isFailure).toBeTruthy();
})
