import 'dotenv/config';
import core from '@actions/core';

interface ENV {
  NOTION_TOKEN: string | undefined;
  DATABASE_PR_ID?: string | undefined;
  DATABASE_PR_STATE_ID?: string | undefined;
}

interface Config {
  NOTION_TOKEN: string;
  DATABASE_PR_ID?: string;
  DATABASE_PR_STATE_ID?: string;
}

// Loading process.env as ENV interface
const getConfig = (): ENV => {
  return {
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    DATABASE_PR_ID: process.env.DATABASE_PR_ID,
    DATABASE_PR_STATE_ID: process.env.DATABASE_PR_STATE_ID,
  };
};

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      core.setFailed(`Environment variable ${key} NOT set!`);
    }
  }
  return config as Config;
};

const config = getConfig();

const env = getSanitzedConfig(config);

export default env;
