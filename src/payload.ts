import {
  CreatePageParameters,
  QueryDatabaseParameters,
  UpdatePageParameters,
} from '@notionhq/client/build/src/api-endpoints';

import env from './config';
import getInputs from './github';
import { clean } from './utils';

/**
 * Payload for updating page from the Pull Request database.
 *
 * @param {string} pageId
 * @param {string} stateId
 * @returns {UpdatePageParameters}
 * @exports
 */
export const updatePullRequestPayload = (pageId: string, stateId: string) => {
  const { inputs } = getInputs();
  const notionPullRequest = inputs.notion_properties.pull_request;

  if (!notionPullRequest?.name) return;

  return clean({
    page_id: pageId,
    icon: {
      external: {
        url: 'https://cdn.simpleicons.org/github/8B949E',
      },
    },
    properties: {
      [notionPullRequest.name]: {
        relation: [{ id: stateId }],
      },
    },
  } as UpdatePageParameters);
};

/**
 * Payload for updating an existing issue/page
 *
 * @name updateIssuePagePayload
 * @param {{ page_id: string state_id?: string | undefined url?: boolean | undefined }} { page_id, state_id, url, }
 * @returns {{ page_id: string; properties: { [x: string]: { status: { name: string | undefined; }; } | { url?: string | undefined; relation?: { ...; }[] | undefined; status?: undefined; }; }; }}
 * @exports
 */
export const updatePagePayload = ({
  page_id,
  state_id,
  url,
}: {
  page_id: string;
  state_id?: string;
  url?: boolean;
}) => {
  const { inputs, pull_request } = getInputs();
  const notionPullRequest = inputs.notion_properties.pull_request;

  if (!inputs.related_status && !state_id && !url) return;

  const payload = clean({
    page_id,
    properties: {
      [inputs.notion_properties.status.name]: {
        status: {
          name: inputs.related_status,
        },
      },
      ...(notionPullRequest && {
        [notionPullRequest.name]: {
          ...(state_id && {
            relation: [{ id: state_id }],
          }),
          ...(url && {
            url: pull_request.href,
          }),
        },
      }),
    },
  });

  return payload;
};

/**
 * Payload for creating a new page in Pull Request database.
 *
 * @param {string} stateId
 * @returns {CreatePageBodyParameters}
 * @exports
 */
export const addPullRequestPayload = (stateId: string) => {
  const { inputs, pull_request } = getInputs();
  const notionPullRequest = inputs.notion_properties.pull_request?.relation;

  if (!env.DATABASE_PR_ID || !notionPullRequest) {
    return;
  }

  return clean({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parent: { database_id: env.DATABASE_PR_ID },
    icon: {
      external: {
        url: 'https://cdn.simpleicons.org/github/8B949E',
      },
    },
    properties: {
      [notionPullRequest.title]: {
        title: [
          {
            text: {
              content: pull_request.title,
            },
          },
        ],
      },
      [notionPullRequest.id]: {
        number: pull_request.number,
      },
      [notionPullRequest.link]: {
        url: pull_request.href,
      },
      [notionPullRequest.state]: {
        relation: [{ id: stateId }],
      },
    },
  } as CreatePageParameters);
};

/**
 * Payload to return pages from Pull Request database
 *
 * @returns {QueryDatabaseParameters}
 * @exports
 */
export const getPullRequestPayload = () => {
  const { inputs, pull_request } = getInputs();
  const stateColumnId = inputs.notion_properties.pull_request?.relation?.id;

  if (!env.DATABASE_PR_ID || !stateColumnId || !pull_request.number) {
    return;
  }

  return clean({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    database_id: env.DATABASE_PR_ID,
    filter: {
      and: [
        {
          property: stateColumnId,
          number: {
            equals: pull_request.number,
          },
        },
      ],
    },
  } as QueryDatabaseParameters);
};

/**
 * Payload to return pages from Pull Request States database
 *
 * @returns {QueryDatabaseParameters}
 * @exports
 */
export const getPullRequestStatePayload = () => {
  const { pull_request } = getInputs();

  if (!env.DATABASE_PR_STATE_ID || !pull_request?.state) {
    return;
  }
  return clean({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    database_id: env.DATABASE_PR_STATE_ID,
    filter: {
      and: [
        {
          property: 'Name',
          title: {
            equals: pull_request?.state,
          },
        },
      ],
    },
  } as QueryDatabaseParameters);
};
