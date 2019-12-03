import React from 'react'
import renderer from 'react-test-renderer';

import {Provider} from 'react-redux'
import {createStore} from 'redux'

const store = createStore(() => {
}, ['test'])

import { mapStateToProps, QuestionClassifier} from '../QuestionClassifier'
import {AnswerButton} from '../ClassifierButton'
import {getAnswersFromWorkflow, getTaskFromWorkflow} from '../../../utils/workflow-utils';


const subject = {
    id: '23432432',
    display: {
        src: 'blah.jpg'
    }
}

const project = {
    display_name: 'Awesome project'
}

const subjectSizes = {resizedWidth: 100, resizedHeight: 100}


const seenThisSession = []

// Stub out actions
const navBarActions = {
    setTitleForPage() {
    },
    setColorForPageToDefault() {
    }
}

const classifierActions = {
    startNewClassification() {
    },
    setClassifierTestMode() {
    }
}

const task = {
    question: 'Do you like this question?',
    answers: [
        {label: 'Yes'},
        {label: 'No'},
        {label: 'Maybe - I have to think about it'},
    ]
}

const workflow = {
    first_task: 'T0',
    tasks: {
        T0: task
    },
    configuration: {
        pan_and_zoom: true
    }
}

// class TestQuestionClassifier extends QuestionClassifier {
//
const initialState = {
    task: task,
    answers: getAnswersFromWorkflow(workflow),
    classifier: {
        isSuccess: true,
        isFailure: false,
        isFetching: false,
        annotations: {},
        guide: {},
        tutorial: {},
        needsTutorial: false,
        subject: {},
        subjectsSeenThisSession: []
    }
}

it('maps state to props', () => {
    expect(mapStateToProps(initialState, {}).isSuccess).toEqual(true);
})

it('renders', () => {
    // const tree = renderer.create(
    //     <Provider store={store}>
    //         <QuestionClassifier
    //             task={task}
    //             isFetching={false}
    //             setIsFetching={jest.fn}
    //             startNewClassification={jest.fn}
    //             saveClassification={jest.fn}
    //             saveAnnotation={jest.fn}
    //             project={project}
    //             workflow={workflow}
    //             workflowID={'1'}
    //             subject={subject}
    //             subjectSizes={subjectSizes}
    //             seenThisSession={seenThisSession}
    //             navBarActions={navBarActions}
    //             classifierActions={classifierActions}
    //         />
    //     </Provider>
    // )
    // console.log(tree);
    // console.log(tree.root.findByType(AnswerButton))
})


