import mongoose from "mongoose";
import { config } from "../../config/config";

export async function connectMongo(): Promise<void> {
  await mongoose.connect(config.db.uri);
  console.log("MongoDB connected");
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
  console.log("MongoDB disconnected");
}
