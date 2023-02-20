import * as github from '@actions/github';

import env from '../config';
import {
  addPullRequestPayload,
  getPullRequestPayload,
  getPullRequestStatePayload,
  updatePagePayload,
  updatePullRequestPayload,
} from '../payload';
import { setInput } from '../utils';

const originalContext = { ...github.context };

describe('payload', () => {
  beforeAll(() => {
    setInput('right_delimiter', ')');
    setInput('left_delimiter', '](');
    env.DATABASE_PR_ID = 'test';
    env.DATABASE_PR_STATE_ID = 'test';
  });

  beforeEach(() => {
    // env.DATABASE_PR_ID = 'test';
    // env.DATABASE_PR_STATE_ID = 'test';
    // setInput('right_delimiter', ')');
    // setInput('left_delimiter', '](');
    // setInput(
    //   'notion_properties',
    //   '{ "status":{ "name":"Notion Status" }, "pull_request":{ "name":"Pull Request", "relation":{ "id":"Number", "link":"Link", "state":"State", "title":"Title" } }, "pull_request_state":{ "name":"Name", "event_type":"Event" } }'
    // );
    // setInput('opened', 'Code Review');
    // setInput('ready_for_review', 'Code Review');
    // setInput('closed', 'Completed');
    // setInput('merged', 'Completed');
    // Object.defineProperty(github, 'context', {
    //   value: {
    //     payload: {
    //       action: 'closed',
    //       pull_request: {
    //         merged: false,
    //         draft: false,
    //         body: 'description body',
    //         html_url: 'https://github.com/actions/checkout/pull/1180',
    //         number: 1180,
    //         title: 'Add Ref and Commit outputs',
    //       },
    //     },
    //   },
    // });
  });

  afterEach(() => {
    // Restore original @actions/github context
    Object.defineProperty(github, 'context', {
      value: originalContext,
    });
  });

  describe('updatePagePayload', () => {
    it('should set url for Page', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" },"pull_request":{ "name":"Pull Request" } }'
      );
      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            pull_request: {
              html_url: 'https://github.com/actions/checkout/pull/1180',
            },
          },
        },
      });
      const result = updatePagePayload({ page_id: '1', url: true });
      expect(result).toEqual({
        page_id: '1',
        properties: {
          'Pull Request': {
            url: 'https://github.com/actions/checkout/pull/1180',
          },
        },
      });
    });

    it('should set relation for Page', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" },"pull_request":{ "name":"Pull Request" } }'
      );

      const result = updatePagePayload({ page_id: '1', state_id: '2' });
      expect(result).toEqual({
        page_id: '1',
        properties: { 'Pull Request': { relation: [{ id: '2' }] } },
      });
    });

    it('should set status and relation for Page', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" },"pull_request":{ "name":"Pull Request" } }'
      );
      setInput('closed', 'Completed');
      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            action: 'closed',
          },
        },
      });
      const result = updatePagePayload({ page_id: '1', state_id: '2' });
      expect(result).toEqual({
        page_id: '1',
        properties: {
          'Notion Status': { status: { name: 'Completed' } },
          'Pull Request': { relation: [{ id: '2' }] },
        },
      });
    });

    it('should set status and url for Page', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" },"pull_request":{ "name":"Pull Request" } }'
      );
      setInput('closed', 'Completed');
      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            action: 'closed',
            pull_request: {
              html_url: 'https://github.com/actions/checkout/pull/1180',
            },
          },
        },
      });
      const result = updatePagePayload({ page_id: '1' });
      expect(result).toEqual({
        page_id: '1',
        properties: { 'Notion Status': { status: { name: 'Completed' } } },
      });
    });

    it('should be undefined', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" },"pull_request":{ "name":"Pull Request" } }'
      );
      setInput('closed', 'Completed');
      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            action: 'open',
            pull_request: {
              html_url: 'https://github.com/actions/checkout/pull/1180',
            },
          },
        },
      });
      const result = updatePagePayload({ page_id: '1' });
      expect(result).toBeUndefined();
    });
  });
  describe('addPullRequestPayload', () => {
    it('should have all properties', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" }, "pull_request":{ "name":"Pull Request", "relation":{ "id":"Number", "link":"Link", "state":"State", "title":"Title" } } }'
      );
      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            pull_request: {
              body: 'description body',
              html_url: 'https://github.com/actions/checkout/pull/1180',
              number: 1180,
              title: 'Add Ref and Commit outputs',
            },
          },
        },
      });
      const result = addPullRequestPayload('121');
      expect(result).toEqual({
        parent: { database_id: 'test' },
        icon: {
          external: { url: 'https://cdn.simpleicons.org/github/8B949E' },
        },
        properties: {
          Title: {
            title: [{ text: { content: 'Add Ref and Commit outputs' } }],
          },
          Number: { number: 1180 },
          Link: { url: 'https://github.com/actions/checkout/pull/1180' },
          State: { relation: [{ id: '121' }] },
        },
      });
    });
  });

  describe('getPullRequestPayload', () => {
    it('should set filtering', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" }, "pull_request":{ "name":"Pull Request", "relation":{ "id":"Number", "link":"Link", "state":"State", "title":"Title" } } }'
      );
      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            pull_request: {
              number: 1180,
            },
          },
        },
      });
      const result = getPullRequestPayload();
      expect(result).toEqual({
        database_id: 'test',
        filter: { and: [{ property: 'Number', number: { equals: 1180 } }] },
      });
    });

    it('should be undefined when no relation', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" }, "pull_request":{ "name":"Pull Request" } }'
      );
      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            pull_request: {
              number: 1180,
            },
          },
        },
      });
      const result = getPullRequestPayload();
      expect(result).toBeUndefined();
    });

    it('should be undefined when no number', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" }, "pull_request":{ "name":"Pull Request", "relation":{ "id":"Number", "link":"Link", "state":"State", "title":"Title" } } }'
      );
      const result = getPullRequestPayload();
      expect(result).toBeUndefined();
    });
  });

  describe('getPullRequestStatePayload', () => {
    it('should set filtering', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" }, "pull_request":{ "name":"Pull Request", "relation":{ "id":"Number", "link":"Link", "state":"State", "title":"Title" } }, "pull_request_state":{ "name":"Name", "event_type":"Event" } }'
      );
      setInput('closed', 'Completed');
      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            action: 'closed',
          },
        },
      });
      const result = getPullRequestStatePayload();
      expect(result).toEqual({
        database_id: 'test',
        filter: { and: [{ property: 'Event', title: { equals: 'closed' } }] },
      });
    });

    it('should be undefined when no state on pull request', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" }, "pull_request":{ "name":"Pull Request", "relation":{ "id":"Number", "link":"Link", "state":"State", "title":"Title" } }, "pull_request_state":{ "name":"Name", "event_type":"Event" } }'
      );
      setInput('closed', 'Completed');
      Object.defineProperty(github, 'context', {
        value: {
          payload: {},
        },
      });
      const result = getPullRequestStatePayload();
      expect(result).toBeUndefined();
    });
  });
  describe('updatePullRequestPayload', () => {
    it('should be undefined when property name not set', () => {
      setInput('notion_properties', '{ "status":{ "name":"Notion Status" } }');
      const result = updatePullRequestPayload('121', '22');
      expect(result).toBeUndefined();
    });

    it('should have relation to state database', () => {
      setInput(
        'notion_properties',
        '{ "status":{ "name":"Notion Status" }, "pull_request":{ "name":"Pull Request", "relation":{ "id":"Number", "link":"Link", "state":"State", "title":"Title" } }, "pull_request_state":{ "name":"Name", "event_type":"Event" } }'
      );
      const result = updatePullRequestPayload('121', '22');
      expect(result).toEqual({
        page_id: '121',
        icon: {
          external: { url: 'https://cdn.simpleicons.org/github/8B949E' },
        },
        properties: { State: { relation: [{ id: '22' }] } },
      });
    });
  });
});
