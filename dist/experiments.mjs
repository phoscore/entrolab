import {C,body,scenario} from './physics.mjs';
export const experimentInfo={
 triple:'Drei Sterne: 1 / 0,8 / 0,5 M☉. Deterministische ebene Anfangsdaten; keine Stabilitätsgarantie, empfindliche Wechselwirkung.',
 assist:'Schleuder im Laborsystem: Stern 1 M☉ mit vx = −0,005 AU/d; Testkörper 10⁻¹² M☉ (≈ 1,99 × 10¹⁸ kg; Kleinkörper, keine Raumsonde) mit vx = +0,03 AU/d. Energieaustausch mit bewegtem Stern; Geschwindigkeit hängt vom Bezugssystem ab.',
 solar:'8 Planeten · idealisierte kreisförmige Startbahnen',binary:'Elliptische Doppelsternbahn · e ≈ 0,5',hole:'Newtonsches BH-Modell · keine relativistische Horizontphysik'
};
export function experiment(name){if(name==='triple'){const b=[body('Stern A','star',1,-1,0,0,-.004,'#ffd19a'),body('Stern B','star',.8,1,0,0,.005,'#bba8ff'),body('Stern C','star',.5,0,1.5,-.006,0,'#79d6e8')];const m=b.reduce((s,x)=>s+x.m,0);for(const k of ['x','y','vx','vy']){const c=b.reduce((s,x)=>s+x.m*x[k],0)/m;for(const x of b)x[k]-=c}return b}if(name==='assist')return [body('Bewegter Stern','star',1,0,0,-.005,0,'#ffd19a'),body('Testkörper','planet',1e-12,-2,.4,.03,0,'#79d6e8')];return scenario(name)}
