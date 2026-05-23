import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── helpers ───────────────────────────────────────────────────────────────────

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

function buildArcPoints(
  la0: number, lo0: number,
  la1: number, lo1: number,
  radius: number,
  segments = 48
): THREE.Vector3[] {
  const start = latLonToVec3(la0, lo0, radius);
  const end   = latLonToVec3(la1, lo1, radius);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t   = i / segments;
    const pt  = new THREE.Vector3().lerpVectors(start, end, t).normalize();
    const lift = Math.sin(Math.PI * t) * 0.22;
    pts.push(pt.multiplyScalar(radius + lift));
  }
  return pts;
}

function buildGridLines(radius: number, color: THREE.Color): THREE.LineSegments {
  const pts: number[] = [];
  const S = 64;
  for (let lat = -80; lat <= 80; lat += 20) {
    for (let i = 0; i <= S; i++) {
      const v = latLonToVec3(lat, -180 + (360 / S) * i, radius);
      pts.push(v.x, v.y, v.z);
      if (i > 0 && i < S) pts.push(v.x, v.y, v.z);
    }
  }
  for (let lon = -180; lon < 180; lon += 20) {
    for (let i = 0; i <= S; i++) {
      const v = latLonToVec3(-90 + (180 / S) * i, lon, radius);
      pts.push(v.x, v.y, v.z);
      if (i > 0 && i < S) pts.push(v.x, v.y, v.z);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.18 }));
}

async function buildCountryLines(radius: number, color: THREE.Color): Promise<THREE.LineSegments | null> {
  try {
    const res  = await fetch("https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson");
    const data = await res.json();
    const pts: number[] = [];
    for (const f of data.features) {
      const g = f.geometry;
      const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
      for (const poly of polys)
        for (const ring of poly)
          for (let i = 0; i < ring.length - 1; i++) {
            const v0 = latLonToVec3(ring[i][1], ring[i][0], radius);
            const v1 = latLonToVec3(ring[i+1][1], ring[i+1][0], radius);
            pts.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z);
          }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }));
  } catch { return null; }
}

// ── route data ────────────────────────────────────────────────────────────────

const ROUTES: [number, number, number, number][] = [
  // ── Land connections (existing) ──────────────────────────────────────────
  [40.7,  -74.0,  51.5,   0.1],  // New York → London
  [40.7,  -74.0,  48.9,   2.3],  // New York → Paris
  [40.7,  -74.0,  35.7, 139.7],  // New York → Tokyo
  [40.7,  -74.0, -23.5, -46.6],  // New York → São Paulo
  [37.8, -122.4,  35.7, 139.7],  // San Francisco → Tokyo
  [37.8, -122.4,  39.9, 116.4],  // San Francisco → Beijing
  [37.8, -122.4,   1.3, 103.8],  // San Francisco → Singapore
  [37.8, -122.4,  40.7, -74.0],  // San Francisco → New York
  [51.5,    0.1,  48.9,   2.3],  // London → Paris
  [51.5,    0.1,  55.8,  37.6],  // London → Moscow
  [51.5,    0.1,  41.0,  29.0],  // London → Istanbul
  [48.9,    2.3,  55.8,  37.6],  // Paris → Moscow
  [48.9,    2.3,  41.9,  12.5],  // Paris → Rome
  [41.9,   12.5,  30.1,  31.2],  // Rome → Cairo
  [55.8,   37.6,  39.9, 116.4],  // Moscow → Beijing
  [39.9,  116.4,  35.7, 139.7],  // Beijing → Tokyo
  [39.9,  116.4,   1.3, 103.8],  // Beijing → Singapore
  [39.9,  116.4,  28.6,  77.2],  // Beijing → Delhi
  [35.7,  139.7,  37.6, 127.0],  // Tokyo → Seoul
  [35.7,  139.7, -33.9, 151.2],  // Tokyo → Sydney
  [1.3,   103.8,  28.6,  77.2],  // Singapore → Delhi
  [1.3,   103.8,  13.8, 100.5],  // Singapore → Bangkok
  [28.6,   77.2,  25.2,  55.3],  // Delhi → Dubai
  [25.2,   55.3,  30.1,  31.2],  // Dubai → Cairo
  [25.2,   55.3,  41.0,  29.0],  // Dubai → Istanbul
  [30.1,   31.2,   6.5,   3.4],  // Cairo → Lagos
  [30.1,   31.2,  -1.3,  36.8],  // Cairo → Nairobi
  [6.5,     3.4, -26.2,  28.0],  // Lagos → Johannesburg
  [-1.3,   36.8, -26.2,  28.0],  // Nairobi → Johannesburg
  [-26.2,  28.0,  51.5,   0.1],  // Johannesburg → London
  [-23.5, -46.6,  40.7, -74.0],  // São Paulo → New York
  [-23.5, -46.6,  51.5,   0.1],  // São Paulo → London
  [-33.9, 151.2,   1.3, 103.8],  // Sydney → Singapore
  [-33.9, 151.2,  28.6,  77.2],  // Sydney → Delhi

  // ── Trans-Atlantic Ocean ─────────────────────────────────────────────────
  [51.5,    0.1,  40.7, -74.0],  // London → New York
  [40.4,   -3.7,  40.7, -74.0],  // Madrid → New York
  [14.7,  -17.5,  40.7, -74.0],  // Dakar → New York          (mid-Atlantic)
  [14.7,  -17.5,  51.5,   0.1],  // Dakar → London
  [14.7,  -17.5, -23.5, -46.6],  // Dakar → São Paulo
  [-23.5, -46.6,  14.7, -17.5],  // São Paulo → Dakar
  [-15.8,  -5.7,  40.7, -74.0],  // Ascension Island → New York
  [-15.8,  -5.7,  51.5,   0.1],  // Ascension Island → London
  [37.8, -122.4, -23.5, -46.6],  // San Francisco → São Paulo  (via South Atlantic)
  [25.0,  -71.0,  51.5,   0.1],  // Bermuda → London
  [25.0,  -71.0,  40.7, -74.0],  // Bermuda → New York

  // ── Trans-Pacific Ocean ──────────────────────────────────────────────────
  [37.8, -122.4, -33.9, 151.2],  // San Francisco → Sydney
  [21.3, -157.8,  35.7, 139.7],  // Honolulu → Tokyo
  [21.3, -157.8,  37.8,-122.4],  // Honolulu → San Francisco
  [21.3, -157.8,  -8.5, 179.2],  // Honolulu → Fiji
  [-8.5,  179.2, -33.9, 151.2],  // Fiji → Sydney
  [-8.5,  179.2,  35.7, 139.7],  // Fiji → Tokyo
  [35.7,  139.7,  37.8,-122.4],  // Tokyo → San Francisco
  [1.3,   103.8, -33.9, 151.2],  // Singapore → Sydney         (Pacific edge)
  [-17.7, -149.4,  37.8,-122.4], // Tahiti → San Francisco
  [-17.7, -149.4, -33.9, 151.2], // Tahiti → Sydney
  [-17.7, -149.4,  21.3,-157.8], // Tahiti → Honolulu
  [55.8,   37.6,  37.8,-122.4],  // Moscow → San Francisco     (over Bering)

  // ── Indian Ocean ─────────────────────────────────────────────────────────
  [-1.3,   36.8,  28.6,  77.2],  // Nairobi → Delhi
  [-20.1,  57.5,  28.6,  77.2],  // Mauritius → Delhi
  [-20.1,  57.5, -26.2,  28.0],  // Mauritius → Johannesburg
  [-20.1,  57.5,   1.3, 103.8],  // Mauritius → Singapore
  [-7.3,   72.4,  28.6,  77.2],  // Diego Garcia → Delhi
  [-7.3,   72.4, -26.2,  28.0],  // Diego Garcia → Johannesburg
  [-7.3,   72.4,   1.3, 103.8],  // Diego Garcia → Singapore
  [25.2,   55.3, -20.1,  57.5],  // Dubai → Mauritius
  [25.2,   55.3, -33.9, 151.2],  // Dubai → Sydney
  [-33.9, 151.2, -20.1,  57.5],  // Sydney → Mauritius

  // ── Arctic / North Polar ────────────────────────────────────────────────
  [51.5,   0.1,  59.9,  30.3],   // London → St. Petersburg
  [59.9,  30.3,  55.8,  37.6],   // St. Petersburg → Moscow
  [55.8,  37.6,  64.1, -21.9],   // Moscow → Reykjavik         (polar shortcut)
  [64.1, -21.9,  51.5,   0.1],   // Reykjavik → London
  [64.1, -21.9,  40.7, -74.0],   // Reykjavik → New York
  [78.2,  15.6,  55.8,  37.6],   // Svalbard → Moscow
  [78.2,  15.6,  51.5,   0.1],   // Svalbard → London

  // ── Southern Ocean / Antarctica edge ────────────────────────────────────
  [-33.9, 151.2, -34.6, -58.4],  // Sydney → Buenos Aires      (Southern Ocean)
  [-34.6, -58.4, -26.2,  28.0],  // Buenos Aires → Johannesburg
  [-53.2,  -70.9,-33.9, 151.2],  // Punta Arenas → Sydney
  [-53.2,  -70.9,-34.6, -58.4],  // Punta Arenas → Buenos Aires
  [-37.8,  144.9,-33.9, 151.2],  // Melbourne → Sydney
  [-37.8,  144.9,  1.3, 103.8],  // Melbourne → Singapore
];

// ── instanced network layer ───────────────────────────────────────────────────

const N = ROUTES.length;
const SEGMENTS = 48;
const dummy = new THREE.Object3D();

function NetworkLayer({ radius }: { radius: number }) {
  const dotsRef = useRef<THREE.InstancedMesh>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);

  // Pre-compute all arc points once
  const allArcs = useMemo(() =>
    ROUTES.map(([la0, lo0, la1, lo1]) =>
      buildArcPoints(la0, lo0, la1, lo1, radius, SEGMENTS)
    ), [radius]);

  // Pre-compute speed & phase offset per arc
  const meta = useMemo(() =>
    ROUTES.map((_, i) => ({
      speed: 0.06 + (i % 7) * 0.01,   // 0.06 → 0.12  (slower = smoother feel)
      phase: i / N,                    // staggered start
    })), []);

  // Build ONE merged LineSegments for all arcs (static geometry)
  const arcGeo = useMemo(() => {
    const pts: number[] = [];
    for (const arc of allArcs)
      for (let i = 0; i < arc.length - 1; i++) {
        const a = arc[i], b = arc[i + 1];
        pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [allArcs]);

  // Progress refs (avoid re-render)
  const progresses = useRef<Float32Array>(
    new Float32Array(N).map((_, i) => meta[i].phase)
  );

  useFrame((_, delta) => {
    const p = progresses.current;

    for (let i = 0; i < N; i++) {
      // Smooth capped delta so a frame-drop doesn't cause a jump
      const dt = Math.min(delta, 0.05);
      p[i] = (p[i] + dt * meta[i].speed) % 1;

      // Interpolate dot position along arc
      const arc = allArcs[i];
      const fi  = p[i] * (arc.length - 1);
      const idx = Math.floor(fi);
      const frac = fi - idx;
      const ptA = arc[Math.min(idx,     arc.length - 1)];
      const ptB = arc[Math.min(idx + 1, arc.length - 1)];

      dummy.position.lerpVectors(ptA, ptB, frac);
      dummy.updateMatrix();
      dotsRef.current.setMatrixAt(i, dummy.matrix);
    }
    dotsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* All arc paths — single draw call */}
      <lineSegments ref={linesRef} geometry={arcGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.25} />
      </lineSegments>

      {/* All travel dots — single instanced draw call */}
      <instancedMesh ref={dotsRef} args={[undefined, undefined, N]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </instancedMesh>
    </>
  );
}

// ── main globe component ──────────────────────────────────────────────────────

export function SciFiGlobe() {
  const groupRef = useRef<THREE.Group>(null!);
  const RADIUS   = 1.8;
  const WHITE    = new THREE.Color("#ffffff");

  const gridLines = useMemo(() => buildGridLines(RADIUS, WHITE), []);

  useEffect(() => {
    let alive = true;
    buildCountryLines(RADIUS * 1.002, WHITE).then((lines) => {
      if (lines && alive && groupRef.current) groupRef.current.add(lines);
    });
    return () => { alive = false; };
  }, []);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.003;
  });

  return (
    <group ref={groupRef}>
      {/* Dark sphere base */}
      <mesh>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshPhongMaterial color="#111111" emissive="#1a1a1a" emissiveIntensity={0.4} transparent opacity={0.85} />
      </mesh>

      {/* Lat/lon grid */}
      <primitive object={gridLines} />

      {/* Network arcs + dots — optimised single-pass */}
      <NetworkLayer radius={RADIUS * 1.012} />

      {/* Atmospheric glow */}
      <mesh scale={1.08}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      <mesh scale={1.16}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
