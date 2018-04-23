import * as ActionConstants from '../../constants/actions';
import projects from '../projectsReducer';

const initialProjectState = {
    isLoading: false,
    isSuccess: false,
    isFailure: false,
    projectList: [],
    previewProjectList: [],
    collaboratorIds: [],
    ownerIds: []
};

test('test projects request', () => {

    const action = {
        type: ActionConstants.PROJECTS_REQUEST,
    };

    const modifiedState = projects(initialProjectState, action);
    expect(modifiedState.projectList).toEqual([]);
    expect(modifiedState.isLoading).toBeTruthy();
})

test('test projects success', () => {
    const action = {
        type: ActionConstants.PROJECTS_SUCCESS,
    };

    const modifiedState = projects(initialProjectState, action);
    expect(modifiedState.isLoading).toBeFalsy();
    expect(modifiedState.isSuccess).toBeTruthy();
})

test('test projects failure', () => {
    const action = {
        type: ActionConstants.PROJECTS_FAILURE,
    };

    const modifiedState = projects(initialProjectState, action);
    expect(modifiedState.projectList).toEqual([]);
    expect(modifiedState.isLoading).toBeFalsy();
    expect(modifiedState.isFailure).toBeTruthy();
})

test('test add projects', () => {
    const projectList = [
        { id: '1'},
        { id: '2'}
    ];
    const nonPreviewAction = {
        type: ActionConstants.ADD_PROJECTS,
        projects: projectList,
        arePreview: false
    }

    const nonPreviewModifiedState = projects(initialProjectState, nonPreviewAction);
    expect(nonPreviewModifiedState.projectList).toEqual(projectList);
    expect(nonPreviewModifiedState.previewProjectList).toEqual([]);

    const previewAction = {
        type: ActionConstants.ADD_PROJECTS,
        projects: projectList,
        arePreview: true
    }
    
    const previewModifiedState = projects(initialProjectState, previewAction);
    expect(previewModifiedState.previewProjectList).toEqual(projectList);
    expect(previewModifiedState.projectList).toEqual([]);
})

test('test add owner project ids', () => {
    const ownerIdAction = {
        type: ActionConstants.ADD_OWNER_PROJECT_ID,
        projectId: 'id'
    }

    let modifiedState = projects(initialProjectState, ownerIdAction)
    expect(modifiedState.ownerIds).toEqual(['id'])
    modifiedState = projects(modifiedState, ownerIdAction)
    expect(modifiedState.ownerIds).toEqual(['id', 'id'])
    
})

test('test add collaborator ids', () => {
    const collaboratorIdAction = {
        type: ActionConstants.ADD_COLLABORATOR_PROJECT_ID,
        projectId: 'ia'
    }

    let modifiedState = projects(initialProjectState, collaboratorIdAction)
    expect(modifiedState.collaboratorIds).toEqual(['ia'])
    modifiedState = projects(modifiedState, collaboratorIdAction)
    expect(modifiedState.collaboratorIds).toEqual(['ia', 'ia'])
})
