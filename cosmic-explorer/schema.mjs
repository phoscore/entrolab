export const SCHEMA_VERSION = 2;
export const DISTANCE_KINDS = Object.freeze({
  'stellar-line-of-sight': 'pc', 'local-distance-indicator': 'Mpc',
  'radial-comoving': 'Mpc', 'transverse-comoving': 'Mpc',
  'angular-diameter': 'Mpc', luminosity: 'Mpc',
});

export function requireData(ok, message) {
  if (!ok) throw new Error(message);
}

function requireSchemaVersion(version) {
  requireData(version === 1 || version === 2, 'Unknown schema version');
}

const label = x => typeof x === 'string' && x.length > 0 && x === x.trim();
const finite = Number.isFinite;
export const objectId = (catalog, release, id) => [catalog, release, id].map(encodeURIComponent).join(':');

export function provenance(source, row, columns, reference = null) {
  return {source, row, columns: Array.isArray(columns) ? columns : [columns], reference};
}

export function quantity(value, unit, evidence, options = {}) {
  if (value === null) return {status: 'unknown', unit, evidence};
  return {status: options.status ?? 'catalog', value, unit, evidence,
    uncertainty: options.uncertainty ?? null, limit: options.limit ?? null,
    ...(options.model ? {model: options.model} : {})};
}

export function validateQuantity(q, sources, unit, check = () => true, schemaVersion = SCHEMA_VERSION) {
  requireSchemaVersion(schemaVersion);
  requireData(q && q.unit === unit, `Expected quantity in ${unit}`);
  validateEvidence(q.evidence, sources);
  if (q.status === 'unknown') {
    requireData(!('value' in q) && !('uncertainty' in q) && !('limit' in q) && !('model' in q), 'Unknown quantity has a value or inference');
    return;
  }
  requireData(['catalog', 'derived', 'schematic'].includes(q.status) && finite(q.value) && check(q.value), `Invalid ${unit} value`);
  requireData(q.status === 'catalog' ? !('model' in q) : label(q.model), 'Inference must name its method/model');
  requireData([null, 'upper', 'lower'].includes(q.limit), 'Invalid upper/lower limit');
  const u = q.uncertainty;
  if (u === null) return;
  requireData(u && !q.limit, 'Uncertainty and one-sided limits must be separate');
  if (u.kind === 'sigma') requireData(finite(u.sigma) && u.sigma > 0, 'Invalid sigma');
  else if (u.kind === 'asymmetric') {
    const sides = [u.minus, u.plus];
    requireData(sides.every(x => (schemaVersion >= 2 && x === null) || (finite(x) && x >= 0)) &&
      sides.some(finite) && (sides.includes(null) || u.minus + u.plus > 0), 'Invalid asymmetric errors');
  } else requireData(u.kind === 'quantiles' && [u.p16, u.p84].every(x => finite(x) && check(x)) &&
    u.p16 <= q.value && q.value <= u.p84 && u.p16 < u.p84, 'Invalid posterior quantiles');
}

function validateEvidence(p, sources) {
  requireData(p && Object.hasOwn(sources, p.source) && label(p.row) && Array.isArray(p.columns) && p.columns.length &&
    p.columns.every(label) && (p.reference === null || label(p.reference)), 'Missing field provenance');
}

const positive = x => x > 0;
const azimuth = x => x >= 0 && x < 360;
const orbitalFields = {period: ['d', positive], semimajorAxis: ['AU', positive], eccentricity: ['1', x => x >= 0 && x < 1],
  inclination: ['deg', x => x >= 0 && x <= 180], ascendingNode: ['deg', azimuth], argumentOfPeriapsis: ['deg', x => x >= -360 && x <= 360]};

export function orbitCapability(orbit) {
  const {elements: e, phase, center, frame, solution} = orbit;
  const measured = q => ['catalog', 'derived'].includes(q?.status) && q.limit === null;
  const coherent = q => measured(q) && q.evidence.source === solution.source && q.evidence.row === solution.row &&
    q.evidence.reference === solution.reference;
  const phaseOk = phase && ['JD-TDB', 'BJD-TDB', 'JD-TT'].includes(phase.timeSystem) && coherent(phase.epoch) &&
    (phase.kind === 'periastron' && e.eccentricity?.value > 0 || phase.kind === 'mean-anomaly' && coherent(phase.angle));
  if (solution.kind === 'single-reference' && label(center) && label(frame) && phaseOk && Object.keys(orbitalFields).every(key => coherent(e[key]))) return 'model-position';
  if (measured(e.period) && measured(e.semimajorAxis)) return 'schematic-phase';
  return 'data-only';
}

export function validateObjects(objects, sources, schemaVersion = SCHEMA_VERSION) {
  requireSchemaVersion(schemaVersion);
  const validate = (q, unit, check) => validateQuantity(q, sources, unit, check, schemaVersion);
  const ids = new Set();
  for (const o of objects) {
    requireData(o && ['star', 'exoplanet', 'galaxy', 'solar-system-body', 'source'].includes(o.kind), 'Unknown object kind');
    const id = o.identity;
    requireData(id && [id.catalog, id.release, id.id].every(label) && o.id === objectId(id.catalog, id.release, id.id) && !ids.has(o.id), `Invalid or duplicate object ID: ${o.id}`);
    ids.add(o.id);
    validateEvidence(id.evidence, sources);
    if (o.classificationEvidence) validateEvidence(o.classificationEvidence, sources);
    requireData(Array.isArray(o.aliases), 'Aliases must be an array');
    const aliases = new Set();
    for (const a of o.aliases) {
      const key = a.name?.normalize('NFKC').toLowerCase();
      requireData(label(a.name) && !aliases.has(key) && ['catalog', 'uncertain'].includes(a.relation), 'Invalid or duplicate alias');
      aliases.add(key);
      validateEvidence(a.evidence, sources);
    }
    if (o.direction !== null) {
      const {frame, epoch, ra, dec, role} = o.direction;
      requireData(['ICRS', 'catalog-equatorial'].includes(frame) && ['object', 'host', 'fiber-mean'].includes(role), 'Invalid direction frame/role');
      if (epoch !== null) {
        requireData(['Julian-year-TCB', 'Julian-year-TT'].includes(epoch.system) && finite(epoch.value), 'Invalid astrometric epoch');
        validateEvidence(epoch.evidence, sources);
      }
      validate(ra, 'deg', azimuth);
      validate(dec, 'deg', x => x >= -90 && x <= 90);
      requireData(ra.status !== 'unknown' && dec.status !== 'unknown' && ra.limit === null && dec.limit === null, 'Incomplete direction');
    }
    if (o.parallax) validate(o.parallax, 'mas');
    if (o.redshift) {
      requireData(['solar-system-barycentric', 'heliocentric', 'CMB', 'observer', 'unspecified'].includes(o.redshift.frame), 'Invalid redshift frame');
      validate(o.redshift.measurement, '1', x => x > -1);
    }
    requireData(Array.isArray(o.distances), 'Distances must be an array');
    const distanceKeys = new Set();
    for (const d of o.distances) {
      requireData(Object.hasOwn(DISTANCE_KINDS, d.kind) && label(d.method) && label(d.origin), 'Invalid distance definition');
      const key = JSON.stringify([d.kind, d.method, d.origin, d.measurement?.evidence?.source, d.measurement?.evidence?.row]);
      requireData(!distanceKeys.has(key), 'Duplicate distance estimate');
      distanceKeys.add(key);
      validate(d.measurement, DISTANCE_KINDS[d.kind], positive);
      if (['radial-comoving', 'transverse-comoving', 'angular-diameter', 'luminosity'].includes(d.kind)) {
        requireData(d.measurement.status === 'derived' && o.redshift?.measurement.value > 0 && o.redshift.frame !== 'unspecified', 'Cosmological distance requires model and positive framed redshift');
      }
    }
    if (Object.hasOwn(o, 'overview')) {
      validate(o.overview?.pl_orbper, 'd', positive);
      validate(o.overview?.pl_orbsmax, 'AU', positive);
    }
    requireData(Array.isArray(o.orbits), 'Orbits must be an array');
    let nasaDefaults = 0;
    for (const orbit of o.orbits) {
      requireData(['single-reference', 'composite', 'undetermined'].includes(orbit.solution?.kind) &&
        (orbit.center === null || label(orbit.center)) && (orbit.frame === null || label(orbit.frame)), 'Invalid orbital solution');
      validateEvidence(orbit.solution, sources);
      const nasaPsSolution = schemaVersion >= 2 && orbit.solution.source === 'nea-ps';
      if (nasaPsSolution) {
        requireData(orbit.solution.kind === 'single-reference' && orbit.solution.reference !== null &&
          typeof orbit.solution.archiveDefault === 'boolean' && orbit.solution.columns.includes('default_flag'),
        'Invalid NASA default flag or provenance');
        if (orbit.solution.archiveDefault) nasaDefaults++;
      } else {
        requireData(!Object.hasOwn(orbit.solution, 'archiveDefault'), 'Default flag requires a NASA PS solution in schema v2');
      }
      for (const [key, [unit, domain]] of Object.entries(orbitalFields)) if (key in orbit.elements) validate(orbit.elements[key], unit, domain);
      if (orbit.separationOrSemimajorAxis) validate(orbit.separationOrSemimajorAxis, 'AU', positive);
      requireData(Object.keys(orbit.elements).every(key => Object.hasOwn(orbitalFields, key)), 'Unknown orbital element');
      if (orbit.phase !== null) {
        requireData(['periastron', 'mean-anomaly', 'transit'].includes(orbit.phase.kind) && (orbit.phase.timeSystem === null || label(orbit.phase.timeSystem)), 'Invalid orbital phase');
        validate(orbit.phase.epoch, 'd');
        if (orbit.phase.kind === 'mean-anomaly') validate(orbit.phase.angle, 'deg', azimuth);
      }
      requireData(orbit.capability === orbitCapability(orbit), 'Orbital capability overstates the data');
    }
    requireData(nasaDefaults <= 1, `Multiple NASA default solutions for ${o.identity.id}`);
  }
  return objects;
}
