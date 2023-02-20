import { getInput } from '@actions/core';
import { context } from '@actions/github';

import { parseJson } from './utils';

interface Inputs {
  readonly right_delimiter: string;
  readonly left_delimiter: string;
  readonly notion_properties: NotionProperties;
  readonly page_status?: string;
}

export interface GithubPullRequest {
  readonly body: string;
  readonly href?: string;
  readonly state?: string;
  readonly number?: number;
  readonly title?: string;
}

interface NotionPullRequest {
  readonly name: string;
  readonly relation?: NotionRelationProperty;
}

type NotionRelationProperty = {
  readonly id: string;
  readonly link: string;
  readonly state: string;
  readonly title: string;
};

type PropertyName = {
  name: string;
};

export type NotionProperties = {
  pull_request_state?: NotionPullRequestState;
  pull_request?: NotionPullRequest;
  status: PropertyName;
};

type NotionPullRequestState = { name: string; event_type: string };

const getPullRequest = (): GithubPullRequest => {
  const pullRequest = context.payload.pull_request;
  const state = pullRequest?.merged
    ? 'merged'
    : pullRequest?.draft
    ? 'draft'
    : context.payload.action;

  return {
    body: pullRequest?.body ?? '',
    href: pullRequest?.html_url,
    number: Number(pullRequest?.number),
    state,
    title: pullRequest?.title,
  };
};

/**
 * Create an object with all the values set on github workflow
 *
 * @returns {WorkflowInput}
 */
const getInputs = (): Inputs => {
  const notionProperties: NotionProperties = parseJson(
    getInput('notion_properties', { required: true })
  );
  const pullRequest = getPullRequest();
  const pageStatus =
    pullRequest?.state && getInput(pullRequest.state, { required: false });

  return {
    right_delimiter: getInput('right_delimiter', { required: true }),
    left_delimiter: getInput('left_delimiter', { required: true }),
    page_status: pageStatus,
    notion_properties: notionProperties,
  };
};

export { getInputs, getPullRequest };
