import {SCHEMA_VERSION, objectId, orbitCapability, provenance, quantity, requireData, validateObjects, validateQuantity} from './schema.mjs';

export function readCsv(text) {
  const rows = [];
  let row = [], field = '', state = 'start';
  const endField = () => { row.push(field); field = ''; state = 'start'; };
  const endRow = () => { endField(); rows.push(row); row = []; };
  for (const char of text.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n')) {
    if (state === 'quoted') {
      if (char === '"') state = 'closed';
      else field += char;
    } else if (char === ',' || char === '\n') {
      if (char === ',') endField();
      else endRow();
    } else if (char === '"' && state === 'closed') {
      field += char;
      state = 'quoted';
    } else if (char === '"' && state === 'start') state = 'quoted';
    else {
      requireData(state !== 'closed' && char !== '"' && char !== '\r', 'Malformed CSV field');
      field += char;
      state = 'plain';
    }
  }
  requireData(state !== 'quoted', 'Unterminated CSV quotation');
  if (row.length || state !== 'start') endRow();
  const columns = rows.shift();
  requireData(columns?.every(Boolean) && new Set(columns).size === columns.length, 'Invalid CSV header');
  return rows.map((values, i) => {
    requireData(values.length === columns.length, `Invalid CSV width at row ${i + 2}`);
    return Object.fromEntries(columns.map((name, n) => [name, values[n]]));
  });
}

const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
function number(value, field) {
  if (value === '' || value === null) return null;
  requireData((typeof value === 'number' || typeof value === 'string' && decimal.test(value)) && Number.isFinite(Number(value)), `Invalid number in ${field}: ${value}`);
  return Number(value);
}

function required(value, field) {
  const n = number(value, field);
  requireData(n !== null, `Missing ${field}`);
  return n;
}

function id64(value) {
  requireData(typeof value === 'string' && /^[1-9]\d{0,18}$/.test(value) && BigInt(value) <= 9223372036854775807n, 'Invalid signed 64-bit catalogue ID');
  return value;
}

function base(kind, catalog, release, id, evidence) {
  return {id: objectId(catalog, release, id), kind, identity: {catalog, release, id, evidence}, aliases: [], direction: null, distances: [], orbits: []};
}

function direction(ra, dec, evidence, {frame, role, epoch = null}) {
  return {frame, role, epoch,
    ra: quantity(required(ra, 'ra'), 'deg', evidence(0)), dec: quantity(required(dec, 'dec'), 'deg', evidence(1))};
}

function errors(minus, plus, columns) {
  const lo = number(minus, columns[0]), hi = number(plus, columns[1]);
  requireData(lo === null || lo >= 0, `Negative lower error magnitude: ${columns[0]}`);
  requireData(hi === null || hi >= 0, `Negative upper error magnitude: ${columns[1]}`);
  if ((lo === null && hi === null) || (lo === 0 && hi === 0)) return null;
  return {kind: 'asymmetric', minus: lo, plus: hi};
}

const knownStars = new Set(['762815470562110464', '4472832130942575872', '5853498713190525696']);

export function importGaia(rows) {
  return rows.map(row => {
    const id = id64(row.source_id);
    const from = columns => provenance('gaia', id, columns);
    const o = base(knownStars.has(id) ? 'star' : 'source', 'gaia', 'DR3', id, from('source_id'));
    if (knownStars.has(id)) o.classificationEvidence = provenance('gaia-nearby', id, 'Gaia DR3 identifier in nearby-star comparison');
    const epoch = {system: 'Julian-year-TCB', value: 2016, evidence: from('ref_epoch (release constant)')};
    o.direction = direction(row.ra, row.dec, i => from(['ra', 'dec'][i]), {frame: 'ICRS', role: 'object', epoch});
    const parallax = number(row.parallax, 'parallax'), sigma = number(row.parallax_error, 'parallax_error');
    requireData((parallax === null) === (sigma === null), 'Gaia parallax and standard error disagree');
    requireData(sigma === null || sigma > 0, 'Invalid Gaia parallax standard error');
    o.parallax = quantity(parallax, 'mas', from(['parallax', 'parallax_error']), {uncertainty: sigma === null ? null : {kind: 'sigma', sigma}});
    const solution = required(row.astrometric_params_solved, 'astrometric_params_solved');
    requireData([3, 31, 95].includes(solution) && (solution === 3) === (parallax === null), 'Invalid Gaia solution mask');
    const ruwe = number(row.ruwe, 'ruwe');
    requireData(ruwe === null || ruwe > 0, 'Invalid Gaia RUWE');
    o.quality = {astrometricParamsSolved: solution, ruwe, parallaxOverError: parallax === null ? null : parallax / sigma};
    for (const [suffix, method] of [['geo', 'geometric'], ['photogeo', 'photogeometric']]) {
      const columns = ['med', 'lo', 'hi'].map(p => `r_${p}_${suffix}`);
      const [value, p16, p84] = columns.map(k => number(row[k], k));
      if ([value, p16, p84].every(x => x === null)) continue;
      requireData([value, p16, p84].every(x => x !== null) && parallax !== null, 'Incomplete Gaia distance posterior');
      o.distances.push({kind: 'stellar-line-of-sight', method, origin: 'solar-system-barycenter',
        measurement: quantity(value, 'pc', provenance('bailer-jones', id, columns, 'https://doi.org/10.3847/1538-3881/abd806'),
          {status: 'derived', model: `Bailer-Jones et al. 2021 ${method}`, uncertainty: {kind: 'quantiles', p16, p84}})});
    }
    return o;
  });
}

export function importDesi(rows) {
  return rows.map(row => {
    const id = id64(row.targetid);
    const from = columns => provenance('desi', id, columns);
    requireData(row.survey === 'main' && row.program === 'bright' && row.spectype === 'GALAXY' &&
      row.zcat_primary === 't' && row.zwarn === '0', `DESI row violates sample filter: ${id}`);
    const o = base('galaxy', 'desi', 'DR1-iron-zpix-v1', id, from('targetid'));
    o.aliases = [{name: row.desiname, relation: 'catalog', evidence: from('desiname')}];
    o.direction = direction(row.mean_fiber_ra, row.mean_fiber_dec, i => from(['mean_fiber_ra', 'mean_fiber_dec'][i]), {frame: 'catalog-equatorial', role: 'fiber-mean'});
    o.redshift = {frame: 'solar-system-barycentric', measurement: quantity(required(row.z, 'z'), '1', from(['z', 'zerr']),
      {uncertainty: {kind: 'sigma', sigma: required(row.zerr, 'zerr')}})};
    o.quality = {zwarn: 0, deltaChi2: required(row.deltachi2, 'deltachi2'), survey: row.survey, program: row.program,
      primary: true, healpix64Nested: required(row.healpix, 'healpix'), meanMjd: required(row.mean_mjd, 'mean_mjd')};
    requireData(o.quality.deltaChi2 >= 0 && Number.isInteger(o.quality.healpix64Nested) && o.quality.healpix64Nested >= 0 &&
      o.quality.healpix64Nested < 12 * 64 ** 2 && o.quality.meanMjd > 0, 'Invalid DESI quality metadata');
    return o;
  });
}

const elements = {period: ['period', 'pl_orbper', 'd'], semimajorAxis: ['semimajoraxis', 'pl_orbsmax', 'AU'],
  eccentricity: ['eccentricity', 'pl_orbeccen', '1'], inclination: ['inclination', 'pl_orbincl', 'deg'],
  argumentOfPeriapsis: ['periastron', 'pl_orblper', 'deg']};

export function importOec(rows, release, schemaVersion = SCHEMA_VERSION) {
  return rows.map(row => {
    const key = `${row.file}#${row.name}`;
    const from = column => provenance('oec', key, column, row.blob);
    const o = base('exoplanet', 'oec', release, row.name, from('planet/name'));
    o.aliases = row.aliases.map(name => ({name, relation: 'catalog', evidence: from('planet/name')}));
    const orbit = {solution: {...from('planet'), kind: 'undetermined'}, center: null, frame: null, elements: {}, phase: null};
    for (const [key, [field, , unit]] of Object.entries(elements)) {
      const value = row.elements[field];
      if (!value) continue;
      const path = `planet/${field}`;
      orbit.elements[key] = quantity(required(value.value, field), unit, from([path, `${path}/@errorminus`, `${path}/@errorplus`]),
        {uncertainty: errors(value.minus, value.plus, ['errorminus', 'errorplus'])});
    }
    if (row.phase) {
      const field = row.phase.kind === 'transit' ? 'transittime' : 'periastrontime';
      const path = `planet/${field}`;
      const uncertainty = errors(row.phase.minus ?? null, row.phase.plus ?? null, ['errorminus', 'errorplus']);
      const columns = [path, `${path}/@unit`];
      if (schemaVersion >= 2 && uncertainty) columns.push(`${path}/@errorminus`, `${path}/@errorplus`);
      orbit.phase = {kind: row.phase.kind, timeSystem: row.phase.system,
        epoch: quantity(required(row.phase.value, field), 'd', from(columns), {uncertainty})};
    }
    orbit.capability = orbitCapability(orbit);
    o.orbits.push(orbit);
    return o;
  });
}

function neaReference(value) {
  const ref = value.match(/href=["']?(https?:\/\/[^\s"'>]+)/i)?.[1];
  if (ref) return ref;
  return value.trim().replace(/<[^>]+>/g, '').trim() || null;
}

function neaLowerError(row, column) {
  const minus = number(row[column], column);
  requireData(minus === null || minus <= 0, `NASA lower error must be signed: ${column}`);
  return minus === null ? null : Math.abs(minus);
}

function neaQuantity(row, field, unit, from) {
  const columns = [field, `${field}err1`, `${field}err2`, `${field}lim`];
  const value = number(row[field], field);
  if (value === null) return quantity(null, unit, from(columns));
  const flag = number(row[columns[3]], columns[3]);
  requireData(flag === null || [-1, 0, 1].includes(flag), 'Unknown NASA limit flag');
  const uncertainty = errors(neaLowerError(row, columns[2]), row[columns[1]], [columns[2], columns[1]]);
  return quantity(value, unit, from(columns), {limit: flag === 1 ? 'upper' : flag === -1 ? 'lower' : null,
    uncertainty: flag ? null : uncertainty});
}

export function importNasa(ps, composite, snapshot) {
  const sourceKeys = {ps: 'nea-ps', composite: 'nea-composite'};
  const byName = new Map(), solutionRows = new Set(), compositeRows = new Set();
  for (const [kind, rows] of [['ps', ps], ['composite', composite]]) for (const [index, row] of rows.entries()) {
    const {pl_name: name, hostname: host} = row;
    requireData(name?.trim() && host?.trim(), 'Missing NASA name or host');
    requireData(row.discoverymethod?.trim(), 'Missing NASA discovery method');
    const ref = kind === 'ps' ? neaReference(row.pl_refname) : null;
    const solutionKey = JSON.stringify([name, ref]);
    const keySet = kind === 'ps' ? solutionRows : compositeRows;
    requireData(kind === 'ps' ? ref && !keySet.has(solutionKey) && ['0', '1'].includes(row.default_flag) : !keySet.has(name), 'Duplicate or invalid NASA solution');
    keySet.add(kind === 'ps' ? solutionKey : name);
    const rowKey = `${name} [CSV ${index + 2}]`;
    const from = (columns, reference = ref) => provenance(sourceKeys[kind], rowKey, columns, reference);
    const existing = byName.get(name);
    requireData(!existing || existing.host === host, `Conflicting NASA host for ${name}`);
    const o = existing ?? {...base('exoplanet', 'nea', snapshot, name, from('pl_name')), host, discoveryMethod: row.discoverymethod};
    requireData(o.discoveryMethod === row.discoverymethod, `Conflicting NASA discovery method for ${name}`);
    if (kind === 'ps') {
      const solution = {...from(['pl_refname', 'default_flag']), kind: 'single-reference', archiveDefault: row.default_flag === '1'};
      const orbit = {solution, center: null, frame: null, elements: {}, phase: null};
      for (const [key, [, field, unit]] of Object.entries(elements)) orbit.elements[key] = neaQuantity(row, field, unit, from);
      if (['Imaging', 'Microlensing'].includes(row.discoverymethod)) {
        orbit.separationOrSemimajorAxis = orbit.elements.semimajorAxis;
        delete orbit.elements.semimajorAxis;
      }
      const time = neaQuantity(row, 'pl_orbtper', 'd', from);
      const transit = number(row.pl_tranmid, 'pl_tranmid');
      if (time.status !== 'unknown') orbit.phase = {kind: 'periastron', timeSystem: row.pl_tsystemref || null, epoch: time};
      else if (transit !== null) orbit.phase = {kind: 'transit', timeSystem: row.pl_tsystemref || null, epoch: quantity(transit, 'd', from(['pl_tranmid', 'pl_tsystemref']))};
      orbit.capability = orbitCapability(orbit);
      o.orbits.push(orbit);
    } else {
      const ra = number(row.ra, 'ra'), dec = number(row.dec, 'dec');
      requireData((ra === null) === (dec === null), 'Incomplete NASA host direction');
      if (ra !== null) o.direction = direction(ra, dec, i => from(['ra', 'dec'][i]), {frame: 'catalog-equatorial', role: 'host'});
      const distance = number(row.sy_dist, 'sy_dist');
      const lo = neaLowerError(row, 'sy_disterr2');
      if (distance !== null) o.distances.push({kind: 'stellar-line-of-sight', method: 'archive-host-distance-unspecified', origin: 'catalog-unspecified',
        measurement: quantity(distance, 'pc', from(['sy_dist', 'sy_disterr1', 'sy_disterr2', 'sy_dist_reflink'], neaReference(row.sy_dist_reflink)),
          {uncertainty: errors(lo, row.sy_disterr1, ['sy_disterr2', 'sy_disterr1'])})});
      o.overview = Object.fromEntries(['pl_orbper', 'pl_orbsmax'].map((field, i) => [field, neaQuantity(row, field, ['d', 'AU'][i],
        columns => from([...columns, `${field}_reflink`], neaReference(row[`${field}_reflink`])))]));
      o.overview.pl_orbsmaxMeaning = ['Imaging', 'Microlensing'].includes(row.discoverymethod) ? 'semimajor-axis-or-projected-separation' : 'semimajor-axis';
    }
    byName.set(name, o);
  }
  const objects = [...byName.values()];
  const sources = {'nea-ps': {}, 'nea-composite': {}};
  validateObjects(objects, sources);
  for (const o of objects) if (o.overview) {
    validateQuantity(o.overview.pl_orbper, sources, 'd', x => x > 0);
    validateQuantity(o.overview.pl_orbsmax, sources, 'AU', x => x > 0);
  }
  return {schemaVersion: SCHEMA_VERSION, snapshot, distribution: 'local-only', objects};
}
