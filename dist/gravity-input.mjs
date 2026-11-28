import {C, EPS} from './physics.mjs';

// Bound coordinate rounding to substantially less than one softened length.
export const MAX_POSITION_AU = EPS / (128 * Number.EPSILON);
// Keep inspector input in a clearly non-relativistic domain for the Newtonian model.
export const MAX_SPEED_KMS = C.c * 0.01 / 1000;
const maxSpeedAuPerDay = MAX_SPEED_KMS * 1000 * C.day / C.AU;

export function gravityInputError(body) {
  if (!body || ![body.m, body.x, body.y, body.vx, body.vy].every(Number.isFinite))
    return 'gravity.input.finite';
  if (body.m < 1e-15 || body.m > 1e11) return 'gravity.input.mass';
  if (Math.abs(body.x) > MAX_POSITION_AU || Math.abs(body.y) > MAX_POSITION_AU)
    return 'gravity.input.position';
  if (Math.hypot(body.vx, body.vy) > maxSpeedAuPerDay)
    return 'gravity.input.velocity';
  return null;
}
