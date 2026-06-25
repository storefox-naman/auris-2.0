import { Job } from "bullmq";
import { startConsumer } from "./queueConsumer";
import directAudioPipeline from "./directAudio/directAudioPipeline";
import { Types } from "mongoose";

const QUEUE_NAME = "direct-audio-pipeline";

type AudioPipelineJob = {
  clipId: Types.ObjectId;
};

export async function directAudioPipelineConsumer() {
  return await startConsumer(
    QUEUE_NAME,
    async (job: Job<AudioPipelineJob>) => {
      const { clipId } = job.data;
      console.log(
        `[${QUEUE_NAME}] Processing audio pipeline for clip: ${clipId}`,
      );

      await directAudioPipeline(clipId);
    },
    5,
  );
}
