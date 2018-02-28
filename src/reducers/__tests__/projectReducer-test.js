import * as ActionConstants from '../../constants/actions';
import projects from '../projectsReducer';

test('test Add projects', () => {
    const initialProjectState = {
        projectList: []
    };

    const projectList = [
        { id: '1'},
        { id: '2'}
    ];
    const action = {
        type: ActionConstants.ADD_PROJECTS,
        projects: projectList
    };

    const modifiedState = projects(initialProjectState, action);
    expect(modifiedState).toEqual({projectList });
})

test('test add project avatar', () => {
    const initialProjectState = {
        projectList: [
            {
                id: '1'
            },
            {
                id: '2',
                avatar_src: 'old_source'
            }
        ]
    }

    const action1 = {
        type: ActionConstants.ADD_PROJECT_AVATAR,
        projectId: '1',
        avatarSrc: 'id1_src'
    };
    expect(projects(initialProjectState, action1)).toEqual({
        projectList: [
            {
                id: '1',
                avatar_src: 'id1_src'
            },
            {
                id: '2',
                avatar_src: 'old_source'
            }
        ]
    });

    const action2 = {
        type: ActionConstants.ADD_PROJECT_AVATAR,
        projectId: '2',
        avatarSrc: 'id2_src'
    };
    expect(projects(initialProjectState, action2)).toEqual({
        projectList: [
            {
                id: '1',
            },
            {
                id: '2',
                avatar_src: 'id2_src'
            }
        ]
    });
})

test('Add Project Workflows', () => {
    const initialState = {
        projectList: [
            {
                id: 'id',
                workflows: {
                    objects: 'eyo'
                }
            }
        ]
    };
    const action = {
        type: ActionConstants.ADD_PROJECT_WORKFLOWS,
        projectId: 'id',
        workflows: {
            test: 'test'
        }
    };

    expect(projects(initialState, action)).toEqual({
        projectList: [
            {
                id: 'id',
                workflows: {
                    test: 'test'
                }
            }
        ]
    })
})
