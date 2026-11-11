// Independent, noninteracting monatomic model. No shared simulation RNG.
export const GAS_MIN = 30;
export const GAS_MAX = 3000;
export const GAS_MASS = 39.948 * 1.66053906892e-27; // kg, representative Ar mass
const BOLTZMANN = 1.380649e-23; // J/K, exact

export const gasTemperatureValid = t => Number.isFinite(t) && t >= GAS_MIN && t <= GAS_MAX;

export function gasStatistics(temperature) {
 if (!gasTemperatureValid(temperature)) throw new RangeError('Gas temperature outside model window');
 const sigma = Math.sqrt(BOLTZMANN * temperature / GAS_MASS);
 return {sigma, rms: Math.sqrt(3) * sigma, mean: Math.sqrt(8 / Math.PI) * sigma,
  energy: 1.5 * BOLTZMANN * temperature};
}

// Probability density of the 3D speed, in (m/s)⁻¹.
export function maxwellDensity(speed, sigma) {
 if (!Number.isFinite(speed) || speed < 0 || !Number.isFinite(sigma) || sigma <= 0) return 0;
 const ratio = speed / sigma;
 if (ratio > 40) return 0;
 return Math.sqrt(2 / Math.PI) * ratio ** 2 * Math.exp(-(ratio ** 2) / 2) / sigma;
}

export function gasSample(seed, count = 160) {
 if (!Number.isSafeInteger(seed) || !Number.isInteger(count) || count < 1 || count > 4096) {
  throw new RangeError('Invalid gas sample');
 }
 let state = seed >>> 0;
 const random = () => {
  state = (Math.imul(1664525, state) + 1013904223) >>> 0;
  return (state + 0.5) / 4294967296;
 };
 const pair = () => {
  const r = Math.sqrt(-2 * Math.log(random()));
  const angle = 2 * Math.PI * random();
  return [r * Math.cos(angle), r * Math.sin(angle)];
 };
 return Array.from({length: count}, () => {
  const [vx, vy] = pair(), [vz] = pair();
  return {x: random(), y: random(), vx, vy, speed: Math.hypot(vx, vy, vz)};
 });
}

export function gasHistogram(sample, sigma, maximum, count) {
 const width = maximum / count, bins = Array(count).fill(0);
 let tail = 0;
 for (const particle of sample) {
  const index = Math.floor(particle.speed * sigma / width);
  if (index < count) bins[index]++;
  else tail++;
 }
 return {density: bins.map(n => n / (sample.length * width)), tail};
}

export const periodicPosition = value => value - Math.floor(value);
