// lib/counter.ts
// Global visitor counter
let globalCounter = 0;

export function getCount(): number {
  return globalCounter;
}

export function incrementCount(): number {
  globalCounter++;
  console.log('Counter incremented to:', globalCounter);
  return globalCounter;
}

export function resetCount(): number {
  const oldCount = globalCounter;
  globalCounter = 0;
  console.log('Counter reset from', oldCount, 'to 0');
  return oldCount;
}

export function setCount(count: number): void {
  globalCounter = count;
  console.log('Counter set to:', globalCounter);
}
