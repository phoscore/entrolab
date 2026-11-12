export const CODATA_2022 = Object.freeze({
 proton: 938.27208943, neutron: 939.56542194, deuteron: 1875.61294500
}); // Rest-energy equivalents in MeV; 2022 CODATA.

export const PHOTON_MIN_MEV = .01;
export const PHOTON_MAX_MEV = 1000;
export const photonEnergyValid = energy =>
 Number.isFinite(energy) && energy >= PHOTON_MIN_MEV && energy <= PHOTON_MAX_MEV;

export function photonSystem(energyA, energyB, degrees) {
 if (!photonEnergyValid(energyA) || !photonEnergyValid(energyB) ||
     !Number.isFinite(degrees) || degrees < 0 || degrees > 180) {
  throw new RangeError('Invalid two-photon parameters');
 }
 const angle = degrees * Math.PI / 180;
 // MeV/c for momentum. Pin cardinal directions to avoid a spurious arrow at 180°.
 const bx = degrees === 90 ? 0 : energyB * Math.cos(angle);
 const by = degrees === 0 || degrees === 180 ? 0 : energyB * Math.sin(angle);
 const energy = energyA + energyB;
 const restEnergy = 2 * Math.sqrt(energyA * energyB) * Math.sin(angle / 2);
 return {energy, restEnergy, momentum: [energyA + bx, by], photonB: [bx, by]};
}

export function deuteronBinding() {
 const {proton, neutron, deuteron} = CODATA_2022;
 const free = proton + neutron;
 return {free, bound: deuteron, difference: free - deuteron};
}
