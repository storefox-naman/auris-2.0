import mongoose, { Schema, Document } from "mongoose";

export interface ITenantConfig extends Document {
  tenant_id: number;
  direct_audio_config: {
    conversation_count_prompt: string;
    conversation_count_virtual_key: string;
  };
}

const TenantConfigSchema = new Schema<ITenantConfig>({
  tenant_id: Number,
  direct_audio_config: {
    conversation_count_prompt: String,
    conversation_count_virtual_key: String,
  },
});

export const TenantConfig = mongoose.model<ITenantConfig>("tenant_config", TenantConfigSchema);
