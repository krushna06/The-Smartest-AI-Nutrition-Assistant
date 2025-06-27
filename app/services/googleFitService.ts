import { google } from 'googleapis';

const fitness = google.fitness('v1');

export interface FitnessData {
  steps: number;
  heartRate: number | null;
  lastUpdated: string;
}

interface DataPoint {
  startTimeNanos?: string | null;
  value?: Array<{ fpVal?: number }>;
}

export async function getFitnessData(accessToken: string): Promise<FitnessData> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const now = new Date();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(now.getDate() - 1);

  const startTimeMillis = oneDayAgo.getTime();
  const endTimeMillis = now.getTime();

  try {
    const stepsResponse = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{
          dataTypeName: 'com.google.step_count.delta',
          dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
        }],
        bucketByTime: { durationMillis: '86400000' },
        startTimeMillis: startTimeMillis.toString(),
        endTimeMillis: endTimeMillis.toString(),
      },
      auth,
    });

    const steps = stepsResponse.data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;

    let heartRate: number | null = null;
    try {
      const heartRateResponse = await fitness.users.dataSources.datasets.get({
        userId: 'me',
        dataSourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
        datasetId: `${startTimeMillis * 1000000}-${endTimeMillis * 1000000}`,
        auth,
      });

      const points: DataPoint[] = (heartRateResponse.data.point as DataPoint[]) || [];
      if (points.length > 0) {
        const latestPoint = points.reduce((latest: DataPoint | null, point: DataPoint) => {
          if (!latest) return point;
          if (!point.startTimeNanos || !latest.startTimeNanos) return latest;
          return point.startTimeNanos > latest.startTimeNanos ? point : latest;
        }, points[0]);
        
        heartRate = latestPoint?.value?.[0]?.fpVal || null;
      }
    } catch (error) {
      console.error('Error fetching heart rate data:', error);
    }

    return {
      steps,
      heartRate,
      lastUpdated: now.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching fitness data:', error);
    throw new Error('Failed to fetch fitness data');
  }
}
