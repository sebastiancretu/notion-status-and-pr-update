import { Client } from '@notionhq/client';
import {
  PageObjectResponse,
  UpdatePageResponse,
} from '@notionhq/client/build/src/api-endpoints';

import env from './config';
import {
  getPullRequestPayload,
  addPullRequestPayload,
  updatePullRequestPayload,
  getPullRequestStatePayload,
} from './payload';

const notion = new Client({
  auth: env.NOTION_TOKEN,
});

/**
 * Fetch a notion page
 *
 * @param {string} id
 * @returns {Promise<PageObjectResponse>}
 * @exports
 */
export const getPage = async (id: string) => {
  return (await notion.pages.retrieve({
    page_id: id,
  })) as PageObjectResponse;
};

/**
 * Update a notion page based on payload.
 *
 * @param {any} payload
 * @returns {Promise<UpdatePageResponse>}
 * @exports
 */
export const updatePage = async (payload) => {
  return await notion.pages.update(payload);
};

/**
 * Updating a page from the Pull Requests database.
 *
 * @param {string} pageId
 * @returns {Promise<PartialPageObjectResponse | undefined>}
 * @exports
 */
export const updatePullRequestPage = async (pageId: string) => {
  const stateId = await getPullRequestState();
  if (!stateId) {
    return;
  }
  const payload = updatePullRequestPayload(pageId, stateId);

  return (await notion.pages.update(payload)) as UpdatePageResponse;
};

/**
 * Creating a new page in the Pull Requests database.
 *
 * @returns {Promise<PageObjectResponse | undefined>}
 * @exports
 */
export const addPullRequestPage = async () => {
  const stateId = await getPullRequestState();
  if (!stateId) {
    return;
  }
  const payload = addPullRequestPayload(stateId);

  return (await notion.pages.create(payload)) as PageObjectResponse;
};

/**
 * Fetch a single page from the Pull Requests database.
 *
 * @returns {Promise<PageObjectResponse>}
 * @exports
 */
export const getPullRequestPage = async () => {
  const payload = getPullRequestPayload();

  return await notion.databases
    .query(payload)
    .then((r) => r.results.pop() as PageObjectResponse);
};

/**
 * Fetch a single State from the Pull Request States database.
 *
 * @returns {Promise<string>}
 * @exports
 */
export const getPullRequestState = async () => {
  const payload = getPullRequestStatePayload();
  const statePages = await notion.databases.query(payload);
  const state = statePages.results.pop() as PageObjectResponse;

  return state?.id;
};
