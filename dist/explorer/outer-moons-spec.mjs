import {parseModelDate} from './solar-model.mjs';

export const OUTER_RELEASE = 'v0.9.5-horizons-outer-2026-2027.1';
export const OUTER_START = parseModelDate('2026-07-01');
export const OUTER_END = parseModelDate('2027-07-01');

// Mean sizes and orbital context are from JPL SSD. Position and velocity are
// computed exclusively from the separately archived Horizons state vectors.
const moon = (id,target,hours,period,radiusKm,meanOrbitKm,name,color) =>
  ({id,target,hours,period,radiusKm,meanOrbitKm,names:[name,name],color,size:5});

export const OUTER_SYSTEMS = {
  saturn: {anchor:'saturn',centre:699,scaleKm:3800000,innerKm:1480000,names:['Saturnsystem','Saturn system'],bodies:[
    {id:'saturn',target:699},
    moon('titan',606,8,15.945,2574.76,1221900,'Titan','#e9b575'),
    moon('enceladus',602,1,1.370,252.10,238000,'Enceladus','#c4e3ea'),
    moon('rhea',605,4,4.518,763.5,527100,'Rhea','#acc6d6'),
    moon('dione',604,2,2.737,561.4,377700,'Dione','#d0d6f0'),
    moon('tethys',603,2,1.888,531.1,295000,'Tethys','#c9c4e7'),
    moon('iapetus',608,24,79.32,734.3,3560800,'Iapetus','#c39b88'),
    moon('mimas',601,1,.942,198.2,185500,'Mimas','#acb4d2'),
  ]},
  uranus: {anchor:'uranus',centre:799,scaleKm:630000,names:['Uranussystem','Uranus system'],bodies:[
    {id:'uranus',target:799},
    moon('titania',703,6,8.706,788.9,436300,'Titania','#c9b4a9'),
    moon('oberon',704,8,13.463,761.4,583500,'Oberon','#be9b8c'),
    moon('umbriel',702,3,4.144,584.7,266000,'Umbriel','#9b9fc4'),
    moon('ariel',701,2,2.520,578.9,190900,'Ariel','#cde0ef'),
    moon('miranda',705,1,1.413,235.8,129900,'Miranda','#d7cab8'),
  ]},
  neptune: {anchor:'neptune',centre:899,scaleKm:10000000,innerKm:470000,names:['Neptunsystem','Neptune system'],bodies:[
    {id:'neptune',target:899},
    moon('triton',801,4,5.877,1353.4,354800,'Triton','#ddc2b5'),
    moon('proteus',808,1,1.122,210,117600,'Proteus','#aab4d5'),
    moon('nereid',802,8,360.14,170,5513400,'Nereid','#a5cfdf'),
  ]},
};
