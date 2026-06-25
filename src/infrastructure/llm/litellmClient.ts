import OpenAI from "openai";
import { config } from "./config/config";

let _client: OpenAI | null = null;

export function getLiteLLMClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      baseURL: config.litellm.baseURL,
      apiKey: config.litellm.apiKey,
    });
  }
  return _client;
}
