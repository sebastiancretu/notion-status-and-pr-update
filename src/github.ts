import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';

import { assertNoPropsUndefined, parseJson } from './utils';

interface Inputs {
  readonly right_delimiter: string;
  readonly left_delimiter: string;
  readonly notion_properties: NotionProperties;
  readonly related_status?: string;
}

export interface GithubPullRequest {
  readonly body: string;
  readonly href?: string;
  readonly state?: string;
  readonly number?: number;
  readonly title?: string;
}

interface NotionPullRequestProperty {
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

type NotionProperties = {
  pull_request?: NotionPullRequestProperty;
  status: PropertyName;
};

export type WorkflowInput = {
  inputs: Inputs;
  pull_request: GithubPullRequest;
};

/**
 * Create an object with all the values set on github workflow
 *
 * @returns {WorkflowInput}
 */
const getInputs = (): WorkflowInput => {
  const pullRequest = context.payload.pull_request;

  const state = pullRequest?.merged
    ? 'merged'
    : pullRequest?.draft
    ? 'draft'
    : context.payload.action;
  const notionProperties: NotionProperties = parseJson(
    getInput('notion_properties', { required: true })
  );
  const relatedStatus = state && getInput(state, { required: false });

  if (notionProperties.pull_request) {
    for (const prop of Object.values(notionProperties.pull_request)) {
      assertNoPropsUndefined(prop);
    }

    if (
      notionProperties.pull_request.relation &&
      !Object.values(notionProperties.pull_request.relation).every((v) => v)
    ) {
      setFailed(`All properties of relation should be defined.`);
    }
  }

  return {
    inputs: {
      right_delimiter: getInput('right_delimiter', { required: true }),
      left_delimiter: getInput('left_delimiter', { required: true }),
      related_status: relatedStatus,
      notion_properties: notionProperties,
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
