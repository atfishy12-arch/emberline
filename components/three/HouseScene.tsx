'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Rising embers                                                      */
/* ------------------------------------------------------------------ */
function Embers({ count = 700 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  /* Each ember carries its own speed, drift and phase so the field never
     pulses in unison — stored once in buffers, updated on the CPU only for
     the y position (the cheapest possible per-frame write). */
  const { geometry, speeds, drifts } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const drifts = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = Math.random() * 14 - 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      speeds[i] = 0.25 + Math.random() * 0.75;
      drifts[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { geometry: geo, speeds, drifts };
  }, [count]);

  useFrame((state, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const attr = pts.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const iy = i * 3 + 1;
      arr[iy] += speeds[i] * delta * 0.9;
      // lateral wander, as if caught in a thermal
      arr[i * 3] += Math.sin(t * 0.5 + drifts[i]) * delta * 0.12;
      if (arr[iy] > 10) {
        arr[iy] = -4;
        arr[i * 3] = (Math.random() - 0.5) * 22;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.045}
        sizeAttenuation
        color="#FF8A3C"
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Architectural massing                                              */
/* ------------------------------------------------------------------ */

/** A lit window pane; `phase` desynchronises the flicker between houses. */
function Window({
  position,
  scale,
  phase,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  phase: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const m = ref.current?.material as THREE.MeshBasicMaterial | undefined;
    if (!m) return;
    // Slow, shallow flicker — interior light, not a candle.
    const t = state.clock.elapsedTime;
    m.opacity = 0.72 + Math.sin(t * 1.1 + phase) * 0.06 + Math.sin(t * 2.7 + phase * 2) * 0.03;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <planeGeometry />
      <meshBasicMaterial color="#FFC46A" transparent opacity={0.75} toneMapped={false} />
    </mesh>
  );
}

function Massing() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * 0.06;
  });

  const concrete = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#221913',
        roughness: 0.86,
        metalness: 0.08,
      }),
    []
  );

  const timber = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3A2718',
        roughness: 0.72,
        metalness: 0.04,
      }),
    []
  );

  return (
    <group ref={group} position={[0, -0.9, 0]}>
      {/* main volume */}
      <mesh material={concrete} position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[3.1, 1.8, 2.2]} />
      </mesh>

      {/* pitched roof, as a rotated slab rather than a cone */}
      <mesh material={timber} position={[0, 2.05, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[3.35, 0.16, 2.45]} />
      </mesh>

      {/* lower wing */}
      <mesh material={timber} position={[2.35, 0.5, 0.35]}>
        <boxGeometry args={[1.7, 1.0, 1.6]} />
      </mesh>

      {/* chimney — the ember source */}
      <mesh material={concrete} position={[-1.0, 2.55, 0]}>
        <boxGeometry args={[0.34, 1.1, 0.34]} />
      </mesh>

      {/* glazing */}
      <Window position={[0, 0.85, 1.115]} scale={[2.1, 0.95, 1]} phase={0} />
      <Window position={[2.35, 0.5, 1.16]} scale={[1.1, 0.55, 1]} phase={1.7} />
      <Window position={[-1.556, 0.9, 0]} scale={[1.4, 0.9, 1]} phase={3.1} />

      {/* ground slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#120C08" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Firelight                                                          */
/* ------------------------------------------------------------------ */
function Firelight() {
  const key = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const { viewport } = useThree();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const x = state.pointer.x * viewport.width * 0.5;
    const y = state.pointer.y * viewport.height * 0.5;
    const k = 1 - Math.pow(0.001, delta);

    if (key.current) {
      key.current.position.x += (x * 1.4 - key.current.position.x) * k;
      key.current.position.y += (y * 1.2 + 1.6 - key.current.position.y) * k;
      // firelight breathes; a constant intensity reads as a lamp
      key.current.intensity = 42 + Math.sin(t * 1.6) * 7 + Math.sin(t * 4.3) * 3;
    }
    if (rim.current) {
      rim.current.position.x += (-x * 1.6 - rim.current.position.x) * k;
    }
  });

  return (
    <>
      <ambientLight intensity={0.22} color="#FF9A5A" />
      <hemisphereLight args={['#FF7A3C', '#0A0705', 0.35]} />
      <pointLight ref={key} position={[3, 2.4, 4]} intensity={45} color="#FF5A1F" distance={26} decay={2} />
      <pointLight ref={rim} position={[-5, 1.2, 2.5]} intensity={26} color="#FF2D46" distance={22} decay={2} />
      <pointLight position={[0, 4.5, -5]} intensity={18} color="#FFB020" distance={24} decay={2} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Rig                                                                */
/* ------------------------------------------------------------------ */
function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.pow(0.004, delta);
    g.rotation.y += (state.pointer.x * 0.22 - g.rotation.y) * k;
    g.rotation.x += (-state.pointer.y * 0.12 - g.rotation.x) * k;

    /* Couple to scroll: the model recedes and tips as the hero leaves, so the
       real-time layer travels with the page rather than sitting behind it.
       Read inside the loop that is already running — no scroll listener. */
    const p = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    g.position.z = p * 5;
    g.position.y = p * 1.2;
  });

  return <group ref={group}>{children}</group>;
}

/* ------------------------------------------------------------------ */

/**
 * The hero's real-time layer: an architectural massing model turning slowly
 * in firelight, with embers rising past it.
 *
 * Built in code rather than rendered as artwork so it reacts to the pointer,
 * to scroll, and to the flicker of its own light — none of which a still
 * image can do.
 *
 * `active` is driven by an IntersectionObserver in Hero: once the fold
 * scrolls away the render loop stops, so the GPU idles for the rest of the page.
 */
export default function HouseScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [5.5, 2.6, 6.5], fov: 40 }}
      frameloop={active ? 'always' : 'never'}
      style={{ pointerEvents: 'none' }}
    >
      <fog attach="fog" args={['#0A0705', 9, 26]} />
      <Firelight />
      <Rig>
        <Massing />
        <Embers />
      </Rig>
    </Canvas>
  );
}
