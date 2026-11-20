import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { playBeadPop, playClick } from '../game/sound';
import type { AgeMode, RobotEmotion } from '../game/types';
import { animateLumiRobot3D, buildLumiRobot3D } from '../three/buildLumiRobot3D';
import { LumiMascotSvg } from './LumiMascotSvg';

interface ClippyRobot3DProps {
  open: boolean;
  ageMode: AgeMode;
  emotion: RobotEmotion;
  tag: string;
  message: string;
  factNumber: number;
  factTotal: number;
  onNextFact: () => void;
  onSpeakMessage: () => void;
  onClose: () => void;
}

const EMOTION_ACCENT: Record<RobotEmotion, string> = {
  happy: '#D97706',
  curious: '#0284C7',
  thinking: '#7C3AED',
  idea: '#CA8A04',
  celebrating: '#059669',
  surprised: '#E11D48',
};

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      (probeCanvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (probeCanvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return true;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
    const isSoft = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return isSoft;
  } catch {
    return true;
  }
}

export function ClippyRobot3D({
  open,
  ageMode,
  emotion,
  tag,
  message,
  factNumber,
  factTotal,
  onNextFact,
  onSpeakMessage,
  onClose,
}: ClippyRobot3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const emotionRef = useRef<RobotEmotion>(emotion);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pokeTimerRef = useRef(0);
  const sideRef = useRef<'right' | 'left'>('right');

  const [side, setSide] = useState<'right' | 'left'>('right');
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    emotionRef.current = emotion;
  }, [emotion]);

  useEffect(() => {
    sideRef.current = side;
  }, [side]);

  // Trigger subtle bounce whenever the fact/message updates while open
  useEffect(() => {
    if (open) {
      pokeTimerRef.current = 0.65;
    }
  }, [message, open]);

  // Track global pointer for expressive 3D gaze
  useEffect(() => {
    if (!open) return;
    const onPointerMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const anchorX = sideRef.current === 'right' ? 0.85 : 0.15;
      const nx = (e.clientX / w - anchorX) * 2.1;
      const ny = (e.clientY / h - 0.8) * 2.1;
      pointerRef.current.x = Math.max(-1, Math.min(1, nx));
      pointerRef.current.y = Math.max(-1, Math.min(1, ny));
    };
    const onBlur = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onBlur);
    };
  }, [open]);

  // Isolated Three.js WebGL lifecycle (only mounted while Lumi is open)
  useEffect(() => {
    if (!open) return;
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = 168;
    const height = 204;
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    if (!isSoftwareGl) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.setAttribute('aria-hidden', 'true');
    container.innerHTML = '';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 20);
    camera.position.set(0.16, 0.34, 5.85);
    camera.lookAt(-0.04, 0.28, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envRT = pmrem.fromScene(envScene);
    scene.environment = envRT.texture;
    envScene.dispose();
    pmrem.dispose();

    const hemiLight = new THREE.HemisphereLight(0xdce9ff, 0x36281a, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1d4, 1.9);
    keyLight.position.set(2.8, 3.6, 3.4);
    scene.add(keyLight);

    const lanternFillLight = new THREE.PointLight(0xffb84d, 1.45, 4.5);
    lanternFillLight.position.set(-1.1, 0.0, 1.3);
    scene.add(lanternFillLight);

    const rimLight = new THREE.DirectionalLight(0xf6c453, 1.25);
    rimLight.position.set(-2.6, 1.9, -2.2);
    scene.add(rimLight);

    const rig = buildLumiRobot3D(isSoftwareGl);
    rig.root.position.set(0.06, -0.02, 0);
    rig.root.rotation.y = -0.14;
    scene.add(rig.root);

    let disposed = false;
    let rafId = 0;
    let timerId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const glCtx = renderer.getContext();

    const onContextLost = (ev: Event) => {
      ev.preventDefault();
      disposed = true;
      setWebglFailed(true);
    };
    const onContextRestored = () => {
      setWebglFailed(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const afterDraw = (next: () => void) => {
      if (disposed) return;
      if (isSoftwareGl && typeof WebGL2RenderingContext !== 'undefined' && glCtx instanceof WebGL2RenderingContext) {
        const sync = glCtx.fenceSync(glCtx.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (sync) {
          glCtx.flush();
          const poll = () => {
            if (disposed) {
              glCtx.deleteSync(sync);
              return;
            }
            const status = glCtx.clientWaitSync(sync, 0, 0);
            if (status === glCtx.TIMEOUT_EXPIRED) {
              timerId = window.setTimeout(poll, 16);
              return;
            }
            glCtx.deleteSync(sync);
            timerId = window.setTimeout(next, 80);
          };
          timerId = window.setTimeout(poll, 16);
          return;
        }
        timerId = window.setTimeout(next, 90);
        return;
      }
      rafId = window.requestAnimationFrame(next);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      if (pokeTimerRef.current > 0) {
        pokeTimerRef.current = Math.max(0, pokeTimerRef.current - dt * 1.45);
      }

      animateLumiRobot3D(
        rig,
        emotionRef.current,
        pointerRef.current.x,
        pointerRef.current.y,
        elapsed,
        dt,
        pokeTimerRef.current
      );

      renderer.render(scene, camera);
      afterDraw(tick);
    };

    animateLumiRobot3D(rig, emotionRef.current, 0, 0, 0, 0.016, 0);
    renderer.render(scene, camera);
    afterDraw(tick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      rig.dispose();
      envRT.dispose();
      renderer.dispose();
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [open]);

  // When folded, Lumi docks cleanly inside the top GameHud bar — zero floating overlay on the page!
  if (!open) return null;

  const accent = EMOTION_ACCENT[emotion];
  const isRight = side === 'right';

  return (
    <aside
      aria-label="Assistant robot Lumi 3D et anecdotes LLM"
      className={`fixed bottom-3 z-40 flex flex-col pointer-events-none select-none sm:bottom-4 ${
        isRight ? 'right-3 sm:right-4 items-end' : 'left-3 sm:left-4 items-start'
      }`}
    >
      {/* Parchment LLM Fact Speech Bubble (never uses backdrop-blur over WebGL) */}
      <div
        className="pointer-events-auto relative mb-2 w-[min(320px,calc(100vw-24px))] rounded-2xl border-2 border-[#D8B872] bg-[#FBF7EF] p-3.5 text-[#172033] shadow-[0_14px_34px_rgba(11,18,38,0.36)]"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />
            <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-[#1B2B4B] leading-tight">
              {tag}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-bold text-[#6A768F] tabular-nums pr-0.5">
              {factNumber}/{factTotal}
            </span>
            <button
              type="button"
              onClick={() => {
                playClick();
                setSide((prev) => (prev === 'right' ? 'left' : 'right'));
              }}
              aria-label={isRight ? 'Déplacer Lumi à gauche' : 'Déplacer Lumi à droite'}
              title={isRight ? 'Déplacer à gauche' : 'Déplacer à droite'}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-[#5A6780] hover:bg-[#ECE3D0] hover:text-[#172033] transition-colors cursor-pointer"
            >
              ⇄
            </button>
            <button
              type="button"
              onClick={() => {
                playClick();
                onClose();
              }}
              aria-label="Ranger Lumi 3D dans la barre du haut"
              title="Ranger Lumi dans la barre du haut"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#5A6780] hover:bg-[#ECE3D0] hover:text-[#172033] transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-[13px] leading-relaxed font-medium text-[#22304B]">
          {message}
        </p>

        {/* Fact Discovery & Audio Controls */}
        <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-[#E6DCC8]">
          <button
            type="button"
            onClick={() => {
              pokeTimerRef.current = 0.9;
              playBeadPop();
              onNextFact();
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#131D38] px-3 py-1.5 text-xs font-bold text-[#F6C453] hover:bg-[#1E2D55] transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{ageMode === 'kid' ? 'Autre secret IA →' : 'Autre fait LLM →'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              onSpeakMessage();
            }}
            aria-label="Écouter cette anecdote à voix haute"
            title="Écouter à voix haute"
            className="inline-flex items-center gap-1 rounded-lg border border-[#D4C4A3] bg-[#F2E9D8] px-2.5 py-1.5 text-xs font-bold text-[#2A3750] hover:bg-[#E7DAC0] transition-colors cursor-pointer whitespace-nowrap"
          >
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none" aria-hidden="true">
              <path
                d="M9 5L5.5 8H3v4h2.5L9 15V5zM12.5 7.5a3.5 3.5 0 0 1 0 5M14.8 5.5a6.2 6.2 0 0 1 0 9"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Lire</span>
          </button>
        </div>

        {/* Speech Bubble Pointer Tail */}
        <span
          aria-hidden="true"
          className={`absolute -bottom-2 h-3.5 w-3.5 rotate-45 border-r-2 border-b-2 border-[#D8B872] bg-[#FBF7EF] ${
            isRight ? 'right-12' : 'left-12'
          }`}
        />
      </div>

      {/* Interactive 3D Three.js Lumi Stage (Midnight Observatory Medallion) */}
      <div className="pointer-events-auto relative flex items-center justify-center rounded-3xl border-2 border-[#D4A449] bg-[radial-gradient(circle_at_50%_38%,#213566_0%,#131D38_72%,#0B1226_100%)] shadow-[0_14px_34px_rgba(11,18,38,0.42)] [@media(max-height:520px)]:hidden">
        <button
          type="button"
          onClick={() => {
            pokeTimerRef.current = 1;
            playBeadPop();
            onNextFact();
          }}
          aria-label="Cliquer sur Lumi 3D pour découvrir une autre anecdote sur les LLM"
          title="Clique sur Lumi pour un autre fait LLM !"
          className="relative flex h-[156px] w-[128px] sm:h-[196px] sm:w-[162px] items-center justify-center rounded-3xl cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
        >
          {webglFailed ? (
            <LumiMascotSvg
              mood={
                emotion === 'celebrating'
                  ? 'celebrating'
                  : emotion === 'thinking' || emotion === 'curious'
                  ? 'thinking'
                  : 'happy'
              }
              className="h-32 w-32 drop-shadow-lg"
            />
          ) : (
            <div ref={mountRef} className="h-full w-full" />
          )}
        </button>
      </div>
    </aside>
  );
}
