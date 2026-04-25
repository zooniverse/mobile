/**
 * Possible values for `workflow.type` as returned by the Panoptes API.
 * Used by `ClassifierScreen` to dispatch to the right body component
 * in `components/classifier/workflowTypes/`.
 */

const WorkflowTypes = {
  SingleChoice: 'single',
  MultiSelect: 'multiple',
  Drawing: 'drawing',
  Swipe: 'swipe',
}

export default WorkflowTypes
