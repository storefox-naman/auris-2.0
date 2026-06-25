import fs from "fs";
import { Types } from "mongoose";
import OpenAI from "openai";
import { config } from "../config/config";
import { TenantConfig } from "../models/tenantConfigModel";

export async function conversationCount(
  tempFilePath: string,
  tenantId: number,
  storeId: Types.ObjectId,
): Promise<unknown> {
  const tenantConfig = await TenantConfig.findOne({ tenant_id: tenantId });
  if (!tenantConfig)
    throw new Error(`TenantConfig not found for tenant: ${tenantId}`);

  const { conversation_count_model_config } =
    tenantConfig.direct_audio_config;

  const client = new OpenAI({
    baseURL: config.litellm.baseURL,
    apiKey: config.litellm.apiKey,
  });

  const base64Audio = fs.readFileSync(tempFilePath).toString("base64");

  const response = await client.chat.completions.create(
    {
      model: conversation_count_model_config.virtual_key,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text:  },
            {
              // @ts-ignore - LiteLLM supports audio input via this format
              type: "input_audio",
              input_audio: { data: base64Audio, format: "aac" },
            },
          ],
        },
      ],
      max_tokens: conversation_count_model_config.max_tokens,
      temperature: conversation_count_model_config.temperature,
    },
    {
      headers: {
        "x-litellm-metadata": JSON.stringify({
          tenant_id: tenantId,
          store_id: storeId,
        }),
      },
    },
  );

  return response.choices[0].message.content;
}
