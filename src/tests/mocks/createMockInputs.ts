import { WorkflowInput } from '../../github';

const defaultPullRequest = {
  pull_request: {
    href: 'https://github.com/xxxxx/pull/11',
    body: 'Lorem Ipsum is simply dummy text of [notion ticket](https://www.notion.so/sample/93a37ade33c44a8a9970a9d70c800d38?v=a6e53baea5c2294186465e5b6e567bc4&p=6fb007c7595b4034aadc0f3bdf77c2f0&pm=s)the printing and typesetting [industry](https://www.google.com). Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    number: 1,
    state: 'draft',
    title: 'Lorem ipsum title',
  },
};

const defaultNotionProperties = {
  status: {
    name: 'Status',
  },
  pull_request: {
    name: 'Pull Request',
    relation: {
      id: 'Number',
      link: 'Link',
      state: 'State',
      title: 'Title',
    },
  },
  url: { name: 'PR' },
};

const defaultNotionInputs = {
  inputs: {
    right_delimiter: '](',
    left_delimiter: ')',
    related_status: 'In review',
    notion_properties: defaultNotionProperties,
  },
  pull_request: defaultPullRequest,
};

const createMockInputs = (overwrites: Partial<WorkflowInput> = {}) => ({
  ...defaultNotionInputs,
  ...defaultPullRequest,
  ...overwrites,
});

export { createMockInputs };
