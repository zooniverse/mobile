import _ from 'lodash';

export const getDataForFeedbackModal = (subject, workflow, answerSelected) => {
  const rules = generateRules(subject, workflow);
  if (
    Array.isArray(rules[workflow?.first_task]) &&
    rules[workflow?.first_task].length === 1
  ) {
    const rulesFirstTask = rules[workflow?.first_task][0];

    const guessCorrect = checkAnswer(rulesFirstTask, answerSelected);
    const modalData = {
      show: true,
      feedbackMeta: rules,
    };
    if (guessCorrect === true) {
      return {
        ...modalData,
        correct: true,
        message: rulesFirstTask?.successMessage,
      };
    } else if (guessCorrect === false) {
      return {
        ...modalData,
        correct: false,
        message: rulesFirstTask?.failureMessage,
      };
    }
  }

  return null;
};

/**
 * The logic/code is copied from the web app but might be organized differently to accomodate mobile code.
 * Also note that right now feedback is only on single-answer question tasks but the code is setup to
 * handle different workflows in the future if needed.
 */
export function isFeedbackActive(project, subject, workflow) {
  return Boolean(
    getProjectFeedback(project) &&
      getSubjectFeedback(subject) &&
      getWorkflowFeedback(workflow)
  );
}

function getProjectFeedback(project) {
  return (
    project &&
    project.experimental_tools &&
    project.experimental_tools.includes('general feedback')
  );
}

function getSubjectFeedback(subject) {
  return subject && metadataToRules(subject.metadata).length > 0;
}

function getWorkflowFeedback(workflow) {
  const taskFeedback = getFeedbackFromTasks(workflow.tasks);
  return Object.keys(taskFeedback).length > 0;
}

// Converts a subject metadata object into an array of feedback objects
function metadataToRules(metadata = {}) {
  const metadataKeys = Object.keys(metadata);
  const rules = metadataKeys.reduce((result, key) => {
    const [prefix, ruleIndex, propKey] = key.split('_');
    const value = metadata[key];
    const stringValue =
      value !== null && value !== undefined ? value.toString() : '';

    if (prefix === '#feedback' && stringValue) {
      if (isNaN(ruleIndex)) {
        console.error(
          `Subject metadata feedback rule index ${ruleIndex} is improperly formatted. The feedback rule index should be an integer.`
        );
      }
      const rule = result[ruleIndex] || {};
      rule[propKey] = value;
      result[ruleIndex] = rule;
    }

    return result;
  }, []);

  return rules.filter(Boolean);
}

// Filters a workflow's tasks object to an object of `taskId: [feedback rules]` pairs
function getFeedbackFromTasks(tasks) {
  return _.reduce(
    tasks,
    (result, task, taskId) => {
      if (
        _.get(task, 'feedback.enabled', false) &&
        _.get(task, 'feedback.rules', []).length > 0
      ) {
        return _.assign({}, result, {
          [taskId]: task.feedback.rules,
        });
      } else {
        return result;
      }
    },
    {}
  );
}

export function generateRules(subject, workflow) {
  const subjectRules = metadataToRules(subject.metadata);
  const workflowRules = getFeedbackFromTasks(workflow.tasks);
  const canonicalRules = {};

  _.forEach(workflowRules, (rules, taskId) => {
    const taskRules = _.reduce(
      rules,
      (result, workflowRule) => {
        const matchingSubjectRule = _.find(
          subjectRules,
          (subjectRule) =>
            subjectRule.id.toString() === workflowRule.id.toString()
        );

        if (matchingSubjectRule) {
          const ruleStrategy = workflowRule.strategy;
          const generatedRule = createRule(
            ruleStrategy,
            matchingSubjectRule,
            workflowRule
          );
          return result.concat([generatedRule]);
        } else {
          return result;
        }
      },
      []
    );

    if (taskRules.length) {
      canonicalRules[taskId] = taskRules;
    }
  });

  return canonicalRules;
}

// Right now this should only work on single-answer question tasks.
const createRule = (ruleStrategy, matchingSubjectRule, workflowRule) => {
  switch (ruleStrategy) {
    case 'singleAnswerQuestion':
      return singleAnswerQuestionRule(matchingSubjectRule, workflowRule);
    default: {
      return {};
    }
  }
};

export const checkAnswer = (rule, answer) => {
  switch (rule?.strategy) {
    case 'singleAnswerQuestion':
      return singleAnswerCheckAnswer(rule, answer);
    default: {
      return null;
    }
  }
};

const singleAnswerCheckAnswer = (rule, answer) => {
  const answerId = answer > -1 && answer !== null ? answer : -1;
  return rule.answer === answerId.toString();
};

const singleAnswerQuestionRule = (subjectRule, workflowRule) => {
  const rule = {
    answer: subjectRule.answer,
    failureEnabled: workflowRule.failureEnabled || false,
    id: subjectRule.id,
    strategy: workflowRule.strategy,
    successEnabled: workflowRule.successEnabled || false,
  };

  if (rule.failureEnabled) {
    rule.failureMessage =
      subjectRule.failureMessage || workflowRule.defaultFailureMessage;
  }

  if (rule.successEnabled) {
    rule.successMessage =
      subjectRule.successMessage || workflowRule.defaultSuccessMessage;
  }

  return ruleChecker(rule);
};

// Checks a canonical rule for validity, and return an array of errors
// containing any missing properties. Used by the strategy `createRule`
// functions.
function validateRuleProperties(rule) {
  return _.reduce(
    rule,
    (errors, value, key) => {
      if (_.isFinite(value)) {
        return errors;
      } else if (_.isBoolean(value)) {
        return errors;
      } else if (_.isUndefined(value) || _.isEmpty(value)) {
        return errors.concat([key]);
      } else {
        return errors;
      }
    },
    []
  );
}

function ruleChecker(rule) {
  const ruleErrors = validateRuleProperties(rule);

  if (ruleErrors.length === 0) {
    return rule;
  } else {
    const errors = ruleErrors.join(', ');
    console.error(
      'Undefined property %s in rule %s, skipping...',
      errors,
      rule.id
    );
    return {};
  }
}
