import core from '@actions/core';
import github from '@actions/github';

interface Inputs {
  readonly right_delimiter: string;
  readonly left_delimiter: string;
  readonly notion: NotionProperties;
  readonly pull_request: PullRequest;
}

interface PullRequest {
  readonly body: string;
  readonly href?: string;
  readonly state?: string;
  readonly number?: number;
  readonly title?: string;
}
interface NotionProperties {
  readonly status_property: string;
  readonly pr_property_name?: string;
  readonly pr_id_column_name?: string;
  readonly pr_state_column_name?: string;
  readonly status?: string;
}

/**
 * Create an object with all the values set on github workflow
 *
 * @returns {Inputs}
 */
const getInputs = (): Inputs => {
  const pullRequest = github.context.payload.pull_request;
  const state = pullRequest?.merged
    ? 'merged'
    : pullRequest?.draft
    ? 'draft'
    : github.context.payload.action;
  return {
    right_delimiter: core.getInput('right_delimiter', { required: true }),
    left_delimiter: core.getInput('left_delimiter', { required: true }),
    notion: {
      status_property: core.getInput('notion_status_property', {
        required: true,
      }),
      pr_property_name: core.getInput('notion_pr_property_name', {
        required: false,
      }),
      pr_id_column_name: core.getInput('notion_pr_id_column_name', {
        required: false,
      }),
      status: state && core.getInput(state, { required: false }),
    },
    pull_request: {
      body: pullRequest?.body ?? '',
      href: pullRequest?.html_url,
      number: Number(pullRequest?.number),
      state,
      title: pullRequest?.title,
    },
  };
};

export default getInputs;
