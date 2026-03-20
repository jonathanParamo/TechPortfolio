'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ══════════════════════════════════════════════
   SHADERS — supernova dust (same as About)
══════════════════════════════════════════════ */
const dustVert = `
  attribute float aSize;
  attribute float aLife;
  attribute vec3  aColor;
  varying float vLife;
  varying vec3  vColor;

  void main() {
    vLife  = aLife;
    vColor = aColor;
    vec4 mvp = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvp.z);
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
    float a    = (core*1.0 + mid*0.60 + halo*0.22) * vLife;
    gl_FragColor = vec4(vColor, a * 0.90);
  }
`;

/* ══════════════════════════════════════════════
   SUPERNOVA BLUE EFFECT — per card
══════════════════════════════════════════════ */
function SupernovaEffect() {
  const ref = useRef();
  const count = 90;

  /* Blue-cyan supernova palette matching About */
  const palette = useMemo(
    () => [
      [0.0, 0.65, 1.0], // electric blue
      [0.0, 0.88, 1.0], // cyan
      [0.1, 0.45, 1.0], // royal blue
      [0.45, 0.75, 1.0], // ice blue
      [0.55, 0.25, 1.0], // violet-blue
      [0.0, 1.0, 0.92], // neon aqua
    ],
    []
  );

  const p = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const lives = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const vel = [];
    const lifeSpeeds = [];
    const turbulence = [];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.55;
      pos[i * 3 + 1] = Math.random() * -0.22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.22;

      sizes[i] = Math.random() * 0.06 + 0.025;
      lives[i] = Math.random();

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];

      vel.push({
        x: (Math.random() - 0.5) * 0.007,
        y: Math.random() * 0.024 + 0.012,
        z: (Math.random() - 0.5) * 0.005,
      });
      lifeSpeeds.push(Math.random() * 0.011 + 0.007);
      turbulence.push(Math.random() * Math.PI * 2);
    }
    return { pos, sizes, lives, colors, vel, lifeSpeeds, turbulence };
  }, [palette]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry;
    const posArr = geo.attributes.position.array;
    const laArr = geo.attributes.aLife.array;
    const t = clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const v = p.vel[i];
      const ls = p.lifeSpeeds[i];
      const tb = p.turbulence[i];

      posArr[i * 3] += v.x + Math.sin(t * 3.2 + tb) * 0.0025;
      posArr[i * 3 + 1] += v.y;
      posArr[i * 3 + 2] += v.z;
      laArr[i] -= ls;

      if (laArr[i] <= 0) {
        posArr[i * 3] = (Math.random() - 0.5) * 0.55;
        posArr[i * 3 + 1] = -0.12;
        posArr[i * 3 + 2] = (Math.random() - 0.5) * 0.22;
        laArr[i] = 1.0;
        p.vel[i] = {
          x: (Math.random() - 0.5) * 0.007,
          y: Math.random() * 0.024 + 0.012,
          z: (Math.random() - 0.5) * 0.005,
        };
        p.turbulence[i] = Math.random() * Math.PI * 2;
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
          array={p.pos}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={p.sizes}
          count={count}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aLife"
          array={p.lives}
          count={count}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aColor"
          array={p.colors}
          count={count}
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

function DustCanvas() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '-8px',
        left: 0,
        right: 0,
        height: '145%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <Canvas
        camera={{ position: [0, 0.3, 2], fov: 55 }}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        style={{ background: 'transparent' }}
      >
        <SupernovaEffect />
      </Canvas>
    </div>
  );
}

/* ══════════════════════════════════════════════
   TECH NAME — blue neon flicker (matches About)
══════════════════════════════════════════════ */
function TechName({ name }) {
  return (
    <span className="tech-name relative flex justify-center gap-[1px] overflow-visible">
      {name.split('').map((char, i) => (
        <span
          key={i}
          className="tech-char"
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
      <style>{`
        .tech-char {
          font-size: 11px;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.5px;
          color: #60b0ff;
          display: inline-block;
          animation: charFlicker 2.8s ease-in-out infinite alternate;
          text-shadow:
            0 0 4px #0088ff,
            0 0 8px #0055cc,
            0 0 14px #0033aa;
        }
        @keyframes charFlicker {
          0%   { color: #a0d0ff; text-shadow: 0 0 4px #60aaff, 0 0 10px #3388ff; transform: translateY(0px);   }
          30%  { color: #55aaff; text-shadow: 0 0 6px #0077ff, 0 0 14px #0055ee; transform: translateY(-1px);  }
          60%  { color: #00ddff; text-shadow: 0 0 5px #00bbee, 0 0 12px #0099cc; transform: translateY(0.5px); }
          100% { color: #a0d0ff; text-shadow: 0 0 8px #60aaff, 0 0 20px #0077ff; transform: translateY(-1px);  }
        }
      `}</style>
    </span>
  );
}

/* ══════════════════════════════════════════════
   TECH CARD
══════════════════════════════════════════════ */
function TechCard({ tech }) {
  return (
    <div
      className="relative w-16 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
      style={{ overflow: 'visible' }}
    >
      {/* Supernova dust per card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        <DustCanvas />
      </div>

      <div
        className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-1
        bg-[#000a1e] dark:bg-[#000510] p-3 rounded-xl
        border border-blue-500/20 hover:border-blue-400/55
        transition-all duration-300
        hover:shadow-lg hover:shadow-blue-500/25"
        style={{
          backdropFilter: 'blur(10px)',
          background: 'rgba(0,8,28,0.82)',
        }}
      >
        <Image
          src={tech.icon}
          alt={tech.name}
          width={56}
          height={56}
          className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
        />
        <TechName name={tech.name} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION TITLE — supernova blue gradient
   (matches About's h1 style)
══════════════════════════════════════════════ */
function TechSectionTitle() {
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

  const letters = 'TECHNOLOGIES'.split('');

  return (
    <h1
      ref={ref}
      style={{
        fontFamily: '"Courier New", Courier, monospace',
        fontWeight: 900,
        fontSize: 'clamp(2rem, 6vw, 4rem)',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        margin: '0 0 8px',
        lineHeight: 1,
        /* Same gradient as About's hero title in dark mode */
        background:
          'linear-gradient(135deg, #e0f2ff 0%, #70bbff 28%, #0077ff 60%, #0033bb 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 0 28px rgba(0,110,255,0.55))',
      }}
    >
      {letters.map((ch, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: `opacity 0.44s ease ${0.05 + i * 0.042}s, transform 0.44s ease ${0.05 + i * 0.042}s`,
          }}
        >
          {ch}
        </span>
      ))}
    </h1>
  );
}

/* ══════════════════════════════════════════════
   TECHNOLOGIES LIST
══════════════════════════════════════════════ */
const TechnologiesList = ({ technologies }) => {
  return (
    <div className="bg-transparent rounded-lg w-full">
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <TechSectionTitle />
      </div>

      {/* Grid */}
      <div className="w-full flex flex-wrap justify-center gap-10 py-6">
        {technologies.map((tech) => (
          <TechCard key={tech.name} tech={tech} />
        ))}
      </div>
    </div>
  );
};

export default TechnologiesList;
