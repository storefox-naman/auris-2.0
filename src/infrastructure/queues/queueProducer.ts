import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../../config/config';

type JobData = Record<string, unknown>;

let connection: IORedis | null = null;
const queues = new Map<string, Queue<JobData>>();

export function getConnection(): IORedis {
  if (!connection) {
    connection = new IORedis({
      host: config.redis.host,
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}

function getQueue(queueName: string): Queue<JobData> {
  let queue = queues.get(queueName);
  if (!queue) {
    queue = new Queue<JobData>(queueName, {
      connection: getConnection() as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    });
    queues.set(queueName, queue);
  }
  return queue;
}

export async function addJob(queueName: string, jobName: string, data: JobData) {
  return getQueue(queueName).add(jobName, data);
}
