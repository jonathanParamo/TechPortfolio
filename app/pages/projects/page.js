'use client';

import { projects } from '@/app/constants';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import Navbar from '@/app/components/Navbar';
import Image from 'next/image';
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
    vLife  = aLife; vColor = aColor;
    vec4 mvp = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (380.0 / -mvp.z);
    gl_Position  = projectionMatrix * mvp;
  }
`;
const dustFrag = `
  varying float vLife; varying vec3 vColor;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float core = 1.0 - smoothstep(0.0,  0.10, d);
    float mid  = 1.0 - smoothstep(0.10, 0.30, d);
    float halo = 1.0 - smoothstep(0.30, 0.50, d);
    float a    = (core*1.0 + mid*0.60 + halo*0.22) * vLife;
    gl_FragColor = vec4(vColor, a * 0.90);
  }
`;
const gridVert = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const gridFrag = `
  uniform float uTime; uniform vec3 uColor; uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 grid = abs(fract(vUv*22.0-0.5)-0.5) / fwidth(vUv*22.0);
    float line = min(grid.x,grid.y);
    float g = 1.0 - min(line,1.0);
    float pulse = 0.5 + 0.5*sin(uTime*0.7+vUv.x*5.0+vUv.y*3.5);
    gl_FragColor = vec4(uColor, g*uOpacity*(0.25+pulse*0.18));
  }
`;

/* ══════════════════════════════════════════════
   SUPERNOVA DUST
══════════════════════════════════════════════ */
function SupernovaDust({ isDark }) {
  const ref = useRef();
  const COUNT = 360;
  const darkP = [
    [0.0, 0.65, 1.0],
    [0.0, 0.88, 1.0],
    [0.1, 0.45, 1.0],
    [0.45, 0.75, 1.0],
    [0.55, 0.25, 1.0],
    [0.0, 1.0, 0.92],
    [0.25, 0.65, 1.0],
  ];
  const lightP = [
    [0.15, 0.35, 0.9],
    [0.05, 0.5, 0.85],
    [0.3, 0.28, 0.88],
    [0.0, 0.45, 0.82],
    [0.4, 0.22, 0.8],
  ];

  const data = useMemo(() => {
    const palette = isDark ? darkP : lightP;
    const pos = new Float32Array(COUNT * 3),
      sizes = new Float32Array(COUNT);
    const lives = new Float32Array(COUNT),
      colors = new Float32Array(COUNT * 3);
    const vel = [],
      decay = [],
      phase = [],
      orbit = [];
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 9;
      sizes[i] = Math.random() * (isDark ? 0.085 : 0.052) + 0.016;
      lives[i] = Math.random();
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];
      vel.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.003 + 0.0008,
        z: (Math.random() - 0.5) * 0.002,
      });
      decay.push(Math.random() * 0.003 + 0.0015);
      phase.push(Math.random() * Math.PI * 2);
      orbit.push(Math.random() * 0.003 + 0.001);
    }
    return { pos, sizes, lives, colors, vel, decay, phase, orbit };
  }, [isDark]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry;
    const pa = geo.attributes.position.array,
      la = geo.attributes.aLife.array;
    const t = clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      pa[i * 3] +=
        data.vel[i].x + Math.sin(t * 0.6 + data.phase[i]) * data.orbit[i];
      pa[i * 3 + 1] +=
        data.vel[i].y +
        Math.cos(t * 0.4 + data.phase[i] * 1.3) * data.orbit[i] * 0.5;
      pa[i * 3 + 2] += data.vel[i].z;
      la[i] -= data.decay[i];
      if (la[i] <= 0) {
        pa[i * 3] = (Math.random() - 0.5) * 26;
        pa[i * 3 + 1] = -8;
        pa[i * 3 + 2] = (Math.random() - 0.5) * 9;
        la[i] = 1.0;
        data.vel[i] = {
          x: (Math.random() - 0.5) * 0.005,
          y: (Math.random() - 0.5) * 0.003 + 0.0008,
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
    const g = new THREE.IcosahedronGeometry(1, detail);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const n =
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
    ref.current.position.y = position[1] + Math.sin(t * 0.38 + phase) * 0.4;
    ref.current.position.x = position[0] + Math.cos(t * 0.22 + phase) * 0.18;
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
];

/* ══════════════════════════════════════════════
   ENERGY STREAMS
══════════════════════════════════════════════ */
function EnergyStream({ from, to, isDark }) {
  const ref = useRef();
  const COUNT = 55;
  const col = isDark ? [0.0, 0.75, 1.0] : [0.18, 0.42, 0.95];
  const data = useMemo(() => {
    const pos = new Float32Array(COUNT * 3),
      sizes = new Float32Array(COUNT);
    const lives = new Float32Array(COUNT),
      colors = new Float32Array(COUNT * 3);
    const t = [];
    for (let i = 0; i < COUNT; i++) {
      const tt = Math.random();
      t.push(tt);
      pos[i * 3] = from[0] + (to[0] - from[0]) * tt;
      pos[i * 3 + 1] = from[1] + (to[1] - from[1]) * tt;
      pos[i * 3 + 2] = from[2] + (to[2] - from[2]) * tt;
      sizes[i] = Math.random() * 0.038 + 0.012;
      lives[i] = Math.random();
      colors[i * 3] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];
    }
    return { pos, sizes, lives, colors, t };
  }, [from, to, isDark]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry;
    const pa = geo.attributes.position.array,
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
   FLOATING GRID
══════════════════════════════════════════════ */
function FloatingGrid({ isDark }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.material.uniforms.uTime.value = clock.elapsedTime;
  });
  const col = isDark
    ? new THREE.Color(0.5, 0.18, 0.95)
    : new THREE.Color(0.48, 0.22, 0.82);
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.6, 0, 0]} position={[0, -3.8, -2]}>
      <planeGeometry args={[32, 22, 1, 1]} />
      <shaderMaterial
        vertexShader={gridVert}
        fragmentShader={gridFrag}
        transparent
        side={THREE.DoubleSide}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: col },
          uOpacity: { value: isDark ? 0.3 : 0.1 },
        }}
      />
    </mesh>
  );
}

/* ══════════════════════════════════════════════
   CAMERA
══════════════════════════════════════════════ */
function CameraController() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const m = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', m);
    return () => window.removeEventListener('mousemove', m);
  }, []);
  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.0 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.current.y * 0.6 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

const SceneCanvas = dynamic(
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
            <SupernovaDust isDark={isDark} />
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
              to={ROCKS[5].position}
              isDark={isDark}
            />
            <EnergyStream
              from={ROCKS[3].position}
              to={ROCKS[4].position}
              isDark={isDark}
            />
            <FloatingGrid isDark={isDark} />
          </Canvas>
        </div>
      );
    }),
  { ssr: false }
);

/* ══════════════════════════════════════════════
   NEON CYCLE — drives card borders (blue palette)
══════════════════════════════════════════════ */
function useNeonCycle(period = 5500) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let raf,
      start = null;
    const loop = (ts) => {
      if (!start) start = ts;
      setPhase(((ts - start) / period) % 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [period]);
  return phase;
}

function neonHSL(phase, offset, isDark) {
  const t = ((phase + offset) % 1) * Math.PI * 2;
  /* Oscillates in blue-cyan-violet space: hue 200–260 */
  const hue = 220 + Math.sin(t) * 32 + Math.cos(t * 0.7) * 14;
  const sat = isDark ? 96 : 88;
  const light = isDark
    ? 55 + Math.sin(t * 1.2) * 10
    : 40 + Math.sin(t * 1.2) * 8;
  return `hsl(${hue},${sat}%,${light}%)`;
}

function neonShadow(col, isDark, hovered) {
  const s = hovered ? 1.5 : 1;
  return isDark
    ? `0 0 ${5 * s}px ${col}, 0 0 ${16 * s}px ${col}, 0 0 ${38 * s}px ${col}`
    : `0 0 ${4 * s}px ${col}, 0 0 ${12 * s}px ${col}`;
}

/* ══════════════════════════════════════════════
   GLITCH TITLE — supernova blue
══════════════════════════════════════════════ */
function GlitchTitle({ isDark }) {
  const [glitch, setGlitch] = useState(false);
  const [offset, setOffset] = useState({ x: 0, skew: 0 });
  useEffect(() => {
    const trigger = () => {
      setOffset({
        x: (Math.random() - 0.5) * 6,
        skew: (Math.random() - 0.5) * 2.5,
      });
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    };
    const id = setInterval(trigger, 3200 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <h1
      style={{
        fontFamily: '"Courier New",Courier,monospace',
        fontWeight: 900,
        fontSize: 'clamp(2.5rem,7vw,5.5rem)',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        display: 'inline-block',
        margin: 0,
        lineHeight: 1,
        background: isDark
          ? 'linear-gradient(135deg,#e0f2ff 0%,#70bbff 28%,#0077ff 60%,#0033bb 100%)'
          : 'linear-gradient(135deg,#001888 0%,#0044cc 35%,#0077ff 65%,#44aaff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: glitch
          ? isDark
            ? 'drop-shadow(4px 0 0 #00ddff) drop-shadow(-4px 0 0 #7744ff)'
            : 'drop-shadow(3px 0 0 #0055ff) drop-shadow(-3px 0 0 #44aaff)'
          : isDark
            ? 'drop-shadow(0 0 28px rgba(0,110,255,0.65))'
            : 'drop-shadow(0 0 18px rgba(0,60,200,0.38))',
        transform: glitch
          ? `translate(${offset.x}px,0) skewX(${offset.skew}deg)`
          : 'none',
        transition: 'filter 0.07s, transform 0.04s',
      }}
    >
      PROJECTS
    </h1>
  );
}

/* ══════════════════════════════════════════════
   PROJECT CARD — blue neon cycling
══════════════════════════════════════════════ */
function ProjectCard({ project, index, isDark, globalPhase }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const ref = useRef(),
    cardRef = useRef();
  const phaseA = useMemo(() => index * 0.19, [index]);
  const phaseB = useMemo(() => index * 0.19 + 0.5, [index]);

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

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const rotX = hovered ? (mousePos.y - 0.5) * -10 : 0;
  const rotY = hovered ? (mousePos.x - 0.5) * 10 : 0;
  const nA = neonHSL(globalPhase, phaseA, isDark);
  const nB = neonHSL(globalPhase, phaseB, isDark);
  const outerGlow = neonShadow(nA, isDark, hovered);
  const liftShadow = hovered
    ? isDark
      ? ', 0 24px 55px rgba(0,0,0,0.72)'
      : `, 0 18px 40px rgba(0,80,200,0.12), 0 4px 14px rgba(0,0,0,0.05)`
    : isDark
      ? ', 0 6px 18px rgba(0,0,0,0.5)'
      : `, 0 2px 10px rgba(0,60,200,0.06)`;

  const cardBg = isDark
    ? 'linear-gradient(155deg,rgba(0,8,28,0.97) 0%,rgba(0,4,16,0.97) 100%)'
    : 'linear-gradient(155deg,rgba(255,254,255,0.98) 0%,rgba(246,249,255,0.98) 100%)';

  return (
    <li
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      onMouseMove={handleMouseMove}
      style={{
        listStyle: 'none',
        borderRadius: 6,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        background: cardBg,
        border: `1px solid ${nA}`,
        boxShadow: outerGlow + liftShadow,
        transform: visible
          ? `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(0) scale(${hovered ? 1.022 : 1})`
          : 'perspective(900px) translateY(32px) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: [
          `opacity 0.55s ease ${index * 0.07}s`,
          'border-color 0.06s',
          'box-shadow 0.06s',
          `transform ${hovered ? '0.1s' : '0.55s'} ease ${hovered ? '0s' : `${index * 0.07}s`}`,
        ].join(', '),
      }}
    >
      {/* Corner brackets */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 18,
          height: 18,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 18,
            height: 2,
            background: `linear-gradient(to right,${nA},transparent)`,
            filter: `blur(0.5px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 2,
            height: 18,
            background: `linear-gradient(to bottom,${nA},transparent)`,
            filter: `blur(0.5px)`,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 18,
          height: 18,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 18,
            height: 2,
            background: `linear-gradient(to left,${nB},transparent)`,
            filter: `blur(0.5px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 2,
            height: 18,
            background: `linear-gradient(to bottom,${nB},transparent)`,
            filter: `blur(0.5px)`,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 18,
          height: 18,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 18,
            height: 2,
            background: `linear-gradient(to right,${nB},transparent)`,
            filter: `blur(0.5px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 2,
            height: 18,
            background: `linear-gradient(to top,${nB},transparent)`,
            filter: `blur(0.5px)`,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 18,
          height: 18,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 18,
            height: 2,
            background: `linear-gradient(to left,${nA},transparent)`,
            filter: `blur(0.5px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 2,
            height: 18,
            background: `linear-gradient(to top,${nA},transparent)`,
            filter: `blur(0.5px)`,
          }}
        />
      </div>

      {/* Index badge */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 10,
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 2,
          color: nA,
          textShadow: `0 0 7px ${nA}, 0 0 16px ${nA}`,
          background: isDark ? 'rgba(0,0,0,0.58)' : 'rgba(255,255,255,0.75)',
          padding: '2px 6px',
          borderRadius: 3,
          backdropFilter: 'blur(6px)',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Image */}
      <div
        ref={cardRef}
        style={{ position: 'relative', height: 148, overflow: 'hidden' }}
      >
        <Image
          src={project.image}
          alt={project.name}
          fill
          className="object-cover"
          style={{
            filter: hovered
              ? isDark
                ? 'brightness(0.78) saturate(1.15)'
                : 'brightness(0.82) saturate(1.1)'
              : isDark
                ? 'brightness(0.36) grayscale(30%)'
                : 'brightness(0.65) grayscale(18%)',
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
            transition: 'filter 0.45s ease, transform 0.45s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'linear-gradient(to bottom,rgba(0,4,16,0.15) 0%,rgba(0,4,16,0.88) 100%)'
              : 'linear-gradient(to bottom,rgba(246,249,255,0.05) 0%,rgba(246,249,255,0.84) 100%)',
          }}
        />
        {/* Neon shimmer top edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg,transparent 0%,${nB} 30%,${nA} 70%,transparent 100%)`,
            opacity: isDark ? 0.9 : 0.55,
            filter: 'blur(0.8px)',
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          padding: '13px 15px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
        }}
      >
        <h2
          style={{
            fontFamily: 'monospace',
            fontWeight: 900,
            fontSize: 12.5,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: 0,
            color: nA,
            textShadow: isDark
              ? `0 0 8px ${nA}, 0 0 20px ${nA}`
              : `0 0 5px ${nA}`,
            transition: 'color 0.06s,text-shadow 0.06s',
          }}
        >
          {project.name}
        </h2>

        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 10.5,
            lineHeight: 1.65,
            margin: 0,
            color: isDark ? 'rgba(180,215,255,0.65)' : 'rgba(10,30,90,0.62)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description}
        </p>

        {/* Tags */}
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}
        >
          {project.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'monospace',
                fontSize: 9,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 3,
                letterSpacing: 0.5,
                background: isDark
                  ? 'rgba(0,60,180,0.20)'
                  : 'rgba(0,55,190,0.07)',
                border: `1px solid ${nB}`,
                color: isDark
                  ? 'rgba(130,200,255,0.92)'
                  : 'rgba(0,45,155,0.80)',
                boxShadow: isDark ? `0 0 5px ${nB}` : `0 0 3px ${nB}`,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}
        >
          {project.deployed_app_link && (
            <a
              href={project.deployed_app_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: 3,
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                textDecoration: 'none',
                background: isDark
                  ? 'rgba(0,80,200,0.22)'
                  : 'rgba(0,55,190,0.08)',
                border: `1px solid ${nA}`,
                color: isDark ? '#a0d8ff' : '#003dcc',
                boxShadow: isDark
                  ? `0 0 8px ${nA},inset 0 0 8px rgba(0,100,255,0.08)`
                  : `0 0 5px ${nA}`,
                transition: 'background 0.2s',
              }}
            >
              <FaExternalLinkAlt size={8} /> LIVE
            </a>
          )}
          {project.frontend_repo && (
            <a
              href={project.frontend_repo}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: 3,
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                textDecoration: 'none',
                background: isDark
                  ? 'rgba(0,0,0,0.45)'
                  : 'rgba(255,255,255,0.72)',
                border: `1px solid rgba(0,100,220,0.35)`,
                color: isDark
                  ? 'rgba(130,200,255,0.75)'
                  : 'rgba(0,45,155,0.65)',
                transition: 'background 0.2s',
              }}
            >
              <FaGithub size={10} /> FRONT
            </a>
          )}
          {project.backend_repo && (
            <a
              href={project.backend_repo}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: 3,
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                textDecoration: 'none',
                background: isDark
                  ? 'rgba(0,0,0,0.45)'
                  : 'rgba(255,255,255,0.72)',
                border: `1px solid rgba(0,100,220,0.35)`,
                color: isDark
                  ? 'rgba(130,200,255,0.75)'
                  : 'rgba(0,45,155,0.65)',
                transition: 'background 0.2s',
              }}
            >
              <FaGithub size={10} /> BACK
            </a>
          )}
        </div>
      </div>

      {/* Bottom neon line */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg,transparent 0%,${nB} 40%,${nA} 60%,transparent 100%)`,
          opacity: isDark ? 0.85 : 0.45,
          filter: 'blur(0.5px)',
        }}
      />
    </li>
  );
}

/* ══════════════════════════════════════════════
   PROJECTS PAGE
══════════════════════════════════════════════ */
const Projects = () => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const globalPhase = useNeonCycle(5500);

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

  const pageBg = isDark
    ? 'radial-gradient(ellipse at 22% 18%,rgba(0,45,160,0.16) 0%,transparent 55%),radial-gradient(ellipse at 78% 82%,rgba(0,70,200,0.11) 0%,transparent 50%),#000610'
    : 'radial-gradient(ellipse at 22% 18%,rgba(180,215,255,0.35) 0%,transparent 55%),radial-gradient(ellipse at 78% 82%,rgba(160,200,255,0.20) 0%,transparent 50%),#edf2ff';

  const dot = isDark ? '#4da6ff' : '#0055cc';
  const lineL = isDark
    ? 'linear-gradient(to right,transparent,#0066ff)'
    : 'linear-gradient(to right,transparent,#2266cc)';
  const lineR = isDark
    ? 'linear-gradient(to left,transparent,#0066ff)'
    : 'linear-gradient(to left,transparent,#2266cc)';

  return (
    <div className="relative min-h-screen" style={{ background: pageBg }}>
      <ParticleBackground />

      {mounted && <SceneCanvas isDark={isDark} />}

      {/* Grain */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: isDark ? 0.045 : 0.02,
          mixBlendMode: isDark ? 'screen' : 'multiply',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(ellipse at center,transparent 42%,rgba(0,2,16,0.82) 100%)'
            : 'radial-gradient(ellipse at center,transparent 50%,rgba(200,215,245,0.48) 100%)',
        }}
      />

      <div className="w-full absolute top-0 z-10">
        <Navbar />
      </div>

      <main
        className="relative pt-12 px-4 md:px-6 flex justify-center items-start overflow-auto min-h-screen"
        style={{ zIndex: 3 }}
      >
        <div className="w-full max-w-6xl">
          <section className="mx-auto py-10 px-2 md:px-4 flex flex-col mb-8 mt-8">
            {/* HEADER */}
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              {/* Ornament */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  marginBottom: 18,
                  opacity: isDark ? 0.55 : 0.42,
                }}
              >
                <div style={{ height: 1, width: 90, background: lineL }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: dot,
                        boxShadow: `0 0 8px ${dot}`,
                        animation: `snPulse ${1.4 + i * 0.35}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
                <div style={{ height: 1, width: 90, background: lineR }} />
              </div>

              {mounted && <GlitchTitle isDark={isDark} />}

              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  letterSpacing: '0.32em',
                  marginTop: 10,
                  color: isDark
                    ? 'rgba(140,190,255,0.75)'
                    : 'rgba(0,55,170,0.40)',
                }}
              >
                ── interactive projects ──
              </p>

              {/* Stats bar */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 18,
                  padding: '7px 20px',
                  borderRadius: 4,
                  background: isDark
                    ? 'rgba(0,80,255,0.08)'
                    : 'rgba(0,55,210,0.06)',
                  border: isDark
                    ? '1px solid rgba(0,120,255,0.22)'
                    : '1px solid rgba(0,80,200,0.18)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {[`${projects.length} PROJECTS`, 'FULL STACK', 'NEXT.JS'].map(
                  (label, i, arr) => (
                    <span
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 10,
                          letterSpacing: 2,
                          color: isDark
                            ? 'rgba(100,170,255,0.75)'
                            : 'rgba(0,50,160,0.65)',
                        }}
                      >
                        {label}
                      </span>
                      {i < arr.length - 1 && (
                        <span
                          style={{
                            width: 1,
                            height: 12,
                            display: 'inline-block',
                            background: isDark
                              ? 'rgba(0,120,255,0.22)'
                              : 'rgba(0,80,200,0.18)',
                          }}
                        />
                      )}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* GRID */}
            <ul
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(238px,1fr))',
                gap: 22,
                padding: 0,
                margin: 0,
              }}
            >
              {projects.map((project, index) => (
                <ProjectCard
                  key={index}
                  project={project}
                  index={index}
                  isDark={isDark}
                  globalPhase={globalPhase}
                />
              ))}
            </ul>
          </section>
        </div>
      </main>

      <style>{`
        @keyframes snPulse {
          from{opacity:0.35;transform:scale(0.82);}
          to{opacity:1;transform:scale(1.20);}
        }
      `}</style>
    </div>
  );
};

export default Projects;
