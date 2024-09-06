import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, ICODING_GPT_TOKEN } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Missing discord environment variables");
}

if (!ICODING_GPT_TOKEN) {
  throw new Error("Missing Icoding token! Please refer to README.md to retrieve one");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
};

export const gptEnv = {
  ICODING_GPT_TOKEN,
};
