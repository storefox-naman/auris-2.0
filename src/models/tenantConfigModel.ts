import mongoose, { Schema, Document } from "mongoose";

export interface ITenantConfig extends Document {
  tenant_id: number;
  direct_audio_config: {
    conversation_count_model_config: {
      virtual_key: string;
      max_tokens: number;
      temperature: number;
    };
  };
}

const TenantConfigSchema = new Schema<ITenantConfig>({
  tenant_id: Number,
  direct_audio_config: {
    conversation_count_model_config: {
      virtual_key: String,
      max_tokens: Number,
      temperature: Number,
    },
  },
});

export const TenantConfig = mongoose.model<ITenantConfig>(
  "tenant_config",
  TenantConfigSchema,
);
