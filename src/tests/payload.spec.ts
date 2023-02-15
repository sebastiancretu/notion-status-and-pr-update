import env from '../config';
import getInputs from '../github';
import {
  addPullRequestPayload,
  getPullRequestPayload,
  updatePagePayload,
  updatePullRequestPayload,
} from '../payload';
import { mockFunction } from '../utils';

import { createMockInputs } from './mocks/createMockInputs';

jest.mock('../github');

describe('payload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    env.DATABASE_PR_ID = 'test';
    env.DATABASE_PR_STATE_ID = 'test';
  });
  describe('updatePagePayload', () => {
    it('should be undefined', () => {
      const mockedInputs = mockFunction(getInputs);
      mockedInputs.mockImplementationOnce(() =>
        createMockInputs({
          inputs: {
            related_status: undefined,
            right_delimiter: '](',
            left_delimiter: ')',
            notion_properties: {
              status: {
                name: 'Status',
              },
            },
          },
        })
      );

      const result = updatePagePayload({ page_id: '121' });
      expect(result).toBeUndefined();
    });

    it('should set status', () => {
      const mockedInputs = mockFunction(getInputs);
      mockedInputs.mockImplementationOnce(() =>
        createMockInputs({
          inputs: {
            related_status: 'In progress',
            right_delimiter: '](',
            left_delimiter: ')',
            notion_properties: {
              status: {
                name: 'Status',
              },
            },
          },
        })
      );
      const result = updatePagePayload({ page_id: '121' });
      expect(result).toEqual({
        page_id: '121',
        properties: { Status: { status: { name: 'In progress' } } },
      });
    });

    it('should set state', () => {
      const mockedInputs = mockFunction(getInputs);
      mockedInputs.mockImplementationOnce(() => createMockInputs());
      const result = updatePagePayload({ page_id: '121', state_id: '2324' });
      expect(result).toEqual({
        page_id: '121',
        properties: {
          Status: { status: { name: 'In review' } },
          'Pull Request': { relation: [{ id: '2324' }] },
        },
      });
    });

    it('should set url and status', () => {
      const mockedInputs = mockFunction(getInputs);
      mockedInputs.mockImplementationOnce(() => createMockInputs());
      const result = updatePagePayload({
        page_id: '121',
        url: true,
      });
      expect(result).toEqual({
        page_id: '121',
        properties: {
          Status: { status: { name: 'In review' } },
          'Pull Request': { url: 'https://github.com/xxxxx/pull/11' },
        },
      });
    });
  });
  describe('updatePullRequestPayload', () => {
    it('should be undefined', () => {
      const mockedInputs = mockFunction(getInputs);
      mockedInputs.mockImplementationOnce(() =>
        createMockInputs({
          inputs: {
            related_status: 'In progress',
            right_delimiter: '](',
            left_delimiter: ')',
            notion_properties: {
              status: {
                name: '',
              },
            },
          },
        })
      );
      const result = updatePullRequestPayload('121', '2324');
      expect(result).toBeUndefined();
    });

    it('should have payload', () => {
      const mockedInputs = mockFunction(getInputs);
      mockedInputs.mockImplementationOnce(() => createMockInputs());
      const result = updatePullRequestPayload('121', '2324');
      expect(result).toEqual({
        page_id: '121',
        icon: {
          external: { url: 'https://cdn.simpleicons.org/github/8B949E' },
        },
        properties: { 'Pull Request': { relation: [{ id: '2324' }] } },
      });
    });
  });

  describe('addPullRequestPayload', () => {
    it('should be undefined when PR relation column names not defined', () => {
      const mockedInputs = mockFunction(getInputs);
      mockedInputs.mockImplementationOnce(() =>
        createMockInputs({
          inputs: {
            right_delimiter: '](',
            left_delimiter: ')',
            related_status: 'In review',
            notion_properties: {
              status: { name: 'Name' },
              pull_request: { name: 'PR name' },
            },
          },
        })
      );
      const result = addPullRequestPayload('121');
      expect(result).toBeUndefined();
    });

    it('should have payload', () => {
      const mockedInputs = mockFunction(getInputs);
      mockedInputs.mockImplementationOnce(() => createMockInputs());
      const result = addPullRequestPayload('121');
      expect(result).toEqual({
        parent: { database_id: 'test' },
        icon: {
          external: { url: 'https://cdn.simpleicons.org/github/8B949E' },
        },
        properties: {
          Title: { title: [{ text: { content: 'Lorem ipsum title' } }] },
          Number: { number: 1 },
          Link: { url: 'https://github.com/xxxxx/pull/11' },
          State: { relation: [{ id: '121' }] },
        },
      });
    });
  });

  describe('getPullRequestPayload', () => {
    it('should be undefined when PR relation column names not defined', () => {
      const mockedInputs = mockFunction(getInputs);
      mockedInputs.mockImplementationOnce(() =>
        createMockInputs({
          inputs: {
            right_delimiter: '](',
            left_delimiter: ')',
            related_status: 'In review',
            notion_properties: {
              status: { name: 'Name' },
              pull_request: { name: 'PR name' },
            },
          },
        })
      );
      const result = getPullRequestPayload();
      expect(result).toBeUndefined();
    });

    it('should have payload', () => {
      const mockedInputs = mockFunction(getInputs);
      mockedInputs.mockImplementationOnce(() => createMockInputs());
      const result = getPullRequestPayload();
      expect(result).toEqual({
        database_id: 'test',
        filter: { and: [{ property: 'Number', number: { equals: 1 } }] },
      });
    });
  });
});
