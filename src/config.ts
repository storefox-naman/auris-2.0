import * as dotenv from "dotenv";

if (process.env.DEV_MODE === "TRUE") {
  dotenv.config({ path: ".env.dev" });
} else {
  dotenv.config();
}

export const config = {
  isDevMode: process.env.DEV_MODE === "TRUE",
  db: {
    uri: process.env.MONGO_DB_URI || "mongodb://localhost:27017/auris",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
  },
};
