'use client';

import Head from 'next/head';
import Navbar from '@/app/components/Navbar';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleBackground = dynamic(
  () => import('@/app/components/ParticleBackground'),
  { ssr: false }
);

/* ══════════════════════════════════════════════
   SHADERS
══════════════════════════════════════════════ */
const dustVert = `
  attribute float aLife;
  attribute float aSize;
  attribute vec3  aColor;
  varying   float vLife;
  varying   vec3  vColor;
  void main() {
    vLife  = aLife;
    vColor = aColor;
    vec4 mvp = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (400.0 / -mvp.z);
    gl_Position  = projectionMatrix * mvp;
  }
`;
const dustFrag = `
  varying float vLife;
  varying vec3  vColor;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float core = 1.0 - smoothstep(0.0,  0.10, d);
    float mid  = 1.0 - smoothstep(0.10, 0.30, d);
    float halo = 1.0 - smoothstep(0.30, 0.50, d);
    float a    = (core*1.0 + mid*0.65 + halo*0.25) * vLife;
    gl_FragColor = vec4(vColor, a * 0.92);
  }
`;

/* ══════════════════════════════════════════════
   SUPERNOVA DUST
══════════════════════════════════════════════ */
function SupernovaDust({ isDark }) {
  const ref = useRef();
  const COUNT = 420;
  const data = useMemo(() => {
    const darkP = [
      [0.0, 0.65, 1.0],
      [0.0, 0.9, 1.0],
      [0.1, 0.45, 1.0],
      [0.45, 0.75, 1.0],
      [0.55, 0.25, 1.0],
      [0.0, 1.0, 0.95],
      [0.25, 0.65, 1.0],
      [0.7, 0.85, 1.0],
    ];
    const lightP = [
      [0.15, 0.35, 0.9],
      [0.05, 0.5, 0.85],
      [0.3, 0.28, 0.88],
      [0.0, 0.45, 0.82],
      [0.4, 0.22, 0.8],
    ];
    const palette = isDark ? darkP : lightP;
    const pos = new Float32Array(COUNT * 3),
      sizes = new Float32Array(COUNT),
      lives = new Float32Array(COUNT),
      colors = new Float32Array(COUNT * 3);
    const vel = [],
      decay = [],
      phase = [],
      orbit = [];
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sizes[i] = Math.random() * (isDark ? 0.09 : 0.055) + 0.018;
      lives[i] = Math.random();
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];
      vel.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.004 + 0.001,
        z: (Math.random() - 0.5) * 0.002,
      });
      decay.push(Math.random() * 0.0035 + 0.0018);
      phase.push(Math.random() * Math.PI * 2);
      orbit.push(Math.random() * 0.004 + 0.0015);
    }
    return { pos, sizes, lives, colors, vel, decay, phase, orbit };
  }, [isDark]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry,
      pa = geo.attributes.position.array,
      la = geo.attributes.aLife.array,
      t = clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      pa[i * 3] +=
        data.vel[i].x + Math.sin(t * 0.7 + data.phase[i]) * data.orbit[i];
      pa[i * 3 + 1] +=
        data.vel[i].y +
        Math.cos(t * 0.5 + data.phase[i] * 1.3) * data.orbit[i] * 0.55;
      pa[i * 3 + 2] += data.vel[i].z;
      la[i] -= data.decay[i];
      if (la[i] <= 0) {
        pa[i * 3] = (Math.random() - 0.5) * 28;
        pa[i * 3 + 1] = -9;
        pa[i * 3 + 2] = (Math.random() - 0.5) * 10;
        la[i] = 1.0;
        data.vel[i] = {
          x: (Math.random() - 0.5) * 0.005,
          y: (Math.random() - 0.5) * 0.004 + 0.001,
          z: (Math.random() - 0.5) * 0.002,
        };
        data.phase[i] = Math.random() * Math.PI * 2;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aLife.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={data.pos}
          count={COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={data.sizes}
          count={COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aLife"
          array={data.lives}
          count={COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aColor"
          array={data.colors}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={dustVert}
        fragmentShader={dustFrag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ══════════════════════════════════════════════
   FLOATING ROCKS
══════════════════════════════════════════════ */
function FloatingRock({ position, scale, rotSpeed, detail, phase, isDark }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, detail),
      p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i),
        n =
          1 +
          Math.sin(x * 4.2 + y * 2.8) * 0.19 +
          Math.cos(z * 3.4 + x * 2.0) * 0.14 +
          Math.sin(y * 5.1 + z * 1.7) * 0.09;
      p.setXYZ(i, x * n, y * n, z * n);
    }
    g.computeVertexNormals();
    return g;
  }, [detail]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * 0.38 + phase) * 0.42;
    ref.current.position.x = position[0] + Math.cos(t * 0.22 + phase) * 0.2;
    ref.current.rotation.x += rotSpeed.x;
    ref.current.rotation.y += rotSpeed.y;
    ref.current.rotation.z += rotSpeed.z;
  });
  return (
    <mesh ref={ref} position={position} scale={scale} geometry={geo}>
      <meshStandardMaterial
        color={isDark ? '#16a8cc' : '#b0c7ff'}
        roughness={0.35}
        metalness={isDark ? 0.85 : 0.25}
        emissive={isDark ? '#22056628' : '#7d1896a1'}
        emissiveIntensity={isDark ? 2.0 : 0.8}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

const ROCKS = [
  {
    position: [-5.8, 1.6, -3.0],
    scale: 0.62,
    detail: 1,
    phase: 0.0,
    rotSpeed: { x: 0.0009, y: 0.0013, z: 0.0005 },
  },
  {
    position: [5.5, 0.3, -3.5],
    scale: 0.88,
    detail: 2,
    phase: 1.2,
    rotSpeed: { x: 0.0005, y: 0.0008, z: 0.0011 },
  },
  {
    position: [-3.2, -2.5, -4.5],
    scale: 0.44,
    detail: 1,
    phase: 2.5,
    rotSpeed: { x: 0.0013, y: 0.0006, z: 0.0008 },
  },
  {
    position: [4.0, 2.8, -2.5],
    scale: 0.4,
    detail: 1,
    phase: 0.8,
    rotSpeed: { x: 0.0007, y: 0.0015, z: 0.0004 },
  },
  {
    position: [-7.0, -0.5, -5.5],
    scale: 0.72,
    detail: 2,
    phase: 3.1,
    rotSpeed: { x: 0.0004, y: 0.0009, z: 0.0012 },
  },
  {
    position: [6.8, 1.5, -4.0],
    scale: 0.32,
    detail: 1,
    phase: 1.7,
    rotSpeed: { x: 0.0011, y: 0.0005, z: 0.0008 },
  },
  {
    position: [0.8, 3.8, -5.0],
    scale: 0.55,
    detail: 2,
    phase: 4.2,
    rotSpeed: { x: 0.0006, y: 0.0012, z: 0.0009 },
  },
  {
    position: [-2.0, -3.2, -3.5],
    scale: 0.36,
    detail: 1,
    phase: 2.0,
    rotSpeed: { x: 0.001, y: 0.0007, z: 0.0014 },
  },
];

/* ══════════════════════════════════════════════
   ENERGY STREAMS
══════════════════════════════════════════════ */
function EnergyStream({ from, to, isDark }) {
  const ref = useRef();
  const COUNT = 70,
    col = isDark ? [0.0, 0.75, 1.0] : [0.18, 0.42, 0.95];
  const data = useMemo(() => {
    const pos = new Float32Array(COUNT * 3),
      sizes = new Float32Array(COUNT),
      lives = new Float32Array(COUNT),
      colors = new Float32Array(COUNT * 3),
      t = [];
    for (let i = 0; i < COUNT; i++) {
      const tt = Math.random();
      t.push(tt);
      pos[i * 3] = from[0] + (to[0] - from[0]) * tt;
      pos[i * 3 + 1] = from[1] + (to[1] - from[1]) * tt;
      pos[i * 3 + 2] = from[2] + (to[2] - from[2]) * tt;
      sizes[i] = Math.random() * 0.04 + 0.012;
      lives[i] = Math.random();
      colors[i * 3] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];
    }
    return { pos, sizes, lives, colors, t };
  }, [from, to, isDark]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry,
      pa = geo.attributes.position.array,
      la = geo.attributes.aLife.array;
    for (let i = 0; i < COUNT; i++) {
      data.t[i] += 0.007;
      if (data.t[i] > 1) {
        data.t[i] = 0;
        la[i] = 1.0;
      }
      const tt = data.t[i];
      pa[i * 3] =
        from[0] +
        (to[0] - from[0]) * tt +
        Math.sin(tt * 9 + clock.elapsedTime) * 0.14;
      pa[i * 3 + 1] =
        from[1] +
        (to[1] - from[1]) * tt +
        Math.cos(tt * 7 + clock.elapsedTime * 0.8) * 0.11;
      pa[i * 3 + 2] = from[2] + (to[2] - from[2]) * tt;
      la[i] = Math.sin(tt * Math.PI);
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aLife.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={data.pos}
          count={COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={data.sizes}
          count={COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aLife"
          array={data.lives}
          count={COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aColor"
          array={data.colors}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={dustVert}
        fragmentShader={dustFrag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ══════════════════════════════════════════════
   ROCK DUST
══════════════════════════════════════════════ */
function RockDust({ isDark }) {
  const ref = useRef();
  const COUNT = 150;
  const data = useMemo(() => {
    const pos = new Float32Array(COUNT * 3),
      sizes = new Float32Array(COUNT),
      lives = new Float32Array(COUNT),
      colors = new Float32Array(COUNT * 3),
      vel = [],
      decay = [],
      phase = [];
    const col = isDark ? [0.0, 0.7, 1.0] : [0.22, 0.42, 0.92];
    for (let i = 0; i < COUNT; i++) {
      const rock = ROCKS[i % ROCKS.length].position;
      pos[i * 3] = rock[0] + (Math.random() - 0.5) * 2;
      pos[i * 3 + 1] = rock[1] + (Math.random() - 0.5) * 2;
      pos[i * 3 + 2] = rock[2] + (Math.random() - 0.5) * 1.2;
      sizes[i] = Math.random() * 0.045 + 0.01;
      lives[i] = Math.random();
      colors[i * 3] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];
      vel.push({
        x: (Math.random() - 0.5) * 0.006,
        y: (Math.random() - 0.5) * 0.006 + 0.002,
      });
      decay.push(Math.random() * 0.008 + 0.003);
      phase.push(Math.random() * Math.PI * 2);
    }
    return { pos, sizes, lives, colors, vel, decay, phase };
  }, [isDark]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry,
      pa = geo.attributes.position.array,
      la = geo.attributes.aLife.array,
      t = clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      pa[i * 3] += data.vel[i].x + Math.sin(t + data.phase[i]) * 0.002;
      pa[i * 3 + 1] += data.vel[i].y;
      la[i] -= data.decay[i];
      if (la[i] <= 0) {
        const rock = ROCKS[i % ROCKS.length].position;
        pa[i * 3] = rock[0] + (Math.random() - 0.5) * 2;
        pa[i * 3 + 1] = rock[1] + (Math.random() - 0.5) * 2;
        pa[i * 3 + 2] = rock[2] + (Math.random() - 0.5) * 1.2;
        la[i] = 1.0;
        data.vel[i] = {
          x: (Math.random() - 0.5) * 0.006,
          y: (Math.random() - 0.5) * 0.006 + 0.002,
        };
        data.phase[i] = Math.random() * Math.PI * 2;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aLife.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={data.pos}
          count={COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={data.sizes}
          count={COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aLife"
          array={data.lives}
          count={COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aColor"
          array={data.colors}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={dustVert}
        fragmentShader={dustFrag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ══════════════════════════════════════════════
   CAMERA
══════════════════════════════════════════════ */
function CameraController() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.2 - camera.position.x) * 0.032;
    camera.position.y += (-mouse.current.y * 0.7 - camera.position.y) * 0.032;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ══════════════════════════════════════════════
   FULL SCENE
══════════════════════════════════════════════ */
function SupernovaScene({ isDark }) {
  return (
    <>
      <CameraController />
      <ambientLight
        intensity={isDark ? 0.05 : 0.5}
        color={isDark ? '#001030' : '#b0c8ff'}
      />
      <pointLight
        position={[-7, 4, 3]}
        intensity={isDark ? 7 : 2.5}
        color="#0066ff"
        distance={16}
      />
      <pointLight
        position={[7, -3, 2]}
        intensity={isDark ? 5 : 2.0}
        color="#00ccff"
        distance={14}
      />
      <pointLight
        position={[0, 6, -4]}
        intensity={isDark ? 4 : 1.5}
        color="#4422ff"
        distance={18}
      />
      <pointLight
        position={[0, -5, 3]}
        intensity={isDark ? 2.5 : 1.0}
        color="#0088ff"
        distance={10}
      />
      <pointLight
        position={[0, 0, -3]}
        intensity={isDark ? 3 : 1.2}
        color="#0044ff"
        distance={12}
      />
      <SupernovaDust isDark={isDark} />
      <RockDust isDark={isDark} />
      {ROCKS.map((r, i) => (
        <FloatingRock key={i} {...r} isDark={isDark} />
      ))}
      <EnergyStream
        from={ROCKS[0].position}
        to={ROCKS[1].position}
        isDark={isDark}
      />
      <EnergyStream
        from={ROCKS[2].position}
        to={ROCKS[6].position}
        isDark={isDark}
      />
      <EnergyStream
        from={ROCKS[4].position}
        to={ROCKS[7].position}
        isDark={isDark}
      />
      <EnergyStream
        from={ROCKS[3].position}
        to={ROCKS[5].position}
        isDark={isDark}
      />
    </>
  );
}

const SupernovaCanvas = dynamic(
  () =>
    Promise.resolve(function SC({ isDark }) {
      const [m, setM] = useState(false);
      useEffect(() => setM(true), []);
      if (!m) return null;
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 10], fov: 58 }}
            gl={{ alpha: true, antialias: true }}
            style={{ background: 'transparent' }}
          >
            <SupernovaScene isDark={isDark} />
          </Canvas>
        </div>
      );
    }),
  { ssr: false }
);

/* ══════════════════════════════════════════════
   GLITCH TITLE — FIX: span inner wrapper
   El h1 NO tiene background. Solo el span interno
   recibe WebkitBackgroundClip:'text'.
   Esto evita que Tailwind/Next sobreescriba el clip.
══════════════════════════════════════════════ */
function GlitchTitle({ isDark }) {
  const [glitch, setGlitch] = useState(false);
  const [off, setOff] = useState({ x: 0, sk: 0 });
  useEffect(() => {
    const trigger = () => {
      setOff({ x: (Math.random() - 0.5) * 6, sk: (Math.random() - 0.5) * 2.5 });
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    };
    const id = setInterval(trigger, 3200 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <h1
      style={{
        /* h1 es solo estructura — SIN background, SIN color aquí */
        fontFamily: '"Courier New",Courier,monospace',
        fontWeight: 900,
        fontSize: 'clamp(3.2rem,9vw,6rem)',
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        margin: '0 0 12px',
        lineHeight: 1,
        display: 'block',
        padding: 0,
      }}
    >
      {/* span interno: aquí va TODO el estilo visual */}
      <span
        style={{
          display: 'inline-block',
          /* Gradient clip — en span funciona en todos los navegadores */
          background: isDark
            ? 'linear-gradient(135deg,#e0f2ff 0%,#70bbff 28%,#0077ff 60%,#0033bb 100%)'
            : 'linear-gradient(135deg,#001888 0%,#0044cc 35%,#0077ff 65%,#44aaff 100%)',
          backgroundSize: '100%',
          backgroundRepeat: 'no-repeat',
          backgroundOrigin: 'padding-box',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          /* Glow + glitch */
          filter: glitch
            ? isDark
              ? 'drop-shadow(4px 0 0 #00ddff) drop-shadow(-4px 0 0 #7744ff)'
              : 'drop-shadow(3px 0 0 #0055ff) drop-shadow(-3px 0 0 #44aaff)'
            : isDark
              ? 'drop-shadow(0 0 32px rgba(0,110,255,0.6))'
              : 'drop-shadow(0 0 18px rgba(0,60,180,0.32))',
          transform: glitch
            ? `translate(${off.x}px,0) skewX(${off.sk}deg)`
            : 'none',
          transition: 'filter 0.07s,transform 0.04s',
        }}
      >
        ABOUT ME
      </span>
    </h1>
  );
}

/* ══════════════════════════════════════════════
   GLOW TEXT
══════════════════════════════════════════════ */
function GlowText({ text, delay = 0, style = {} }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <span ref={ref} style={{ display: 'inline', ...style }}>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          style={{
            display: ch === ' ' ? 'inline' : 'inline-block',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity 0.44s ease ${delay + i * 0.02}s,transform 0.44s ease ${delay + i * 0.02}s`,
          }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

/* ══════════════════════════════════════════════
   CARD + HEADING
══════════════════════════════════════════════ */
function SupernovaCard({ children, delay = 0, isDark }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.07 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 8,
        padding: '28px 32px',
        background: isDark
          ? hovered
            ? 'rgba(0,18,55,0.92)'
            : 'rgba(0,10,32,0.82)'
          : hovered
            ? 'rgba(232,240,255,0.95)'
            : 'rgba(245,249,255,0.90)',
        border: `1px solid ${hovered ? (isDark ? 'rgba(0,130,255,0.65)' : 'rgba(0,80,220,0.50)') : isDark ? 'rgba(0,90,220,0.22)' : 'rgba(0,60,190,0.18)'}`,
        boxShadow: hovered
          ? isDark
            ? '0 0 30px rgba(0,110,255,0.28),0 0 70px rgba(0,90,220,0.14),inset 0 0 40px rgba(0,60,180,0.08)'
            : '0 10px 36px rgba(0,80,200,0.18),0 2px 8px rgba(0,0,0,0.06)'
          : isDark
            ? '0 4px 22px rgba(0,0,0,0.55)'
            : '0 2px 14px rgba(0,50,160,0.08)',
        backdropFilter: 'blur(16px)',
        transform: visible
          ? 'translateY(0) scale(1)'
          : 'translateY(24px) scale(0.97)',
        opacity: visible ? 1 : 0,
        transition: `opacity 0.6s ease ${delay}s,transform 0.6s ease ${delay}s,border 0.3s,box-shadow 0.3s,background 0.3s`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          borderRadius: '8px 8px 0 0',
          background: `linear-gradient(90deg,transparent,${isDark ? '#0077ff' : '#3366ee'},transparent)`,
          opacity: hovered ? (isDark ? 1 : 0.7) : isDark ? 0.38 : 0.25,
          transition: 'opacity 0.3s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 16,
          height: 16,
          borderTop: `2px solid ${isDark ? '#0066ff' : '#2255cc'}`,
          borderLeft: `2px solid ${isDark ? '#0066ff' : '#2255cc'}`,
          borderRadius: '8px 0 0 0',
          opacity: isDark ? 0.8 : 0.55,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 16,
          height: 16,
          borderBottom: `2px solid ${isDark ? 'rgba(0,80,200,0.5)' : 'rgba(0,60,180,0.35)'}`,
          borderRight: `2px solid ${isDark ? 'rgba(0,80,200,0.5)' : 'rgba(0,60,180,0.35)'}`,
          borderRadius: '0 0 8px 0',
        }}
      />
      {children}
    </div>
  );
}

function SectionHeading({ text, delay, isDark }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2
        style={{
          fontFamily: '"Courier New",Courier,monospace',
          fontWeight: 900,
          fontSize: 'clamp(0.95rem,2.2vw,1.25rem)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          margin: '0 0 10px',
          color: isDark ? '#55aaff' : '#1144cc',
          textShadow: isDark
            ? '0 0 16px rgba(0,130,255,0.85),0 0 40px rgba(0,100,255,0.4)'
            : '0 0 10px rgba(0,80,200,0.22)',
        }}
      >
        <GlowText text={text} delay={delay} />
      </h2>
      <div
        style={{
          height: 1,
          background: isDark
            ? 'linear-gradient(90deg,#0077ff,rgba(0,110,255,0.35),transparent)'
            : 'linear-gradient(90deg,#2255cc,rgba(0,80,200,0.22),transparent)',
          boxShadow: isDark ? '0 0 8px rgba(0,110,255,0.6)' : 'none',
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════
   ABOUT PAGE
══════════════════════════════════════════════ */
const About = () => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setMounted(true);
    const check = () =>
      setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => obs.disconnect();
  }, []);

  const T = {
    pageBg: isDark
      ? 'radial-gradient(ellipse at 22% 18%,rgba(0,45,160,0.18) 0%,transparent 55%),radial-gradient(ellipse at 78% 82%,rgba(0,70,200,0.13) 0%,transparent 50%),#000610'
      : 'radial-gradient(ellipse at 22% 18%,rgba(180,215,255,0.38) 0%,transparent 55%),radial-gradient(ellipse at 78% 82%,rgba(160,200,255,0.22) 0%,transparent 50%),#edf2ff',
    heroSub: isDark ? 'rgba(120,180,255,0.9)' : 'rgba(0,55,170,0.42)',
    bodyText: isDark ? 'rgba(185,220,255,0.88)' : 'rgba(10,30,90,0.85)',
    dimText: isDark ? 'rgba(120,180,255,0.65)' : 'rgba(25,55,155,0.62)',
    eyeBg: isDark ? 'rgba(0,80,255,0.10)' : 'rgba(0,55,210,0.07)',
    eyeBorder: isDark ? 'rgba(0,130,255,0.28)' : 'rgba(0,80,210,0.20)',
    eyeText: isDark ? 'rgba(110,185,255,0.82)' : 'rgba(0,45,155,0.68)',
    pillBg: isDark ? 'rgba(0,65,190,0.22)' : 'rgba(0,55,190,0.08)',
    pillBorder: isDark ? 'rgba(0,110,255,0.35)' : 'rgba(0,65,185,0.22)',
    pillText: isDark ? 'rgba(130,200,255,0.95)' : 'rgba(0,45,155,0.82)',
    dot: isDark ? '#0099ff' : '#0044cc',
    statV: isDark ? '#55aaff' : '#0033cc',
    statL: isDark ? 'rgba(80,155,255,0.52)' : 'rgba(0,45,145,0.48)',
    statBg: isDark ? 'rgba(0,14,48,0.68)' : 'rgba(228,238,255,0.75)',
    statBorder: isDark ? 'rgba(0,85,210,0.22)' : 'rgba(0,60,180,0.14)',
    link: isDark ? '#00ddff' : '#0033cc',
    linkB: isDark ? 'rgba(0,210,255,0.32)' : 'rgba(0,55,175,0.28)',
    vig: isDark
      ? 'radial-gradient(ellipse at center,transparent 38%,rgba(0,2,16,0.85) 100%)'
      : 'radial-gradient(ellipse at center,transparent 46%,rgba(195,212,245,0.58) 100%)',
  };

  const body = {
    fontFamily: '"Courier New",Courier,monospace',
    fontSize: 13.5,
    lineHeight: 1.88,
    color: T.bodyText,
    margin: 0,
  };

  return (
    <div
      style={{ position: 'relative', minHeight: '100vh', background: T.pageBg }}
    >
      <ParticleBackground />
      <Head>
        <title>About — Jonathan Dev</title>
        <meta name="description" content="Jonathan — Full Stack Developer" />
      </Head>

      {mounted && <SupernovaCanvas isDark={isDark} />}

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(ellipse at 20% 35%,rgba(0,60,200,0.13) 0%,transparent 55%),radial-gradient(ellipse at 80% 65%,rgba(0,90,230,0.09) 0%,transparent 50%)'
            : 'radial-gradient(ellipse at 20% 35%,rgba(150,195,255,0.20) 0%,transparent 55%),radial-gradient(ellipse at 80% 65%,rgba(120,175,255,0.14) 0%,transparent 50%)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: T.vig,
        }}
      />
      <div className="w-full absolute top-0 z-10">
        <Navbar />
      </div>

      <main
        style={{
          position: 'relative',
          zIndex: 3,
          minHeight: '100vh',
          paddingTop: 88,
          paddingBottom: 72,
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 22px' }}>
          {/* HERO */}
          <div
            style={{ textAlign: 'center', marginBottom: 62, paddingTop: 14 }}
          >
            {/* Eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 24,
                padding: '5px 20px',
                borderRadius: 20,
                background: T.eyeBg,
                border: `1px solid ${T.eyeBorder}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: T.dot,
                  boxShadow: `0 0 10px ${T.dot}`,
                  animation: 'superPulse 1.8s ease-in-out infinite alternate',
                }}
              />
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 10,
                  letterSpacing: '0.3em',
                  color: T.eyeText,
                  textTransform: 'uppercase',
                }}
              >
                Jonathan · Full Stack · Developer
              </span>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: T.dot,
                  boxShadow: `0 0 10px ${T.dot}`,
                  animation: 'superPulse 1.8s ease-in-out infinite alternate',
                  animationDelay: '0.5s',
                }}
              />
            </div>

            {/* ✅ TÍTULO CORREGIDO — GlitchTitle con span wrapper */}
            {mounted && <GlitchTitle isDark={isDark} />}

            <p
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                letterSpacing: '0.34em',
                color: T.heroSub,
                marginTop: 10,
              }}
            >
              ── beyond the code ──
            </p>
          </div>

          {/* CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <SupernovaCard delay={0.15} isDark={isDark}>
              <SectionHeading text="About Me" delay={0.22} isDark={isDark} />
              <p style={body}>
                {mounted && (
                  <GlowText
                    text="I'm Jonathan, a passionate developer with expertise in JavaScript, React, and various web technologies. My mission is to deliver high-quality products and solutions that exceed your expectations. I specialize in creating dynamic and engaging web applications — explore the full stack I use in the "
                    delay={0.3}
                  />
                )}
                <Link
                  href="/pages/technologies"
                  style={{
                    color: T.link,
                    textDecoration: 'none',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textShadow: isDark
                      ? '0 0 12px rgba(0,210,255,0.65)'
                      : 'none',
                    borderBottom: `1px solid ${T.linkB}`,
                  }}
                >
                  Technologies page →
                </Link>
              </p>
            </SupernovaCard>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                gap: 24,
              }}
            >
              <SupernovaCard delay={0.28} isDark={isDark}>
                <SectionHeading text="Mission" delay={0.36} isDark={isDark} />
                <p style={body}>
                  {mounted && (
                    <GlowText
                      text="My mission is to innovate and excel in delivering cutting-edge technology solutions. I am dedicated to creating user-friendly applications that are both powerful and intuitive, leveraging my expertise across the modern web stack."
                      delay={0.44}
                    />
                  )}
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 7,
                    marginTop: 20,
                  }}
                >
                  {[
                    'React',
                    'Next.js',
                    'Node.js',
                    'MongoDB',
                    'Three.js',
                    'Redux',
                    'Tailwind',
                  ].map((s) => (
                    <span
                      key={s}
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: 3,
                        letterSpacing: 1,
                        background: T.pillBg,
                        border: `1px solid ${T.pillBorder}`,
                        color: T.pillText,
                        boxShadow: isDark
                          ? '0 0 7px rgba(0,110,255,0.22)'
                          : 'none',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </SupernovaCard>

              <SupernovaCard delay={0.38} isDark={isDark}>
                <SectionHeading text="Values" delay={0.46} isDark={isDark} />
                <p style={body}>
                  {mounted && (
                    <GlowText
                      text="Integrity, innovation, and excellence are at the core of everything I do. I am committed to delivering value through honesty, cutting-edge technology, and user-centric design."
                      delay={0.54}
                    />
                  )}
                </p>
                <div
                  style={{
                    marginTop: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {[
                    'Honesty & Transparency',
                    'Cutting-edge Technology',
                    'User-Centric Design',
                  ].map((v, i) => (
                    <div
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: T.dot,
                          boxShadow: `0 0 10px ${T.dot},0 0 22px ${T.dot}55`,
                          animation: `superPulse ${1.5 + i * 0.35}s ease-in-out infinite alternate`,
                          animationDelay: `${i * 0.25}s`,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 11.5,
                          color: T.dimText,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </SupernovaCard>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
                gap: 18,
                marginTop: 6,
              }}
            >
              {[
                { label: 'Projects', value: '5+' },
                { label: 'Technologies', value: '10+' },
                { label: 'Passion', value: '∞' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    textAlign: 'center',
                    padding: '22px 14px',
                    borderRadius: 8,
                    background: T.statBg,
                    border: `1px solid ${T.statBorder}`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: isDark
                      ? '0 0 22px rgba(0,90,210,0.14)'
                      : '0 2px 12px rgba(0,50,160,0.07)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"Courier New",monospace',
                      fontWeight: 900,
                      fontSize: '2.5rem',
                      lineHeight: 1,
                      color: T.statV,
                      textShadow: isDark
                        ? '0 0 20px rgba(0,130,255,0.8),0 0 45px rgba(0,100,255,0.35)'
                        : 'none',
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 9,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: T.statL,
                      marginTop: 8,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes superPulse {
          from{opacity:0.42;transform:scale(0.80);}
          to{opacity:1;transform:scale(1.25);}
        }
      `}</style>
    </div>
  );
};

export default About;
