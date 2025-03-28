export function hasScoreOrDistanceInData<T extends Record<string, any>>(data: T[]): boolean {
  return data.some((item) => 'Score' in item || 'Distance' in item);
}
