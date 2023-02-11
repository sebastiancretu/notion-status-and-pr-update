"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const config_1 = __importDefault(require("./config"));
const github_1 = __importDefault(require("./github"));
const notion_1 = require("./notion");
const payload_1 = require("./payload");
const utils_1 = require("./utils");
const SupportedType = {
    url: 'url',
    relation: 'relation',
};
const inputs = (0, github_1.default)();
const run = async () => {
    const bodyPages = (0, utils_1.getUrlsFromString)({
        body: inputs.pull_request?.body,
        left_delimiter: inputs.left_delimiter,
        right_delimiter: inputs.right_delimiter,
    });
    const pageIds = (0, utils_1.getPageIds)(bodyPages);
    for (const pageId of pageIds) {
        let payload = (0, payload_1.updateIssuePagePayload)({ page_id: pageId });
        if (inputs.notion?.pr_property_name) {
            if (!config_1.default.DATABASE_PR_ID) {
                core_1.default.setFailed('{{ vars.DATABASE_RELATION_ID }} variable not set.');
                return;
            }
            const page = await (0, notion_1.getPage)(pageId);
            const prProperty = page.properties[inputs.notion.pr_property_name];
            if (prProperty.type === SupportedType.relation) {
                let relation;
                const currentPullRequest = await (0, notion_1.getPullRequestPage)();
                if (!currentPullRequest) {
                    relation = await (0, notion_1.addPullRequestPage)();
                }
                else if (currentPullRequest) {
                    relation = await (0, notion_1.updatePullRequestPage)(currentPullRequest.id);
                }
                payload = await (0, payload_1.updateIssuePagePayload)({
                    page_id: page.id,
                    state_id: relation.id,
                });
            }
            if (prProperty.type === SupportedType.url) {
                payload = await (0, payload_1.updateIssuePagePayload)({
                    page_id: page.id,
                    url: true,
                });
            }
        }
        await (0, notion_1.updatePage)(payload);
    }
};
exports.default = run();
