import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { playBeadPop, playClick } from '../game/sound';
import type { AgeMode, RobotEmotion } from '../game/types';
import { animateLumiRobot3D, buildLumiRobot3D } from '../three/buildLumiRobot3D';
import { LumiMascotSvg } from './LumiMascotSvg';

interface ClippyRobot3DProps {
  ageMode: AgeMode;
  emotion: RobotEmotion;
  message: string;
  autoOpenBubble?: boolean;
  onSelectEmotion: (emotion: RobotEmotion, customTip?: string) => void;
  onPokeTip: () => void;
}

const EMOTION_META: Record<
  RobotEmotion,
  { label: string; accent: string; tipKid: string; tipAdult: string }
> = {
  happy: {
    label: 'Ravi',
    accent: '#D97706',
    tipKid: 'Coucou ! Clique sur moi quand tu veux un conseil magique !',
    tipAdult: 'Bienvenue ! Cliquez sur moi pour une astuce sur les LLM.',
  },
  curious: {
    label: 'Curieux',
    accent: '#0284C7',
    tipKid: 'Hmm… et si on ouvrait une nouvelle station sur la carte ?',
    tipAdult: 'Curieux de comparer Transformer Dense, MoE et LFM3 ? Essayez la station 3.',
  },
  thinking: {
    label: 'Réflexion',
    accent: '#7C3AED',
    tipKid: 'Je réfléchis… chaque perle de mot s’éclaire avec ses amies !',
    tipAdult: 'Attention Q·K·V : chaque token pondère son contexte avant le MLP.',
  },
  idea: {
    label: 'Idée !',
    accent: '#CA8A04',
    tipKid: 'Eurêka ! En mode Enfant et en mode Adulte, tes scores restent séparés !',
    tipAdult: 'Astuce : les scores Enfant et Adulte sont isolés dans deux compteurs distincts.',
  },
  celebrating: {
    label: 'Bravo !',
    accent: '#059669',
    tipKid: 'Youpi ! Tu collectionnes les cristaux comme un vrai savant !',
    tipAdult: 'Superbe progression ! Consultez le tableau Succès pour vos trophées.',
  },
  surprised: {
    label: 'Oh !',
    accent: '#E11D48',
    tipKid: 'Oh là là ! Tu as changé de mode, mes sourcils s’envolent !',
    tipAdult: 'Changement de vue ! Les modèles Omni lisent texte, image et audio ensemble.',
  },
};

const QUICK_EMOTIONS: { id: RobotEmotion; label: string }[] = [
  { id: 'idea', label: 'Idée' },
  { id: 'curious', label: 'Curieux' },
  { id: 'celebrating', label: 'Bravo' },
  { id: 'surprised', label: 'Oh !' },
];

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
  ageMode,
  emotion,
  message,
  autoOpenBubble = false,
  onSelectEmotion,
  onPokeTip,
}: ClippyRobot3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const emotionRef = useRef<RobotEmotion>(emotion);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pokeTimerRef = useRef(0);

  const [collapsed, setCollapsed] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(autoOpenBubble);
  const [webglFailed, setWebglFailed] = useState(false);

  // Keep latest emotion in ref without tearing down Three.js
  useEffect(() => {
    emotionRef.current = emotion;
  }, [emotion]);

  // Open speech bubble only when explicitly requested (title screen, celebration, mode switch)
  // and tuck it away automatically on normal route changes so it never obscures cards
  useEffect(() => {
    if (collapsed) return;
    if (autoOpenBubble && message) {
      setBubbleOpen(true);
    } else if (!autoOpenBubble) {
      setBubbleOpen(false);
    }
  }, [message, collapsed, autoOpenBubble]);

  // Track global pointer for expressive 3D gaze
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      // Offset reference point toward bottom-right where Lumi sits
      const nx = (e.clientX / w - 0.85) * 2.1;
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
  }, []);

  // Isolated Three.js WebGL lifecycle
  useEffect(() => {
    if (collapsed) return;
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

    const width = 164;
    const height = 164;
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
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.display = 'block';
    canvas.setAttribute('aria-hidden', 'true');
    container.innerHTML = '';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 20);
    camera.position.set(0, 0.42, 4.15);
    camera.lookAt(0, 0.24, 0);

    // Calibrated IBL Environment on all devices so brass & porcelain gleam properly
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envRT = pmrem.fromScene(envScene);
    scene.environment = envRT.texture;
    envScene.dispose();
    pmrem.dispose();

    // Warm 3-point observatory studio lighting
    const hemiLight = new THREE.HemisphereLight(0xdceeff, 0x2b344d, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4dd, 1.9);
    keyLight.position.set(2.8, 3.6, 3.2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfbbf24, 1.05);
    rimLight.position.set(-2.6, 1.8, -2.4);
    scene.add(rimLight);

    const rig = buildLumiRobot3D(isSoftwareGl);
    rig.root.position.set(0, -0.05, 0);
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

    // Draw initial frame synchronously so first paint is never blank
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
  }, [collapsed]);

  const meta = EMOTION_META[emotion];

  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => {
            playClick();
            setCollapsed(false);
            setBubbleOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#E8A62E] bg-[#131D38] px-4 py-2.5 text-sm font-bold text-[#FBF7EF] shadow-[0_10px_28px_rgba(10,16,34,0.45)] transition-transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
          aria-label="Afficher Lumi l'assistant 3D"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: meta.accent }}
            aria-hidden="true"
          />
          <span>Lumi 3D</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Assistant robot Lumi 3D"
      className="fixed bottom-3 right-3 z-40 flex flex-col items-end pointer-events-none select-none sm:bottom-4 sm:right-4"
    >
      {/* Clippy-Style Parchment Speech Bubble (no backdrop-blur over WebGL) */}
      {bubbleOpen && (
        <div
          className="pointer-events-auto relative mb-1.5 w-[264px] rounded-2xl border-2 border-[#D8B872] bg-[#FBF7EF] p-3.5 text-[#172033] shadow-[0_14px_34px_rgba(11,18,38,0.34)] sm:w-[280px]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: meta.accent }}
                aria-hidden="true"
              />
              <span className="font-display text-xs font-extrabold uppercase tracking-wider text-[#1B2B4B] truncate">
                Lumi · {meta.label}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setBubbleOpen(false);
                }}
                aria-label="Fermer la bulle de Lumi"
                title="Fermer la bulle"
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
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setCollapsed(true);
                }}
                aria-label="Réduire Lumi 3D"
                title="Réduire Lumi"
                className="inline-flex h-6 px-1.5 items-center justify-center rounded-md text-[11px] font-bold text-[#5A6780] hover:bg-[#ECE3D0] hover:text-[#172033] transition-colors cursor-pointer"
              >
                −
              </button>
            </div>
          </div>

          <p className="text-xs leading-relaxed font-medium text-[#2A3750]">{message}</p>

          {/* Clippy Emotion Trigger Bar */}
          <div className="mt-2.5 flex items-center gap-1.5 pt-2 border-t border-[#E6DCC8]">
            {QUICK_EMOTIONS.map((item) => {
              const active = emotion === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    pokeTimerRef.current = 0.85;
                    playBeadPop();
                    const nextMeta = EMOTION_META[item.id];
                    onSelectEmotion(
                      item.id,
                      ageMode === 'kid' ? nextMeta.tipKid : nextMeta.tipAdult
                    );
                  }}
                  className={`flex-1 rounded-lg px-1.5 py-1 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#131D38] text-[#F6C453]'
                      : 'bg-[#F0E8D7] text-[#354461] hover:bg-[#E4D7BC]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Speech Bubble Pointer Tail */}
          <span
            aria-hidden="true"
            className="absolute -bottom-2 right-14 h-3.5 w-3.5 rotate-45 border-r-2 border-b-2 border-[#D8B872] bg-[#FBF7EF]"
          />
        </div>
      )}

      {/* Interactive 3D Three.js Lumi Stage */}
      <div className="pointer-events-auto relative flex items-center justify-center">
        <button
          type="button"
          onClick={() => {
            pokeTimerRef.current = 1;
            playBeadPop();
            if (!bubbleOpen) {
              setBubbleOpen(true);
            } else {
              onPokeTip();
            }
          }}
          aria-label="Cliquer sur Lumi l'assistant 3D pour une astuce"
          title="Clique sur Lumi !"
          className="relative flex h-[164px] w-[164px] items-center justify-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
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
            <div ref={mountRef} className="h-[164px] w-[164px]" />
          )}
        </button>

        {!bubbleOpen && (
          <button
            type="button"
            onClick={() => {
              playClick();
              setCollapsed(true);
            }}
            aria-label="Masquer Lumi 3D"
            title="Masquer Lumi"
            className="absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#D8B872] bg-[#131D38] text-xs font-bold text-[#F6D58E] hover:bg-[#1E2D55] cursor-pointer"
          >
            −
          </button>
        )}
      </div>
    </aside>
  );
}
