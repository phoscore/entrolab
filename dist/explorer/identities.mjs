import {RELEASE} from './release.mjs';

export const GAIA_NAMES_SOURCE = 'https://www.cosmos.esa.int/web/gaia/iow_20250513';
const starNames = Object.freeze({
  '5853498713190525696':['Proxima Centauri','Proxima Centauri'],
  '4472832130942575872':['Barnards Stern',"Barnard's Star"],
  '762815470562110464':['Lalande 21185','Lalande 21185'],
});
export const GAIA_KNOWN_STAR_IDS = Object.freeze(Object.keys(starNames));

export function gaiaKnownStarName(id,lang) {
  return Object.hasOwn(starNames,id)?starNames[id][lang==='en'?1:0]:null;
}

export function preferredStarName(object, lang) {
  if (object.kind !== 'star' || object.identity.catalog !== 'gaia' || object.identity.release !== 'DR3') return null;
  return gaiaKnownStarName(object.identity.id,lang);
}

export const OEC_REVISION = '4a61419b92d4a57366b111b2d11d0a03eb0b5df0';
const systems = [
  {host:'51 Peg', aliases:['Helvetios','HD 217014'], file:'systems/51 Peg.xml',
    blob:'442932a7ec7f4d09522b8e8341b22cb6584e6f40', planets:['51 Peg b']},
  {host:'TRAPPIST-1', aliases:['2MASS J23062928-0502285','K2-112'], file:'systems/TRAPPIST-1.xml',
    blob:'3c73bdeca3b237ab8411a406d1b5c70429b372d0', planets:['TRAPPIST-1 b','TRAPPIST-1 c','TRAPPIST-1 d','TRAPPIST-1 e','TRAPPIST-1 f','TRAPPIST-1 g','TRAPPIST-1 h']},
  {host:'HR 8799', aliases:['HD 218396','V342 Peg'], file:'systems/HR 8799.xml',
    blob:'3f6378b7d0763e1c4a1296ef726658c7eb194751', planets:['HR 8799 b','HR 8799 c','HR 8799 d','HR 8799 e']},
];

// The sample imports one planet per file. Extra names are the confirmed children
// under the same single <star> in the pinned OEC XML, without imported measurements.
export function systemFor(object, release) {
  if (release !== RELEASE || object.kind !== 'exoplanet' || object.identity.catalog !== 'oec' || object.identity.release !== OEC_REVISION) return null;
  const {evidence,id} = object.identity;
  if (evidence.source !== 'oec') return null;
  const system = systems.find(s => s.planets[0] === id && evidence.row === `${s.file}#${id}` && evidence.reference === s.blob);
  if (!system) return null;
  const source = `https://github.com/OpenExoplanetCatalogue/open_exoplanet_catalogue/blob/${OEC_REVISION}/${encodeURI(system.file)}`;
  return {...system, source};
}
