'use client';

import { useState, useEffect } from 'react';

/* ══════════════════════════════════════════════
   useIsDark — detecta clase dark en <html>
   Uso: const { isDark, mounted } = useIsDark()
══════════════════════════════════════════════ */
export function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  return { isDark, mounted };
}

/* ══════════════════════════════════════════════
   useNeonCycle — fase continua 0→1 en bucle
   Uso: const phase = useNeonCycle(5500)
══════════════════════════════════════════════ */
export function useNeonCycle(period = 5500) {
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

/* ══════════════════════════════════════════════
   neonHSL — color azul ciclante
   hue oscila 174–266 (azul-cian-violeta)
══════════════════════════════════════════════ */
export function neonHSL(phase, offset = 0, lightMode = false) {
  const t = ((phase + offset) % 1) * Math.PI * 2;
  const hue = 220 + Math.sin(t) * 32 + Math.cos(t * 0.7) * 14;
  const sat = 96;
  const light = lightMode
    ? 40 + Math.sin(t * 1.2) * 8
    : 58 + Math.sin(t * 1.2) * 10;
  return `hsl(${hue},${sat}%,${light}%)`;
}

/* ══════════════════════════════════════════════
   TOKENS DE TEMA — objeto con todos los colores
   Uso: const T = themeTokens(isDark)
══════════════════════════════════════════════ */
export function themeTokens(isDark) {
  return {
    pageBg: isDark
      ? 'radial-gradient(ellipse at 22% 18%,rgba(0,45,160,0.16) 0%,transparent 55%),radial-gradient(ellipse at 78% 82%,rgba(0,70,200,0.11) 0%,transparent 50%),#000610'
      : 'radial-gradient(ellipse at 22% 18%,rgba(180,215,255,0.35) 0%,transparent 55%),radial-gradient(ellipse at 78% 82%,rgba(160,200,255,0.20) 0%,transparent 50%),#edf2ff',
    vignette: isDark
      ? 'radial-gradient(ellipse at center,transparent 38%,rgba(0,2,16,0.82) 100%)'
      : 'radial-gradient(ellipse at center,transparent 48%,rgba(200,215,245,0.48) 100%)',
    bodyText: isDark ? 'rgba(185,220,255,0.85)' : 'rgba(10,30,90,0.82)',
    dimText: isDark ? 'rgba(120,180,255,0.65)' : 'rgba(25,55,155,0.62)',
    dot: isDark ? '#0099ff' : '#0044cc',
    subText: isDark ? 'rgba(90,160,255,0.55)' : 'rgba(0,55,170,0.42)',
    lineL: isDark
      ? 'linear-gradient(to right,transparent,#0066ff)'
      : 'linear-gradient(to right,transparent,#2266cc)',
    lineR: isDark
      ? 'linear-gradient(to left,transparent,#0066ff)'
      : 'linear-gradient(to left,transparent,#2266cc)',
    btnBg: isDark ? 'rgba(0,80,200,0.20)' : 'rgba(0,55,190,0.08)',
    btnBorder: isDark ? 'rgba(0,130,255,0.45)' : 'rgba(0,80,200,0.30)',
    btnText: isDark ? '#a0d8ff' : '#003dcc',
    pillBg: isDark ? 'rgba(0,65,190,0.22)' : 'rgba(0,55,190,0.08)',
    pillBorder: isDark ? 'rgba(0,110,255,0.35)' : 'rgba(0,65,185,0.22)',
    pillText: isDark ? 'rgba(130,200,255,0.95)' : 'rgba(0,45,155,0.82)',
    statValue: isDark ? '#55aaff' : '#0033cc',
    statLabel: isDark ? 'rgba(80,155,255,0.52)' : 'rgba(0,45,145,0.48)',
    statBg: isDark ? 'rgba(0,14,48,0.68)' : 'rgba(228,238,255,0.75)',
    statBorder: isDark ? 'rgba(0,85,210,0.22)' : 'rgba(0,60,180,0.14)',
    cardBg: isDark ? 'rgba(0,10,32,0.84)' : 'rgba(245,249,255,0.91)',
    cardBgHov: isDark ? 'rgba(0,18,55,0.92)' : 'rgba(232,240,255,0.96)',
    cardBorder: isDark ? 'rgba(0,90,220,0.20)' : 'rgba(0,60,190,0.16)',
    cardBorderHov: isDark ? 'rgba(0,130,255,0.65)' : 'rgba(0,80,220,0.50)',
    sectionBg: isDark ? 'rgba(0,8,28,0.80)' : 'rgba(245,249,255,0.90)',
    sectionBorder: isDark
      ? '1px solid rgba(0,90,220,0.18)'
      : '1px solid rgba(0,60,190,0.14)',
    eyeBg: isDark ? 'rgba(0,80,255,0.10)' : 'rgba(0,55,210,0.07)',
    eyeBorder: isDark ? 'rgba(0,130,255,0.28)' : 'rgba(0,80,210,0.20)',
    eyeText: isDark ? 'rgba(110,185,255,0.82)' : 'rgba(0,45,155,0.68)',
    heading: isDark ? '#55aaff' : '#0033cc',
    headingShadow: isDark
      ? '0 0 14px rgba(0,130,255,0.75),0 0 32px rgba(0,100,255,0.35)'
      : '0 0 8px rgba(0,60,200,0.22)',
    linkColor: isDark ? '#00ccff' : '#0033cc',
    link: isDark ? '#00ddff' : '#0033cc',
    linkBorder: isDark ? 'rgba(0,210,255,0.32)' : 'rgba(0,55,175,0.28)',
    statShadow: isDark
      ? '0 0 20px rgba(0,130,255,0.8),0 0 44px rgba(0,100,255,0.35)'
      : 'none',
  };
}

/* ══════════════════════════════════════════════
   useTypewriter
══════════════════════════════════════════════ */
export function useTypewriter(text, speed = 40, startDelay = 700) {
  const [disp, setDisp] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisp('');
    setDone(false);
    const t = setTimeout(() => {
      let i = 0;
      const id = setInterval(() => {
        i++;
        setDisp(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(id);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(id);
    }, startDelay);
    return () => clearTimeout(t);
  }, [text, speed, startDelay]);
  return { disp, done };
}
