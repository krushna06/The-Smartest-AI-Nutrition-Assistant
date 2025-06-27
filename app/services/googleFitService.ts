import { google } from 'googleapis';

const fitness = google.fitness('v1');

interface MetricData<T = number> {
  value: T;
  success: boolean;
  error?: string;
}

export interface FitnessData {
  steps: number;
  heartRate: number | null;
  activeMinutes: number;
  calories: number;
  distance: number;
  sleepDuration: number | null;
  lastUpdated: string;
  metrics: {
    steps: MetricData;
    activeMinutes: MetricData;
    calories: MetricData;
    distance: MetricData;
    heartRate: MetricData<number | null>;
    sleepDuration: MetricData<number | null>;
  };
}

interface DataPoint {
  startTimeNanos?: string | null;
  value?: Array<{ fpVal?: number }>;
}

async function fetchAggregateData(auth: any, dataType: string, dataSourceId: string, startTimeMillis: number, endTimeMillis: number) {
  try {
    const response = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{
          dataTypeName: dataType,
          dataSourceId: dataSourceId
        }],
        bucketByTime: { durationMillis: '86400000' },
        startTimeMillis: startTimeMillis.toString(),
        endTimeMillis: endTimeMillis.toString(),
      },
      auth,
    });
    
    const value = response.data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0];
    const result = value?.fpVal || value?.intVal || 0;
    
    return {
      value: result,
      success: true
    };
  } catch (error: any) {
    console.error(`Error fetching ${dataType} data:`, error.message);
    return {
      value: 0,
      success: false,
      error: error.message
    };
  }
}

async function fetchHeartRate(auth: any, startTimeMillis: number, endTimeMillis: number): Promise<number | null> {
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
      
      return latestPoint?.value?.[0]?.fpVal || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching heart rate data:', error);
    return null;
  }
}

async function fetchSleepData(auth: any, startTimeMillis: number, endTimeMillis: number): Promise<number | null> {
  try {
    const sleepResponse = await fitness.users.sessions.list({
      userId: 'me',
      startTime: new Date(startTimeMillis).toISOString(),
      endTime: new Date(endTimeMillis).toISOString(),
      auth,
    });

    const sleepSessions = sleepResponse.data.session || [];
    const sleepDurationMs = sleepSessions.reduce((total, session) => {
      if (session.endTimeMillis && session.startTimeMillis) {
        return total + (parseInt(session.endTimeMillis) - parseInt(session.startTimeMillis));
      }
      return total;
    }, 0);

    return sleepDurationMs > 0 ? Math.round(sleepDurationMs / (1000 * 60)) : null;
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    return null;
  }
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
    let dataSources;
    try {
      const dataSourcesResponse = await fitness.users.dataSources.list({
        userId: 'me',
        auth,
      });
      dataSources = dataSourcesResponse.data.dataSource || [];
      // console.log('Available data sources:', dataSources.map((ds: any) => ({
      //   type: ds.dataType.name,
      //   id: ds.dataStreamId
      // })));
    } catch (error) {
      console.error('Error fetching data sources:', error);
    }

    const [
      stepsData,
      activeMinutesData,
      caloriesData,
      distanceData,
      heartRateData,
      sleepData
    ] = await Promise.all([
      (async () => {
        const sources = [
          'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
          'derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas',
          'derived:com.google.step_count.delta:com.google.android.gms:platform_step_counter'
        ];
        
        for (const source of sources) {
          const result = await fetchAggregateData(
            auth,
            'com.google.step_count.delta',
            source,
            startTimeMillis,
            endTimeMillis
          );
          if (result.success && result.value > 0) return result;
        }
        return { value: 0, success: false, error: 'No step data available' };
      })(),

      fetchAggregateData(
        auth,
        'com.google.active_minutes',
        'derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes',
        startTimeMillis,
        endTimeMillis
      ),

      fetchAggregateData(
        auth,
        'com.google.calories.expended',
        'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
        startTimeMillis,
        endTimeMillis
      ),

      (async () => {
        const sources = [
          'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta',
          'derived:com.google.distance.delta:com.google.android.gms:platform_distance_delta'
        ];
        
        for (const source of sources) {
          const result = await fetchAggregateData(
            auth,
            'com.google.distance.delta',
            source,
            startTimeMillis,
            endTimeMillis
          );
          if (result.success && result.value > 0) return result;
        }
        return { value: 0, success: false, error: 'No distance data available' };
      })(),

      fetchHeartRate(auth, startTimeMillis, endTimeMillis),
      fetchSleepData(auth, startTimeMillis, endTimeMillis)
    ]);

    const steps = stepsData.success ? Math.round(stepsData.value) : 0;
    const activeMinutes = activeMinutesData.success ? Math.round(activeMinutesData.value) : 0;
    const calories = caloriesData.success ? Math.round(caloriesData.value) : 0;
    const distance = distanceData.success ? Math.round(distanceData.value) : 0;
    const heartRate = heartRateData;
    const sleepDuration = sleepData;

    const metrics = {
      steps: { value: steps, success: stepsData.success },
      activeMinutes: { value: activeMinutes, success: activeMinutesData.success },
      calories: { value: calories, success: caloriesData.success },
      distance: { value: distance, success: distanceData.success },
      heartRate: { value: heartRate, success: heartRate !== null },
      sleepDuration: { value: sleepDuration, success: sleepDuration !== null },
    };

    // console.log('Fitness data metrics:', metrics);

    return {
      steps,
      heartRate,
      activeMinutes,
      calories,
      distance,
      sleepDuration,
      metrics,
      lastUpdated: now.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching fitness data:', error);
    throw new Error('Failed to fetch fitness data');
  }
}
