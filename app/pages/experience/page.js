'use client';

import Navbar from '@/app/components/Navbar';
import { experiences } from '@/app/constants';
import { useEffect, useState, useRef, useMemo } from 'react';
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
  attribute float aLife; attribute float aSize; attribute vec3 aColor;
  varying float vLife; varying vec3 vColor;
  void main() {
    vLife=aLife; vColor=aColor;
    vec4 mvp=modelViewMatrix*vec4(position,1.0);
    gl_PointSize=aSize*(380.0/-mvp.z);
    gl_Position=projectionMatrix*mvp;
  }
`;
const dustFrag = `
  varying float vLife; varying vec3 vColor;
  void main() {
    vec2 uv=gl_PointCoord-0.5; float d=length(uv);
    if(d>0.5)discard;
    float core=1.0-smoothstep(0.0,0.10,d);
    float mid =1.0-smoothstep(0.10,0.30,d);
    float halo=1.0-smoothstep(0.30,0.50,d);
    float a=(core*1.0+mid*0.60+halo*0.22)*vLife;
    gl_FragColor=vec4(vColor,a*0.90);
  }
`;
const gridVert = `
  varying vec2 vUv;
  void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
`;
const gridFrag = `
  uniform float uTime; uniform vec3 uColor; uniform float uOpacity;
  varying vec2 vUv;
  void main(){
    vec2 g=abs(fract(vUv*22.0-0.5)-0.5)/fwidth(vUv*22.0);
    float line=min(g.x,g.y);
    float gl2=1.0-min(line,1.0);
    float pulse=0.5+0.5*sin(uTime*0.7+vUv.x*5.0+vUv.y*3.5);
    gl_FragColor=vec4(uColor,gl2*uOpacity*(0.25+pulse*0.18));
  }
`;

/* ══════════════════════════════════════════════
   SUPERNOVA DUST
══════════════════════════════════════════════ */
function SupernovaDust({ isDark }) {
  const ref = useRef();
  const COUNT = 320;
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
      sizes = new Float32Array(COUNT),
      lives = new Float32Array(COUNT),
      colors = new Float32Array(COUNT * 3);
    const vel = [],
      decay = [],
      phase = [],
      orbit = [];
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 9;
      sizes[i] = Math.random() * (isDark ? 0.082 : 0.05) + 0.015;
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
    const geo = ref.current.geometry,
      pa = geo.attributes.position.array,
      la = geo.attributes.aLife.array,
      t = clock.elapsedTime;
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
    scale: 0.58,
    detail: 1,
    phase: 0.0,
    rotSpeed: { x: 0.0009, y: 0.0013, z: 0.0005 },
  },
  {
    position: [5.5, 0.3, -3.5],
    scale: 0.82,
    detail: 2,
    phase: 1.2,
    rotSpeed: { x: 0.0005, y: 0.0008, z: 0.0011 },
  },
  {
    position: [-3.2, -2.5, -4.5],
    scale: 0.4,
    detail: 1,
    phase: 2.5,
    rotSpeed: { x: 0.0013, y: 0.0006, z: 0.0008 },
  },
  {
    position: [4.0, 2.8, -2.5],
    scale: 0.38,
    detail: 1,
    phase: 0.8,
    rotSpeed: { x: 0.0007, y: 0.0015, z: 0.0004 },
  },
  {
    position: [-7.0, -0.5, -5.5],
    scale: 0.68,
    detail: 2,
    phase: 3.1,
    rotSpeed: { x: 0.0004, y: 0.0009, z: 0.0012 },
  },
  {
    position: [6.8, 1.5, -4.0],
    scale: 0.3,
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
  const COUNT = 50,
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
      sizes[i] = Math.random() * 0.035 + 0.01;
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
        Math.sin(tt * 9 + clock.elapsedTime) * 0.13;
      pa[i * 3 + 1] =
        from[1] +
        (to[1] - from[1]) * tt +
        Math.cos(tt * 7 + clock.elapsedTime * 0.8) * 0.1;
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
          uOpacity: { value: isDark ? 0.28 : 0.09 },
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
    camera.position.x += (mouse.current.x * 0.9 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.current.y * 0.55 - camera.position.y) * 0.03;
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
   GLITCH TITLE
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
          ? `translate(${off.x}px,0) skewX(${off.sk}deg)`
          : 'none',
        transition: 'filter 0.07s,transform 0.04s',
      }}
    >
      EXPERIENCE
    </h1>
  );
}

/* ══════════════════════════════════════════════
   NEON CYCLE — for timeline nodes & accents
══════════════════════════════════════════════ */
function useNeonCycle(period = 6000) {
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
  const hue = 220 + Math.sin(t) * 32 + Math.cos(t * 0.7) * 14;
  const sat = isDark ? 96 : 88;
  const light = isDark
    ? 55 + Math.sin(t * 1.2) * 10
    : 40 + Math.sin(t * 1.2) * 8;
  return `hsl(${hue},${sat}%,${light}%)`;
}

/* ══════════════════════════════════════════════
   LETTER REVEAL
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
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: `opacity 0.4s ease ${delay + i * 0.02}s,transform 0.4s ease ${delay + i * 0.02}s`,
          }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

/* ══════════════════════════════════════════════
   EXPERIENCE CARD — timeline style
══════════════════════════════════════════════ */
function ExperienceCard({ experience, index, isDark, globalPhase, isLast }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef();

  const phaseOff = index * 0.22;
  const nA = neonHSL(globalPhase, phaseOff, isDark);
  const nB = neonHSL(globalPhase, phaseOff + 0.5, isDark);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.06 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const { title, company_name, date, points } = experience;

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        gap: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-28px)',
        transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`,
      }}
    >
      {/* Timeline column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 40,
          flexShrink: 0,
        }}
      >
        {/* Node — neon pulsing dot */}
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            flexShrink: 0,
            marginTop: 6,
            background: nA,
            boxShadow: `0 0 10px ${nA}, 0 0 24px ${nA}88, 0 0 40px ${nA}44`,
            border: `2px solid ${nB}`,
            transition: 'background 0.06s,box-shadow 0.06s',
            zIndex: 2,
            animation: `snPulse 2s ease-in-out infinite alternate`,
            animationDelay: `${index * 0.3}s`,
          }}
        />
        {/* Vertical line */}
        {!isLast && (
          <div
            style={{
              flex: 1,
              width: 2,
              marginTop: 4,
              background: isDark
                ? `linear-gradient(to bottom,${nA}88,${nB}44,transparent)`
                : `linear-gradient(to bottom,${nA}66,${nB}33,transparent)`,
              minHeight: 40,
            }}
          />
        )}
      </div>

      {/* Card */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1,
          marginLeft: 16,
          marginBottom: isLast ? 0 : 28,
          borderRadius: 8,
          padding: '20px 24px',
          position: 'relative',
          background: isDark
            ? hovered
              ? 'rgba(0,12,38,0.95)'
              : 'rgba(0,7,24,0.85)'
            : hovered
              ? 'rgba(238,244,255,0.97)'
              : 'rgba(246,250,255,0.92)',
          border: `1px solid ${
            hovered
              ? isDark
                ? `${nA}99`
                : `${nA}77`
              : isDark
                ? 'rgba(0,90,220,0.18)'
                : 'rgba(0,60,190,0.14)'
          }`,
          boxShadow: hovered
            ? isDark
              ? `0 0 22px ${nA}44, 0 0 55px ${nA}22, inset 0 0 30px rgba(0,50,150,0.06), 0 20px 40px rgba(0,0,0,0.55)`
              : `0 8px 32px ${nA}33, 0 2px 8px rgba(0,0,0,0.05)`
            : isDark
              ? '0 4px 18px rgba(0,0,0,0.5)'
              : '0 2px 12px rgba(0,50,160,0.07)',
          backdropFilter: 'blur(14px)',
          transition: 'border 0.3s,box-shadow 0.3s,background 0.3s',
        }}
      >
        {/* Top shimmer edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            borderRadius: '8px 8px 0 0',
            background: `linear-gradient(90deg,transparent,${nA},transparent)`,
            opacity: hovered ? (isDark ? 0.9 : 0.6) : isDark ? 0.35 : 0.2,
            transition: 'opacity 0.3s',
          }}
        />

        {/* Corner brackets */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 14,
            height: 14,
            borderTop: `1.5px solid ${nA}`,
            borderLeft: `1.5px solid ${nA}`,
            borderRadius: '8px 0 0 0',
            opacity: isDark ? 0.8 : 0.55,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 14,
            height: 14,
            borderBottom: `1.5px solid ${nB}66`,
            borderRight: `1.5px solid ${nB}66`,
            borderRadius: '0 0 8px 0',
          }}
        />

        {/* Date badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 10,
            padding: '3px 10px',
            borderRadius: 12,
            background: isDark ? 'rgba(0,60,180,0.20)' : 'rgba(0,55,190,0.08)',
            border: `1px solid ${nB}`,
            boxShadow: isDark ? `0 0 8px ${nB}44` : 'none',
          }}
        >
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: nB,
              boxShadow: `0 0 6px ${nB}`,
            }}
          />
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: isDark ? 'rgba(130,200,255,0.85)' : 'rgba(0,45,155,0.75)',
            }}
          >
            {date}
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: '"Courier New",Courier,monospace',
            fontWeight: 900,
            fontSize: 'clamp(1rem,2.2vw,1.2rem)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: '0 0 4px',
            color: isDark ? nA : '#0033bb',
            textShadow: isDark ? `0 0 12px ${nA}cc,0 0 28px ${nA}55` : 'none',
            transition: 'color 0.06s,text-shadow 0.06s',
          }}
        >
          <GlowText text={title} delay={index * 0.08} />
        </h2>

        {/* Company */}
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            margin: '0 0 12px',
            color: isDark ? 'rgba(100,170,255,0.72)' : 'rgba(0,55,170,0.62)',
            textShadow: isDark ? `0 0 8px ${nB}66` : 'none',
          }}
        >
          {company_name}
        </p>

        {/* Divider */}
        <div
          style={{
            height: 1,
            marginBottom: 14,
            background: `linear-gradient(90deg,${nA}66,${nB}33,transparent)`,
            boxShadow: isDark ? `0 0 4px ${nA}44` : 'none',
          }}
        />

        {/* Points */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {points.map((point, i) => (
            <li
              key={i}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
            >
              {/* Bullet */}
              <span
                style={{
                  display: 'inline-block',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  flexShrink: 0,
                  marginTop: 5,
                  background: neonHSL(globalPhase, phaseOff + i * 0.08, isDark),
                  boxShadow: `0 0 6px ${neonHSL(globalPhase, phaseOff + i * 0.08, isDark)}`,
                }}
              />
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 12.5,
                  lineHeight: 1.72,
                  color: isDark
                    ? 'rgba(180,215,255,0.78)'
                    : 'rgba(10,30,90,0.78)',
                }}
              >
                {point}
              </span>
            </li>
          ))}
        </ul>

        {/* Bottom glow line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            borderRadius: '0 0 8px 8px',
            background: `linear-gradient(90deg,transparent,${nB}66,transparent)`,
            opacity: hovered ? (isDark ? 0.8 : 0.5) : 0,
            transition: 'opacity 0.3s',
          }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   EXPERIENCES PAGE
══════════════════════════════════════════════ */
const Experiences = () => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const globalPhase = useNeonCycle(5800);

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
    <div
      style={{ position: 'relative', minHeight: '100vh', background: pageBg }}
    >
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
          opacity: isDark ? 0.042 : 0.018,
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
        <div className="w-full max-w-3xl">
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
                  letterSpacing: '0.34em',
                  marginTop: 10,
                  color: isDark
                    ? 'rgba(140,190,255,0.75)'
                    : 'rgba(0,55,170,0.40)',
                }}
              >
                ── experience & growth ──
              </p>

              {/* Stats eyebrow */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 14,
                  marginTop: 18,
                  padding: '6px 20px',
                  borderRadius: 20,
                  background: isDark
                    ? 'rgba(0,80,255,0.08)'
                    : 'rgba(0,55,210,0.06)',
                  border: isDark
                    ? '1px solid rgba(0,120,255,0.22)'
                    : '1px solid rgba(0,80,200,0.18)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: dot,
                    boxShadow: `0 0 8px ${dot}`,
                    animation: 'snPulse 1.8s ease-in-out infinite alternate',
                  }}
                />
                {[`${experiences?.length ?? 0} POSITIONS`, 'FULL STACK'].map(
                  (label, i, arr) => (
                    <span
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', gap: 14 }}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 10,
                          letterSpacing: '0.22em',
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
                            height: 11,
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
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: dot,
                    boxShadow: `0 0 8px ${dot}`,
                    animation: 'snPulse 1.8s ease-in-out infinite alternate',
                    animationDelay: '0.5s',
                  }}
                />
              </div>
            </div>

            {/* TIMELINE */}
            <div style={{ paddingLeft: 4 }}>
              {experiences?.map((exp, i) => (
                <ExperienceCard
                  key={exp.title + i}
                  experience={exp}
                  index={i}
                  isDark={isDark}
                  globalPhase={globalPhase}
                  isLast={i === experiences.length - 1}
                />
              ))}
            </div>
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

export default Experiences;
