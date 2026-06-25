import { Types } from "mongoose";
import path from "path";
import os from "os";
import fs from "fs";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { AudioClip } from "./audioClipModel";

const directAudioPipeline = async (clipId: Types.ObjectId): Promise<string> => {
  const clip = await AudioClip.findById(clipId);
  if (!clip) throw new Error(`AudioClip not found: ${clipId}`);

  const { fileName, bucketName, region } = clip.file_details;

  const s3 = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const command = new GetObjectCommand({ Bucket: bucketName, Key: fileName });
  const response = await s3.send(command);

  const ext = path.extname(fileName) || ".aac";
  const tempFilePath = path.join(os.tmpdir(), `${clipId}${ext}`);

  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(tempFilePath);
    (response.Body as Readable).pipe(writeStream);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  console.log(
    `[directAudioPipeline] Downloaded clip ${clipId} to ${tempFilePath}`,
  );

  // call conversation count with audio

  // return tempFilePath;
};

export default directAudioPipeline;
