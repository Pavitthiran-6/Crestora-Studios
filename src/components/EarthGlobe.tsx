import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

export const EarthGlobe = ({ color = "#4b2e83" }: { color?: string }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (globeRef.current) {
      globeRef.current.rotation.y = time * 0.1;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = time * 0.15;
    }
  });

  return (
    <group scale={1.5}>
      {/* Core Earth */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Atmospheric Glow */}
      <mesh scale={1.05}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Clouds / Particles */}
      <mesh ref={cloudRef} scale={1.1}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshPhongMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={0.5} />
      </Float>
    </group>
  );
};
