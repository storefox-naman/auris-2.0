import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAudioClip extends Document {
  _id: Types.ObjectId;
  recording_start: Date;
  activity_array_of_segments: {
    actual_start: Date;
    actual_end: Date;
    duration: number;
    rel_start: number;
  }[];
  duration: number;
  file_details: {
    fileName: string;
    mimeType: string;
    bucketName: string;
    region: string;
    s3Url: string;
    fileHash: string;
  };
  batchingDone: boolean;
  tenantId: number;
  micId: string;
  storeId: Types.ObjectId;
  deviceId: string;
}

const AudioClipSchema = new Schema<IAudioClip>({
  recording_start: Date,
  activity_array_of_segments: [
    {
      actual_start: Date,
      actual_end: Date,
      duration: Number,
      rel_start: Number,
    },
  ],
  duration: Number,
  file_details: {
    fileName: String,
    mimeType: String,
    bucketName: String,
    region: String,
    s3Url: String,
    fileHash: String,
  },
  batchingDone: Boolean,
  tenantId: Number,
  micId: String,
  storeId: Schema.Types.ObjectId,
  deviceId: String,
});

export const AudioClip = mongoose.model<IAudioClip>("audioclips", AudioClipSchema);
