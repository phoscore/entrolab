import { C } from './physics.mjs';
import { compactObject, EXAMPLES } from './extreme-data.mjs';

// IAU 2015 B3 conversion factors. Jupiter mass is the nominal GM divided by C.G.
const solarRadius = 6.957e8;
const jupiterRadius = 7.1492e7;
const jupiterMass = 1.2668653e17 / C.G;
const solarTemperature = 5772;

function sphereExample(example) {
 const {mass,radius,temperature} = example;
 return Object.freeze({
  ...example,
  density: mass/(4*Math.PI*radius**3/3),
  ...(temperature ? {luminosity:(radius/solarRadius)**2*(temperature/solarTemperature)**4} : {}),
 });
}

const examples = Object.freeze({
 // Faherty et al. inferred this temperature using 0.9 Jupiter radii. The demo uses 1.
 brown: sphereExample({
  name:'v0925.brown', reference:'Luhman 16B', mass:29.4*jupiterMass, radius:jupiterRadius,
  temperature:1280, color:'#c99179', assumption:'v0925.brown.model',
  sources:Object.freeze([
   ['Bedin et al. (2024)', 'https://arxiv.org/abs/2403.08865'],
   ['Faherty et al. (2014)', 'https://doi.org/10.1088/0004-637X/790/2/90'],
   ['Spiegel et al. (2011)', 'https://doi.org/10.1088/0004-637X/727/1/57'],
  ].map(Object.freeze)),
 }),
 supergiant: sphereExample({
  name:'v0925.supergiant', reference:'Betelgeuse', mass:18*C.sun, radius:764*solarRadius,
  temperature:3600, color:'#ee9867', assumption:'v0925.supergiant.model',
  sources:Object.freeze([
   ['Joyce et al. (2020)', 'https://arxiv.org/abs/2006.09837'],
   ['Levesque & Massey (2020)', 'https://arxiv.org/abs/2002.10463'],
  ].map(Object.freeze)),
 }),
 magnetar: sphereExample({
  name:'v0925.magnetar', reference:'4U 0142+61', mass:EXAMPLES.neutron.mass, radius:EXAMPLES.neutron.radius,
  period:8.69, field:1.3e10, color:'#a6bdf3', assumption:'v0925.magnetar.model',
  sources:Object.freeze([
   ['Olausen & Kaspi (2014)', 'https://arxiv.org/abs/1309.4167'],
   ['McGill Magnetar Catalog', 'https://www.physics.mcgill.ca/~pulsar/magnetar/v201117/main.html'],
  ].map(Object.freeze)),
 }),
 wolf: Object.freeze({
  name:'v0925.wolf', reference:'WR 111 (WC5)', mass:13.63*C.sun, radius:.905*solarRadius,
  temperature:140000, luminosity:10**5.45, massLoss:10**-5.14, density:null,
  color:'#99c9e4', assumption:'v0925.wolf.model',
  sources:Object.freeze([Object.freeze(['Gräfener & Hamann (2005), Table 2', 'https://arxiv.org/abs/astro-ph/0410697'])]),
 }),
});

export const extremeKinds = Object.freeze(['blackhole','white','neutron',...Object.keys(examples)]);
export const hasStellarExample = kind => Object.hasOwn(examples,kind);
export function extremeExample(kind, mass) {
 if (hasStellarExample(kind)) return {kind,...examples[kind]};
 if (kind==='blackhole'||kind==='white'||kind==='neutron') return compactObject(kind,mass);
 throw new RangeError('Unknown extreme object');
}

export function extremeExplanation({kind,geometry,disk,pulsar}) {
 if (kind==='blackhole') return geometry?'v0925.blackhole.geometry':disk?'v0925.blackhole.image':'v0925.blackhole.isolated';
 if (kind==='neutron'&&pulsar) return 'v0925.neutron.pulsar';
 return `v0925.${kind}.image`;
}
