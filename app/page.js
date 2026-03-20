'use client';

import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';
import { portfolioPhoto } from '../public/assets';
import {
  useIsDark,
  useTypewriter,
  themeTokens,
} from '@/app/hooks/useSupernova';
import {
  SupernovaCanvas,
  GlitchTitle,
  HeaderOrnament,
  EyebrowBadge,
  Card,
  SectionHeading,
  StatCard,
  Pill,
  PageGrain,
  PageVignette,
} from '@/app/components/SupernovaScene';
import { useRef, useEffect, useState } from 'react';

/* ══════════════════════════════════════════════
   PHOTO FRAME — neon cycling border + floating
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

function neonHSL(phase, offset = 0, lightMode = false) {
  const t = ((phase + offset) % 1) * Math.PI * 2;
  const hue = 200 + Math.sin(t) * 30 + Math.cos(t * 0.7) * 15; // cyan-blue range
  const sat = 96;
  const light = lightMode
    ? 40 + Math.sin(t * 1.2) * 8
    : 58 + Math.sin(t * 1.2) * 10;
  return `hsl(${hue},${sat}%,${light}%)`;
}

function ProfilePhoto({ isDark }) {
  const phase = useNeonCycle(5000);
  const colA = neonHSL(phase, 0, !isDark);
  const colB = neonHSL(phase, 0.33, !isDark);
  const colC = neonHSL(phase, 0.66, !isDark);

  return (
    <div
      style={{
        position: 'relative',
        width: 'clamp(220px, 28vw, 340px)',
        height: 'clamp(220px, 28vw, 340px)',
        flexShrink: 0,
        /* Floating animation */
        animation: 'photoFloat 4s ease-in-out infinite alternate',
      }}
    >
      {/* Outer rotating neon ring */}
      <div
        style={{
          position: 'absolute',
          inset: -12,
          borderRadius: '50%',
          border: `1.5px solid ${colA}`,
          boxShadow: `0 0 12px ${colA}, 0 0 28px ${colA}44`,
          animation: 'ringRotate 8s linear infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Middle ring — counter-rotate */}
      <div
        style={{
          position: 'absolute',
          inset: -6,
          borderRadius: '50%',
          border: `1px solid ${colB}`,
          boxShadow: `0 0 8px ${colB}`,
          animation: 'ringRotateReverse 12s linear infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Scanning line — vertical sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${colC}, transparent)`,
            boxShadow: `0 0 10px ${colC}`,
            animation: 'scanLine 3s ease-in-out infinite',
            opacity: 0.8,
          }}
        />
      </div>

      {/* Corner brackets — 4 esquinas */}
      {[
        { top: 0, left: 0, borderTop: true, borderLeft: true },
        { top: 0, right: 0, borderTop: true, borderRight: true },
        { bottom: 0, left: 0, borderBottom: true, borderLeft: true },
        { bottom: 0, right: 0, borderBottom: true, borderRight: true },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            zIndex: 3,
            ...pos,
            borderTop: pos.borderTop ? `2px solid ${colA}` : 'none',
            borderLeft: pos.borderLeft ? `2px solid ${colA}` : 'none',
            borderBottom: pos.borderBottom ? `2px solid ${colA}` : 'none',
            borderRight: pos.borderRight ? `2px solid ${colA}` : 'none',
            borderRadius:
              pos.top !== undefined && pos.left !== undefined
                ? '6px 0 0 0'
                : pos.top !== undefined && pos.right !== undefined
                  ? '0 6px 0 0'
                  : pos.bottom !== undefined && pos.left !== undefined
                    ? '0 0 0 6px'
                    : '0 0 6px 0',
            filter: `drop-shadow(0 0 4px ${colA})`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Glow backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: -20,
          borderRadius: '50%',
          background: isDark
            ? `radial-gradient(circle, ${colA}22 0%, transparent 70%)`
            : `radial-gradient(circle, ${colA}18 0%, transparent 70%)`,
          filter: 'blur(12px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Photo — círculo */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: 1,
          border: `2px solid ${isDark ? 'rgba(0,150,255,0.3)' : 'rgba(0,80,200,0.2)'}`,
          boxShadow: isDark
            ? `0 0 30px ${colA}44, 0 0 60px ${colA}22`
            : `0 0 20px ${colA}33`,
        }}
      >
        <Image
          src={portfolioPhoto}
          alt="Jonathan — Full Stack Developer"
          fill
          className="object-cover object-top"
          priority
          style={{
            filter: isDark
              ? 'brightness(0.92) saturate(1.05)'
              : 'brightness(0.95) saturate(1.0)',
          }}
        />
        {/* Subtle inner vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at center, transparent 55%, rgba(0,8,28,0.45) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Status badge */}
      <div
        style={{
          position: 'absolute',
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 14px',
          borderRadius: 12,
          zIndex: 4,
          background: isDark ? 'rgba(0,10,30,0.88)' : 'rgba(235,243,255,0.92)',
          border: `1px solid ${isDark ? 'rgba(0,150,255,0.35)' : 'rgba(0,80,200,0.25)'}`,
          backdropFilter: 'blur(8px)',
          boxShadow: isDark
            ? `0 0 12px ${colA}44`
            : `0 2px 8px rgba(0,80,200,0.1)`,
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#00dd88',
            boxShadow: '0 0 8px #00dd88, 0 0 16px rgba(0,220,136,0.5)',
            animation: 'snPulse 2s ease-in-out infinite alternate',
          }}
        />
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: isDark ? 'rgba(100,200,150,0.85)' : 'rgba(0,100,60,0.75)',
          }}
        >
          Available
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════ */
export default function Home() {
  const { isDark, mounted } = useIsDark();
  const { disp, done } = useTypewriter(
    'Full Stack Developer · JavaScript · React · Node.js · Three.js',
    40,
    800
  );
  const T = themeTokens(isDark);

  const bodyStyle = {
    fontFamily: '"Courier New",Courier,monospace',
    fontSize: 13,
    lineHeight: 1.85,
    color: T.bodyText,
    margin: 0,
  };

  return (
    <div
      style={{ position: 'relative', minHeight: '100vh', background: T.pageBg }}
    >
      <Head>
        <title>Jonathan Dev — Portfolio</title>
        <meta
          name="description"
          content="Full Stack Developer portfolio — Jonathan"
        />
      </Head>

      {mounted && <SupernovaCanvas isDark={isDark} />}
      <PageGrain isDark={isDark} />
      <PageVignette isDark={isDark} />

      <div className="w-full absolute top-0 z-10">
        <Navbar />
      </div>

      <main
        style={{
          position: 'relative',
          zIndex: 3,
          minHeight: '100vh',
          paddingTop: 88,
          paddingBottom: 80,
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 22px' }}>
          {/* ══ HERO — dos columnas ══ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 48,
              marginBottom: 64,
              paddingTop: 20,
              flexWrap: 'wrap', // mobile: apila verticalmente
            }}
          >
            {/* Columna izquierda — texto */}
            <div style={{ flex: 1, minWidth: 260, textAlign: 'left' }}>
              <EyebrowBadge text="Portfolio · 2025" isDark={isDark} />

              {mounted && <GlitchTitle text="JONATHAN DEV" isDark={isDark} />}

              {/* Typewriter */}
              <div
                style={{
                  fontFamily: '"Courier New",Courier,monospace',
                  fontSize: 'clamp(11px,2vw,14px)',
                  letterSpacing: '0.08em',
                  color: T.subText,
                  minHeight: 22,
                  marginTop: 4,
                }}
              >
                {disp}
                <span
                  style={{
                    opacity: done ? 0 : 1,
                    transition: 'opacity 0.3s',
                    color: isDark ? '#0099ff' : '#0044cc',
                  }}
                >
                  |
                </span>
              </div>

              {/* Ornamento */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 22,
                  opacity: isDark ? 0.5 : 0.4,
                }}
              >
                <div style={{ height: 1, width: 60, background: T.lineL }} />
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: T.dot,
                      boxShadow: `0 0 7px ${T.dot}`,
                      animation: `snPulse ${1.4 + i * 0.35}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
                <div style={{ height: 1, width: 60, background: T.lineR }} />
              </div>

              {/* CTA Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  marginTop: 28,
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { label: 'VIEW PROJECTS', href: '/pages/projects' },
                  { label: 'ABOUT ME', href: '/pages/about' },
                  { label: 'CONTACT', href: '/pages/contact' },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      fontFamily: '"Courier New",monospace',
                      fontSize: 11,
                      fontWeight: 900,
                      padding: '10px 18px',
                      borderRadius: 4,
                      letterSpacing: '0.12em',
                      textDecoration: 'none',
                      background: T.btnBg,
                      border: `1px solid ${T.btnBorder}`,
                      color: T.btnText,
                      boxShadow: isDark
                        ? '0 0 10px rgba(0,100,255,0.2)'
                        : 'none',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.22s',
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Columna derecha — foto */}
            {mounted && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ProfilePhoto isDark={isDark} />
              </div>
            )}
          </div>

          {/* ══ CARDS ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Card delay={0.15} isDark={isDark}>
              <SectionHeading isDark={isDark}>Welcome</SectionHeading>
              <p style={bodyStyle}>
                I'm Jonathan, a versatile developer with extensive experience
                working with a range of web technologies. Over the years I've
                been involved in various projects where I've honed my skills in
                JavaScript, React, and more. My work is driven by a passion for
                delivering top-tier, innovative solutions that push the
                boundaries of web development.
              </p>
            </Card>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                gap: 22,
              }}
            >
              <Card delay={0.25} isDark={isDark}>
                <SectionHeading isDark={isDark}>
                  Project Highlights
                </SectionHeading>
                <p style={bodyStyle}>
                  Throughout my career I've worked on a multitude of projects
                  ranging from simple web applications to complex systems. Each
                  project presented unique challenges that helped me grow and
                  refine my technical abilities — from full e-commerce platforms
                  to real-time dashboards.
                </p>
                <div style={{ marginTop: 14 }}>
                  <Link
                    href="/pages/projects"
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: 700,
                      color: T.linkColor,
                      textDecoration: 'none',
                      letterSpacing: '0.08em',
                      borderBottom: `1px solid ${isDark ? 'rgba(0,200,255,0.3)' : 'rgba(0,50,175,0.25)'}`,
                      textShadow: isDark
                        ? '0 0 10px rgba(0,200,255,0.55)'
                        : 'none',
                    }}
                  >
                    See all projects →
                  </Link>
                </div>
              </Card>

              <Card delay={0.35} isDark={isDark}>
                <SectionHeading isDark={isDark}>My Approach</SectionHeading>
                <p style={bodyStyle}>
                  My approach to development is deeply rooted in integrity,
                  innovation, and excellence. Whether creating responsive user
                  interfaces or optimizing back-end processes, I always strive
                  to deliver solutions that exceed expectations and provide real
                  value.
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginTop: 14,
                  }}
                >
                  {['Clean Code', 'Performance', 'UX-First', 'Scalable'].map(
                    (s) => (
                      <Pill key={s} isDark={isDark}>
                        {s}
                      </Pill>
                    )
                  )}
                </div>
              </Card>
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))',
                gap: 16,
              }}
            >
              {[
                { label: 'Projects', value: '5+' },
                { label: 'Technologies', value: '10+' },
                { label: 'Experience', value: '2yr' },
                { label: 'Passion', value: '∞' },
              ].map(({ label, value }) => (
                <StatCard
                  key={label}
                  label={label}
                  value={value}
                  isDark={isDark}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes snPulse {
          from { opacity:0.38; transform:scale(0.80); }
          to   { opacity:1;   transform:scale(1.22); }
        }
        @keyframes photoFloat {
          from { transform: translateY(0px);   }
          to   { transform: translateY(-12px); }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes ringRotateReverse {
          from { transform: rotate(0deg);    }
          to   { transform: rotate(-360deg); }
        }
        @keyframes scanLine {
          0%   { top: -2px;   opacity: 0;   }
          10%  { opacity: 0.9; }
          90%  { opacity: 0.9; }
          100% { top: 100%;   opacity: 0;   }
        }

        /* Mobile: apila hero verticalmente y centra foto */
        @media (max-width: 640px) {
          .hero-col-left { text-align: center !important; }
          .hero-ornament { justify-content: center !important; }
          .hero-cta      { justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}
