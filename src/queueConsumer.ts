import { Worker, Job } from 'bullmq';
import { getConnection } from './queueProducer';

export async function startConsumer<T = Record<string, unknown>>(
  queueName: string,
  handler: (job: Job<T>) => Promise<void>,
  concurrency = 1,
): Promise<Worker<T>> {
  const worker = new Worker<T>(queueName, handler, {
    connection: getConnection() as any,
    concurrency,
  });

  worker.on('ready', () => {
    console.log(`[${queueName}] Worker started`);
  });

  worker.on('completed', (job) => {
    console.log(`[${queueName}] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    const attemptsMade = job?.attemptsMade ?? 0;
    const maxAttempts = job?.opts?.attempts ?? 1;
    console.error(`[${queueName}] Job ${job?.id} failed`, {
      reason: job?.failedReason,
      attemptsMade,
      error: err.message,
    });

    if (attemptsMade >= maxAttempts) {
      console.error(`[${queueName}] Job ${job?.id} permanently failed after ${attemptsMade} attempts`);
    }
  });

  worker.on('error', (err) => {
    console.error(`[${queueName}] Worker error`, err);
  });

  return worker;
}
