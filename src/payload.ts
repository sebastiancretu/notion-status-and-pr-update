import {
  CreatePageParameters,
  QueryDatabaseParameters,
  UpdatePageParameters,
} from '@notionhq/client/build/src/api-endpoints';

import env from './config';
import { getInputs, getPullRequest } from './github';
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
  const { notion_properties } = getInputs();

  if (!notion_properties.pull_request?.relation?.state) return;

  return clean({
    page_id: pageId,
    icon: {
      external: {
        url: 'https://cdn.simpleicons.org/github/8B949E',
      },
    },
    properties: {
      [notion_properties.pull_request.relation.state]: {
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
  const { page_status, notion_properties } = getInputs();
  const { href } = getPullRequest();

  if (!page_status && !state_id && !url) return;

  const payload = clean({
    page_id,
    properties: {
      [notion_properties.status.name]: {
        status: {
          name: page_status,
        },
      },
      ...(notion_properties.pull_request && {
        [notion_properties.pull_request.name]: {
          ...(state_id && {
            relation: [{ id: state_id }],
          }),
          ...(url && {
            url: href,
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
  const { notion_properties } = getInputs();
  const { title, number, href } = getPullRequest();
  const pullRequestRelationProperty = notion_properties.pull_request?.relation;

  if (!env.DATABASE_PR_ID || !pullRequestRelationProperty) {
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
      [pullRequestRelationProperty.title]: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      [pullRequestRelationProperty.id]: {
        number: number,
      },
      [pullRequestRelationProperty.link]: {
        url: href,
      },
      [pullRequestRelationProperty.state]: {
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
  const { notion_properties } = getInputs();
  const { number } = getPullRequest();
  const stateColumnId = notion_properties.pull_request?.relation?.id;

  if (!env.DATABASE_PR_ID || !stateColumnId || !number) {
    return;
  }

  return clean({
    database_id: env.DATABASE_PR_ID,
    filter: {
      and: [
        {
          property: stateColumnId,
          number: {
            equals: number,
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
  const { notion_properties } = getInputs();
  const { state } = getPullRequest();
  const eventTypeColumn = notion_properties.pull_request_state?.event_type;

  if (!env.DATABASE_PR_STATE_ID || !state || !eventTypeColumn) {
    return;
  }
  return clean({
    database_id: env.DATABASE_PR_STATE_ID,
    filter: {
      and: [
        {
          property: eventTypeColumn,
          title: {
            equals: state,
          },
        },
      ],
    },
  } as QueryDatabaseParameters);
};
