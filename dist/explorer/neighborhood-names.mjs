import {GAIA_KNOWN_STAR_IDS,gaiaKnownStarName,GAIA_NAMES_SOURCE} from './identities.mjs';

// Small, independently citable annotations. Gaia DR3 source IDs remain the keys.
const supplements = Object.freeze({
  '35227046884571776': {names:['Teegardens Stern',"Teegarden's Star"],aliases:['Teegarden'],spectral:'M7.0 V',
    reference:'https://arxiv.org/abs/1906.07196'},
  '3864972938605115520': {names:['Wolf 359','Wolf 359']},
  '1872046609345556480': {names:['61 Cygni A','61 Cygni A'],aliases:['61 Cyg A']},
  '1872046574983497216': {names:['61 Cygni B','61 Cygni B'],aliases:['61 Cyg B']},
  '762815470562110464': {aliases:['Gl 411','Gliese 411'],spectral:'M2 V',
    reference:'https://doi.org/10.1088/0004-637X/753/2/156'},
});
export const NEIGHBORHOOD_ANNOTATIONS = 'neighborhood-identities.1';
export const NEIGHBORHOOD_KNOWN_IDS = Object.freeze([...new Set([...GAIA_KNOWN_STAR_IDS,...Object.keys(supplements)])]);
export const neighborhoodName = (id,lang) => gaiaKnownStarName(id,lang) ?? supplements[id]?.names?.[lang==='en'?1:0] ?? null;
export const neighborhoodAnnotation = id => Object.hasOwn(supplements,id) ? supplements[id] : null;
export {GAIA_NAMES_SOURCE};
