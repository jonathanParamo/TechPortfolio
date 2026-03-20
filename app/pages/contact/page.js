'use client';

import Head from 'next/head';
import Navbar from '@/app/components/Navbar';
import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleBackground = dynamic(
  () => import('@/app/components/ParticleBackground'),
  { ssr: false }
);

const dustVert = `attribute float aLife;attribute float aSize;attribute vec3 aColor;varying float vLife;varying vec3 vColor;void main(){vLife=aLife;vColor=aColor;vec4 mvp=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*(400.0/-mvp.z);gl_Position=projectionMatrix*mvp;}`;
const dustFrag = `varying float vLife;varying vec3 vColor;void main(){vec2 uv=gl_PointCoord-0.5;float d=length(uv);if(d>0.5)discard;float core=1.0-smoothstep(0.0,0.10,d);float mid=1.0-smoothstep(0.10,0.30,d);float halo=1.0-smoothstep(0.30,0.50,d);float a=(core*1.0+mid*0.65+halo*0.25)*vLife;gl_FragColor=vec4(vColor,a*0.92);}`;

function SupernovaDust({ isDark }) {
  const ref = useRef();
  const COUNT = 300;
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
      sz = new Float32Array(COUNT),
      li = new Float32Array(COUNT),
      col = new Float32Array(COUNT * 3);
    const vel = [],
      dc = [],
      ph = [],
      or = [];
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 9;
      sz[i] = Math.random() * (isDark ? 0.085 : 0.05) + 0.015;
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
      dc.push(Math.random() * 0.003 + 0.0015);
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
        pa[i * 3] = (Math.random() - 0.5) * 26;
        pa[i * 3 + 1] = -8;
        pa[i * 3 + 2] = (Math.random() - 0.5) * 9;
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
        emissive={isDark ? '#001840' : '#334499'}
        emissiveIntensity={isDark ? 1.2 : 0.4}
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
    scale: 0.8,
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
    scale: 0.36,
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
    scale: 0.28,
    detail: 1,
    phase: 1.7,
    rotSpeed: { x: 0.0011, y: 0.0005, z: 0.0008 },
  },
];

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
            zIndex: -10,
            isolation: 'isolate',
            pointerEvents: 'none',
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 10], fov: 58 }}
            gl={{ alpha: true, antialias: true }}
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              inset: 0,
            }}
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
          </Canvas>
        </div>
      );
    }),
  { ssr: false }
);

function Notification({ status, type, onClose, isDark }) {
  useEffect(() => {
    if (status) {
      const t = setTimeout(onClose, 5000);
      return () => clearTimeout(t);
    }
  }, [status, onClose]);
  if (!status) return null;
  const ok = type === 'success';
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '14px 20px',
        borderRadius: 8,
        minWidth: 260,
        maxWidth: 400,
        textAlign: 'center',
        background: isDark
          ? ok
            ? 'rgba(0,18,55,0.95)'
            : 'rgba(40,0,0,0.95)'
          : ok
            ? 'rgba(230,242,255,0.97)'
            : 'rgba(255,235,235,0.97)',
        border: `1px solid ${ok ? (isDark ? 'rgba(0,130,255,0.7)' : 'rgba(0,80,200,0.5)') : isDark ? 'rgba(255,50,50,0.6)' : 'rgba(200,30,30,0.4)'}`,
        animation: 'slideUp 0.35s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: ok ? (isDark ? '#0099ff' : '#0044cc') : '#ff3333',
          }}
        />
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 700,
            color: ok
              ? isDark
                ? 'rgba(150,210,255,0.95)'
                : 'rgba(0,45,155,0.9)'
              : 'rgba(255,100,100,0.95)',
            margin: 0,
          }}
        >
          {status}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 8,
          right: 10,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(150,150,255,0.7)',
          fontSize: 16,
        }}
      >
        ✕
      </button>
    </div>
  );
}

function NeonInput({
  label,
  type = 'text',
  id,
  value,
  onChange,
  isDark,
  multiline = false,
  rows = 4,
}) {
  const [focused, setFocused] = useState(false);
  const accent = isDark ? '#0088ff' : '#0044cc';
  const inputStyle = {
    display: 'block',
    width: '100%',
    fontFamily: '"Courier New",Courier,monospace',
    fontSize: 12.5,
    padding: '10px 12px',
    borderRadius: 5,
    outline: 'none',
    zIndex: 50,
    /* SIN backdropFilter — era el culpable */
    background: isDark
      ? focused
        ? 'rgba(0,15,45,0.95)'
        : 'rgba(0,8,28,0.90)'
      : focused
        ? 'rgba(220,235,255,0.98)'
        : 'rgba(240,246,255,0.95)',
    border: `1px solid ${focused ? (isDark ? 'rgba(0,140,255,0.65)' : 'rgba(0,80,220,0.55)') : isDark ? 'rgba(0,80,200,0.22)' : 'rgba(0,60,190,0.18)'}`,
    color: isDark ? 'rgba(185,220,255,0.92)' : 'rgba(10,30,90,0.88)',
    boxShadow: focused
      ? isDark
        ? '0 0 14px rgba(0,120,255,0.22)'
        : '0 2px 12px rgba(0,80,200,0.10)'
      : 'none',
    transition: 'border 0.25s,box-shadow 0.25s,background 0.25s',
    resize: 'none',
    boxSizing: 'border-box',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: focused
            ? isDark
              ? accent
              : '#0033cc'
            : isDark
              ? 'rgba(100,170,255,0.72)'
              : 'rgba(0,50,160,0.62)',
          transition: 'color 0.25s',
        }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          style={inputStyle}
          className="z-index-9999"
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          style={inputStyle}
        />
      )}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg,transparent,${accent},transparent)`,
          opacity: focused ? (isDark ? 0.8 : 0.5) : 0,
          transition: 'opacity 0.25s',
        }}
      />
    </div>
  );
}

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
        fontSize: 'clamp(2.8rem,8vw,5.5rem)',
        letterSpacing: '0.14em',
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
            ? 'linear-gradient(135deg,#e0f2ff 0%,#70bbff 28%,#0077ff 60%,#0033bb 100%)'
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
              ? 'drop-shadow(0 0 28px rgba(0,110,255,0.65))'
              : 'drop-shadow(0 0 18px rgba(0,60,200,0.38))',
          transform: glitch
            ? `translate(${off.x}px,0) skewX(${off.sk}deg)`
            : 'none',
          transition: 'filter 0.07s,transform 0.04s',
        }}
      >
        CONTACT
      </span>
    </h1>
  );
}

function CardHeading({ children, isDark }) {
  return (
    <h2
      style={{
        fontFamily: 'monospace',
        fontWeight: 900,
        fontSize: 11,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        margin: '0 0 20px',
        color: isDark ? '#55aaff' : '#0033cc',
        textShadow: isDark ? '0 0 12px rgba(0,130,255,0.7)' : 'none',
        background: 'none',
      }}
    >
      {children}
    </h2>
  );
}

/* BaseCard — SIN backdropFilter, background más sólido */
function BaseCard({ children, isDark, style = {} }) {
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 8,
        padding: '24px 28px',
        /* background más opaco para compensar la falta de blur */
        background: isDark ? 'rgba(0,8,24,0.96)' : 'rgba(242,247,255,0.98)',
        border: `1px solid ${isDark ? 'rgba(0,90,220,0.20)' : 'rgba(0,60,190,0.16)'}`,
        /* SIN backdropFilter — era el que rompía el stacking context */
        boxShadow: isDark
          ? '0 4px 22px rgba(0,0,0,0.55)'
          : '0 2px 14px rgba(0,50,160,0.08)',
        ...style,
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
          opacity: isDark ? 0.5 : 0.28,
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

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [showNotif, setShowNotif] = useState(false);
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailRe.test(email)) {
      setStatusType('error');
      setStatus('Please enter a valid email address.');
      setShowNotif(true);
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/sendMail/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatusType('success');
        setStatus('Message sent successfully!');
        setShowNotif(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatusType('error');
        setStatus('Error sending message. Please try again.');
        setShowNotif(true);
      }
    } catch {
      setStatusType('error');
      setStatus('Connection error. Please try again.');
      setShowNotif(true);
    } finally {
      setSending(false);
    }
  };

  const T = {
    pageBg: isDark
      ? 'radial-gradient(ellipse at 22% 18%,rgba(0,45,160,0.16) 0%,transparent 55%),radial-gradient(ellipse at 78% 82%,rgba(0,70,200,0.11) 0%,transparent 50%),#000610'
      : 'radial-gradient(ellipse at 22% 18%,rgba(180,215,255,0.35) 0%,transparent 55%),radial-gradient(ellipse at 78% 82%,rgba(160,200,255,0.20) 0%,transparent 50%),#edf2ff',
    dot: isDark ? '#0099ff' : '#0044cc',
    sub: isDark ? 'rgba(120,180,255,0.9)' : 'rgba(0,55,170,0.42)',
    vig: isDark
      ? 'radial-gradient(ellipse at center,transparent 38%,rgba(0,2,16,0.82) 100%)'
      : 'radial-gradient(ellipse at center,transparent 48%,rgba(200,215,245,0.48) 100%)',
    infoText: isDark ? 'rgba(160,210,255,0.78)' : 'rgba(10,30,90,0.75)',
    infoLabel: isDark ? 'rgba(100,180,255,0.65)' : 'rgba(0,55,160,0.62)',
    iconBg: isDark ? 'rgba(0,60,180,0.22)' : 'rgba(0,55,190,0.08)',
    iconBorder: isDark ? 'rgba(0,110,255,0.32)' : 'rgba(0,65,185,0.20)',
  };

  return (
    <div
      style={{ position: 'relative', minHeight: '100vh', background: T.pageBg }}
    >
      <ParticleBackground />
      <Head>
        <title>Contact — Jonathan Dev</title>
        <meta name="description" content="Get in touch with Jonathan" />
      </Head>
      {mounted && <SceneCanvas isDark={isDark} />}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(ellipse at 20% 35%,rgba(0,60,200,0.12) 0%,transparent 55%)'
            : 'radial-gradient(ellipse at 20% 35%,rgba(150,195,255,0.18) 0%,transparent 55%)',
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
          {/* HEADER */}
          <div
            style={{ textAlign: 'center', marginBottom: 52, paddingTop: 14 }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 22,
                padding: '5px 20px',
                borderRadius: 20,
                background: isDark
                  ? 'rgba(0,80,255,0.10)'
                  : 'rgba(0,55,210,0.07)',
                border: `1px solid ${isDark ? 'rgba(0,130,255,0.28)' : 'rgba(0,80,210,0.20)'}`,
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
                  animation: 'snPulse 1.8s ease-in-out infinite alternate',
                }}
              />
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 10,
                  letterSpacing: '0.3em',
                  color: isDark
                    ? 'rgba(110,185,255,0.82)'
                    : 'rgba(0,45,155,0.68)',
                  textTransform: 'uppercase',
                }}
              >
                Get in Touch
              </span>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: T.dot,
                  boxShadow: `0 0 10px ${T.dot}`,
                  animation: 'snPulse 1.8s ease-in-out infinite alternate',
                  animationDelay: '0.5s',
                }}
              />
            </div>
            {mounted && <GlitchTitle isDark={isDark} />}
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                letterSpacing: '0.32em',
                color: T.sub,
                marginTop: 8,
              }}
            >
              ── let's create something meaningful ──
            </p>
          </div>

          {/* GRID */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
              gap: 22,
            }}
          >
            {/* FORM */}
            <BaseCard isDark={isDark} style={{ zIndex: 9999 }}>
              <CardHeading isDark={isDark}>Send a Message</CardHeading>
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                <NeonInput
                  label="Name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  isDark={isDark}
                />
                <NeonInput
                  label="Email"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isDark={isDark}
                />
                <NeonInput
                  label="Message"
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  isDark={isDark}
                  multiline
                  rows={4}
                />
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    fontFamily: '"Courier New",Courier,monospace',
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '12px 20px',
                    borderRadius: 5,
                    letterSpacing: '0.14em',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    background: isDark
                      ? sending
                        ? 'rgba(0,40,100,0.5)'
                        : 'rgba(0,70,200,0.22)'
                      : sending
                        ? 'rgba(150,170,220,0.15)'
                        : 'rgba(0,55,190,0.10)',
                    border: `1px solid ${isDark ? 'rgba(0,130,255,0.55)' : 'rgba(0,80,200,0.42)'}`,
                    color: isDark ? '#a0d8ff' : '#003dcc',
                    boxShadow: isDark
                      ? '0 0 12px rgba(0,100,255,0.25)'
                      : 'none',
                    transition: 'all 0.22s',
                    opacity: sending ? 0.65 : 1,
                  }}
                >
                  {sending ? 'SENDING...' : 'SEND MESSAGE →'}
                </button>
              </form>
            </BaseCard>

            {/* INFO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <BaseCard isDark={isDark}>
                <CardHeading isDark={isDark}>Contact Info</CardHeading>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  {[
                    {
                      icon: '✉',
                      label: 'Email',
                      value: 'jhonathan-and@outlook.com',
                    },
                    { icon: '☏', label: 'Phone', value: '+57 315 422 0879' },
                  ].map(({ icon, label, value }) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: T.iconBg,
                          border: `1px solid ${T.iconBorder}`,
                          fontSize: 14,
                          color: isDark ? '#55aaff' : '#0033cc',
                        }}
                      >
                        {icon}
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: T.infoLabel,
                            marginBottom: 3,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 12.5,
                            color: T.infoText,
                            letterSpacing: '0.03em',
                          }}
                        >
                          {value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </BaseCard>

              <div
                style={{
                  position: 'relative',
                  borderRadius: 8,
                  padding: '20px 24px',
                  background: isDark
                    ? 'rgba(0,35,120,0.92)'
                    : 'rgba(215,232,255,0.98)',
                  border: `1px solid ${isDark ? 'rgba(0,100,255,0.25)' : 'rgba(0,70,200,0.18)'}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#00dd88',
                      boxShadow:
                        '0 0 10px #00dd88,0 0 20px rgba(0,220,136,0.5)',
                      animation: 'snPulse 2s ease-in-out infinite alternate',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: isDark
                        ? 'rgba(100,220,150,0.82)'
                        : 'rgba(0,120,60,0.75)',
                    }}
                  >
                    Available for work
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 11.5,
                    lineHeight: 1.7,
                    color: isDark
                      ? 'rgba(160,210,255,0.72)'
                      : 'rgba(10,30,90,0.68)',
                    margin: 0,
                  }}
                >
                  Open to new opportunities — freelance projects, full-time
                  positions, or collaborations. Let's talk!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showNotif && (
        <Notification
          status={status}
          type={statusType}
          onClose={() => setShowNotif(false)}
          isDark={isDark}
        />
      )}

      <style>{`
        @keyframes snPulse{from{opacity:0.38;transform:scale(0.80);}to{opacity:1;transform:scale(1.22);}}
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
      `}</style>
    </div>
  );
};
export default Contact;
