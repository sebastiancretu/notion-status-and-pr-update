"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJson = exports.getPageIds = exports.getUrlsFromString = void 0;
const core_1 = __importDefault(require("@actions/core"));
/**
 * Gets all URL's from a string between two preset delimiters
 *
 * @param {{ body: string left_delimiter?: string | undefined right_delimiter?: string | undefined }} { body, left_delimiter, right_delimiter, }
 * @returns {URL[]}
 * @exports
 */
const getUrlsFromString = ({ body, left_delimiter, right_delimiter, }) => {
    let startIndex = 0, index;
    const urls = [];
    while ((index = body.indexOf(left_delimiter, startIndex)) > -1) {
        startIndex = index + 1;
        try {
            const url = new URL(body.substring(index + left_delimiter.length, body.indexOf(right_delimiter, index)));
            if (url.host.includes('notion')) {
                urls.push(url);
            }
        }
        catch (error) {
            continue;
        }
    }
    return urls;
};
exports.getUrlsFromString = getUrlsFromString;
/**
 * Takes in an array of URLs and returns an array of notion page IDs.
 * Supported URL types:
 * https://www.notion.so/xxxxxxx/3d9878311a5a421b80f2ccb905863bc2
 * https://www.notion.so/xxxxxxx/d6a3b91207c249cfb68bbc23f46cc412?v=408aaa18e9744cd0932040f6071c78f5&p=3d9878311a5a421b80f2ccb905863bc2&pm=s
 * https://www.notion.so/chargetrip/Lorem-Ipsum-is-simply-dummy-text-of-the-printing-3d9878311a5a421b80f2ccb905863bc2
 *
 * @exports
 */
const getPageIds = (urls) => urls
    .map((url) => new URLSearchParams(url.searchParams).get('p') ||
    url.pathname.match(/\b[0-9a-f]{32}\b/g)?.pop())
    .filter(Boolean);
exports.getPageIds = getPageIds;
const parseJson = (string) => {
    try {
        return JSON.parse(string);
    }
    catch (error) {
        core_1.default.setFailed(`${string} is an invalid json format`);
    }
    return;
};
exports.parseJson = parseJson;
