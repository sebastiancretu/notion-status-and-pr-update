/* eslint-disable @typescript-eslint/no-explicit-any */
import { setFailed } from '@actions/core';
import { transform, isPlainObject, isEmpty } from 'lodash';
import 'dotenv/config';
/**
 * Gets all URL's from a string between two preset delimiters
 *
 * @param {{ body: string left_delimiter?: string | undefined right_delimiter?: string | undefined }} { body, left_delimiter, right_delimiter, }
 * @returns {URL[]}
 * @exports
 */
export const getUrlsFromString = ({
  body,
  left_delimiter,
  right_delimiter,
}: {
  body: string;
  left_delimiter: string;
  right_delimiter: string;
}): URL[] => {
  let startIndex = 0,
    index: number | undefined;
  const urls: URL[] = [];
  while ((index = body.indexOf(left_delimiter, startIndex)) > -1) {
    startIndex = index + 1;
    try {
      const url = new URL(
        body.substring(
          index + left_delimiter.length,
          body.indexOf(right_delimiter, index)
        )
      );
      if (url.host.includes('notion')) {
        urls.push(url);
      }
    } catch (error) {
      continue;
    }
  }
  return urls;
};

/**
 * Takes in an array of URLs and returns an array of notion page IDs.
 * Supported URL types:
 * https://www.notion.so/xxxxxxx/3d9878311a5a421b80f2ccb905863bc2
 * https://www.notion.so/xxxxxxx/d6a3b91207c249cfb68bbc23f46cc412?v=408aaa18e9744cd0932040f6071c78f5&p=3d9878311a5a421b80f2ccb905863bc2&pm=s
 * https://www.notion.so/chargetrip/Lorem-Ipsum-is-simply-dummy-text-of-the-printing-3d9878311a5a421b80f2ccb905863bc2
 *
 * @exports
 */
export const getPageIds = (urls: URL[]) =>
  urls
    .map(
      (url) =>
        new URLSearchParams(url.searchParams).get('p') ||
        url.pathname.match(/\b[0-9a-f]{32}\b/g)?.pop()
    )
    .filter(Boolean) as string[];

export const parseJson = (string: string) => {
  try {
    return JSON.parse(string);
  } catch (error) {
    setFailed(`${string} is an invalid json format`);
  }
  return;
};

/**
 * Clean an object of emptyArrays, emptyObjects, emptyStrings, NaNValues, nullValues or undefinedValues
 * @param o
 * @param param1
 * @returns
 */
export const clean = <T>(
  o: T,
  {
    cleanKeys = [],
    cleanValues = [],
    emptyArrays = true,
    emptyObjects = true,
    emptyStrings = true,
    NaNValues = true,
    nullValues = true,
    undefinedValues = true,
  }: {
    cleanKeys?: Array<string | number>;
    cleanValues?: any[];
    emptyArrays?: boolean;
    emptyObjects?: boolean;
    emptyStrings?: boolean;
    NaNValues?: boolean;
    nullValues?: boolean;
    undefinedValues?: boolean;
  } = {}
): any => {
  return transform(o as any, (result, value, key) => {
    // Exclude specific keys.
    if (cleanKeys.includes(key)) {
      return;
    }

    // Recurse into arrays and objects.
    if (Array.isArray(value) || isPlainObject(value)) {
      value = clean(value, {
        NaNValues,
        cleanKeys,
        cleanValues,
        emptyArrays,
        emptyObjects,
        emptyStrings,
        nullValues,
        undefinedValues,
      });
    }

    // Exclude specific values.
    if (cleanValues.includes(value)) {
      return;
    }

    // Exclude empty objects.
    if (emptyObjects && isPlainObject(value) && isEmpty(value)) {
      return;
    }

    // Exclude empty arrays.
    if (emptyArrays && Array.isArray(value) && !value.length) {
      return;
    }

    // Exclude empty strings.
    if (emptyStrings && value === '') {
      return;
    }

    // Exclude NaN values.
    if (NaNValues && Number.isNaN(value)) {
      return;
    }

    // Exclude null values.
    if (nullValues && value === null) {
      return;
    }

    // Exclude undefined values.
    if (undefinedValues && value === undefined) {
      return;
    }

    // Append when recursing arrays.
    if (Array.isArray(result)) {
      return result.push(value);
    }
    result[key] = value;
  });
};

export function mockFunction<T extends (...args: any[]) => any>(
  fn: T
): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

export function assertNoPropsUndefined<T extends object>(
  obj: T
): asserts obj is { [K in keyof T]: Exclude<T[K], null> } {
  Object.entries(obj).forEach(([k, v]) => {
    if (!v) setFailed(`Missing value for property ${k}`);
  });
}

export function setInput(name, value): void {
  process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value;
}
