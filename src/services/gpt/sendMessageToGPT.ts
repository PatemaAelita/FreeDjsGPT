import axios from "axios";
import { gptEnv } from "config";
import { readGPTConfig } from "utils/readGPTConfig";

const token = gptEnv.ICODING_GPT_TOKEN;

export async function sendMessageToGPT(model: string, context: Context[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const gptConfig = readGPTConfig();
    const options = {
      method: "POST",
      url: "https://lite.icoding.ink/api/v1/gpt/message",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      data: {
        model: model,
        chatId: "40",
        messages: context,
        plugins: gptConfig.plugins,
        systemPrompt: gptConfig.prompt,
        temperature: 0.7,
        sign: ""
      }
    };

    axios.request(options).then(function (response) {
      resolve(response.data);
    }).catch(function (error) {
      reject(error);
    });
  });
}

export interface Context {
  role: string;
  content: string;
  time: string;
  attachments: [];
}