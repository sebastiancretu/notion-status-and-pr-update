import { setFailed } from '@actions/core';
import { StatusPropertyItemObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import env from './config';
import getInputs from './github';
import {
  getPage,
  addPullRequestPage,
  updatePage,
  getPullRequestPage,
  updatePullRequestPage,
} from './notion';
import { updatePagePayload } from './payload';
import { getUrlsFromString, getPageIds, clean } from './utils';

const SupportedType = {
  url: 'url',
  relation: 'relation',
};

type PropertyResponse = {
  type: string;
  relation?: Array<{
    id: string;
  }>;
  url?: string;
  id: string;
};

const { inputs, pull_request } = getInputs();

const run = async (): Promise<void> => {
  console.log(inputs.related_status);
  if (inputs.notion_properties.pull_request?.relation && !inputs.related_status)
    return;

  const bodyNotionLinks = getUrlsFromString({
    body: pull_request.body,
    left_delimiter: inputs.left_delimiter,
    right_delimiter: inputs.right_delimiter,
  });

  const pageIds = getPageIds(bodyNotionLinks);

  for (const pageId of pageIds) {
    const page = await getPage(pageId);
    let payload = updatePagePayload({ page_id: pageId });
    const currentPageStatus = page.properties[
      inputs.notion_properties.status.name
    ] as StatusPropertyItemObjectResponse;
    const notionPullRequest = inputs.notion_properties.pull_request;

    if (notionPullRequest?.name) {
      if (!env.DATABASE_PR_ID) {
        setFailed('{{ vars.DATABASE_PR_ID }} variable not set.');
        return;
      }

      const prProperty = page.properties[
        notionPullRequest.name
      ] as PropertyResponse;

      if (prProperty.type === SupportedType.relation) {
        let relation;
        const currentPullRequest = await getPullRequestPage();
        console.log(currentPullRequest, relation);

        if (!currentPullRequest) {
          relation = await addPullRequestPage();
        } else if (currentPullRequest) {
          relation = await updatePullRequestPage(currentPullRequest.id);
        }
        payload = await updatePagePayload({
          page_id: page.id,
          state_id: relation?.id,
        });
      }

      if (prProperty.type === SupportedType.url) {
        payload = await updatePagePayload({
          page_id: page.id,
          url: true,
        });
      }
    }

    const cleanedPayload = clean(payload);

    if (
      inputs.related_status !== currentPageStatus.status?.name ||
      (notionPullRequest?.name &&
        cleanedPayload.properties[notionPullRequest.name])
    ) {
      await updatePage(cleanedPayload);
    }
  }
};

export default run();
