'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ══════════════════════════════════════════════
   SHADERS
══════════════════════════════════════════════ */
const dustVert = `
  attribute float aLife; attribute float aSize; attribute vec3 aColor;
  varying float vLife; varying vec3 vColor;
  void main() {
    vLife=aLife; vColor=aColor;
    vec4 mvp=modelViewMatrix*vec4(position,1.0);
    gl_PointSize=aSize*(400.0/-mvp.z);
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
    float a=(core*1.0+mid*0.65+halo*0.25)*vLife;
    gl_FragColor=vec4(vColor,a*0.92);
  }
`;
const gridVert = `
  varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
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
   THREE COMPONENTS
══════════════════════════════════════════════ */
function SupernovaDust({ isDark }) {
  const ref = useRef();
  const COUNT = 380;
  const data = useMemo(() => {
    const dP = [
      [0.0, 0.65, 1.0],
      [0.0, 0.9, 1.0],
      [0.1, 0.45, 1.0],
      [0.45, 0.75, 1.0],
      [0.55, 0.25, 1.0],
      [0.0, 1.0, 0.95],
      [0.25, 0.65, 1.0],
    ];
    const lP = [
      [0.15, 0.35, 0.9],
      [0.05, 0.5, 0.85],
      [0.3, 0.28, 0.88],
      [0.0, 0.45, 0.82],
      [0.4, 0.22, 0.8],
    ];
    const pal = isDark ? dP : lP;
    const pos = new Float32Array(COUNT * 3),
      sz = new Float32Array(COUNT);
    const li = new Float32Array(COUNT),
      col = new Float32Array(COUNT * 3);
    const vel = [],
      dc = [],
      ph = [],
      or = [];
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sz[i] = Math.random() * (isDark ? 0.09 : 0.055) + 0.018;
      li[i] = Math.random();
      const c = pal[Math.floor(Math.random() * pal.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
      vel.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.004 + 0.001,
        z: (Math.random() - 0.5) * 0.002,
      });
      dc.push(Math.random() * 0.0032 + 0.0015);
      ph.push(Math.random() * Math.PI * 2);
      or.push(Math.random() * 0.004 + 0.0015);
    }
    return { pos, sz, li, col, vel, dc, ph, or };
  }, [isDark]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry,
      pa = geo.attributes.position.array,
      la = geo.attributes.aLife.array,
      t = clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      pa[i * 3] += data.vel[i].x + Math.sin(t * 0.7 + data.ph[i]) * data.or[i];
      pa[i * 3 + 1] +=
        data.vel[i].y +
        Math.cos(t * 0.5 + data.ph[i] * 1.3) * data.or[i] * 0.55;
      pa[i * 3 + 2] += data.vel[i].z;
      la[i] -= data.dc[i];
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
        data.ph[i] = Math.random() * Math.PI * 2;
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
          array={data.sz}
          count={COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aLife"
          array={data.li}
          count={COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aColor"
          array={data.col}
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

function FloatingRock({ position, scale, rotSpeed, detail, phase, isDark }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, detail),
      p = g.attributes.position;
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

export const ROCKS = [
  {
    position: [-5.8, 1.6, -3.0],
    scale: 0.6,
    detail: 1,
    phase: 0.0,
    rotSpeed: { x: 0.0009, y: 0.0013, z: 0.0005 },
  },
  {
    position: [5.5, 0.3, -3.5],
    scale: 0.85,
    detail: 2,
    phase: 1.2,
    rotSpeed: { x: 0.0005, y: 0.0008, z: 0.0011 },
  },
  {
    position: [-3.2, -2.5, -4.5],
    scale: 0.42,
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
    scale: 0.7,
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
  {
    position: [0.8, 3.8, -5.0],
    scale: 0.52,
    detail: 2,
    phase: 4.2,
    rotSpeed: { x: 0.0006, y: 0.0012, z: 0.0009 },
  },
  {
    position: [-2.0, -3.2, -3.5],
    scale: 0.34,
    detail: 1,
    phase: 2.0,
    rotSpeed: { x: 0.001, y: 0.0007, z: 0.0014 },
  },
];

function EnergyStream({ from, to, isDark }) {
  const ref = useRef();
  const COUNT = 60;
  const col = isDark ? [0.0, 0.75, 1.0] : [0.18, 0.42, 0.95];
  const data = useMemo(() => {
    const pos = new Float32Array(COUNT * 3),
      sz = new Float32Array(COUNT);
    const li = new Float32Array(COUNT),
      co = new Float32Array(COUNT * 3),
      t = [];
    for (let i = 0; i < COUNT; i++) {
      const tt = Math.random();
      t.push(tt);
      pos[i * 3] = from[0] + (to[0] - from[0]) * tt;
      pos[i * 3 + 1] = from[1] + (to[1] - from[1]) * tt;
      pos[i * 3 + 2] = from[2] + (to[2] - from[2]) * tt;
      sz[i] = Math.random() * 0.038 + 0.01;
      li[i] = Math.random();
      co[i * 3] = col[0];
      co[i * 3 + 1] = col[1];
      co[i * 3 + 2] = col[2];
    }
    return { pos, sz, li, co, t };
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
          array={data.sz}
          count={COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aLife"
          array={data.li}
          count={COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aColor"
          array={data.co}
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

function CamCtrl() {
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

/* ══════════════════════════════════════════════
   SCENE CANVAS — exportable, reutilizable
   Uso: <SupernovaCanvas isDark={isDark} />
══════════════════════════════════════════════ */
export const SupernovaCanvas = dynamic(
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
            <CamCtrl />
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
              to={ROCKS[6].position}
              isDark={isDark}
            />
            <EnergyStream
              from={ROCKS[3].position}
              to={ROCKS[5].position}
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
   UI COMPONENTS — reutilizables en todas las páginas
══════════════════════════════════════════════ */

/* GlitchTitle
   Uso: <GlitchTitle text="PROJECTS" isDark={isDark} /> */
export function GlitchTitle({ text, isDark }) {
  const [glitch, setGlitch] = useState(false);
  const [off, setOff] = useState({ x: 0, sk: 0 });
  useEffect(() => {
    const trigger = () => {
      setOff({ x: (Math.random() - 0.5) * 5, sk: (Math.random() - 0.5) * 2 });
      setGlitch(true);
      setTimeout(() => setGlitch(false), 180);
    };
    const id = setInterval(trigger, 3500 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <h1
      style={{
        fontFamily: '"Courier New",Courier,monospace',
        fontWeight: 900,
        fontSize: 'clamp(2.4rem,8vw,5.5rem)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        margin: '0 0 12px',
        lineHeight: 1,
        display: 'block',
        padding: 0,
        background: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          background: isDark
            ? 'linear-gradient(135deg,#e0f2ff 0%,#70bbff 25%,#0077ff 58%,#0033bb 100%)'
            : 'linear-gradient(135deg,#001888 0%,#0044cc 35%,#0077ff 65%,#44aaff 100%)',
          backgroundSize: '100%',
          backgroundRepeat: 'no-repeat',
          backgroundOrigin: 'padding-box',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          filter: glitch
            ? isDark
              ? 'drop-shadow(4px 0 0 #00ddff) drop-shadow(-4px 0 0 #7744ff)'
              : 'drop-shadow(3px 0 0 #0055ff) drop-shadow(-3px 0 0 #44aaff)'
            : isDark
              ? 'drop-shadow(0 0 32px rgba(0,110,255,0.65))'
              : 'drop-shadow(0 0 18px rgba(0,60,180,0.35))',
          transform: glitch
            ? `translate(${off.x}px,0) skewX(${off.sk}deg)`
            : 'none',
          transition: 'filter 0.07s,transform 0.04s',
        }}
      >
        {text}
      </span>
    </h1>
  );
}

/* HeaderOrnament — dots + lines decorativos
   Uso: <HeaderOrnament isDark={isDark} /> */
export function HeaderOrnament({ isDark }) {
  const dot = isDark ? '#4da6ff' : '#0055cc';
  const lineL = isDark
    ? 'linear-gradient(to right,transparent,#0066ff)'
    : 'linear-gradient(to right,transparent,#2266cc)';
  const lineR = isDark
    ? 'linear-gradient(to left,transparent,#0066ff)'
    : 'linear-gradient(to left,transparent,#2266cc)';
  return (
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
  );
}

/* EyebrowBadge — pill con dots y texto
   Uso: <EyebrowBadge text="Portfolio · 2025" isDark={isDark} /> */
export function EyebrowBadge({ text, isDark }) {
  const dot = isDark ? '#0099ff' : '#0044cc';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 22,
        padding: '5px 20px',
        borderRadius: 20,
        background: isDark ? 'rgba(0,80,255,0.10)' : 'rgba(0,55,210,0.07)',
        border: `1px solid ${isDark ? 'rgba(0,130,255,0.28)' : 'rgba(0,80,210,0.20)'}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: dot,
          boxShadow: `0 0 10px ${dot}`,
          animation: 'snPulse 1.8s ease-in-out infinite alternate',
        }}
      />
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 10,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: isDark ? 'rgba(110,185,255,0.82)' : 'rgba(0,45,155,0.68)',
        }}
      >
        {text}
      </span>
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: dot,
          boxShadow: `0 0 10px ${dot}`,
          animation: 'snPulse 1.8s ease-in-out infinite alternate',
          animationDelay: '0.5s',
        }}
      />
    </div>
  );
}

/* Card — contenedor con hover glow y corner brackets
   Uso: <Card delay={0.15} isDark={isDark}>...</Card> */
export function Card({ children, delay = 0, isDark }) {
  const [visible, setVisible] = useState(false);
  const [hov, setHov] = useState(false);
  const ref = useRef();
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
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        borderRadius: 8,
        padding: '26px 28px',
        background: isDark
          ? hov
            ? 'rgba(0,18,55,0.92)'
            : 'rgba(0,10,32,0.84)'
          : hov
            ? 'rgba(232,240,255,0.96)'
            : 'rgba(245,249,255,0.91)',
        border: `1px solid ${hov ? (isDark ? 'rgba(0,130,255,0.65)' : 'rgba(0,80,220,0.50)') : isDark ? 'rgba(0,90,220,0.20)' : 'rgba(0,60,190,0.16)'}`,
        boxShadow: hov
          ? isDark
            ? '0 0 30px rgba(0,110,255,0.25),0 0 70px rgba(0,90,220,0.12),inset 0 0 40px rgba(0,60,180,0.07)'
            : '0 10px 36px rgba(0,80,200,0.16),0 2px 8px rgba(0,0,0,0.05)'
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
          opacity: hov ? (isDark ? 1 : 0.65) : isDark ? 0.35 : 0.22,
          transition: 'opacity 0.3s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 14,
          height: 14,
          borderTop: `1.5px solid ${isDark ? '#0066ff' : '#2255cc'}`,
          borderLeft: `1.5px solid ${isDark ? '#0066ff' : '#2255cc'}`,
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
          borderBottom: `1.5px solid ${isDark ? 'rgba(0,80,200,0.5)' : 'rgba(0,60,180,0.35)'}`,
          borderRight: `1.5px solid ${isDark ? 'rgba(0,80,200,0.5)' : 'rgba(0,60,180,0.35)'}`,
          borderRadius: '0 0 8px 0',
        }}
      />
      {children}
    </div>
  );
}

/* SectionHeading — h2 plain color + línea degradada
   Uso: <SectionHeading isDark={isDark}>Welcome</SectionHeading> */
export function SectionHeading({ children, isDark }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2
        style={{
          fontFamily: '"Courier New",Courier,monospace',
          fontWeight: 900,
          fontSize: 'clamp(0.9rem,2vw,1.15rem)',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          margin: '0 0 8px',
          color: isDark ? '#55aaff' : '#0033cc',
          textShadow: isDark
            ? '0 0 14px rgba(0,130,255,0.75),0 0 32px rgba(0,100,255,0.35)'
            : '0 0 8px rgba(0,60,200,0.22)',
          background: 'none',
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: 1,
          background: isDark
            ? 'linear-gradient(90deg,#0077ff,rgba(0,110,255,0.3),transparent)'
            : 'linear-gradient(90deg,#2255cc,rgba(0,80,200,0.2),transparent)',
          boxShadow: isDark ? '0 0 7px rgba(0,110,255,0.55)' : 'none',
        }}
      />
    </div>
  );
}

/* StatCard — caja de estadística numérica
   Uso: <StatCard label="Projects" value="5+" isDark={isDark} /> */
export function StatCard({ label, value, isDark }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '20px 12px',
        borderRadius: 8,
        background: isDark ? 'rgba(0,14,48,0.68)' : 'rgba(228,238,255,0.75)',
        border: `1px solid ${isDark ? 'rgba(0,85,210,0.22)' : 'rgba(0,60,180,0.14)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: isDark
          ? '0 0 20px rgba(0,90,210,0.12)'
          : '0 2px 10px rgba(0,50,160,0.06)',
      }}
    >
      <div
        style={{
          fontFamily: '"Courier New",monospace',
          fontWeight: 900,
          fontSize: '2.2rem',
          lineHeight: 1,
          color: isDark ? '#55aaff' : '#0033cc',
          textShadow: isDark
            ? '0 0 20px rgba(0,130,255,0.8),0 0 44px rgba(0,100,255,0.35)'
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
          color: isDark ? 'rgba(80,155,255,0.52)' : 'rgba(0,45,145,0.48)',
          marginTop: 7,
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* Pill — tag pequeño
   Uso: <Pill isDark={isDark}>React</Pill> */
export function Pill({ children, isDark }) {
  return (
    <span
      style={{
        fontFamily: 'monospace',
        fontSize: 9,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 3,
        letterSpacing: 1,
        background: isDark ? 'rgba(0,65,190,0.22)' : 'rgba(0,55,190,0.08)',
        border: `1px solid ${isDark ? 'rgba(0,110,255,0.35)' : 'rgba(0,65,185,0.22)'}`,
        color: isDark ? 'rgba(130,200,255,0.95)' : 'rgba(0,45,155,0.82)',
        boxShadow: isDark ? '0 0 6px rgba(0,110,255,0.2)' : 'none',
      }}
    >
      {children}
    </span>
  );
}

/* PageGrain — textura de ruido fija
   Uso: <PageGrain isDark={isDark} /> */
export function PageGrain({ isDark }) {
  return (
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
  );
}

/* PageVignette — viñeta circular fija
   Uso: <PageVignette isDark={isDark} /> */
export function PageVignette({ isDark }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        background: isDark
          ? 'radial-gradient(ellipse at center,transparent 38%,rgba(0,2,16,0.82) 100%)'
          : 'radial-gradient(ellipse at center,transparent 48%,rgba(200,215,245,0.48) 100%)',
      }}
    />
  );
}
