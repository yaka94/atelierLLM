import * as THREE from 'three';
import type { RobotEmotion } from '../game/types';

export interface LumiRobotRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  antennaBulb: THREE.Mesh;
  antennaBulbMat: THREE.MeshStandardMaterial;
  chestCoreMat: THREE.MeshStandardMaterial;
  hoverRing: THREE.Mesh;
  ideaBulbGroup: THREE.Group;
  starCrownGroup: THREE.Group;
  dispose: () => void;
}

function createBrushedMetalBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 2) {
      const shade = 115 + ((y * 17) % 28);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, 128, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Builds a composite 14-part procedural PBR 3D Lumi Robot inspired by our storybook
 * brass-and-porcelain workshop robot with expressive Clippy-like articulated eyebrows,
 * arms, antenna beacon, hover halo, and emotion props.
 */
export function buildLumiRobot3D(isSoftwareGl: boolean): LumiRobotRig {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const bumpTex = createBrushedMetalBumpTexture();
  textures.push(bumpTex);

  // Calibrated PBR Materials (roughness delta >= 0.25 across adjacent parts)
  const porcelainMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xfbf4e4,
      roughness: 0.42,
      metalness: 0.06,
      clearcoat: 0.45,
      clearcoatRoughness: 0.28,
    })
  );

  const brushedBrassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd99b38,
      roughness: 0.22,
      metalness: 0.88,
      bumpMap: bumpTex,
      bumpScale: 0.008,
    })
  );

  const darkBronzeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x5c3c18,
      roughness: 0.55,
      metalness: 0.7,
    })
  );

  const visorMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x111c36,
      roughness: 0.1,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    })
  );

  const eyeGlowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff3c4,
      emissive: 0xfbbf24,
      emissiveIntensity: 1.6,
      roughness: 0.2,
      metalness: 0.1,
    })
  );

  const antennaBulbMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.8,
      roughness: 0.18,
      metalness: 0.05,
    })
  );

  const chestCoreMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.1,
    })
  );

  const hoverMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.25,
      roughness: 0.2,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
    })
  );

  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // Soft grounded radial shadow disc beneath the hovering robot
  const shadowGeo = trackGeo(new THREE.CircleGeometry(0.62, 24));
  const shadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0x0c1328,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    })
  );
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = -0.92;
  root.add(shadowDisc);

  // 1. Floating Hover Halo Ring
  const hoverGeo = trackGeo(new THREE.TorusGeometry(0.42, 0.045, 12, 32));
  const hoverRing = new THREE.Mesh(hoverGeo, hoverMat);
  hoverRing.rotation.x = Math.PI / 2;
  hoverRing.position.y = -0.72;
  bodyGroup.add(hoverRing);

  // 2. Sculpted Lathe Porcelain Torso (organic bell silhouette, not a box!)
  const torsoProfile = [
    new THREE.Vector2(0.01, -0.52),
    new THREE.Vector2(0.32, -0.48),
    new THREE.Vector2(0.45, -0.24),
    new THREE.Vector2(0.46, 0.02),
    new THREE.Vector2(0.38, 0.22),
    new THREE.Vector2(0.24, 0.3),
    new THREE.Vector2(0.01, 0.31),
  ];
  const torsoGeo = trackGeo(new THREE.LatheGeometry(torsoProfile, 28));
  const torsoMesh = new THREE.Mesh(torsoGeo, porcelainMat);
  torsoMesh.castShadow = !isSoftwareGl;
  bodyGroup.add(torsoMesh);

  // 3. Brass Belt & Collar Trim
  const collarGeo = trackGeo(new THREE.TorusGeometry(0.26, 0.048, 12, 28));
  const collar = new THREE.Mesh(collarGeo, brushedBrassMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.31;
  bodyGroup.add(collar);

  const beltGeo = trackGeo(new THREE.TorusGeometry(0.44, 0.036, 10, 28));
  const belt = new THREE.Mesh(beltGeo, darkBronzeMat);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = -0.22;
  bodyGroup.add(belt);

  // 4. Chest Lantern Bezel + Glowing Heart Core
  const bezelGeo = trackGeo(new THREE.TorusGeometry(0.16, 0.032, 12, 24));
  const bezel = new THREE.Mesh(bezelGeo, brushedBrassMat);
  bezel.position.set(0, 0.0, 0.43);
  bodyGroup.add(bezel);

  const coreGeo = trackGeo(new THREE.SphereGeometry(0.13, 18, 14));
  const core = new THREE.Mesh(coreGeo, chestCoreMat);
  core.position.set(0, 0.0, 0.4);
  core.scale.set(1, 1, 0.45);
  bodyGroup.add(core);

  // 5 & 6. Articulated Brass Arms + Porcelain Mittens
  const armCurveGeo = trackGeo(new THREE.CapsuleGeometry(0.068, 0.32, 8, 12));
  const handGeo = trackGeo(new THREE.SphereGeometry(0.105, 16, 12));
  const shoulderGeo = trackGeo(new THREE.SphereGeometry(0.095, 14, 12));

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.48, 0.14, 0);
  const lShoulder = new THREE.Mesh(shoulderGeo, brushedBrassMat);
  const lShaft = new THREE.Mesh(armCurveGeo, brushedBrassMat);
  lShaft.position.set(-0.08, -0.2, 0.06);
  lShaft.rotation.z = 0.25;
  const lHand = new THREE.Mesh(handGeo, porcelainMat);
  lHand.position.set(-0.14, -0.4, 0.11);
  leftArm.add(lShoulder, lShaft, lHand);
  bodyGroup.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.48, 0.14, 0);
  const rShoulder = new THREE.Mesh(shoulderGeo, brushedBrassMat);
  const rShaft = new THREE.Mesh(armCurveGeo, brushedBrassMat);
  rShaft.position.set(0.08, -0.2, 0.06);
  rShaft.rotation.z = -0.25;
  const rHand = new THREE.Mesh(handGeo, porcelainMat);
  rHand.position.set(0.14, -0.4, 0.11);
  rightArm.add(rShoulder, rShaft, rHand);
  bodyGroup.add(rightArm);

  // 7. Articulated Head Group (gaze tracking + Clippy tilts!)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.72, 0);
  bodyGroup.add(headGroup);

  // Sculpted wide porcelain head dome
  const headGeo = trackGeo(new THREE.SphereGeometry(0.48, 28, 22));
  const headMesh = new THREE.Mesh(headGeo, porcelainMat);
  headMesh.scale.set(1.16, 0.9, 0.95);
  headMesh.castShadow = !isSoftwareGl;
  headGroup.add(headMesh);

  // Brass Visor Frame
  const frameGeo = trackGeo(new THREE.TorusGeometry(0.35, 0.038, 12, 32));
  const visorFrame = new THREE.Mesh(frameGeo, brushedBrassMat);
  visorFrame.scale.set(1.16, 0.74, 1);
  visorFrame.position.set(0, -0.01, 0.39);
  headGroup.add(visorFrame);

  // Dark Glass Face Visor
  const visorGeo = trackGeo(new THREE.SphereGeometry(0.35, 24, 18));
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.scale.set(1.14, 0.72, 0.36);
  visor.position.set(0, -0.01, 0.34);
  headGroup.add(visor);

  // 8 & 9. Brass Ear Dials
  const earGeo = trackGeo(new THREE.CylinderGeometry(0.13, 0.15, 0.12, 18));
  const leftEar = new THREE.Mesh(earGeo, brushedBrassMat);
  leftEar.rotation.z = Math.PI / 2;
  leftEar.position.set(-0.56, 0, 0);
  const rightEar = new THREE.Mesh(earGeo, brushedBrassMat);
  rightEar.rotation.z = Math.PI / 2;
  rightEar.position.set(0.56, 0, 0);
  headGroup.add(leftEar, rightEar);

  // 10 & 11. Expressive Glowing Eyes
  const eyeGeo = trackGeo(new THREE.SphereGeometry(0.082, 16, 14));
  const leftEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
  leftEye.position.set(-0.16, 0.0, 0.45);
  leftEye.scale.set(1, 1.15, 0.45);

  const rightEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
  rightEye.position.set(0.16, 0.0, 0.45);
  rightEye.scale.set(1, 1.15, 0.45);
  headGroup.add(leftEye, rightEye);

  // 12 & 13. Expressive Clippy-Style Articulated Eyebrows!
  const browGeo = trackGeo(new THREE.CapsuleGeometry(0.026, 0.15, 6, 10));
  const leftBrow = new THREE.Mesh(browGeo, brushedBrassMat);
  leftBrow.rotation.z = Math.PI / 2;
  leftBrow.position.set(-0.16, 0.145, 0.47);

  const rightBrow = new THREE.Mesh(browGeo, brushedBrassMat);
  rightBrow.rotation.z = Math.PI / 2;
  rightBrow.position.set(0.16, 0.145, 0.47);
  headGroup.add(leftBrow, rightBrow);

  // 14. Antenna Stalk & Glowing Emotion Beacon
  const stalkGeo = trackGeo(new THREE.CylinderGeometry(0.025, 0.038, 0.28, 12));
  const stalk = new THREE.Mesh(stalkGeo, darkBronzeMat);
  stalk.position.set(0, 0.54, 0);
  headGroup.add(stalk);

  const bulbGeo = trackGeo(new THREE.SphereGeometry(0.095, 16, 14));
  const antennaBulb = new THREE.Mesh(bulbGeo, antennaBulbMat);
  antennaBulb.position.set(0, 0.72, 0);
  headGroup.add(antennaBulb);

  // Clippy Emotion Prop A: Floating Lightbulb ("Idée!")
  const ideaBulbGroup = new THREE.Group();
  ideaBulbGroup.position.set(0.46, 0.72, 0.15);
  const ideaGlassGeo = trackGeo(new THREE.SphereGeometry(0.14, 16, 14));
  const ideaGlassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 2.0,
      roughness: 0.15,
    })
  );
  const ideaBaseGeo = trackGeo(new THREE.CylinderGeometry(0.06, 0.05, 0.08, 12));
  const ideaGlass = new THREE.Mesh(ideaGlassGeo, ideaGlassMat);
  const ideaBase = new THREE.Mesh(ideaBaseGeo, brushedBrassMat);
  ideaBase.position.y = -0.14;
  ideaBulbGroup.add(ideaGlass, ideaBase);
  ideaBulbGroup.visible = false;
  headGroup.add(ideaBulbGroup);

  // Clippy Emotion Prop B: Orbiting Celebration Star Crown ("Bravo!")
  const starCrownGroup = new THREE.Group();
  starCrownGroup.position.set(0, 0.85, 0);
  const starGeo = trackGeo(new THREE.OctahedronGeometry(0.085, 0));
  const starMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.8,
      roughness: 0.18,
      metalness: 0.6,
    })
  );
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.set(Math.cos(angle) * 0.42, 0, Math.sin(angle) * 0.42);
    starCrownGroup.add(star);
  }
  starCrownGroup.visible = false;
  headGroup.add(starCrownGroup);

  return {
    root,
    bodyGroup,
    headGroup,
    leftArm,
    rightArm,
    leftEye,
    rightEye,
    leftBrow,
    rightBrow,
    antennaBulb,
    antennaBulbMat,
    chestCoreMat,
    hoverRing,
    ideaBulbGroup,
    starCrownGroup,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}

const EMOTION_HEX: Record<RobotEmotion, number> = {
  happy: 0xf59e0b,
  curious: 0x38bdf8,
  thinking: 0xa78bfa,
  idea: 0xfacc15,
  celebrating: 0x34d399,
  surprised: 0xfb7185,
};

const _targetColor = new THREE.Color();

/**
 * Updates the 3D Lumi Robot kinematics & Clippy-style facial expressions smoothly with exponential damping.
 * Zero object allocations inside the render loop.
 */
export function animateLumiRobot3D(
  rig: LumiRobotRig,
  emotion: RobotEmotion,
  pointerX: number,
  pointerY: number,
  elapsed: number,
  dt: number,
  pokeTimer: number
): void {
  const safeDt = Math.min(dt, 0.05);

  // 1. Hover float + playful bounce on poke/celebration
  const floatAmp = emotion === 'celebrating' ? 0.11 : 0.06;
  const floatSpeed = emotion === 'celebrating' ? 5.2 : 2.3;
  const pokeHop = pokeTimer > 0 ? Math.sin(pokeTimer * Math.PI * 3) * 0.16 : 0;
  rig.bodyGroup.position.y = Math.sin(elapsed * floatSpeed) * floatAmp + pokeHop;

  // Hover ring spin & gentle pulse
  rig.hoverRing.rotation.z = elapsed * 1.4;
  const ringScale = 1 + Math.sin(elapsed * 3.1) * 0.05;
  rig.hoverRing.scale.set(ringScale, ringScale, 1);

  // 2. Smooth gaze tracking + emotion head pose (Clippy head cock!)
  let targetHeadY = THREE.MathUtils.clamp(pointerX * 0.42, -0.48, 0.48);
  let targetHeadX = THREE.MathUtils.clamp(-pointerY * 0.24, -0.26, 0.26);
  let targetHeadZ = 0;

  if (emotion === 'curious') {
    targetHeadZ = 0.22;
  } else if (emotion === 'thinking') {
    targetHeadZ = -0.15;
    targetHeadX -= 0.12;
  } else if (emotion === 'celebrating') {
    targetHeadY += Math.sin(elapsed * 5.5) * 0.22;
  } else if (emotion === 'surprised') {
    targetHeadZ = Math.sin(elapsed * 14) * 0.08;
  } else if (emotion === 'idea') {
    targetHeadX -= 0.08;
  }

  if (pokeTimer > 0) {
    targetHeadY += Math.sin(pokeTimer * Math.PI * 4) * 0.45;
  }

  rig.headGroup.rotation.y = THREE.MathUtils.damp(rig.headGroup.rotation.y, targetHeadY, 7, safeDt);
  rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, targetHeadX, 7, safeDt);
  rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, targetHeadZ, 7, safeDt);

  // 3. Expressive Eye Blink & Scale
  const blinkCycle = elapsed % 3.8;
  const isBlinking = blinkCycle > 3.64 && emotion !== 'surprised';
  const targetEyeScaleY = isBlinking
    ? 0.12
    : emotion === 'surprised'
    ? 1.45
    : emotion === 'celebrating'
    ? 0.85
    : 1.15;
  const targetEyeScaleX = emotion === 'surprised' ? 1.25 : 1.0;

  rig.leftEye.scale.y = THREE.MathUtils.damp(rig.leftEye.scale.y, targetEyeScaleY, 18, safeDt);
  rig.rightEye.scale.y = THREE.MathUtils.damp(rig.rightEye.scale.y, targetEyeScaleY, 18, safeDt);
  rig.leftEye.scale.x = THREE.MathUtils.damp(rig.leftEye.scale.x, targetEyeScaleX, 14, safeDt);
  rig.rightEye.scale.x = THREE.MathUtils.damp(rig.rightEye.scale.x, targetEyeScaleX, 14, safeDt);

  // 4. Clippy Eyebrow Kinematics!
  let lBrowY = 0.145;
  let rBrowY = 0.145;
  let lBrowRot = Math.PI / 2;
  let rBrowRot = Math.PI / 2;

  if (emotion === 'curious') {
    // Classic Clippy asymmetric raised brow!
    lBrowY = 0.135;
    rBrowY = 0.21;
    lBrowRot = Math.PI / 2 - 0.12;
    rBrowRot = Math.PI / 2 + 0.22;
  } else if (emotion === 'thinking') {
    lBrowY = 0.13;
    rBrowY = 0.13;
    lBrowRot = Math.PI / 2 - 0.25;
    rBrowRot = Math.PI / 2 + 0.25;
  } else if (emotion === 'surprised' || emotion === 'idea') {
    lBrowY = 0.21;
    rBrowY = 0.21;
    lBrowRot = Math.PI / 2 + 0.16;
    rBrowRot = Math.PI / 2 - 0.16;
  } else if (emotion === 'celebrating') {
    const cheer = Math.sin(elapsed * 8) * 0.025;
    lBrowY = 0.19 + cheer;
    rBrowY = 0.19 + cheer;
  }

  rig.leftBrow.position.y = THREE.MathUtils.damp(rig.leftBrow.position.y, lBrowY, 10, safeDt);
  rig.rightBrow.position.y = THREE.MathUtils.damp(rig.rightBrow.position.y, rBrowY, 10, safeDt);
  rig.leftBrow.rotation.z = THREE.MathUtils.damp(rig.leftBrow.rotation.z, lBrowRot, 10, safeDt);
  rig.rightBrow.rotation.z = THREE.MathUtils.damp(rig.rightBrow.rotation.z, rBrowRot, 10, safeDt);

  // 5. Arm Gestures per Emotion
  let lArmZ = 0.08 + Math.sin(elapsed * 2.2) * 0.05;
  let rArmZ = -0.08 - Math.sin(elapsed * 2.2) * 0.05;
  let lArmX = 0;
  let rArmX = 0;

  if (emotion === 'celebrating') {
    lArmZ = 2.4 + Math.sin(elapsed * 8) * 0.24;
    rArmZ = -2.4 - Math.sin(elapsed * 8) * 0.24;
  } else if (emotion === 'idea') {
    rArmZ = -2.35;
    lArmZ = 0.15;
  } else if (emotion === 'thinking') {
    rArmX = -0.85;
    rArmZ = -0.65;
  } else if (emotion === 'happy' && pokeTimer > 0) {
    rArmZ = -2.2 + Math.sin(elapsed * 16) * 0.35;
  } else if (emotion === 'curious') {
    lArmZ = 0.32;
    rArmZ = -0.45;
  } else if (emotion === 'surprised') {
    lArmZ = 1.1;
    rArmZ = -1.1;
  }

  rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, lArmZ, 9, safeDt);
  rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, rArmZ, 9, safeDt);
  rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, lArmX, 9, safeDt);
  rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, rArmX, 9, safeDt);

  // 6. Emotion Beacon Color + Floating Props
  _targetColor.setHex(EMOTION_HEX[emotion]);
  rig.antennaBulbMat.emissive.lerp(_targetColor, 1 - Math.exp(-8 * safeDt));
  rig.chestCoreMat.emissive.lerp(_targetColor, 1 - Math.exp(-8 * safeDt));

  rig.ideaBulbGroup.visible = emotion === 'idea';
  if (rig.ideaBulbGroup.visible) {
    rig.ideaBulbGroup.position.y = 0.72 + Math.sin(elapsed * 5) * 0.06;
    rig.ideaBulbGroup.rotation.y = elapsed * 1.8;
  }

  rig.starCrownGroup.visible = emotion === 'celebrating';
  if (rig.starCrownGroup.visible) {
    rig.starCrownGroup.rotation.y = elapsed * 2.6;
  }
}
