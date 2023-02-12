import core from '@actions/core';
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
import { updateIssuePagePayload } from './payload';
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

const inputs = getInputs();

const run = async (): Promise<void> => {
  if (!inputs.notion.status) {
    return;
  }
  const bodyPages = getUrlsFromString({
    body: inputs.pull_request?.body,
    left_delimiter: inputs.left_delimiter,
    right_delimiter: inputs.right_delimiter,
  });
  const pageIds = getPageIds(bodyPages);
  for (const pageId of pageIds) {
    const page = await getPage(pageId);
    let payload = updateIssuePagePayload({ page_id: pageId });
    const currentPageStatus = page.properties[
      inputs.notion?.status_property
    ] as StatusPropertyItemObjectResponse;

    if (inputs.notion?.pr_property_name) {
      if (!env.DATABASE_PR_ID) {
        core.setFailed('{{ vars.DATABASE_RELATION_ID }} variable not set.');
        return;
      }

      const prProperty = page.properties[
        inputs.notion.pr_property_name
      ] as PropertyResponse;

      if (prProperty.type === SupportedType.relation) {
        let relation;
        const currentPullRequest = await getPullRequestPage();
        if (!currentPullRequest) {
          relation = await addPullRequestPage();
        } else if (currentPullRequest) {
          relation = await updatePullRequestPage(currentPullRequest.id);
        }

        payload = await updateIssuePagePayload({
          page_id: page.id,
          state_id: relation?.id,
        });
      }

      if (prProperty.type === SupportedType.url) {
        payload = await updateIssuePagePayload({
          page_id: page.id,
          url: true,
        });
      }
    }

    const cleanedPayload = clean(payload);

    if (
      inputs.notion.status !== currentPageStatus.status?.name ||
      (inputs.notion?.pr_property_name &&
        cleanedPayload.properties[inputs.notion?.pr_property_name])
    ) {
      await updatePage(cleanedPayload);
    }
  }
};

export default run();
