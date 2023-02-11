import {
  CreatePageParameters,
  QueryDatabaseParameters,
  UpdatePageParameters,
} from '@notionhq/client/build/src/api-endpoints';

import env from './config';
import getInputs from './github';

const inputs = getInputs();

/**
 * Payload for updating page from the Pull Request database.
 *
 * @param {string} pageId
 * @param {string} stateId
 * @returns {UpdatePageParameters}
 * @exports
 */
export const updatePRPagePayload = (pageId: string, stateId: string) =>
  ({
    page_id: pageId,
    icon: {
      external: {
        url: 'https://cdn.simpleicons.org/github/8B949E',
      },
    },
    properties: {
      ...(pageId && {
        State: {
          relation: [{ id: stateId }],
        },
      }),
    },
  } as UpdatePageParameters);

/**
 * Payload for updating an existing issue/page
 *
 * @name updateIssuePagePayload
 * @param {{ page_id: string state_id?: string | undefined url?: boolean | undefined }} { page_id, state_id, url, }
 * @returns {{ page_id: string; properties: { [x: string]: { status: { name: string | undefined; }; } | { url?: string | undefined; relation?: { ...; }[] | undefined; status?: undefined; }; }; }}
 * @exports
 */
export const updateIssuePagePayload = ({
  page_id,
  state_id,
  url,
}: {
  page_id: string;
  state_id?: string;
  url?: boolean;
}) => ({
  page_id,
  properties: {
    ...(inputs.notion?.status_property && {
      [inputs.notion.status_property]: {
        status: {
          name: inputs.notion?.status,
        },
      },
    }),
    ...(inputs.notion?.pr_property_name && {
      [inputs.notion.pr_property_name]: {
        ...(state_id && {
          relation: [{ id: state_id }],
        }),
        ...(url && {
          url: inputs.pull_request?.href,
        }),
      },
    }),
  },
});

/**
 * Payload for creating a new page in Pull Request database.
 *
 * @param {string} stateId
 * @returns {CreatePageBodyParameters}
 * @exports
 */
export const addPullRequestPayload = (stateId: string) =>
  ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parent: { database_id: env.DATABASE_PR_ID! },
    icon: {
      external: {
        url: 'https://cdn.simpleicons.org/github/8B949E',
      },
    },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: inputs.pull_request?.title,
            },
          },
        ],
      },
      Number: {
        number: inputs.pull_request?.number,
      },
      Link: {
        url: inputs.pull_request?.href,
      },
      ...(stateId && {
        State: {
          relation: [{ id: stateId }],
        },
      }),
    },
  } as CreatePageParameters);

/**
 * Payload to return pages from Pull Request database
 *
 * @returns {QueryDatabaseParameters}
 * @exports
 */
export const getPullRequestPayload = () =>
  ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    database_id: env.DATABASE_PR_ID!,
    filter: {
      and: [
        {
          property: inputs.notion?.pr_id_column_name,
          number: {
            equals: inputs.pull_request?.number,
          },
        },
      ],
    },
  } as QueryDatabaseParameters);

/**
 * Payload to return pages from Pull Request States database
 *
 * @returns {QueryDatabaseParameters}
 * @exports
 */
export const getPullRequestStatePayload = () =>
  ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    database_id: env.DATABASE_PR_STATE_ID!,
    filter: {
      and: [
        {
          property: inputs.notion?.pr_state_column_name,
          title: {
            equals: inputs.pull_request?.state,
          },
        },
      ],
    },
  } as QueryDatabaseParameters);
