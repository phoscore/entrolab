import {AU_KM, J2000, bodies, eccentricAnomaly, orbitAt, parseModelDate, vectorOnOrbit} from './solar-model.mjs';

export const GALACTIC_FRAME_SOURCE = 'https://docs.astropy.org/en/stable/api/astropy.coordinates.Galactocentric.html';
export const GALACTIC_MIN_DATE = '1970-01-01';
export const GALACTIC_MAX_DATE = '2030-01-01';
export const GALACTIC_MIN_DAY = parseModelDate(GALACTIC_MIN_DATE);
export const GALACTIC_MAX_DAY = parseModelDate(GALACTIC_MAX_DATE);
export const TRAIL_DAYS = Object.freeze([30, 90, 180, 365]);
export const SUN_KM_S = Object.freeze([12.9, 245.6, 7.78]); // Astropy Galactocentric v4.0
const DAY_SECONDS = 86400;
const SUN_AU_DAY = SUN_KM_S.map(v => v * DAY_SECONDS / AU_KM);
const RAD = Math.PI / 180;
const OBLIQUITY = (84381.448 / 3600) * RAD;
const CENTER_RA = 266.4051 * RAD;
const CENTER_DEC = -28.936175 * RAD;
const ROLL = 58.5986320306 * RAD;
const TILT = Math.asin(20.8 / 8122);
const MAX_TRUE_SWEEP = 6 * RAD;
const MAX_SAMPLE_STEP = 14;
const CHORD_TARGET_AU = .001;

const rotateX = ([x, y, z], a) => [x, Math.cos(a)*y - Math.sin(a)*z, Math.sin(a)*y + Math.cos(a)*z];
const rotateY = ([x, y, z], a) => [Math.cos(a)*x + Math.sin(a)*z, y, Math.cos(a)*z - Math.sin(a)*x];
const rotateZ = ([x, y, z], a) => [Math.cos(a)*x - Math.sin(a)*y, Math.sin(a)*x + Math.cos(a)*y, z];
const toGalactocentric = vector => rotateY(
  rotateX(rotateY(rotateZ(rotateX(vector, OBLIQUITY), -CENTER_RA), CENTER_DEC), -ROLL), TILT,
);
const basis = [[1,0,0], [0,1,0], [0,0,1]].map(toGalactocentric);

export function rotateEcliptic([x, y, z]) {
  return basis[0].map((v, i) => v*x + basis[1][i]*y + basis[2][i]*z);
}

export const supportsGalacticDay = day => Number.isFinite(day) && day >= GALACTIC_MIN_DAY && day <= GALACTIC_MAX_DAY;

export function sunDisplacement(day) {
  if (!supportsGalacticDay(day)) throw new RangeError('Epoch outside the galactic motion model');
  return SUN_AU_DAY.map(v => v * (day - J2000));
}

export function galacticPosition(day, ecliptic) {
  const sun = sunDisplacement(day);
  return rotateEcliptic(ecliptic).map((v, i) => v + sun[i]);
}

export function galacticVelocity(eclipticKmS) {
  return rotateEcliptic(eclipticKmS).map((v, i) => v + SUN_KM_S[i]);
}

// Rendering only. Keep the Sun's track in scale and enlarge the planet's
// displacement from the Sun uniformly in the three spatial dimensions.
export function schematicPosition(position, sun) {
  return position.map((v, i) => sun[i] + 3 * (v - sun[i]));
}

function sampleStep(body) {
  if (!body.base) return MAX_SAMPLE_STEP;
  const orbits = [orbitAt(body, GALACTIC_MIN_DAY), orbitAt(body, GALACTIC_MAX_DAY)];
  const period = 360 * 36525 / (body.rate[3] - body.rate[4]);
  const e = Math.max(...orbits.map(orbit => orbit.e));
  const a = Math.max(...orbits.map(orbit => orbit.a));
  const meanRate = 2 * Math.PI / period;
  const peakAngularRate = meanRate * Math.sqrt(1 + e) / (1 - e)**1.5;
  const peakAcceleration = meanRate**2 * a / (1 - e)**2;
  const chordStep = .98 * Math.sqrt(8 * CHORD_TARGET_AU / peakAcceleration);
  return Math.min(MAX_SAMPLE_STEP, MAX_TRUE_SWEEP / peakAngularRate, chordStep);
}

const steps = bodies.map(sampleStep);
export const MAX_TRAIL_POINTS = steps.reduce((sum, step) => sum + Math.ceil(TRAIL_DAYS.at(-1) / step) + 2, 0);

export function flightTrails(day, duration, previous = []) {
  if (!supportsGalacticDay(day) || !TRAIL_DAYS.includes(duration)) throw new RangeError('Invalid flight trail interval');
  const start = Math.max(GALACTIC_MIN_DAY, day - duration);
  return bodies.map((body, index) => {
    const step = steps[index];
    const samples = [], existing = previous[index]?.samples ?? [];
    let cursor = 0;
    function sample(epoch) {
      while (cursor < existing.length && existing[cursor].day < epoch) cursor++;
      const hit = existing[cursor];
      let vector;
      if (hit?.day === epoch) vector = hit.vector;
      else {
        const orbit = orbitAt(body, epoch);
        const relative = orbit ? vectorOnOrbit(orbit,eccentricAnomaly(orbit.mean,orbit.e)) : [0,0,0];
        vector = galacticPosition(epoch,relative);
      }
      return {day:epoch,vector,age:(day-epoch)/duration};
    }
    // Align interior samples to a model-time lattice. The clipped start and
    // moving endpoint are exact, so no frame-history segments enter the trail.
    const first = Math.floor((start - J2000) / step) + 1;
    const last = Math.ceil((day - J2000) / step) - 1;
    if (day > start) {
      samples.push(sample(start));
      for (let i = first; i <= last; i++) {
        const epoch = J2000 + i * step;
        if (epoch > start && epoch < day) samples.push(sample(epoch));
      }
    }
    samples.push(sample(day));
    return {body, samples};
  });
}
