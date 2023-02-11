"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = __importDefault(require("@actions/core"));
// Loading process.env as ENV interface
const getConfig = () => {
    return {
        NOTION_TOKEN: process.env.NOTION_TOKEN,
        DATABASE_PR_ID: process.env.DATABASE_PR_ID,
        DATABASE_PR_STATE_ID: process.env.DATABASE_PR_STATE_ID,
    };
};
const getSanitzedConfig = (config) => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            core_1.default.setFailed(`Environment variable ${key} NOT set!`);
        }
    }
    return config;
};
const config = getConfig();
const env = getSanitzedConfig(config);
exports.default = env;
