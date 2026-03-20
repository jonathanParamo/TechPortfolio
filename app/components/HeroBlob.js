'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';

function AnimatedBlob() {
  const mesh = useRef();

  useFrame((state) => {
    mesh.current.rotation.x = state.clock.elapsedTime * 0.3;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.5;
  });

  return (
    <Sphere ref={mesh} args={[1, 100, 100]}>
      <MeshDistortMaterial
        color="#7c3aed"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

export default function HeroBlob() {
  return (
    <div className="w-64 h-64 md:w-96 md:h-96">
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} color="#06b6d4" intensity={0.5} />
        <AnimatedBlob />
      </Canvas>
    </div>
  );
}
