import {parseModelDate} from './solar-model.mjs';
import {OUTER_SYSTEMS,OUTER_START,OUTER_END,OUTER_RELEASE} from './outer-moons-spec.mjs';
import {OUTER_PACKAGES} from './outer-moons-pin.mjs';

export const RELEASE = 'v0.9.5-horizons-2025-2030.1';
// Update these pins together with RELEASE when publishing new package bytes.
export const EPHEMERIS_PACKAGES = Object.freeze({
  earth: Object.freeze({bytes: 701288, sha256: '573e6e5eee46196f5b8f0d710e281f565528e5617303a61e2beaef2572590461'}),
  jupiter: Object.freeze({bytes: 3769112, sha256: 'a44bc090ab569ff10453f9ca3a4063dc2585b366db9270b73909bb8283f25270'}),
  pluto: Object.freeze({bytes: 438392, sha256: '998b4159f956134e4626906327166408931c074b2ae2e3c09675aaf2ef8e8c96'}),
});
export const START = parseModelDate('2025-01-01');
export const END = parseModelDate('2030-01-01');
export const SECONDS_PER_DAY = 86400;
export const FRAME = 'ICRF / Ecliptic of J2000.0 / TDB / KM-S / geometric';
export const LEGACY_SYSTEMS = {
  earth: {anchor: 'earth', centre: 3, scaleKm: 480000, names: ['Erde–Mond', 'Earth–Moon'], bodies: [
    {id: 'earth', target: 399, hours: 6},
    {id: 'moon', target: 301, hours: 6, period: 27.32, names: ['Mond', 'Moon'], radiusKm: 1737.4, color: '#c3cad8', size: 6},
  ]},
  jupiter: {anchor: 'jupiter', centre: 5, scaleKm: 2200000, names: ['Jupitersystem', 'Jupiter system'], bodies: [
    {id: 'jupiter', target: 599, hours: 12},
    {id: 'io', target: 501, hours: 1, period: 1.77, names: ['Io', 'Io'], radiusKm: 1821.6, color: '#f6c363', size: 5},
    {id: 'europa', target: 502, hours: 3, period: 3.55, names: ['Europa', 'Europa'], radiusKm: 1560.8, color: '#e5d7be', size: 5},
    {id: 'ganymede', target: 503, hours: 4, period: 7.15, names: ['Ganymed', 'Ganymede'], radiusKm: 2631.2, color: '#d2a389', size: 6},
    {id: 'callisto', target: 504, hours: 8, period: 16.69, names: ['Kallisto', 'Callisto'], radiusKm: 2410.3, color: '#a1accc', size: 6},
  ]},
  pluto: {anchor: 'pluto-anchor', centre: 9, scaleKm: 25000, names: ['Pluto–Charon', 'Pluto–Charon'], bodies: [
    {id: 'pluto', target: 999, hours: 12, period: 6.39, names: ['Pluto', 'Pluto'], radiusKm: 1188.3, color: '#d9a991', size: 7},
    {id: 'charon', target: 901, hours: 12, period: 6.39, names: ['Charon', 'Charon'], radiusKm: 606, color: '#b0b8c5', size: 5},
  ]},
};
export const SYSTEMS = {...LEGACY_SYSTEMS,...OUTER_SYSTEMS};
export const PLUTO_ANCHOR = {id: 'pluto-anchor', target: 9, centre: 10, hours: 24};

export function seriesFor(system) {
  const {bodies, centre} = SYSTEMS[system];
  const relative = bodies.map(body => ({...body, centre}));
  if (Object.hasOwn(OUTER_SYSTEMS,system)) return relative.slice(1);
  return system === 'pluto' ? [...relative, PLUTO_ANCHOR] : relative;
}

export function ephemerisSpec(system) {
  return Object.hasOwn(OUTER_SYSTEMS,system)
    ? {start:OUTER_START,end:OUTER_END,release:OUTER_RELEASE,pack:OUTER_PACKAGES[system],planetCentred:true}
    : {start:START,end:END,release:RELEASE,pack:EPHEMERIS_PACKAGES[system],planetCentred:false};
}
