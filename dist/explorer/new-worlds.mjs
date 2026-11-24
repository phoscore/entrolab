import {AU_KM, bodies} from './solar-model.mjs';
import {LIGHT_KM_S, solarVelocities} from './solar-motion.mjs';
import {supportsEpoch} from './new-worlds-ephemeris.mjs';
import {ephemerisSpec, SYSTEMS, SECONDS_PER_DAY} from './new-worlds-spec.mjs';
import {outerMoonNotes} from './outer-moons-notes.mjs';

const kmToAU = value => value / AU_KM;
const zero = [0, 0, 0];
const difference = (a, b) => a.map((v, i) => v - b[i]);
const add = (a, b) => a.map((v, i) => v + b[i]);
const legacy = new Map(bodies.map(body => [body.id, body]));
export const pluto = SYSTEMS.pluto.bodies[0];
export const systemBodies = system => SYSTEMS[system].bodies.map(body => legacy.get(body.id) ?? body);

export function worldVector(ephemeris, system, id, day, local = false) {
  const state = ephemeris?.sample(id, day);
  if (!state) return null;
  if (local) return state.position.map(kmToAU);
  if (ephemerisSpec(system).planetCentred) return null;
  return worldHeliocentric(ephemeris, system, state, day).position.map(kmToAU);
}

function worldHeliocentric(ephemeris, system, state, day) {
  let anchor;
  if (system === 'pluto') anchor = ephemeris.sample('pluto-anchor', day);
  else {
    const entry = solarVelocities(day).states.find(v => v.body.id === SYSTEMS[system].anchor);
    anchor = {position: entry.vector.map(v => v * AU_KM), velocity: entry.velocityAUPerDay.map(v => v * AU_KM / SECONDS_PER_DAY)};
  }
  return {position: add(anchor.position, state.position), velocity: add(anchor.velocity, state.velocity)};
}

export function worldComparison(ephemeris, system, day, target, reference) {
  if (target === reference) return null;
  let a = ephemeris?.sample(target, day), b = ephemeris?.sample(reference, day);
  if (!a && !b) return null;
  const isSolar = target === 'sun' || reference === 'sun';
  if (isSolar && ephemerisSpec(system).planetCentred) return null;
  if (isSolar) {
    a = a ? worldHeliocentric(ephemeris, system, a, day) : {position: zero, velocity: zero};
    b = b ? worldHeliocentric(ephemeris, system, b, day) : {position: zero, velocity: zero};
  }
  if (!a || !b) return null;
  const position = difference(a.position, b.position);
  const velocityKmS = difference(a.velocity, b.velocity);
  const distanceKm = Math.hypot(...position);
  return {source: isSolar && system !== 'pluto' ? 'hybrid' : 'horizons', distanceKm,
    distanceAU: kmToAU(distanceKm), projectedAU: kmToAU(Math.hypot(position[0], position[1])),
    speedKmS: Math.hypot(...velocityKmS), lightSeconds: distanceKm/LIGHT_KM_S,
    radialKmS: distanceKm ? position.reduce((sum, v, i) => sum + v*velocityKmS[i], 0)/distanceKm : null};
}

export function worldTrail(ephemeris, system, body, day, local) {
  if (!body.period || !ephemeris || !supportsEpoch(day,system)) return [];
  const first = Math.max(ephemerisSpec(system).start, day - (local ? body.period * .65 : 365));
  return Array.from({length: first === day ? 1 : 49}, (_, i) =>
    worldVector(ephemeris, system, body.id, first + (day - first) * i / 48, local));
}

export function localOrbitPath(ephemeris, system, body, day) {
  if (!body.period || !ephemeris || !supportsEpoch(day,system)) return [];
  const {start,end}=ephemerisSpec(system);
  const first = Math.max(start, Math.min(end-body.period, day-body.period/2));
  const span = Math.min(body.period, end-first);
  const segments=body.id==='nereid'?256:64;
  return Array.from({length:segments+1},(_,i)=>worldVector(ephemeris,system,body.id,Math.min(end,first+span*i/segments),true));
}

export const worldNotes = {
  ...outerMoonNotes,
  moon: [['Die Gezeitenwirkung der Erde hat die Rotation des Mondes gebunden. Deshalb sehen wir von der Erde im Mittel dieselbe Seite.', 'Earth’s tides locked the Moon’s rotation. On average, we see the same side from Earth.'], 'https://science.nasa.gov/moon/facts/'],
  io: [['Wechselnde Gezeitenkräfte verformen Io und heizen sein Inneres. Das treibt seinen starken Vulkanismus an.', 'Changing tidal forces flex Io and heat its interior, driving intense volcanism.'], 'https://science.nasa.gov/jupiter/moons/io/'],
  europa: [['Unter Europas Eiskruste gibt es starke Hinweise auf einen salzigen Ozean. Er ist ein Ziel der Suche nach lebensfreundlichen Umgebungen.', 'Strong evidence points to a salty ocean below Europa’s ice. It is a target in the search for habitable environments.'], 'https://science.nasa.gov/jupiter/moons/europa/'],
  ganymede: [['Ganymed hat einen größeren Durchmesser als Merkur und besitzt ein eigenes Magnetfeld.', 'Ganymede is larger across than Mercury and has its own magnetic field.'], 'https://science.nasa.gov/jupiter/moons/ganymede/'],
  callisto: [['Kallistos alte Oberfläche ist von Einschlagkratern geprägt. Ein unterirdischer Ozean ist möglich.', 'Impact craters mark Callisto’s ancient surface. A subsurface ocean is possible.'], 'https://science.nasa.gov/jupiter/moons/callisto/'],
  pluto: [['Pluto ist ein Zwergplanet im Kuipergürtel. Seine Bahn ist deutlich gegen die Ekliptik geneigt.', 'Pluto is a Kuiper Belt dwarf planet. Its orbit is substantially inclined to the ecliptic.'], 'https://science.nasa.gov/dwarf-planets/pluto/facts/'],
  charon: [['Charon ist im Verhältnis zu Pluto so groß, dass der gemeinsame Schwerpunkt außerhalb Plutos liegt. Beide Körper umlaufen ihn.', 'Charon is large enough relative to Pluto for their common barycentre to lie outside Pluto. Both bodies orbit it.'], 'https://science.nasa.gov/dwarf-planets/pluto/moons/'],
};
