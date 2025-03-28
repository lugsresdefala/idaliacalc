import { addDays, differenceInDays } from "date-fns";

// Gestational Age Calculator functions
export function calculateGestationalAgeFromLMP(lmpDate: Date) {
  // Calculate due date (40 weeks from LMP)
  const dueDate = addDays(lmpDate, 280); // 40 weeks = 280 days
  
  // Calculate current gestational age
  const today = new Date();
  const diffDays = differenceInDays(today, lmpDate);
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  
  // Calculate trimester dates
  const firstTrimesterEnd = addDays(lmpDate, 84); // 12 weeks = 84 days
  const secondTrimesterEnd = addDays(lmpDate, 182); // 26 weeks = 182 days
  
  return {
    weeks,
    days,
    dueDate,
    firstTrimesterEnd,
    secondTrimesterEnd
  };
}

export function calculateGestationalAgeFromUltrasound(
  usgDate: Date,
  usgWeeks: number,
  usgDays: number
) {
  // Calculate LMP based on USG measurements
  const totalDays = (usgWeeks * 7) + usgDays;
  const lmpDate = addDays(usgDate, -totalDays);
  
  return calculateGestationalAgeFromLMP(lmpDate);
}

export function calculateGestationalAgeFromTransfer(
  transferDate: Date,
  embryoDays: number
) {
  // Calculate estimated LMP
  // For a 5-day blastocyst, the embryo is already 19 days old in gestational age terms (14 + 5)
  // For a 3-day embryo, it's 17 days old (14 + 3)
  const additionalDays = embryoDays === 5 ? 19 : 17;
  
  const lmpDate = addDays(transferDate, -additionalDays);
  
  return calculateGestationalAgeFromLMP(lmpDate);
}

// Fertility Period Calculator functions
export function calculateFertilePeriod(
  lastPeriodStart: Date,
  lastPeriodEnd: Date,
  cycleLength: number = 28
) {
  // Basic estimation of ovulation day - 14 days before next period
  const ovulationDay = addDays(lastPeriodStart, cycleLength - 14);
  
  // Fertile window is typically 5 days before ovulation and 1 day after
  const fertileWindowStart = addDays(ovulationDay, -5);
  const fertileWindowEnd = addDays(ovulationDay, 1);
  
  // Calculate next period
  const nextPeriodStart = addDays(lastPeriodStart, cycleLength);
  const periodLength = differenceInDays(lastPeriodEnd, lastPeriodStart);
  const nextPeriodEnd = addDays(nextPeriodStart, periodLength);
  
  return {
    ovulationDay,
    fertileStart: fertileWindowStart,
    fertileEnd: fertileWindowEnd,
    nextPeriodStart,
    nextPeriodEnd
  };
}

// Calculate predicted fertile window based on historical cycle data
export function calculatePredictedFertileWindow(
  cycles: { startDate: Date, endDate: Date }[], 
  lastPeriodStart: Date
) {
  if (cycles.length < 2) {
    // Not enough data, use standard calculation
    return calculateFertilePeriod(lastPeriodStart, addDays(lastPeriodStart, 5));
  }
  
  // Sort cycles by start date
  const sortedCycles = [...cycles].sort((a, b) => 
    a.startDate.getTime() - b.startDate.getTime()
  );
  
  // Calculate average cycle length from historical data
  const cycleLengths = [];
  for (let i = 1; i < sortedCycles.length; i++) {
    cycleLengths.push(
      differenceInDays(sortedCycles[i].startDate, sortedCycles[i-1].startDate)
    );
  }
  
  const avgCycleLength = Math.round(
    cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length
  );
  
  // Calculate average period length
  const periodLengths = sortedCycles.map(cycle => 
    differenceInDays(cycle.endDate, cycle.startDate) + 1
  );
  
  const avgPeriodLength = Math.round(
    periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length
  );
  
  // Calculate fertility window using the average cycle length
  return calculateFertilePeriod(
    lastPeriodStart, 
    addDays(lastPeriodStart, avgPeriodLength - 1),
    avgCycleLength
  );
}

// Função para calcular perímetro cefálico fetal estimado (cm) baseado em idade gestacional (semanas)
export function estimateFoetalHeadCircumference(weeks: number): number {
  if (weeks < 12) {
    return 0; // Não é possível estimar com precisão antes de 12 semanas
  }
  
  // Fórmula baseada em tabelas de referência (aproximação)
  // HC = a + b*GA + c*GA^2 + d*GA^3 (onde GA = idade gestacional em semanas)
  const a = -28.2849;
  const b = 3.61859;
  const c = -0.0022;
  const d = -0.000896;
  
  const ga = weeks;
  return parseFloat((a + (b * ga) + (c * Math.pow(ga, 2)) + (d * Math.pow(ga, 3))).toFixed(1));
}

// Função para calcular o comprimento fetal estimado (cm) baseado em idade gestacional (semanas)
export function estimateFoetalLength(weeks: number): number {
  if (weeks < 6) {
    return 0; // Muito precoce para medidas precisas
  }
  
  // CRL (Crown-Rump Length) ou comprimento crânio-caudal até 12 semanas
  if (weeks <= 12) {
    return parseFloat((weeks * 0.8 - 0.9).toFixed(1));
  }
  
  // Comprimento total depois de 12 semanas (aproximação)
  // Baseado em tabelas de referência adaptadas
  const lengthMap: Record<number, number> = {
    13: 7.4, 14: 8.7, 15: 10.1, 16: 11.6, 17: 13.0, 18: 14.2, 
    19: 15.3, 20: 16.4, 21: 17.4, 22: 18.3, 23: 19.2, 24: 20.0, 
    25: 20.8, 26: 21.5, 27: 22.3, 28: 23.1, 29: 24.0, 30: 25.0, 
    31: 26.0, 32: 27.0, 33: 28.0, 34: 29.1, 35: 30.1, 36: 31.2, 
    37: 32.2, 38: 33.3, 39: 34.3, 40: 35.3, 41: 36.2, 42: 37.0
  };
  
  return lengthMap[weeks] || 0;
}

// Função para calcular o peso fetal estimado (g) baseado em idade gestacional (semanas)
export function estimateFoetalWeight(weeks: number): number {
  if (weeks < 10) {
    return 0; // Muito precoce para medidas precisas
  }
  
  // Fórmula baseada em Hadlock et al. (aproximação)
  // log10(weight) = a + b*GA + c*GA^2 + d*GA^3 (onde GA = idade gestacional em semanas)
  const a = -1.7492;
  const b = 0.166;
  const c = 0.046;
  const d = -0.00046;
  
  const ga = weeks;
  const logWeight = a + (b * ga) + (c * Math.pow(ga, 2)) + (d * Math.pow(ga, 3));
  const weight = Math.pow(10, logWeight);
  
  return Math.round(weight);
}