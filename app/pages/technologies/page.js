'use client';

import Navbar from '@/app/components/Navbar';
import WithTechnologies from '@/app/components/WitchTecnologies';
import dynamic from 'next/dynamic';

// Hooks compartidos
import { useIsDark, themeTokens } from '@/app/hooks/useSupernova';

// Componentes compartidos
import {
  SupernovaCanvas,
  GlitchTitle,
  HeaderOrnament,
  EyebrowBadge,
  PageVignette,
} from '@/app/components/SupernovaScene';

const TechnologiesList = dynamic(
  () => import('@/app/components/TechnologiesList'),
  { ssr: false }
);

/* ══════════════════════════════════════════════
   TECHNOLOGIES PAGE
══════════════════════════════════════════════ */
function Technologies({ technologies }) {
  const { isDark, mounted } = useIsDark();
  const T = themeTokens(isDark);

  return (
    <div
      style={{ position: 'relative', minHeight: '100vh', background: T.pageBg }}
    >
      <PageVignette isDark={isDark} />

      <div className="w-full absolute top-0 z-10" style={{ zIndex: 9999 }}>
        <Navbar />
      </div>

      {mounted && <SupernovaCanvas isDark={isDark} />}

      <main
        className="h-auto min-h-screen pt-12 px-5 flex justify-center items-start overflow-auto relative"
        style={{ zIndex: 10 }}
      >
        <div className="w-full max-w-6xl">
          <section
            style={{
              margin: '2rem 0',
              padding: '2rem 2rem 2.5rem',
              borderRadius: 10,
              background: T.sectionBg,
              border: T.sectionBorder,
              backdropFilter: 'blur(14px)',
              boxShadow: isDark
                ? '0 0 40px rgba(0,60,180,0.10), 0 8px 32px rgba(0,0,0,0.5)'
                : '0 4px 24px rgba(0,50,160,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {/* HEADER */}
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              {mounted && <HeaderOrnament isDark={isDark} />}
              {mounted && <GlitchTitle text="TECHNOLOGIES" isDark={isDark} />}

              {/* Subtitle */}
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
                ── tools I use ──
              </p>

              {/* Stats eyebrow */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 14,
                  marginTop: 18,
                  padding: '6px 18px',
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
                    background: isDark ? '#4da6ff' : '#0044cc',
                    boxShadow: isDark ? '0 0 8px #4da6ff' : '0 0 6px #0044cc',
                    animation: 'snPulse 1.8s ease-in-out infinite alternate',
                  }}
                />
                {[
                  `${technologies?.length ?? 10} TECHNOLOGIES`,
                  'FULL STACK',
                ].map((label, i, arr) => (
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
                            ? 'rgba(0,120,255,0.25)'
                            : 'rgba(0,80,200,0.20)',
                        }}
                      />
                    )}
                  </span>
                ))}
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: isDark ? '#4da6ff' : '#0044cc',
                    boxShadow: isDark ? '0 0 8px #4da6ff' : '0 0 6px #0044cc',
                    animation: 'snPulse 1.8s ease-in-out infinite alternate',
                    animationDelay: '0.5s',
                  }}
                />
              </div>
            </div>

            {/* TECH LIST */}
            <div className="p-1 mt-2 md:p-2 space-y-4">
              <TechnologiesList technologies={technologies} />
            </div>
          </section>
        </div>
      </main>

      <style>{`@keyframes snPulse{from{opacity:0.38;transform:scale(0.80);}to{opacity:1;transform:scale(1.22);}}`}</style>
    </div>
  );
}

export default WithTechnologies(Technologies);
