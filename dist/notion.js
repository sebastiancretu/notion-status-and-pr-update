"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPullRequestState = exports.getPullRequestPage = exports.addPullRequestPage = exports.updatePullRequestPage = exports.updatePage = exports.getPage = void 0;
const client_1 = require("@notionhq/client");
const config_1 = __importDefault(require("./config"));
const payload_1 = require("./payload");
const notion = new client_1.Client({
    auth: config_1.default.NOTION_TOKEN,
});
/**
 * Fetch a notion page
 *
 * @param {string} id
 * @returns {Promise<PageObjectResponse>}
 * @exports
 */
const getPage = async (id) => {
    return (await notion.pages.retrieve({
        page_id: id,
    }));
};
exports.getPage = getPage;
/**
 * Update a notion page based on payload.
 *
 * @param {any} payload
 * @returns {Promise<UpdatePageResponse>}
 * @exports
 */
const updatePage = async (payload) => {
    return await notion.pages.update(payload);
};
exports.updatePage = updatePage;
/**
 * Updating a page from the Pull Requests database.
 *
 * @param {string} pageId
 * @returns {Promise<PartialPageObjectResponse | undefined>}
 * @exports
 */
const updatePullRequestPage = async (pageId) => {
    const stateId = await (0, exports.getPullRequestState)();
    if (!stateId) {
        return;
    }
    const payload = (0, payload_1.updatePRPagePayload)(pageId, stateId);
    return (await notion.pages.update(payload));
};
exports.updatePullRequestPage = updatePullRequestPage;
/**
 * Creating a new page in the Pull Requests database.
 *
 * @returns {Promise<PageObjectResponse | undefined>}
 * @exports
 */
const addPullRequestPage = async () => {
    const stateId = await (0, exports.getPullRequestState)();
    if (!stateId) {
        return;
    }
    const payload = (0, payload_1.addPullRequestPayload)(stateId);
    return (await notion.pages.create(payload));
};
exports.addPullRequestPage = addPullRequestPage;
/**
 * Fetch a single page from the Pull Requests database.
 *
 * @returns {Promise<PageObjectResponse>}
 * @exports
 */
const getPullRequestPage = async () => {
    const payload = (0, payload_1.getPullRequestPayload)();
    return await notion.databases
        .query(payload)
        .then((r) => r.results.pop());
};
exports.getPullRequestPage = getPullRequestPage;
/**
 * Fetch a single State from the Pull Request States database.
 *
 * @returns {Promise<string>}
 * @exports
 */
const getPullRequestState = async () => {
    const payload = (0, payload_1.getPullRequestStatePayload)();
    const statePages = await notion.databases.query(payload);
    const state = statePages.results.pop();
    return state?.id;
};
exports.getPullRequestState = getPullRequestState;
