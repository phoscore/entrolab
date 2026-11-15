// NASA/JPL Solar System Dynamics: Approximate Positions of the Planets, table 1.
// Element order: a [AU], e, I, L, longitude of perihelion, longitude of node [deg].
// Rates use one Julian century (36525 d). Coordinates are heliocentric J2000 ecliptic.
export const ORBIT_SOURCE = 'https://ssd.jpl.nasa.gov/planets/approx_pos.html';
export const RADIUS_SOURCE = 'https://ssd.jpl.nasa.gov/planets/phys_par.html';
export const SUN_SOURCE = 'https://doi.org/10.3847/0004-6256/152/2/41';
export const AU_KM = 149597870.7;
export const J2000 = 2451545;
export const MIN_DAY = 2378496.5; // 1800-01-01 00:00 TDB, proleptic Gregorian
export const MAX_DAY = 2469807.5; // 2050-01-01 00:00 TDB
const UNIX_DAY = 2440587.5;
const MS_PER_DAY = 86400000;
const TAU = 2 * Math.PI;
const RAD = Math.PI / 180;

export const bodies = [
  {id:'sun', names:['Sonne','Sun'], radiusKm:695700, color:'#ffbd69', size:13},
  {id:'mercury', names:['Merkur','Mercury'], radiusKm:2439.4, color:'#bfb6ac', size:4.5,
    base:[.38709927,.20563593,7.00497902,252.25032350,77.45779628,48.33076593],
    rate:[.00000037,.00001906,-.00594749,149472.67411175,.16047689,-.12534081]},
  {id:'venus', names:['Venus','Venus'], radiusKm:6051.8, color:'#edc68b', size:6,
    base:[.72333566,.00677672,3.39467605,181.97909950,131.60246718,76.67984255],
    rate:[.00000390,-.00004107,-.00078890,58517.81538729,.00268329,-.27769418]},
  {id:'earth', names:['Erde','Earth'], radiusKm:6371.0084, color:'#63c8e7', size:6,
    base:[1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0],
    rate:[.00000562,-.00004392,-.01294668,35999.37244981,.32327364,0]},
  {id:'mars', names:['Mars','Mars'], radiusKm:3389.50, color:'#ef856e', size:5,
    base:[1.52371034,.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],
    rate:[.00001847,.00007882,-.00813131,19140.30268499,.44441088,-.29257343]},
  {id:'jupiter', names:['Jupiter','Jupiter'], radiusKm:69911, color:'#edb99c', size:10,
    base:[5.20288700,.04838624,1.30439695,34.39644051,14.72847983,100.47390909],
    rate:[-.00011607,-.00013253,-.00183714,3034.74612775,.21252668,.20469106]},
  {id:'saturn', names:['Saturn','Saturn'], radiusKm:58232, color:'#e0c69c', size:8,
    base:[9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448],
    rate:[-.00125060,-.00050991,.00193609,1222.49362201,-.41897216,-.28867794]},
  {id:'uranus', names:['Uranus','Uranus'], radiusKm:25362, color:'#8dd7d8', size:7,
    base:[19.18916464,.04725744,.77263783,313.23810451,170.95427630,74.01692503],
    rate:[-.00196176,-.00004397,-.00242939,428.48202785,.40805281,.04240589]},
  {id:'neptune', names:['Neptun','Neptune'], radiusKm:24622, color:'#849ff2', size:7,
    base:[30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574],
    rate:[.00026291,.00005105,.00035372,218.45945325,-.32241464,-.00508664]},
];

export function formatModelDay(day) {
  checkDay(day);
  // Date supplies Gregorian calendar arithmetic only. These fields are TDB, never UTC.
  return new Date(Math.round((day - UNIX_DAY) * MS_PER_DAY)).toISOString().slice(0, 16);
}

export function parseModelDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const ms = Date.parse(value + 'T00:00:00.000Z');
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== value) return null;
  const day = UNIX_DAY + ms / MS_PER_DAY;
  return day >= MIN_DAY && day <= MAX_DAY ? day : null;
}

function checkDay(day) {
  if (!Number.isFinite(day) || day < MIN_DAY || day > MAX_DAY) throw new RangeError('JPL table 1 date outside fit interval');
}

export function advanceModelDay(day, elapsedSeconds, daysPerSecond) {
  checkDay(day);
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 || !Number.isFinite(daysPerSecond)) throw new RangeError('Invalid model clock interval');
  return Math.max(MIN_DAY, Math.min(MAX_DAY, day + elapsedSeconds * daysPerSecond));
}

export function eccentricAnomaly(mean, e) {
  if (!Number.isFinite(mean) || !(e >= 0 && e < 1)) throw new RangeError('Invalid elliptic elements');
  const m = ((mean % TAU + 3 * Math.PI) % TAU) - Math.PI;
  let low = -Math.PI, high = Math.PI;
  // Monotone for 0 <= e < 1, including near-parabolic eccentricities.
  for (let i = 0; i < 49; i++) {
    const mid = (low + high) / 2;
    if (mid - e * Math.sin(mid) < m) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export function orbitAt(body, day) {
  checkDay(day);
  if (!body.base) return null;
  const t = (day - J2000) / 36525;
  const [a, e, inclination, longitude, perihelion, node] = body.base.map((v, i) => v + body.rate[i] * t);
  const i = inclination * RAD, w = (perihelion - node) * RAD, o = node * RAD;
  const [ci, si, cw, sw, co, so] = [Math.cos(i), Math.sin(i), Math.cos(w), Math.sin(w), Math.cos(o), Math.sin(o)];
  return {
    a, e, mean: (longitude - perihelion) * RAD,
    p: [cw*co - sw*so*ci, cw*so + sw*co*ci, sw*si],
    q: [-sw*co - cw*so*ci, -sw*so + cw*co*ci, cw*si],
  };
}

export function vectorOnOrbit(orbit, anomaly) {
  const x = orbit.a * (Math.cos(anomaly) - orbit.e);
  const y = orbit.a * Math.sqrt(1 - orbit.e ** 2) * Math.sin(anomaly);
  return orbit.p.map((axis, i) => axis * x + orbit.q[i] * y);
}

export function solarState(day) {
  checkDay(day);
  return bodies.map(body => {
    const orbit = orbitAt(body, day);
    const vector = orbit ? vectorOnOrbit(orbit, eccentricAnomaly(orbit.mean, orbit.e)) : [0, 0, 0];
    return {body, orbit, vector, distanceAU:Math.hypot(...vector)};
  });
}

// Orthographic view from the +Z side of the J2000 ecliptic. Canvas y points down.
export const eclipticToMap = ([x,y]) => [x,-y];
export const radiusAU = body => body.radiusKm / AU_KM;
