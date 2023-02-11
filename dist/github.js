"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
/**
 * Create an object with all the values set on github workflow
 *
 * @returns {Inputs}
 */
const getInputs = () => {
    const pullRequest = github_1.default.context.payload.pull_request;
    const state = pullRequest?.merged
        ? 'merged'
        : pullRequest?.draft
            ? 'draft'
            : github_1.default.context.payload.action;
    return {
        right_delimiter: core_1.default.getInput('right_delimiter', { required: true }),
        left_delimiter: core_1.default.getInput('left_delimiter', { required: true }),
        notion: {
            status_property: core_1.default.getInput('notion_status_property', {
                required: true,
            }),
            pr_property_name: core_1.default.getInput('notion_pr_property_name', {
                required: false,
            }),
            pr_id_column_name: core_1.default.getInput('notion_pr_id_column_name', {
                required: false,
            }),
            status: state && core_1.default.getInput(state, { required: false }),
        },
        pull_request: {
            body: pullRequest?.body ?? '',
            href: pullRequest?.html_url,
            number: Number(pullRequest?.number),
            state,
            title: pullRequest?.title,
        },
    };
};
exports.default = getInputs;
