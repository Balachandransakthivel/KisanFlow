// AI Waiting Time Prediction Service
// Simulates a Random Forest-style weighted regression

export interface WaitPredictionInput {
  farmersAhead: number;
  activeCounters: number;
  avgProcessingTime: number; // minutes
  quantityKg: number;
  cropId: string;
  timeOfDay: number; // hour (0–23)
  centreLoad: 'normal' | 'moderate' | 'high';
}

// Simulate ML features
function getQuantityFactor(kg: number): number {
  if (kg < 300) return 0.8;
  if (kg < 600) return 1.0;
  if (kg < 1000) return 1.15;
  return 1.3;
}

function getTimeFactor(hour: number): number {
  if (hour >= 9 && hour <= 11) return 1.25; // peak morning
  if (hour >= 14 && hour <= 16) return 1.1; // peak afternoon
  return 0.9;
}

function getLoadFactor(load: string): number {
  if (load === 'high') return 1.35;
  if (load === 'moderate') return 1.15;
  return 1.0;
}

export function predictWaitingTime(input: WaitPredictionInput): number {
  const { farmersAhead, activeCounters, avgProcessingTime, quantityKg, timeOfDay, centreLoad } = input;
  const effectiveCounters = Math.max(1, activeCounters);
  const base = (farmersAhead / effectiveCounters) * avgProcessingTime;
  const qf = getQuantityFactor(quantityKg);
  const tf = getTimeFactor(timeOfDay);
  const lf = getLoadFactor(centreLoad);
  const predicted = Math.round(base * qf * tf * lf);
  return Math.max(5, predicted);
}

export function predictCrowding(centreId: string, hour: number): {
  expectedFarmers: number;
  capacity: number;
  risk: 'low' | 'moderate' | 'high';
  recommendation: string;
} {
  // Simulate crowd pattern
  const baseFarmers = [5, 3, 2, 2, 3, 8, 25, 48, 62, 70, 65, 55, 45, 52, 60, 58, 42, 30, 18, 10, 6, 5, 4, 3];
  const expected = baseFarmers[hour] || 10;
  const capacity = 50;
  const ratio = expected / capacity;
  const risk = ratio > 1.2 ? 'high' : ratio > 0.85 ? 'moderate' : 'low';
  const rec =
    risk === 'high'
      ? 'Consider redirecting farmers to off-peak hours (2–4 PM)'
      : risk === 'moderate'
      ? 'Open an additional counter to reduce wait time'
      : 'Operating within optimal capacity';
  return { expectedFarmers: expected, capacity, risk, recommendation: rec };
}

export function recommendBestSlot(availableSlots: Array<{ time: string; available: number; hour: number }>): {
  time: string;
  estimatedWait: number;
  crowdLevel: 'low' | 'moderate' | 'high';
} {
  const scored = availableSlots
    .filter(s => s.available > 0)
    .map(s => {
      const crowding = predictCrowding('c1', s.hour);
      const wait = predictWaitingTime({
        farmersAhead: 50 - s.available,
        activeCounters: 3,
        avgProcessingTime: 11,
        quantityKg: 700,
        timeOfDay: s.hour,
        centreLoad: crowding.risk,
      });
      return { ...s, wait, crowd: crowding.risk };
    })
    .sort((a, b) => a.wait - b.wait);
  const best = scored[0];
  if (!best) return { time: 'No slots', estimatedWait: 0, crowdLevel: 'low' };
  return { time: best.time, estimatedWait: best.wait, crowdLevel: best.crowd };
}
