import {AU_KM,parseModelDate} from './solar-model.mjs';

const radians = degrees => degrees*Math.PI/180;
const longitude = radians(256), latitude = radians(5);
const sinLon = Math.sin(longitude), cosLon = Math.cos(longitude);
const sinLat = Math.sin(latitude), cosLat = Math.cos(latitude);

// Right-handed basis in the heliocentric J2000 ecliptic frame.
// The nose is a direction toward the incoming neutral helium.
export const nose = Object.freeze([cosLat*cosLon,cosLat*sinLon,sinLat]);
const east = [-sinLon,cosLon,0];
const north = [-sinLat*cosLon,-sinLat*sinLon,cosLat];

export function boundaries(cosine,azimuth) {
  const cross = Math.sqrt(Math.max(0,1-cosine*cosine));
  const tail = Math.max(0,-cosine);
  const latitudeComponent = cross*Math.sin(azimuth);
  const heliopause = 126-12*cosine+135*tail**2
    + 9*latitudeComponent + 7*cross**2*Math.cos(2*azimuth);
  const shock = heliopause*(.73-.12*tail+.04*latitudeComponent);
  return {shock,heliopause};
}

function point(radius,cosine,azimuth) {
  const cross = Math.sqrt(Math.max(0,1-cosine*cosine));
  const e = cross*Math.cos(azimuth), n = cross*Math.sin(azimuth);
  return nose.map((v,i)=>radius*(cosine*v+e*east[i]+n*north[i]));
}

export function shellGeometry() {
  return ['heliopause','shock'].map(id=>{
    const rings = Array.from({length:21},(_,j)=>{
      const cosine = Math.cos(j*Math.PI/20);
      return Array.from({length:40},(_,i)=>{
        const azimuth = i*2*Math.PI/40;
        return point(boundaries(cosine,azimuth)[id],cosine,azimuth);
      });
    });
    return {id,rings};
  });
}

const v1Shock = 'https://pubmed.ncbi.nlm.nih.gov/16179468/';
const v2Shock = 'https://doi.org/10.1038/nature07024';
const heliopause = 'https://doi.org/10.1038/s41550-019-0920-y';
export const crossings = Object.freeze([
  {id:'v1-shock',probe:'v1',boundary:'shock',start:'2004-12-16',end:'2004-12-16',au:94,source:v1Shock},
  {id:'v2-shock',probe:'v2',boundary:'shock',start:'2007-08-30',end:'2007-09-01',au:84,source:v2Shock},
  {id:'v1-pause',probe:'v1',boundary:'heliopause',start:'2012-08-25',end:'2012-08-25',au:121.6,source:heliopause},
  {id:'v2-pause',probe:'v2',boundary:'heliopause',start:'2018-11-05',end:'2018-11-05',au:119,source:heliopause},
].map(event=>Object.freeze({...event,day:parseModelDate(event.start),lastDay:parseModelDate(event.end)})));

export function crossingPosition(event,data) {
  const position = data?.[event.probe]?.sample(event.day)?.position;
  return position?.map(km=>km/AU_KM) ?? null;
}

export function observedRegion(probe,day) {
  const shock = crossings.find(event=>event.probe===probe&&event.boundary==='shock');
  const pause = crossings.find(event=>event.probe===probe&&event.boundary==='heliopause');
  if (!shock || !pause || !Number.isFinite(day)) return null;
  // At day resolution, the whole final crossing date is a transition.
  if (day>=pause.day) return day<pause.day+1?'pauseCrossing':'interstellar';
  if (day>=shock.day) return day<shock.lastDay+1?'shockCrossing':'sheath';
  return 'wind';
}

export function regionPoint(region,direction) {
  const dot = axis => axis.reduce((value,v,i)=>value+v*direction[i],0);
  const {shock,heliopause}=boundaries(dot(nose),Math.atan2(dot(north),dot(east)));
  const radii={
    wind:shock*.55, shock, sheath:(shock+heliopause)/2,
    heliopause, interstellar:heliopause*1.23, tail:heliopause*.82,
  };
  return direction.map(v=>v*radii[region]);
}
