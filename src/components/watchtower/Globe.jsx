import React, { useEffect, useRef } from 'react';
import styles from './Globe.module.css';
import { isLand, LAND_COLS, LAND_ROWS } from './globeLand.js';

// A dot-matrix globe drawn on a 2D canvas. The sphere is sampled from the
// equirectangular land mask so coastlines read as brighter dots, a faint
// graticule gives the surface a technical feel, and arcs carry requests from a
// spread of origins to a single protection point. Nothing here needs a WebGL
// context, so the section still renders where hardware acceleration is
// unavailable, which is exactly where a heavier globe would drop out.

const TILT = -0.3;
const SPIN = 0.05;
const ARC_STEPS = 22;
const ARC_LIFT = 0.17;
const DRAG = 0.0062;

// Real places, used only to spread the origins of inbound traffic across the
// visible face. They are request sources, not infrastructure.
const ORIGINS = [
  { lat: 37.77, lon: -122.42 },
  { lat: 40.71, lon: -74.01 },
  { lat: 43.65, lon: -79.38 },
  { lat: 19.43, lon: -99.13 },
  { lat: -23.55, lon: -46.63 },
  { lat: -34.6, lon: -58.38 },
  { lat: 51.51, lon: -0.13 },
  { lat: 52.37, lon: 4.9 },
  { lat: 50.11, lon: 8.68 },
  { lat: 41.01, lon: 28.98 },
  { lat: 6.52, lon: 3.38 },
  { lat: -26.2, lon: 28.05 },
  { lat: -33.92, lon: 18.42 },
  { lat: 25.2, lon: 55.27 },
  { lat: 19.08, lon: 72.88 },
  { lat: 1.35, lon: 103.82 },
  { lat: 35.68, lon: 139.69 },
  { lat: 37.57, lon: 126.98 },
  { lat: -33.87, lon: 151.21 },
  { lat: -36.85, lon: 174.76 }
];

// A share of the origins stand for traffic that never reaches the site. Those
// arcs run out of route before the protection point, which is the same
// distinction the request diagram makes with its two verdicts.
const STOPPED = new Set([2, 6, 9, 12, 16, 18]);
const STOP_RATIO = 0.7;

// The protection point is fixed in the tilted frame rather than pinned to a
// place on the sphere: the site does not move, and the traffic moves around it.
// It sits a little below the centre of the disc, on the front surface.
const HUB = { x: 0, y: -0.19, z: 0.982 };

const DEG = Math.PI / 180;
const COS_TILT = Math.cos(TILT);
const SIN_TILT = Math.sin(TILT);

// Depth is quantised into a few opacity steps so the whole dot field can be
// painted without reassigning fillStyle for every one of its points.
const DEPTH_STEPS = 6;

const GRATICULE_LATS = [-60, -30, 0, 30, 60];
const GRATICULE_LONS = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];

// The dot field is walked at a coarser stride on small canvases. The land mask
// is 240 by 120, so the stride is always a whole divisor of the sample grid.
const STRIDE_SMALL = 3;
const STRIDE_LARGE = 2;

function toFixed(samples) {
  return samples.map((sample) => {
    const lat = sample.lat * DEG;
    const lon = sample.lon * DEG;
    return {
      cosLat: Math.cos(lat),
      sinLat: Math.sin(lat),
      cosLon: Math.cos(lon),
      sinLon: Math.sin(lon),
      land: sample.land
    };
  });
}

function buildDots(stride) {
  const samples = [];
  for (let row = 0; row < LAND_ROWS; row += stride) {
    const lat = 90 - ((row + 0.5) * 180) / LAND_ROWS;
    for (let col = 0; col < LAND_COLS; col += stride) {
      samples.push({ lat, lon: -180 + ((col + 0.5) * 360) / LAND_COLS, land: isLand(col, row) ? 1 : 0 });
    }
  }
  return toFixed(samples);
}

export default function Globe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const computed = getComputedStyle(canvas);
    // Colours live in the Watch Tower stylesheet so they can be themed, but a
    // missing or renamed custom property would hand the canvas an empty string
    // and blank the whole product page. Fall back rather than throw.
    const FALLBACKS = {
      '--globe-ocean': '#35707a',
      '--globe-land': '#5fd8b6',
      '--globe-graticule': 'rgba(122, 202, 192, 0.1)',
      '--globe-arc': '#5fd8b6',
      '--globe-stopped': '#e8705a',
      '--globe-origin': '#ffd166',
      '--globe-hub': '#7ce0c3',
      '--globe-halo': 'rgba(60, 190, 168, 0.12)'
    };
    const read = (name) => computed.getPropertyValue(name).trim() || FALLBACKS[name];

    const palette = {
      ocean: read('--globe-ocean'),
      land: read('--globe-land'),
      graticule: read('--globe-graticule'),
      arc: read('--globe-arc'),
      stopped: read('--globe-stopped'),
      origin: read('--globe-origin'),
      hub: read('--globe-hub'),
      halo: read('--globe-halo')
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let dots = buildDots(window.innerWidth < 760 ? STRIDE_SMALL : STRIDE_LARGE);
    let origins = toFixed(ORIGINS);
    let width = 0;
    let height = 0;
    let radius = 0;
    let halo = null;
    let frame = 0;
    let running = false;
    let visible = true;
    let spin = -0.9;
    let dragVelocity = 0;
    let last = 0;
    let elapsed = 0;
    let pointerX = 0;

    // The tilt and the rotation are the only angles that change between frames,
    // so they are resolved once and reused by every projection below.
    let cosSpin = 1;
    let sinSpin = 0;
    let originX = new Float64Array(origins.length);
    let originY = new Float64Array(origins.length);
    let originZ = new Float64Array(origins.length);
    const path = new Float64Array((ARC_STEPS + 1) * 2);

    function setAngles(value) {
      cosSpin = Math.cos(value);
      sinSpin = Math.sin(value);
    }

    function size() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));

      if (nextWidth === width && nextHeight === height && halo) return;

      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      radius = Math.min(width, height) * 0.43;
      // A rim glow rather than a filled pool. A gradient that is opaque across
      // the middle of the disc reads as a solid teal circle and swallows the
      // dot field, so the colour is kept to a narrow band around the limb.
      halo = ctx.createRadialGradient(
        width / 2,
        height / 2,
        radius * 0.92,
        width / 2,
        height / 2,
        radius * 1.42
      );
      halo.addColorStop(0, 'rgba(0, 0, 0, 0)');
      halo.addColorStop(0.38, palette.halo);
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    function render(time) {
      setAngles(spin);

      for (let i = 0; i < origins.length; i += 1) {
        const o = origins[i];
        const x = o.cosLat * (o.cosLon * cosSpin - o.sinLon * sinSpin);
        const y = o.cosLat * (o.sinLon * cosSpin + o.cosLon * sinSpin);
        const z = o.sinLat;
        originX[i] = x;
        originY[i] = y * COS_TILT - z * SIN_TILT;
        originZ[i] = y * SIN_TILT + z * COS_TILT;
      }

      size();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
      drawGraticule();
      drawDots();
      drawArcs(time);
      drawMarkers(time);
    }

    function drawGraticule() {
      ctx.strokeStyle = palette.graticule;
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let i = 0; i < GRATICULE_LATS.length; i += 1) {
        const lat = GRATICULE_LATS[i] * DEG;
        const cosLat = Math.cos(lat);
        const sinLat = Math.sin(lat);
        let started = false;

        for (let lon = -180; lon <= 180; lon += 6) {
          const angle = (lon + spin) * DEG;
          const x = cosLat * Math.cos(angle);
          const y = cosLat * Math.sin(angle);
          const z = y * SIN_TILT + sinLat * COS_TILT;
          if (z <= 0) {
            started = false;
            continue;
          }
          const sx = width / 2 + x * radius;
          const sy = height / 2 - (y * COS_TILT - sinLat * SIN_TILT) * radius;
          if (started) ctx.lineTo(sx, sy);
          else ctx.moveTo(sx, sy);
          started = true;
        }
      }

      for (let i = 0; i < GRATICULE_LONS.length; i += 1) {
        const base = GRATICULE_LONS[i] * DEG;
        const cosBase = Math.cos(base);
        const sinBase = Math.sin(base);
        let started = false;

        for (let lat = -90; lat <= 90; lat += 6) {
          const angle = lat * DEG;
          const cosLat = Math.cos(angle);
          const sinLat = Math.sin(angle);
          const x = cosLat * (cosBase * cosSpin - sinBase * sinSpin);
          const y = cosLat * (sinBase * cosSpin + cosBase * sinSpin);
          const z = y * SIN_TILT + sinLat * COS_TILT;
          if (z <= 0) {
            started = false;
            continue;
          }
          const sx = width / 2 + x * radius;
          const sy = height / 2 - (y * COS_TILT - sinLat * SIN_TILT) * radius;
          if (started) ctx.lineTo(sx, sy);
          else ctx.moveTo(sx, sy);
          started = true;
        }
      }

      ctx.stroke();
    }

    function drawDots() {
      // Dot size follows the sphere only loosely, so a large globe does not turn
      // into a solid mass of dots and a small one does not turn to dust.
      const size = 1.6 + radius / 300;
      const landSize = size + 0.8;
      const centreX = width / 2;
      const centreY = height / 2;
      let previous = '';

      for (let i = 0; i < dots.length; i += 1) {
        const dot = dots[i];
        const x = dot.cosLat * (dot.cosLon * cosSpin - dot.sinLon * sinSpin);
        const y = dot.cosLat * (dot.sinLon * cosSpin + dot.cosLon * sinSpin);
        const z = y * SIN_TILT + dot.sinLat * COS_TILT;
        if (z <= 0.03) continue;

        const bucket = Math.min(DEPTH_STEPS - 1, (z * DEPTH_STEPS) | 0);
        const key = dot.land + bucket * 2;
        if (key !== previous) {
          const depth = (bucket + 1) / DEPTH_STEPS;
          ctx.globalAlpha = depth * depth * 0.84 + 0.1;
          ctx.fillStyle = dot.land ? palette.land : palette.ocean;
          previous = key;
        }

        const half = (dot.land ? landSize : size) * 0.5;
        ctx.fillRect(
          centreX + x * radius - half,
          centreY - (y * COS_TILT - dot.sinLat * SIN_TILT) * radius - half,
          half * 2,
          half * 2
        );
      }
      ctx.globalAlpha = 1;
    }

    // Great-circle interpolation between two unit vectors, lifted away from the
    // surface so an arc reads as a route rather than a scratch on the sphere.
    function arcStep(index, t, out) {
      const ax = originX[index];
      const ay = originY[index];
      const az = originZ[index];

      const dot = ax * HUB.x + ay * HUB.y + az * HUB.z;
      const omega = Math.acos(dot < -1 ? -1 : dot > 1 ? 1 : dot);
      const sinOmega = Math.sin(omega);

      let x;
      let y;
      let z;

      if (sinOmega < 1e-4) {
        x = HUB.x;
        y = HUB.y;
        z = HUB.z;
      } else {
        const a = Math.sin((1 - t) * omega) / sinOmega;
        const b = Math.sin(t * omega) / sinOmega;
        x = ax * a + HUB.x * b;
        y = ay * a + HUB.y * b;
        z = az * a + HUB.z * b;
      }

      const lift = 1 + ARC_LIFT * Math.sin(Math.PI * t);
      out.x = x * lift;
      out.y = y * lift;
      out.z = z * lift;
    }

    const point = { x: 0, y: 0, z: 0 };

    function drawArcs(time) {
      const centreX = width / 2;
      const centreY = height / 2;

      for (let i = 0; i < origins.length; i += 1) {
        if (originZ[i] <= -0.1) continue;

        const stopped = STOPPED.has(i);
        const end = stopped ? STOP_RATIO : 1;
        let count = 0;

        for (let step = 0; step <= ARC_STEPS; step += 1) {
          arcStep(i, (step / ARC_STEPS) * end, point);
          if (point.z <= 0) continue;
          path[count * 2] = centreX + point.x * radius;
          path[count * 2 + 1] = centreY - point.y * radius;
          count += 1;
        }
        if (count < 2) continue;

        ctx.beginPath();
        ctx.moveTo(path[0], path[1]);
        for (let p = 1; p < count; p += 1) ctx.lineTo(path[p * 2], path[p * 2 + 1]);
        ctx.strokeStyle = stopped ? palette.stopped : palette.arc;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.42;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // A short bright segment travels the arc. The stopped ones run out of
        // route before the protection point, which is the whole point of them.
        const progress = ((time * 0.12 + i * 0.14) % 1) * end;
        const from = Math.max(0, progress - 0.18);
        let running = false;

        ctx.beginPath();
        for (let step = 0; step <= ARC_STEPS; step += 1) {
          const t = (step / ARC_STEPS) * end;
          if (t < from || t > progress) {
            running = false;
            continue;
          }
          arcStep(i, t, point);
          if (point.z <= 0) {
            running = false;
            continue;
          }
          const sx = centreX + point.x * radius;
          const sy = centreY - point.y * radius;
          if (running) ctx.lineTo(sx, sy);
          else ctx.moveTo(sx, sy);
          running = true;
        }
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    function drawMarkers(time) {
      const centreX = width / 2;
      const centreY = height / 2;

      for (let i = 0; i < origins.length; i += 1) {
        if (originZ[i] <= 0.05) continue;
        const x = centreX + originX[i] * radius;
        const y = centreY - originY[i] * radius;
        const pulse = (time * 0.5 + i * 0.23) % 1;
        const stopped = STOPPED.has(i);

        ctx.beginPath();
        ctx.arc(x, y, 3 + pulse * 10, 0, Math.PI * 2);
        ctx.strokeStyle = stopped ? palette.stopped : palette.origin;
        ctx.globalAlpha = (1 - pulse) * 0.3;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.globalAlpha = 1;
        ctx.fillStyle = stopped ? palette.stopped : palette.origin;
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }

      const hx = centreX + HUB.x * radius;
      const hy = centreY - HUB.y * radius;
      const pulse = (time * 0.36) % 1;

      ctx.beginPath();
      ctx.arc(hx, hy, 6 + pulse * 26, 0, Math.PI * 2);
      ctx.strokeStyle = palette.hub;
      ctx.globalAlpha = (1 - pulse) * 0.45;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.fillStyle = palette.hub;
      ctx.fillRect(hx - 3, hy - 3, 6, 6);
      ctx.strokeStyle = palette.hub;
      ctx.lineWidth = 1;
      ctx.strokeRect(hx - 7.5, hy - 7.5, 15, 15);
    }

    function tick(now) {
      if (!running) return;
      frame = requestAnimationFrame(tick);

      const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      elapsed += delta;

      dragVelocity *= 0.94;
      spin += (SPIN + dragVelocity) * delta;
      render(elapsed);
    }

    function start() {
      if (running || !visible) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      last = 0;
      cancelAnimationFrame(frame);
    }

    function density() {
      const stride = window.innerWidth < 760 ? STRIDE_SMALL : STRIDE_LARGE;
      const expected = Math.ceil(LAND_ROWS / stride) * Math.ceil(LAND_COLS / stride);
      if (dots.length === expected) return;
      dots = buildDots(stride);
    }

    function onPointerDown(event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add(styles.dragging);
      pointerX = event.clientX;
      dragVelocity = 0;
    }

    function onPointerMove(event) {
      if (!canvas.hasPointerCapture(event.pointerId)) return;
      const movement = event.clientX - pointerX;
      pointerX = event.clientX;
      spin -= movement * DRAG;
      dragVelocity -= movement * DRAG * 2.2;
    }

    function onPointerUp(event) {
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      canvas.classList.remove(styles.dragging);
    }

    const onResize = new ResizeObserver(() => {
      if (reduceMotion.matches) render(elapsed);
    });

    const onVisibility = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (!visible) {
          stop();
          return;
        }
        density();
        if (reduceMotion.matches) render(elapsed);
        else start();
      },
      { rootMargin: '120px' }
    );

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    onResize.observe(canvas);
    onVisibility.observe(canvas);

    size();
    render(0);

    if (reduceMotion.matches) render(0);
    else start();

    return () => {
      stop();
      onResize.disconnect();
      onVisibility.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  return (
    <div className={styles.stage}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="A globe showing requests arriving from many parts of the world and being inspected at a single protection layer, where some continue to the website and others stop."
      />
      <p className={styles.hint} aria-hidden="true">Drag to rotate</p>
    </div>
  );
}
