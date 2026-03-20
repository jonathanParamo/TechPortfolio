'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ThemeContext = createContext();

const sunVertexShader = `
  attribute float aSize;
  attribute float aLife;
  varying float vLife;
  void main() {
    vLife = aLife;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (250.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;
const sunFragmentShader = `
  varying float vLife;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;
    float alpha = (1.0 - dist * 2.0) * vLife;
    vec3 core   = vec3(1.0,  1.0,  0.7);
    vec3 mid    = vec3(1.0,  0.75, 0.1);
    vec3 outer  = vec3(1.0,  0.3,  0.0);
    vec3 color  = vLife > 0.6
      ? mix(mid,   core,  (vLife - 0.6) * 2.5)
      : mix(outer, mid,   vLife / 0.6);
    gl_FragColor = vec4(color, alpha);
  }
`;

const moonVertexShader = `
  attribute float aSize;
  attribute float aLife;
  varying float vLife;
  void main() {
    vLife = aLife;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (250.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;
const moonFragmentShader = `
  varying float vLife;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;
    float alpha = (1.0 - dist * 2.0) * vLife * 0.85;
    vec3 iceBlue  = vec3(0.6, 0.85, 1.0);
    vec3 deepBlue = vec3(0.1, 0.3,  0.7);
    vec3 color = mix(deepBlue, iceBlue, vLife);
    gl_FragColor = vec4(color, alpha);
  }
`;

function SunFlares() {
  const meshRef = useRef();
  const count = 80;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const lives = new Float32Array(count);
    const angles = [];
    const speeds = [];
    const lifeSpeeds = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.2 + 0.3;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.sin(angle) * r;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      sizes[i] = Math.random() * 0.08 + 0.04;
      lives[i] = Math.random();
      angles.push(angle);
      speeds.push(Math.random() * 0.018 + 0.008);
      lifeSpeeds.push(Math.random() * 0.015 + 0.008);
    }
    return { positions, sizes, lives, angles, speeds, lifeSpeeds };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posArr = geo.attributes.position.array;
    const lifeArr = geo.attributes.aLife.array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const a = particles.angles[i];
      const sp = particles.speeds[i];
      posArr[i * 3] += Math.cos(a) * sp + Math.sin(t * 2 + i) * 0.002;
      posArr[i * 3 + 1] += Math.sin(a) * sp;
      lifeArr[i] -= particles.lifeSpeeds[i];

      if (lifeArr[i] <= 0) {
        const newAngle = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.2 + 0.3;
        posArr[i * 3] = Math.cos(newAngle) * r;
        posArr[i * 3 + 1] = Math.sin(newAngle) * r;
        posArr[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
        lifeArr[i] = 1.0;
        particles.angles[i] = newAngle;
        particles.speeds[i] = Math.random() * 0.018 + 0.008;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aLife.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={particles.sizes}
          count={count}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aLife"
          array={particles.lives}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={sunVertexShader}
        fragmentShader={sunFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function MoonDust() {
  const meshRef = useRef();
  const count = 60;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const lives = new Float32Array(count);
    const velocities = [];
    const lifeSpeeds = [];
    const turbulence = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      sizes[i] = Math.random() * 0.06 + 0.02;
      lives[i] = Math.random();
      velocities.push({
        x: (Math.random() - 0.5) * 0.004,
        y: Math.random() * 0.006 + 0.003,
      });
      lifeSpeeds.push(Math.random() * 0.008 + 0.004);
      turbulence.push(Math.random() * Math.PI * 2);
    }
    return { positions, sizes, lives, velocities, lifeSpeeds, turbulence };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posArr = geo.attributes.position.array;
    const lifeArr = geo.attributes.aLife.array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const v = particles.velocities[i];
      const tb = particles.turbulence[i];
      posArr[i * 3] += v.x + Math.sin(t * 1.5 + tb) * 0.002;
      posArr[i * 3 + 1] += v.y;
      lifeArr[i] -= particles.lifeSpeeds[i];

      if (lifeArr[i] <= 0 || posArr[i * 3 + 1] > 0.9) {
        posArr[i * 3] = (Math.random() - 0.5) * 1.2;
        posArr[i * 3 + 1] = -0.6;
        posArr[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
        lifeArr[i] = 1.0;
        particles.turbulence[i] = Math.random() * Math.PI * 2;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aLife.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={particles.sizes}
          count={count}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aLife"
          array={particles.lives}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={moonVertexShader}
        fragmentShader={moonFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ThemeButton({ theme, onClick }) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onClick}
      aria-label="Toggle theme"
      style={{
        position: 'relative',
        width: 72,
        height: 72,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle at 40% 40%, #1e293b, #0f172a)'
            : 'radial-gradient(circle at 40% 35%, #fef9c3, #fbbf24)',
          boxShadow: isDark
            ? '0 0 0 2px #334155, 0 0 20px #1e40af55'
            : '0 0 0 2px #f59e0b, 0 0 20px #fbbf2488',
          transition: 'all 0.4s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 28,
            lineHeight: 1,
            userSelect: 'none',
            zIndex: 2,
            position: 'relative',
          }}
        >
          {isDark ? '🌙' : '☀️'}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: '-16px',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 60 }}
          gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
          style={{ background: 'transparent' }}
        >
          {isDark ? <MoonDust /> : <SunFlares />}
        </Canvas>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: -22,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 9,
          fontWeight: 700,
          fontFamily: 'monospace',
          letterSpacing: 1,
          color: isDark ? '#7dd3fc' : '#f97316',
          textShadow: isDark ? '0 0 8px #38bdf8' : '0 0 8px #fbbf24',
          whiteSpace: 'nowrap',
          animation: 'labelPulse 2s ease-in-out infinite',
        }}
      >
        {isDark ? 'DARK MODE' : 'LIGHT MODE'}
      </div>

      <style>{`
        @keyframes labelPulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1;   }
        }
      `}</style>
    </button>
  );
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const preferredTheme =
      storedTheme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');
    setTheme(preferredTheme);
    document.documentElement.classList.toggle(
      'dark',
      preferredTheme === 'dark'
    );
  }, []);

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  if (!theme) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999 }}>
        <ThemeButton theme={theme} onClick={toggleTheme} />
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
