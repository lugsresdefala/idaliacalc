import { v4 as uuidv4 } from 'uuid';

export type CalculationType = 'fertility' | 'gestational';

export interface CalculationRecord {
  id: string;
  type: CalculationType;
  calculatedAt: Date;
  result: any;
}

const STORAGE_KEY = 'idalia_calc_history';

export function saveCalculation(type: CalculationType, result: any): CalculationRecord {
  const newRecord: CalculationRecord = {
    id: uuidv4(),
    type,
    calculatedAt: new Date(),
    result
  };
  
  try {
    // Get existing records
    const existingRecordsString = localStorage.getItem(STORAGE_KEY);
    const existingRecords: CalculationRecord[] = existingRecordsString 
      ? JSON.parse(existingRecordsString) 
      : [];
    
    // Add new record at the beginning
    const updatedRecords = [newRecord, ...existingRecords].slice(0, 10); // Keep only last 10
    
    // Save back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    
    return newRecord;
  } catch (error) {
    console.error('Error saving calculation history:', error);
    return newRecord;
  }
}

export function getCalculationHistory(): CalculationRecord[] {
  try {
    const recordsString = localStorage.getItem(STORAGE_KEY);
    if (!recordsString) return [];
    
    const records: CalculationRecord[] = JSON.parse(recordsString);
    
    // Convert date strings back to Date objects
    return records.map(record => ({
      ...record,
      calculatedAt: new Date(record.calculatedAt)
    }));
  } catch (error) {
    console.error('Error retrieving calculation history:', error);
    return [];
  }
}

export function clearCalculationHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing calculation history:', error);
  }
}

export function getLastCalculation(type?: CalculationType): CalculationRecord | null {
  const history = getCalculationHistory();
  if (history.length === 0) return null;
  
  if (type) {
    const filteredByType = history.filter(record => record.type === type);
    return filteredByType.length > 0 ? filteredByType[0] : null;
  }
  
  return history[0];
}