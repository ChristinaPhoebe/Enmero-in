// Regenerates the Watch Tower globe land mask.
//
// The globe only needs to know which dots sit over land, not where the
// coastline runs, so the mask is rasterised once at build time and committed
// as a compact bitmask. Run this only if the mask needs to change:
//
//   node scripts/build-globe-land.mjs
//
// Source: Natural Earth 110m land via world-atlas, public domain.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COLS = 240;
const ROWS = 120;
const SOURCE_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json';
const TARGET = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/components/watchtower/globeLand.js'
);

// Natural Earth 110m land covers about 29 percent of the surface. A mask far
// from that figure means the geometry was decoded or rasterised wrongly, which
// is easy to miss because the globe still looks like a plausible sphere.
const EXPECTED_LAND_SHARE = [0.28, 0.36];

const { transform, arcs: rawArcs, objects } = JSON.parse(await loadSource());
const [scaleX, scaleY] = transform.scale;
const [translateX, translateY] = transform.translate;

// TopoJSON stores each arc delta encoded in quantised integer space. Rebuild
// the absolute coordinates and apply the topology transform once.
const arcs = rawArcs.map((arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * scaleX + translateX, y * scaleY + translateY];
  });
});

// A negative index means that arc was traversed backwards. Consecutive arcs in
// a ring share a boundary point, so the duplicate is dropped when joining.
function ring(arcIndices) {
  const points = [];
  for (const index of arcIndices) {
    const arc = index < 0 ? arcs[~index].slice().reverse() : arcs[index];
    for (let i = points.length ? 1 : 0; i < arc.length; i += 1) points.push(arc[i]);
  }
  return points;
}

const rings = [];
function collect(geometry) {
  if (geometry.type === 'GeometryCollection') geometry.geometries.forEach(collect);
  else if (geometry.type === 'Polygon') rings.push(...geometry.arcs.map(ring));
  else if (geometry.type === 'MultiPolygon') geometry.arcs.forEach((polygon) => rings.push(...polygon.map(ring)));
  else throw new Error(`unsupported geometry type ${geometry.type}`);
}
objects.land.geometries.forEach(collect);

// Even-odd scanline fill. All rings are filled as a single planar subdivision so
// holes such as the Caspian fall out without special cases. Each row is sampled
// twice and the results merged, otherwise narrow land like Chile and Italy
// disappears between scanlines.
const bits = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
for (let row = 0; row < ROWS; row += 1) {
  for (const latitude of [90 - ((row + 0.25) * 180) / ROWS, 90 - ((row + 0.75) * 180) / ROWS]) {
    const crossings = [];
    for (const points of rings) {
      for (let i = 0; i < points.length; i += 1) {
        const [ax, ay] = points[i];
        const [bx, by] = points[(i + 1) % points.length];
        if (ay > latitude === by > latitude) continue;
        crossings.push(ax + ((latitude - ay) * (bx - ax)) / (by - ay));
      }
    }
    crossings.sort((a, b) => a - b);
    for (let i = 0; i + 1 < crossings.length; i += 2) {
      const from = Math.ceil(((crossings[i] + 180) / 360) * COLS - 0.5);
      const to = Math.floor(((crossings[i + 1] + 180) / 360) * COLS - 0.5);
      for (let col = Math.max(0, from); col <= Math.min(COLS - 1, to); col += 1) bits[row][col] = 1;
    }
  }
}

const at = (longitude, latitude) =>
  bits[Math.round(((90 - latitude) / 180) * ROWS) % ROWS][Math.floor(((longitude + 180) / 360) * COLS) % COLS];

// Coastlines are checked against places that stay recognisable at 240 x 120, so
// a decoder or winding regression fails here instead of on the page.
const COASTLINE_PROBES = [
  [10, 25, 'Sahara', 1],
  [20, 0, 'Congo', 1],
  [100, 65, 'Siberia', 1],
  [-60, -5, 'Amazon', 1],
  [78, 22, 'India', 1],
  [135, -25, 'Australia', 1],
  [-42, 72, 'Greenland', 1],
  [0, -80, 'Antarctica', 1],
  [-30, 10, 'Mid-Atlantic', 0],
  [-25, 30, 'Atlantic', 0],
  [-150, 0, 'North Pacific', 0],
  [170, 55, 'North Pacific', 0],
  [0, -40, 'South Atlantic', 0],
  [75, -30, 'Indian Ocean', 0],
  [0, 88, 'Arctic Ocean', 0]
];

const landCells = bits.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);
const share = landCells / (COLS * ROWS);
assert.ok(
  share > EXPECTED_LAND_SHARE[0] && share < EXPECTED_LAND_SHARE[1],
  `land share ${(share * 100).toFixed(1)}% is outside ${EXPECTED_LAND_SHARE.map((n) => n * 100).join(' to ')}%`
);
for (const [longitude, latitude, name, expected] of COASTLINE_PROBES) {
  assert.equal(at(longitude, latitude), expected, `${name} (${longitude}, ${latitude}) should be ${expected ? 'land' : 'ocean'}`);
}

// One hex digit per four columns keeps the committed mask small.
const hex = bits.map((row) => {
  let packed = '';
  for (let col = 0; col < COLS; col += 4) {
    const nibble = (row[col] << 3) | (row[col + 1] << 2) | (row[col + 2] << 1) | row[col + 3];
    packed += nibble.toString(16);
  }
  return `  '${packed}'`;
});

fs.writeFileSync(
  TARGET,
  `// Land mask for the Watch Tower globe.
//
// Natural Earth 110m land, public domain, via the world-atlas package. It is
// rasterised once into an equirectangular bitmask at ${COLS} x ${ROWS} and stored
// as one hex digit per four columns, so the globe can brighten the dots over
// land without shipping geometry. Row 0 is 90 degrees north and column 0 is
// 180 degrees west, matching the latitude the globe samples from top to bottom.
//
// Regenerate with scripts/build-globe-land.mjs.
export const LAND_COLS = ${COLS};
export const LAND_ROWS = ${ROWS};

const HEX = [
${hex.join(',\n')}
];

const ROWS_OF_BITS = HEX.map((row) => row.split('').map((nibble) => parseInt(nibble, 16).toString(2).padStart(4, '0')).join(''));

export function isLand(col, row) {
  const c = ((col % LAND_COLS) + LAND_COLS) % LAND_COLS;
  const r = Math.min(Math.max(row, 0), LAND_ROWS - 1);
  return ROWS_OF_BITS[r][c] === '1';
}
`
);

console.log(`land share ${(share * 100).toFixed(1)}%, ${COASTLINE_PROBES.length} coastline probes passed`);
console.log(`wrote ${path.relative(process.cwd(), TARGET)}`);

async function loadSource() {
  const cache = path.join(path.dirname(fileURLToPath(import.meta.url)), '.land-110m.json');
  if (fs.existsSync(cache)) return fs.readFileSync(cache, 'utf8');
  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`could not download land data, ${response.status} ${response.statusText}`);
  const text = await response.text();
  fs.writeFileSync(cache, text);
  return text;
}
