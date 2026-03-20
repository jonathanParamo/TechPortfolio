'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { navLinks, socialLinks } from '../constants';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

/* ══════════════════════════════════════════════
   BLUE FLAME SHADERS — same structure as fire
   but palette shifted to supernova blue
══════════════════════════════════════════════ */
const flameVert = `
  attribute float aSize;
  attribute float aLife;
  varying float vLife;
  void main() {
    vLife = aLife;
    vec4 mvp = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvp.z);
    gl_Position = projectionMatrix * mvp;
  }
`;
const flameFrag = `
  varying float vLife;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    if (length(uv) > 0.5) discard;
    float a = (0.5 - length(uv)) * 2.0 * vLife;

    /* Blue supernova palette — cool white core → electric blue → deep violet */
    vec3 white   = vec3(0.92, 0.97, 1.00);   /* icy white core */
    vec3 cyan    = vec3(0.00, 0.88, 1.00);   /* electric cyan */
    vec3 blue    = vec3(0.05, 0.45, 1.00);   /* royal blue */
    vec3 violet  = vec3(0.40, 0.10, 0.90);   /* deep violet */
    vec3 dark    = vec3(0.00, 0.05, 0.30);   /* dark blue base */

    vec3 color;
    if      (vLife > 0.75) color = mix(cyan,   white,  (vLife - 0.75) * 4.0);
    else if (vLife > 0.50) color = mix(blue,   cyan,   (vLife - 0.50) * 4.0);
    else if (vLife > 0.25) color = mix(violet, blue,   (vLife - 0.25) * 4.0);
    else                   color = mix(dark,   violet,  vLife * 4.0);

    gl_FragColor = vec4(color, a * 0.95);
  }
`;

/* ══════════════════════════════════════════════
   LOGO FLAME PARTICLES
══════════════════════════════════════════════ */
function LogoFlame({ count = 100 }) {
  const ref = useRef();
  const p = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const lives = new Float32Array(count);
    const vel = [],
      ls = [],
      tb = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.4;
      pos[i * 3 + 1] = Math.random() * -0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      sizes[i] = Math.random() * 0.07 + 0.03;
      lives[i] = Math.random();
      vel.push({
        x: (Math.random() - 0.5) * 0.009,
        y: Math.random() * 0.028 + 0.014,
      });
      ls.push(Math.random() * 0.013 + 0.007);
      tb.push(Math.random() * Math.PI * 2);
    }
    return { pos, sizes, lives, vel, ls, tb };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry;
    const pa = geo.attributes.position.array;
    const la = geo.attributes.aLife.array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      pa[i * 3] += p.vel[i].x + Math.sin(t * 3.2 + p.tb[i]) * 0.004;
      pa[i * 3 + 1] += p.vel[i].y;
      la[i] -= p.ls[i];
      if (la[i] <= 0) {
        pa[i * 3] = (Math.random() - 0.5) * 1.4;
        pa[i * 3 + 1] = -0.2;
        pa[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        la[i] = 1.0;
        p.vel[i] = {
          x: (Math.random() - 0.5) * 0.009,
          y: Math.random() * 0.028 + 0.014,
        };
        p.tb[i] = Math.random() * Math.PI * 2;
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
      </bufferGeometry>
      <shaderMaterial
        vertexShader={flameVert}
        fragmentShader={flameFrag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Blue energy ring around logo */
function EnergyRing({ speed = 1.2, radius = 1.1, opacity = 0.35 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.elapsedTime * speed;
    ref.current.rotation.x = clock.elapsedTime * 0.5;
    ref.current.material.opacity =
      opacity + Math.sin(clock.elapsedTime * 2) * 0.12;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.012, 8, 64]} />
      <meshBasicMaterial color="#0088ff" transparent opacity={opacity} />
    </mesh>
  );
}

function CameraController() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const m = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', m);
    return () => window.removeEventListener('mousemove', m);
  }, []);
  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (mouse.current.y * 1.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

const LogoCanvas = dynamic(
  () =>
    Promise.resolve(function LC() {
      const [m, setM] = useState(false);
      useEffect(() => setM(true), []);
      if (!m) return null;
      return (
        <Canvas
          camera={{ position: [0, 0, 4] }}
          gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          <CameraController />
          <LogoFlame count={100} />
          <EnergyRing speed={1.2} radius={1.1} opacity={0.35} />
          <EnergyRing speed={-0.7} radius={1.45} opacity={0.18} />
        </Canvas>
      );
    }),
  { ssr: false }
);

/* ══════════════════════════════════════════════
   LOGO SVG — J letter in blue gradient
══════════════════════════════════════════════ */
function GothicLogo() {
  return (
    <Link
      href="/"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        textDecoration: 'none',
      }}
    >
      {/* J with blue flame canvas */}
      <div
        style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <LogoCanvas />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox="0 0 60 72"
            width="52"
            height="62"
            style={{
              overflow: 'visible',
              filter:
                'drop-shadow(0 0 10px rgba(0,136,255,0.9)) drop-shadow(0 0 22px rgba(0,100,220,0.6))',
            }}
          >
            <defs>
              {/* Blue supernova gradient */}
              <linearGradient id="jBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e0f4ff" />
                <stop offset="20%" stopColor="#70bbff" />
                <stop offset="50%" stopColor="#0077ff" />
                <stop offset="78%" stopColor="#0033cc" />
                <stop offset="100%" stopColor="#001166" />
              </linearGradient>
              <filter id="jGlowB" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <ellipse
              cx="30"
              cy="66"
              rx="14"
              ry="3"
              fill="rgba(0,100,255,0.28)"
            />
            <path
              d="M 27 6 C 26 5, 25 4.5, 24 5 L 23 5.5 C 22 6, 22 7, 23 8 L 28 8.5
                 C 30 8.7, 31 9, 31.5 10 L 32 52
                 C 32.2 58, 30 63, 26 65.5 C 22 68, 17 67.5, 14 65
                 C 11 62.5, 10.5 59, 11 57 C 11.5 55, 13 54, 14.5 54.5
                 C 16 55, 16.5 56.5, 16 58 C 15.5 59.5, 16 61, 18 62
                 C 20 63, 23 62.5, 25 60.5 C 27 58.5, 27.5 56, 27.5 53
                 L 27 10 L 33 10 L 33 52
                 C 33 58, 31 64, 26.5 67 C 22 70, 15.5 69.5, 11.5 66.5
                 C 7.5 63.5, 7 59, 7.5 56 C 8 53, 10 51, 12.5 51.5
                 C 10 52, 8.5 54.5, 8 57 C 7.5 60, 8.5 64, 12 67
                 C 15.5 70, 22 70.5, 27 68 C 32 65.5, 35 60, 35 53
                 L 35 9 C 35.5 8, 36.5 7.5, 38 7.5 L 43 7
                 C 44.5 7, 45 6, 44.5 5 C 44 4, 43 3.5, 41 3.5
                 L 30 4 C 28.5 4, 27.5 5, 27 6 Z"
              fill="url(#jBlue)"
              filter="url(#jGlowB)"
            />
            <circle
              cx="30"
              cy="7"
              r="1.8"
              fill="#a0d8ff"
              opacity="0.95"
              style={{ filter: 'drop-shadow(0 0 4px #0099ff)' }}
            />
            <circle cx="22" cy="5.5" r="1" fill="#55aaff" opacity="0.85" />
            <circle cx="38" cy="5.5" r="1" fill="#55aaff" opacity="0.85" />
          </svg>
        </div>
      </div>

      {/* ONATHAN DEV text — blue gradient via span */}
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
        className="hidden sm:flex"
      >
        <span
          style={{
            fontFamily: '"Cinzel Decorative","Palatino Linotype",serif',
            fontWeight: 900,
            fontSize: 18,
            letterSpacing: 3,
            textTransform: 'uppercase',
            lineHeight: 1.1,
            /* Blue gradient — span so it works */
            background:
              'linear-gradient(180deg,#e0f4ff 0%,#70bbff 35%,#0077ff 70%,#0033cc 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            filter: 'drop-shadow(0 0 8px rgba(0,120,255,0.7))',
          }}
        >
          onathan
        </span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 8,
            letterSpacing: 5,
            color: 'rgba(100,180,255,0.55)',
            textTransform: 'uppercase',
          }}
        >
          dev
        </span>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════
   NEON CYCLE — drives nav links (same as Projects)
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

function neonHSL(phase, offset, lightMode = false) {
  const t = ((phase + offset) % 1) * Math.PI * 2;
  const hue = 220 + Math.sin(t) * 32 + Math.cos(t * 0.7) * 14; // 174–266
  const sat = 96;
  const light = lightMode
    ? 40 + Math.sin(t * 1.2) * 8 // deeper on light bg
    : 58 + Math.sin(t * 1.2) * 10; // brighter on dark bg
  return `hsl(${hue},${sat}%,${light}%)`;
}

/* ══════════════════════════════════════════════
   NAV LINK — neon color cycles even without hover
══════════════════════════════════════════════ */
function NavLink({ href, label, index, phase, isDark, onClick }) {
  const [hovered, setHovered] = useState(false);
  const offset = index * 0.18;
  const color = neonHSL(phase, offset, !isDark);
  const colorB = neonHSL(phase, offset + 0.5, !isDark);

  return (
    <li style={{ listStyle: 'none' }}>
      <Link
        href={href}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          position: 'relative',
          display: 'inline-block',
          padding: '6px 2px',
          color: color,
          textShadow: isDark
            ? `0 0 ${hovered ? 16 : 8}px ${color}, 0 0 ${hovered ? 32 : 16}px ${color}55`
            : `0 0 ${hovered ? 12 : 6}px ${color}`,
          transition: 'text-shadow 0.15s',
        }}
      >
        {label}
        {/* Underline sweep on hover */}
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 1,
            width: hovered ? '100%' : '0%',
            background: `linear-gradient(90deg, ${color}, ${colorB})`,
            boxShadow: `0 0 6px ${color}`,
            transition: 'width 0.28s ease',
            display: 'block',
          }}
        />
      </Link>
    </li>
  );
}

/* ══════════════════════════════════════════════
   SOCIAL ICON — permanent pulse glow, no hover needed
══════════════════════════════════════════════ */
function SocialIcon({ href, icon, label, phase, index, isDark }) {
  const offset = index * 0.33;
  const col = neonHSL(phase, offset, !isDark);
  const colB = neonHSL(phase, offset + 0.5, !isDark);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: '50%',
        textDecoration: 'none',
        /* Neon border cycles */
        border: `1px solid ${col}`,
        background: isDark ? 'rgba(0,8,28,0.7)' : 'rgba(240,246,255,0.7)',
        color: col,
        fontSize: 16,
        /* Permanent glow that breathes */
        boxShadow: isDark
          ? `0 0 8px ${col}, 0 0 20px ${col}55, inset 0 0 8px rgba(0,60,180,0.1)`
          : `0 0 6px ${col}, 0 0 14px ${col}44`,
        filter: `drop-shadow(0 0 4px ${col})`,
        transition:
          'border-color 0.05s, box-shadow 0.05s, color 0.05s, filter 0.05s',
        backdropFilter: 'blur(8px)',
      }}
    >
      {icon}
    </a>
  );
}

/* ══════════════════════════════════════════════
   HAMBURGER — morphs to X with blue neon
══════════════════════════════════════════════ */
function HamburgerBtn({ isOpen, onClick, phase, isDark }) {
  const col = neonHSL(phase, 0, !isDark);
  return (
    <button
      onClick={onClick}
      aria-label="Toggle menu"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        width: 40,
        height: 40,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: 'block',
            height: 1.5,
            borderRadius: 2,
            background: col,
            boxShadow: `0 0 6px ${col}, 0 0 14px ${col}88`,
            transition: 'all 0.32s ease',
            width: i === 1 ? (isOpen ? '0px' : '24px') : '30px',
            transform: isOpen
              ? i === 0
                ? 'translateY(6.5px) rotate(45deg)'
                : i === 2
                  ? 'translateY(-6.5px) rotate(-45deg)'
                  : 'none'
              : 'none',
            opacity: i === 1 && isOpen ? 0 : 1,
          }}
        />
      ))}
    </button>
  );
}

/* ══════════════════════════════════════════════
   MOBILE MENU — full-width expand from top
══════════════════════════════════════════════ */
function MobileMenu({ isOpen, onClose, phase, isDark }) {
  const dot = neonHSL(phase, 0.1, !isDark);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 8,
        /* Expand from top */
        maxHeight: isOpen ? '100vh' : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.45s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark ? 'rgba(0,2,16,0.88)' : 'rgba(230,240,255,0.92)',
          backdropFilter: 'blur(20px)',
          zIndex: -1,
        }}
      />

      {/* Content */}
      <div
        style={{
          paddingTop: 90,
          paddingBottom: 48,
          paddingLeft: 28,
          paddingRight: 28,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Bottom neon line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${dot}, transparent)`,
            opacity: 0.6,
          }}
        />

        {/* Label */}
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 9,
            letterSpacing: '0.4em',
            color: isDark ? 'rgba(100,170,255,0.45)' : 'rgba(0,50,160,0.4)',
            textTransform: 'uppercase',
            marginBottom: 32,
          }}
        >
          ── navigation ──
        </div>

        {/* Nav links — big and spaced */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navLinks.map((link, i) => {
            const col = neonHSL(phase, i * 0.18, !isDark);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 0',
                  fontFamily: '"Courier New", Courier, monospace',
                  fontWeight: 900,
                  fontSize: 'clamp(1.4rem,5vw,2rem)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  color: col,
                  textShadow: isDark
                    ? `0 0 14px ${col}, 0 0 32px ${col}55`
                    : `0 0 8px ${col}`,
                  borderBottom: `1px solid ${isDark ? 'rgba(0,80,200,0.12)' : 'rgba(0,60,180,0.10)'}`,
                  transition: 'color 0.05s',
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fontWeight: 700,
                    color: isDark
                      ? 'rgba(100,160,255,0.5)'
                      : 'rgba(0,50,150,0.45)',
                    letterSpacing: '0.15em',
                    minWidth: 24,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div
          style={{
            height: 1,
            margin: '32px 0',
            background: `linear-gradient(90deg, transparent, ${dot}55, transparent)`,
          }}
        />

        {/* Social icons */}
        <div style={{ display: 'flex', gap: 14 }}>
          {socialLinks.map((s, i) => (
            <SocialIcon
              key={s.href}
              href={s.href}
              icon={s.icon}
              label={s.href}
              phase={phase}
              index={i}
              isDark={isDark}
            />
          ))}
        </div>

        {/* Bottom label */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 32,
            fontFamily: 'monospace',
            fontSize: 8,
            letterSpacing: '0.3em',
            color: isDark ? 'rgba(100,170,255,0.20)' : 'rgba(0,50,160,0.18)',
            textTransform: 'uppercase',
          }}
        >
          jonathan.dev · 2025
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════ */
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const phase = useNeonCycle(5500);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    const check = () =>
      setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      <nav
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '10px 20px',
          background: scrolled
            ? isDark
              ? 'rgba(0,4,18,0.92)'
              : 'rgba(235,243,255,0.92)'
            : 'transparent',
          borderBottom: scrolled
            ? isDark
              ? `1px solid rgba(0,90,220,0.18)`
              : `1px solid rgba(0,70,200,0.15)`
            : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          transition: 'background 0.4s, border-color 0.4s',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* LOGO */}
          <GothicLogo />

          {/* DESKTOP NAV — hidden on mobile via inline style + media query workaround */}
          <ul
            className="hidden md:flex"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              gap: 28,
              alignItems: 'center',
              /* no display here — let Tailwind control it */
            }}
          >
            {navLinks.map((link, i) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                index={i}
                phase={phase}
                isDark={isDark}
              />
            ))}
          </ul>

          {/* DESKTOP SOCIALS */}
          <div
            className="hidden md:flex"
            style={{ gap: 10, alignItems: 'center' }}
          >
            {socialLinks.map((s, i) => (
              <SocialIcon
                key={s.href}
                href={s.href}
                icon={s.icon}
                label={s.href}
                phase={phase}
                index={i}
                isDark={isDark}
              />
            ))}
          </div>

          {/* MOBILE HAMBURGER — always rendered, no mounted gate */}
          <div className="flex md:hidden" style={{ alignItems: 'center' }}>
            <HamburgerBtn
              isOpen={isOpen}
              onClick={() => setIsOpen((v) => !v)}
              phase={phase}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Scroll glow line */}
        {scrolled && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '8%',
              right: '8%',
              height: 1,
              background: `linear-gradient(90deg, transparent, ${neonHSL(phase, 0, !isDark)}66, transparent)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </nav>

      {/* MOBILE MENU — always mounted, animates via maxHeight */}
      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        phase={phase}
        isDark={isDark}
      />

      {/* Mobile side socials */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          opacity: isOpen ? 0 : 1,
          transition: 'opacity 0.3s',
          pointerEvents: isOpen ? 'none' : 'auto',
        }}
      >
        {socialLinks.map((s, i) => (
          <SocialIcon
            key={s.href}
            href={s.href}
            icon={s.icon}
            label={s.href}
            phase={phase}
            index={i}
            isDark={isDark}
          />
        ))}
      </div>
    </>
  );
}

export default Navbar;
