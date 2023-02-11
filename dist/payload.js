"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPullRequestStatePayload = exports.getPullRequestPayload = exports.addPullRequestPayload = exports.updateIssuePagePayload = exports.updatePRPagePayload = void 0;
const config_1 = __importDefault(require("./config"));
const github_1 = __importDefault(require("./github"));
const inputs = (0, github_1.default)();
/**
 * Payload for updating page from the Pull Request database.
 *
 * @param {string} pageId
 * @param {string} stateId
 * @returns {UpdatePageParameters}
 * @exports
 */
const updatePRPagePayload = (pageId, stateId) => ({
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
});
exports.updatePRPagePayload = updatePRPagePayload;
/**
 * Payload for updating an existing issue/page
 *
 * @name updateIssuePagePayload
 * @param {{ page_id: string state_id?: string | undefined url?: boolean | undefined }} { page_id, state_id, url, }
 * @returns {{ page_id: string; properties: { [x: string]: { status: { name: string | undefined; }; } | { url?: string | undefined; relation?: { ...; }[] | undefined; status?: undefined; }; }; }}
 * @exports
 */
const updateIssuePagePayload = ({ page_id, state_id, url, }) => ({
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
exports.updateIssuePagePayload = updateIssuePagePayload;
/**
 * Payload for creating a new page in Pull Request database.
 *
 * @param {string} stateId
 * @returns {CreatePageBodyParameters}
 * @exports
 */
const addPullRequestPayload = (stateId) => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parent: { database_id: config_1.default.DATABASE_PR_ID },
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
});
exports.addPullRequestPayload = addPullRequestPayload;
/**
 * Payload to return pages from Pull Request database
 *
 * @returns {QueryDatabaseParameters}
 * @exports
 */
const getPullRequestPayload = () => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    database_id: config_1.default.DATABASE_PR_ID,
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
});
exports.getPullRequestPayload = getPullRequestPayload;
/**
 * Payload to return pages from Pull Request States database
 *
 * @returns {QueryDatabaseParameters}
 * @exports
 */
const getPullRequestStatePayload = () => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    database_id: config_1.default.DATABASE_PR_STATE_ID,
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
});
exports.getPullRequestStatePayload = getPullRequestStatePayload;
