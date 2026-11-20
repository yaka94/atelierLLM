import * as THREE from 'three';
import type { RobotEmotion } from '../game/types';

export interface LumiRobotRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  lanternPivot: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  antennaBulb: THREE.Mesh;
  antennaBulbMat: THREE.MeshStandardMaterial;
  chestCoreMat: THREE.MeshStandardMaterial;
  lanternFlameMat: THREE.MeshStandardMaterial;
  eyeGlowMat: THREE.MeshStandardMaterial;
  shadowDisc: THREE.Mesh;
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
      const shade = 114 + ((y * 17) % 28);
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
 * Warm ivory-cream porcelain texture with subtle vintage shading so it never looks
 * flat stark white, echoing the storybook observatory illustration.
 */
function createCreamEnamelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#F0E4CA');
    grad.addColorStop(0.55, '#E4D3B2');
    grad.addColorStop(1, '#CCB389');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 90; i++) {
      const x = (i * 79) % 256;
      const y = (i * 47) % 256;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(122, 86, 44, 0.06)' : 'rgba(255, 248, 232, 0.1)';
      ctx.fillRect(x, y, 3, 3);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Warm golden-amber radial iris/sun glow texture so eyes & chest core glow richly
 * in golden amber rather than blowing out to flat pure white under ACES tone mapping.
 */
function createWarmAmberGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
    grad.addColorStop(0, '#FFF6CC');
    grad.addColorStop(0.45, '#FAD26B');
    grad.addColorStop(0.82, '#D98E26');
    grad.addColorStop(1, '#8F5614');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
    grad.addColorStop(0, 'rgba(7, 11, 24, 0.65)');
    grad.addColorStop(0.6, 'rgba(7, 11, 24, 0.25)');
    grad.addColorStop(1, 'rgba(7, 11, 24, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Builds a high-craft procedural 3D Lumi Robot sculpted to mirror the exact silhouette
 * and heroic storybook proportions of the Title Screen observatory robot:
 * - Wide sculpted oval head with golden lower chin plate & serene curved smile seam
 * - Wide-set warm amber glowing eyes (non-clipping radial glow) in recessed bronze/brass rims
 * - Tapered cream breastplate -> slender 4-ring dark bronze accordion waist -> cream porcelain pelvis
 * - Signature thin mechanical bronze rods (upper arms & thighs) contrasting with plump
 *   Lathe-sculpted cream forearm gauntlets and flared bell-shaped shin greaves
 * - Rounded vintage domed brass boots & proud hanging hexagonal observatory lantern
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
  const enamelTex = createCreamEnamelTexture();
  const amberGlowTex = createWarmAmberGlowTexture();
  const shadowTex = createContactShadowTexture();
  textures.push(bumpTex, enamelTex, amberGlowTex, shadowTex);

  // Calibrated PBR Materials (roughness delta >= 0.25 between matte ceramic and brushed antique brass)
  const creamEnamelMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xf2e6ce,
      map: enamelTex,
      roughness: 0.48,
      metalness: 0.04,
      clearcoat: 0.3,
      clearcoatRoughness: 0.36,
    })
  );

  const antiqueBrassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xc98d36,
      roughness: 0.22,
      metalness: 0.86,
      bumpMap: bumpTex,
      bumpScale: 0.008,
    })
  );

  const warmBronzeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x6a4522,
      roughness: 0.5,
      metalness: 0.72,
      bumpMap: bumpTex,
      bumpScale: 0.01,
    })
  );

  const darkSteelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x453528,
      roughness: 0.44,
      metalness: 0.78,
    })
  );

  const eyeGlowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffe494,
      map: amberGlowTex,
      emissive: 0xf0a830,
      emissiveMap: amberGlowTex,
      emissiveIntensity: 0.92,
      roughness: 0.2,
      metalness: 0.05,
    })
  );

  const antennaBulbMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffdf85,
      emissive: 0xe89b24,
      emissiveIntensity: 1.05,
      roughness: 0.22,
      metalness: 0.15,
    })
  );

  const chestCoreMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffe38f,
      map: amberGlowTex,
      emissive: 0xf29f24,
      emissiveMap: amberGlowTex,
      emissiveIntensity: 1.15,
      roughness: 0.18,
      metalness: 0.05,
    })
  );

  const lanternFlameMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff0b3,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.45,
      roughness: 0.15,
      metalness: 0.0,
    })
  );

  const lanternGlassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xfbd375,
      emissive: 0xd97706,
      emissiveIntensity: 0.42,
      roughness: 0.16,
      metalness: 0.05,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    })
  );

  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // Soft grounded contact shadow beneath the vintage boots
  const shadowGeo = trackGeo(new THREE.PlaneGeometry(1.55, 1.1));
  const shadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    })
  );
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.set(0, -1.25, 0);
  root.add(shadowDisc);

  // ===================== 1. HOURGLASS TORSO + 4-RING ACCORDION WAIST + CREAM PELVIS =====================
  // Tapered sculpted chest (broad rounded shoulders narrowing gracefully toward waist!)
  const chestProfile = [
    new THREE.Vector2(0.01, -0.18),
    new THREE.Vector2(0.24, -0.17),
    new THREE.Vector2(0.32, -0.06),
    new THREE.Vector2(0.39, 0.1),
    new THREE.Vector2(0.41, 0.25),
    new THREE.Vector2(0.36, 0.37),
    new THREE.Vector2(0.24, 0.43),
    new THREE.Vector2(0.01, 0.44),
  ];
  const chestGeo = trackGeo(new THREE.LatheGeometry(chestProfile, 30));
  const chestMesh = new THREE.Mesh(chestGeo, creamEnamelMat);
  chestMesh.scale.set(1.04, 1.0, 0.84);
  chestMesh.castShadow = !isSoftwareGl;
  bodyGroup.add(chestMesh);

  // Antique brass lower breastplate trim band (curving gracefully like the Title Robot!)
  const lowerChestTrimGeo = trackGeo(new THREE.TorusGeometry(0.315, 0.038, 12, 30));
  const lowerChestTrim = new THREE.Mesh(lowerChestTrimGeo, antiqueBrassMat);
  lowerChestTrim.rotation.x = Math.PI / 2 + 0.14;
  lowerChestTrim.scale.set(1.04, 0.86, 1);
  lowerChestTrim.position.set(0, -0.07, 0.02);
  bodyGroup.add(lowerChestTrim);

  // Brass collar rim + 3-ring slender dark-bronze accordion neck
  const collarGeo = trackGeo(new THREE.TorusGeometry(0.24, 0.04, 12, 28));
  const collar = new THREE.Mesh(collarGeo, antiqueBrassMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.42;
  bodyGroup.add(collar);

  const neckRingGeo = trackGeo(new THREE.TorusGeometry(0.13, 0.028, 10, 22));
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(neckRingGeo, i % 2 === 0 ? warmBronzeMat : darkSteelMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.47 + i * 0.048;
    bodyGroup.add(ring);
  }

  // Signature 4-ring slender bronze accordion waist (iconic Title Robot silhouette!)
  const waistRingGeo = trackGeo(new THREE.TorusGeometry(0.21, 0.032, 10, 24));
  for (let i = 0; i < 4; i++) {
    const wRing = new THREE.Mesh(waistRingGeo, i % 2 === 0 ? warmBronzeMat : darkSteelMat);
    wRing.rotation.x = Math.PI / 2;
    wRing.scale.set(1.02 - i * 0.02, 0.84, 1);
    wRing.position.y = -0.21 - i * 0.048;
    bodyGroup.add(wRing);
  }

  // Sculpted Cream Enamel Pelvis Shell with Brass Belt Rim (NOT a flat brown cylinder!)
  const pelvisProfile = [
    new THREE.Vector2(0.01, -0.58),
    new THREE.Vector2(0.12, -0.57),
    new THREE.Vector2(0.24, -0.5),
    new THREE.Vector2(0.29, -0.4),
    new THREE.Vector2(0.25, -0.36),
    new THREE.Vector2(0.01, -0.36),
  ];
  const pelvisGeo = trackGeo(new THREE.LatheGeometry(pelvisProfile, 24));
  const pelvisMesh = new THREE.Mesh(pelvisGeo, creamEnamelMat);
  pelvisMesh.scale.set(1.06, 1.0, 0.86);
  bodyGroup.add(pelvisMesh);

  const pelvisRimGeo = trackGeo(new THREE.TorusGeometry(0.26, 0.026, 10, 26));
  const pelvisRim = new THREE.Mesh(pelvisRimGeo, antiqueBrassMat);
  pelvisRim.rotation.x = Math.PI / 2;
  pelvisRim.scale.set(1.06, 0.86, 1);
  pelvisRim.position.y = -0.375;
  bodyGroup.add(pelvisRim);

  // Iconic Glowing Golden Sun Chest Core + Bezel + Single Side Brass Dial (exact Title Robot layout!)
  const chestBezelGeo = trackGeo(new THREE.TorusGeometry(0.155, 0.034, 14, 28));
  const chestBezel = new THREE.Mesh(chestBezelGeo, antiqueBrassMat);
  chestBezel.position.set(0, 0.14, 0.34);
  bodyGroup.add(chestBezel);

  const chestInnerRingGeo = trackGeo(new THREE.TorusGeometry(0.118, 0.014, 10, 24));
  const chestInnerRing = new THREE.Mesh(chestInnerRingGeo, warmBronzeMat);
  chestInnerRing.position.set(0, 0.14, 0.355);
  bodyGroup.add(chestInnerRing);

  const coreGeo = trackGeo(new THREE.SphereGeometry(0.12, 20, 16));
  const coreMesh = new THREE.Mesh(coreGeo, chestCoreMat);
  coreMesh.scale.set(1, 1, 0.4);
  coreMesh.position.set(0, 0.14, 0.335);
  bodyGroup.add(coreMesh);

  // Small decorative brass badge dial on right upper chest (just like the painting!)
  const sideDialGeo = trackGeo(new THREE.TorusGeometry(0.042, 0.014, 8, 16));
  const sideDial = new THREE.Mesh(sideDialGeo, antiqueBrassMat);
  sideDial.position.set(0.22, 0.24, 0.28);
  sideDial.rotation.y = 0.45;
  bodyGroup.add(sideDial);

  // ===================== 2. ICONIC LEGS: SLENDER BRONZE THIGHS + BIG BRASS KNEES + FLARED CREAM SHINS + DOMED BOOTS =====================
  const hipBallGeo = trackGeo(new THREE.SphereGeometry(0.11, 16, 14));
  const thighRodGeo = trackGeo(new THREE.CylinderGeometry(0.052, 0.048, 0.29, 14));
  const kneeBallGeo = trackGeo(new THREE.SphereGeometry(0.1, 16, 14));

  // Flared bell-shaped cream enamel shin greave via LatheGeometry!
  const shinProfile = [
    new THREE.Vector2(0.055, 0.0),
    new THREE.Vector2(0.088, -0.05),
    new THREE.Vector2(0.102, -0.16),
    new THREE.Vector2(0.125, -0.31),
    new THREE.Vector2(0.118, -0.34),
    new THREE.Vector2(0.05, -0.34),
  ];
  const shinGreaveGeo = trackGeo(new THREE.LatheGeometry(shinProfile, 20));
  const shinCuffGeo = trackGeo(new THREE.TorusGeometry(0.122, 0.018, 10, 22));

  // Vintage rounded domed brass boot (NOT a rectangular box!)
  const bootDomeGeo = trackGeo(
    new THREE.SphereGeometry(0.135, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.56)
  );
  const bootSoleGeo = trackGeo(new THREE.CylinderGeometry(0.136, 0.142, 0.04, 18));

  const buildLeg = (side: -1 | 1): THREE.Group => {
    const legGroup = new THREE.Group();
    legGroup.position.set(side * 0.21, -0.5, 0);

    const hip = new THREE.Mesh(hipBallGeo, antiqueBrassMat);
    const thigh = new THREE.Mesh(thighRodGeo, darkSteelMat);
    thigh.position.set(0, -0.16, 0);

    const knee = new THREE.Mesh(kneeBallGeo, antiqueBrassMat);
    knee.position.set(0, -0.31, 0.02);

    const shin = new THREE.Mesh(shinGreaveGeo, creamEnamelMat);
    shin.position.set(0, -0.32, 0);

    const shinCuff = new THREE.Mesh(shinCuffGeo, antiqueBrassMat);
    shinCuff.rotation.x = Math.PI / 2;
    shinCuff.position.set(0, -0.65, 0);

    const boot = new THREE.Mesh(bootDomeGeo, antiqueBrassMat);
    boot.scale.set(0.95, 0.85, 1.32);
    boot.position.set(0, -0.73, 0.055);

    const sole = new THREE.Mesh(bootSoleGeo, warmBronzeMat);
    sole.scale.set(0.96, 1, 1.32);
    sole.position.set(0, -0.735, 0.055);

    legGroup.add(hip, thigh, knee, shin, shinCuff, boot, sole);
    return legGroup;
  };

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);
  bodyGroup.add(leftLeg, rightLeg);

  // ===================== 3. ICONIC ARMS: THIN BRONZE RODS + CHUNKY LATHE CREAM GAUNTLETS + HANDS =====================
  const shoulderBallGeo = trackGeo(new THREE.SphereGeometry(0.138, 18, 14));
  const upperRodGeo = trackGeo(new THREE.CylinderGeometry(0.05, 0.048, 0.25, 14));
  const elbowBallGeo = trackGeo(new THREE.SphereGeometry(0.088, 14, 12));

  // Plump tapered cream porcelain forearm gauntlet via LatheGeometry!
  const gauntletProfile = [
    new THREE.Vector2(0.055, 0.0),
    new THREE.Vector2(0.095, -0.05),
    new THREE.Vector2(0.112, -0.16),
    new THREE.Vector2(0.118, -0.27),
    new THREE.Vector2(0.092, -0.3),
    new THREE.Vector2(0.04, -0.3),
  ];
  const gauntletGeo = trackGeo(new THREE.LatheGeometry(gauntletProfile, 20));
  const wristCuffGeo = trackGeo(new THREE.TorusGeometry(0.105, 0.022, 10, 20));
  const handPalmGeo = trackGeo(new THREE.SphereGeometry(0.085, 14, 12));
  const fingerGeo = trackGeo(new THREE.CapsuleGeometry(0.022, 0.065, 6, 8));

  const buildArm = (side: -1 | 1): THREE.Group => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.46, 0.27, 0);

    const shoulder = new THREE.Mesh(shoulderBallGeo, antiqueBrassMat);
    const upperRod = new THREE.Mesh(upperRodGeo, darkSteelMat);
    upperRod.position.set(side * 0.05, -0.15, 0.02);
    upperRod.rotation.z = -side * 0.22;

    const elbow = new THREE.Mesh(elbowBallGeo, antiqueBrassMat);
    elbow.position.set(side * 0.095, -0.28, 0.05);

    const gauntlet = new THREE.Mesh(gauntletGeo, creamEnamelMat);
    gauntlet.position.set(side * 0.1, -0.3, 0.06);
    gauntlet.rotation.z = -side * 0.14;
    gauntlet.rotation.x = -0.24;

    const cuff = new THREE.Mesh(wristCuffGeo, antiqueBrassMat);
    cuff.rotation.x = Math.PI / 2 - 0.24;
    cuff.position.set(side * 0.135, -0.57, 0.13);

    const palm = new THREE.Mesh(handPalmGeo, warmBronzeMat);
    palm.position.set(side * 0.145, -0.64, 0.15);

    const f1 = new THREE.Mesh(fingerGeo, antiqueBrassMat);
    f1.position.set(side * 0.115, -0.71, 0.18);
    const f2 = new THREE.Mesh(fingerGeo, antiqueBrassMat);
    f2.position.set(side * 0.175, -0.71, 0.15);
    const thumb = new THREE.Mesh(fingerGeo, antiqueBrassMat);
    thumb.position.set(side * 0.08, -0.66, 0.17);
    thumb.rotation.z = side * 0.6;

    arm.add(shoulder, upperRod, elbow, gauntlet, cuff, palm, f1, f2, thumb);
    return arm;
  };

  // Viewer's LEFT arm (side = -1) holds the iconic golden observatory lantern!
  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);
  bodyGroup.add(leftArm, rightArm);

  // Sculpted Hanging Brass Observatory Lantern (matching Title Screen silhouette!)
  const lanternPivot = new THREE.Group();
  lanternPivot.position.set(-0.145, -0.69, 0.19);
  leftArm.add(lanternPivot);

  const handleRingGeo = trackGeo(new THREE.TorusGeometry(0.082, 0.015, 10, 20));
  const handleRing = new THREE.Mesh(handleRingGeo, antiqueBrassMat);
  handleRing.position.y = -0.05;
  lanternPivot.add(handleRing);

  const lanternRoofGeo = trackGeo(new THREE.ConeGeometry(0.185, 0.13, 6));
  const lanternRoof = new THREE.Mesh(lanternRoofGeo, antiqueBrassMat);
  lanternRoof.position.y = -0.17;
  lanternPivot.add(lanternRoof);

  const lanternRimTopGeo = trackGeo(new THREE.CylinderGeometry(0.17, 0.15, 0.035, 6));
  const lanternRimTop = new THREE.Mesh(lanternRimTopGeo, warmBronzeMat);
  lanternRimTop.position.y = -0.24;
  lanternPivot.add(lanternRimTop);

  const lanternGlassGeo = trackGeo(new THREE.CylinderGeometry(0.135, 0.115, 0.28, 6));
  const lanternGlass = new THREE.Mesh(lanternGlassGeo, lanternGlassMat);
  lanternGlass.position.y = -0.39;
  lanternGlass.renderOrder = 2;
  lanternPivot.add(lanternGlass);

  const flameGeo = trackGeo(new THREE.SphereGeometry(0.068, 14, 12));
  const flameMesh = new THREE.Mesh(flameGeo, lanternFlameMat);
  flameMesh.scale.set(0.75, 1.45, 0.75);
  flameMesh.position.y = -0.4;
  lanternPivot.add(flameMesh);

  const barGeo = trackGeo(new THREE.CylinderGeometry(0.013, 0.013, 0.29, 6));
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const bar = new THREE.Mesh(barGeo, warmBronzeMat);
    bar.position.set(Math.cos(angle) * 0.132, -0.39, Math.sin(angle) * 0.132);
    lanternPivot.add(bar);
  }

  const lanternBaseGeo = trackGeo(new THREE.CylinderGeometry(0.16, 0.13, 0.075, 6));
  const lanternBase = new THREE.Mesh(lanternBaseGeo, antiqueBrassMat);
  lanternBase.position.y = -0.55;
  lanternPivot.add(lanternBase);

  // ===================== 4. WIDE SERENE OBSERVATORY HEAD (Exact Title Screen Proportions!) =====================
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.0, 0);
  bodyGroup.add(headGroup);

  // Wide, pillowy cream-porcelain head dome
  const headGeo = trackGeo(new THREE.SphereGeometry(0.45, 34, 26));
  const headMesh = new THREE.Mesh(headGeo, creamEnamelMat);
  headMesh.scale.set(1.16, 0.94, 0.96);
  headMesh.castShadow = !isSoftwareGl;
  headGroup.add(headMesh);

  // Flush curved golden skullcap plate on top of forehead (clean & sleek, NO dark ring across face!)
  const crownCapGeo = trackGeo(
    new THREE.SphereGeometry(0.456, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.27)
  );
  const crownCap = new THREE.Mesh(crownCapGeo, antiqueBrassMat);
  crownCap.scale.set(1.16, 0.95, 0.96);
  crownCap.position.set(0, 0.025, 0.0);
  headGroup.add(crownCap);

  // Golden lower jaw / chin plate (giving that sleek serene Title Screen jaw separation!)
  const chinCapGeo = trackGeo(
    new THREE.SphereGeometry(0.455, 28, 14, 0, Math.PI * 2, Math.PI * 0.68, Math.PI * 0.32)
  );
  const chinCap = new THREE.Mesh(chinCapGeo, antiqueBrassMat);
  chinCap.scale.set(1.16, 0.94, 0.96);
  chinCap.position.set(0, 0.0, 0.0);
  headGroup.add(chinCap);

  // Wide sleek serene smile seam separating cream cheeks from golden chin!
  const smileSeamGeo = trackGeo(new THREE.TorusGeometry(0.425, 0.014, 8, 36, Math.PI * 0.56));
  const smileSeam = new THREE.Mesh(smileSeamGeo, warmBronzeMat);
  smileSeam.rotation.x = Math.PI / 2 + 0.22;
  smileSeam.rotation.z = -Math.PI * 0.78;
  smileSeam.scale.set(1.14, 0.96, 1);
  smileSeam.position.set(0, -0.15, 0.04);
  headGroup.add(smileSeam);

  // Vintage Brass Ear Dials on both sides
  const earBaseGeo = trackGeo(new THREE.CylinderGeometry(0.115, 0.135, 0.1, 20));
  const earRingGeo = trackGeo(new THREE.TorusGeometry(0.11, 0.02, 10, 20));

  const leftEar = new THREE.Mesh(earBaseGeo, antiqueBrassMat);
  leftEar.rotation.z = Math.PI / 2;
  leftEar.position.set(-0.52, -0.02, 0);
  const leftEarRing = new THREE.Mesh(earRingGeo, warmBronzeMat);
  leftEarRing.rotation.y = Math.PI / 2;
  leftEarRing.position.set(-0.56, -0.02, 0);

  const rightEar = new THREE.Mesh(earBaseGeo, antiqueBrassMat);
  rightEar.rotation.z = Math.PI / 2;
  rightEar.position.set(0.52, -0.02, 0);
  const rightEarRing = new THREE.Mesh(earRingGeo, warmBronzeMat);
  rightEarRing.rotation.y = Math.PI / 2;
  rightEarRing.position.set(0.56, -0.02, 0);
  headGroup.add(leftEar, leftEarRing, rightEar, rightEarRing);

  // Wide-set warm golden-amber eyes in recessed bronze-and-brass bezels!
  const eyeSocketGeo = trackGeo(new THREE.TorusGeometry(0.122, 0.028, 14, 28));
  const eyeInnerRimGeo = trackGeo(new THREE.TorusGeometry(0.1, 0.015, 10, 24));
  const eyeGlowGeo = trackGeo(new THREE.SphereGeometry(0.102, 20, 16));

  const leftEyeSocket = new THREE.Mesh(eyeSocketGeo, antiqueBrassMat);
  leftEyeSocket.position.set(-0.2, 0.02, 0.395);
  leftEyeSocket.rotation.y = -0.32;

  const leftEyeInnerRim = new THREE.Mesh(eyeInnerRimGeo, warmBronzeMat);
  leftEyeInnerRim.position.set(-0.2, 0.02, 0.408);
  leftEyeInnerRim.rotation.y = -0.32;

  const leftEye = new THREE.Mesh(eyeGlowGeo, eyeGlowMat);
  leftEye.position.set(-0.2, 0.02, 0.388);
  leftEye.rotation.y = -0.32;
  leftEye.scale.set(1, 1, 0.45);

  const rightEyeSocket = new THREE.Mesh(eyeSocketGeo, antiqueBrassMat);
  rightEyeSocket.position.set(0.2, 0.02, 0.395);
  rightEyeSocket.rotation.y = 0.32;

  const rightEyeInnerRim = new THREE.Mesh(eyeInnerRimGeo, warmBronzeMat);
  rightEyeInnerRim.position.set(0.2, 0.02, 0.408);
  rightEyeInnerRim.rotation.y = 0.32;

  const rightEye = new THREE.Mesh(eyeGlowGeo, eyeGlowMat);
  rightEye.position.set(0.2, 0.02, 0.388);
  rightEye.rotation.y = 0.32;
  rightEye.scale.set(1, 1, 0.45);

  headGroup.add(
    leftEyeSocket,
    leftEyeInnerRim,
    leftEye,
    rightEyeSocket,
    rightEyeInnerRim,
    rightEye
  );

  // Sleek Expressive Clippy-Style Brass Eyebrows (delicate & proportional!)
  const browGeo = trackGeo(new THREE.CapsuleGeometry(0.019, 0.135, 6, 10));
  const leftBrow = new THREE.Mesh(browGeo, warmBronzeMat);
  leftBrow.rotation.z = Math.PI / 2;
  leftBrow.rotation.y = -0.28;
  leftBrow.position.set(-0.2, 0.165, 0.405);

  const rightBrow = new THREE.Mesh(browGeo, warmBronzeMat);
  rightBrow.rotation.z = Math.PI / 2;
  rightBrow.rotation.y = 0.28;
  rightBrow.position.set(0.2, 0.165, 0.405);
  headGroup.add(leftBrow, rightBrow);

  // Offset Brass Antenna Stalk + Warm Golden Orb (compact height so it NEVER clips!)
  const antennaMountGeo = trackGeo(new THREE.CylinderGeometry(0.048, 0.072, 0.055, 14));
  const antennaMount = new THREE.Mesh(antennaMountGeo, antiqueBrassMat);
  antennaMount.position.set(0.12, 0.42, -0.02);
  antennaMount.rotation.z = -0.22;
  headGroup.add(antennaMount);

  const stalkGeo = trackGeo(new THREE.CylinderGeometry(0.018, 0.028, 0.19, 12));
  const stalk = new THREE.Mesh(stalkGeo, warmBronzeMat);
  stalk.position.set(0.15, 0.52, -0.02);
  stalk.rotation.z = -0.22;
  headGroup.add(stalk);

  const bulbGeo = trackGeo(new THREE.SphereGeometry(0.068, 16, 14));
  const antennaBulb = new THREE.Mesh(bulbGeo, antennaBulbMat);
  antennaBulb.position.set(0.18, 0.63, -0.02);
  headGroup.add(antennaBulb);

  // Clippy Emotion Prop A: Floating Lightbulb ("Idée!")
  const ideaBulbGroup = new THREE.Group();
  ideaBulbGroup.position.set(-0.46, 0.54, 0.14);
  const ideaGlassGeo = trackGeo(new THREE.SphereGeometry(0.12, 16, 14));
  const ideaGlassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffef99,
      emissive: 0xf5b31a,
      emissiveIntensity: 1.45,
      roughness: 0.18,
    })
  );
  const ideaBaseGeo = trackGeo(new THREE.CylinderGeometry(0.05, 0.042, 0.07, 12));
  const ideaGlass = new THREE.Mesh(ideaGlassGeo, ideaGlassMat);
  const ideaBase = new THREE.Mesh(ideaBaseGeo, antiqueBrassMat);
  ideaBase.position.y = -0.12;
  ideaBulbGroup.add(ideaGlass, ideaBase);
  ideaBulbGroup.visible = false;
  headGroup.add(ideaBulbGroup);

  // Clippy Emotion Prop B: Orbiting Celebration Star Crown ("Bravo!")
  const starCrownGroup = new THREE.Group();
  starCrownGroup.position.set(0, 0.66, 0);
  const starGeo = trackGeo(new THREE.OctahedronGeometry(0.072, 0));
  const starMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.4,
      roughness: 0.18,
      metalness: 0.6,
    })
  );
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.set(Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4);
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
    lanternPivot,
    leftLeg,
    rightLeg,
    leftEye,
    rightEye,
    leftBrow,
    rightBrow,
    antennaBulb,
    antennaBulbMat,
    chestCoreMat,
    lanternFlameMat,
    eyeGlowMat,
    shadowDisc,
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
  happy: 0xe89b24,
  curious: 0x38bdf8,
  thinking: 0xa78bfa,
  idea: 0xfacc15,
  celebrating: 0x34d399,
  surprised: 0xfb7185,
};

const _targetColor = new THREE.Color();

/**
 * Animates the Title-Screen-faithful 3D Observatory Robot with Clippy expressions,
 * gentle breathing & standing poise, joyful hops, and swinging brass lantern physics.
 * Zero per-frame allocations.
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

  // 1. Grounded lively breathing + subtle hop on poke or celebration (kept comfortably inside frame)
  const breath = Math.sin(elapsed * 2.3) * 0.022;
  const cheerHop = emotion === 'celebrating' ? Math.abs(Math.sin(elapsed * 5.0)) * 0.11 : 0;
  const pokeHop = pokeTimer > 0 ? Math.abs(Math.sin(pokeTimer * Math.PI * 2.5)) * 0.13 : 0;
  const bodyLift = breath + cheerHop + pokeHop;
  rig.bodyGroup.position.y = bodyLift;

  const shadowScale = Math.max(0.78, 1 - bodyLift * 0.8);
  rig.shadowDisc.scale.set(shadowScale, shadowScale, 1);

  const lLegTarget =
    emotion === 'celebrating'
      ? Math.sin(elapsed * 10.0) * 0.2
      : pokeTimer > 0
      ? Math.sin(pokeTimer * Math.PI * 3) * 0.16
      : 0;
  const rLegTarget = -lLegTarget;
  rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, lLegTarget, 10, safeDt);
  rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, rLegTarget, 10, safeDt);

  // 2. Smooth gaze tracking + charming Title-Screen slight head cock!
  let targetHeadY = THREE.MathUtils.clamp(pointerX * 0.4, -0.44, 0.44);
  let targetHeadX = THREE.MathUtils.clamp(-pointerY * 0.2, -0.22, 0.22);
  let targetHeadZ = -0.06; // subtle iconic inquisitive tilt like the Title Screen robot!

  if (emotion === 'curious') {
    targetHeadZ = 0.2;
  } else if (emotion === 'thinking') {
    targetHeadZ = -0.18;
    targetHeadX -= 0.09;
  } else if (emotion === 'celebrating') {
    targetHeadY += Math.sin(elapsed * 5.2) * 0.2;
    targetHeadZ = 0;
  } else if (emotion === 'surprised') {
    targetHeadZ = Math.sin(elapsed * 13) * 0.06;
  } else if (emotion === 'idea') {
    targetHeadX -= 0.06;
  }

  if (pokeTimer > 0) {
    targetHeadY += Math.sin(pokeTimer * Math.PI * 4) * 0.36;
  }

  rig.headGroup.rotation.y = THREE.MathUtils.damp(rig.headGroup.rotation.y, targetHeadY, 7, safeDt);
  rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, targetHeadX, 7, safeDt);
  rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, targetHeadZ, 7, safeDt);

  // 3. Expressive Eye Blink & Scale
  const blinkCycle = elapsed % 4.1;
  const isBlinking = blinkCycle > 3.94 && emotion !== 'surprised';
  const targetEyeScaleY = isBlinking
    ? 0.12
    : emotion === 'surprised'
    ? 1.22
    : emotion === 'celebrating'
    ? 0.88
    : 1.0;
  const targetEyeScaleX = emotion === 'surprised' ? 1.14 : 1.0;

  rig.leftEye.scale.y = THREE.MathUtils.damp(rig.leftEye.scale.y, targetEyeScaleY, 18, safeDt);
  rig.rightEye.scale.y = THREE.MathUtils.damp(rig.rightEye.scale.y, targetEyeScaleY, 18, safeDt);
  rig.leftEye.scale.x = THREE.MathUtils.damp(rig.leftEye.scale.x, targetEyeScaleX, 14, safeDt);
  rig.rightEye.scale.x = THREE.MathUtils.damp(rig.rightEye.scale.x, targetEyeScaleX, 14, safeDt);

  // 4. Clippy Articulated Brass Eyebrows
  let lBrowY = 0.165;
  let rBrowY = 0.165;
  let lBrowRot = Math.PI / 2;
  let rBrowRot = Math.PI / 2;

  if (emotion === 'curious') {
    lBrowY = 0.155;
    rBrowY = 0.22;
    lBrowRot = Math.PI / 2 - 0.1;
    rBrowRot = Math.PI / 2 + 0.22;
  } else if (emotion === 'thinking') {
    lBrowY = 0.148;
    rBrowY = 0.148;
    lBrowRot = Math.PI / 2 - 0.22;
    rBrowRot = Math.PI / 2 + 0.22;
  } else if (emotion === 'surprised' || emotion === 'idea') {
    lBrowY = 0.22;
    rBrowY = 0.22;
    lBrowRot = Math.PI / 2 + 0.14;
    rBrowRot = Math.PI / 2 - 0.14;
  } else if (emotion === 'celebrating') {
    const cheer = Math.sin(elapsed * 8) * 0.02;
    lBrowY = 0.2 + cheer;
    rBrowY = 0.2 + cheer;
  }

  rig.leftBrow.position.y = THREE.MathUtils.damp(rig.leftBrow.position.y, lBrowY, 10, safeDt);
  rig.rightBrow.position.y = THREE.MathUtils.damp(rig.rightBrow.position.y, rBrowY, 10, safeDt);
  rig.leftBrow.rotation.z = THREE.MathUtils.damp(rig.leftBrow.rotation.z, lBrowRot, 10, safeDt);
  rig.rightBrow.rotation.z = THREE.MathUtils.damp(rig.rightBrow.rotation.z, rBrowRot, 10, safeDt);

  // 5. Arm Gestures (leftArm holds lantern proudly out like Title Screen; rightArm hangs gracefully or waves!)
  let lArmZ = -0.52 + Math.sin(elapsed * 2.0) * 0.04;
  let lArmX = -0.45;
  let rArmZ = -0.05 - Math.sin(elapsed * 2.0) * 0.04;
  let rArmX = 0;

  if (emotion === 'celebrating') {
    lArmZ = -0.78 + Math.sin(elapsed * 7) * 0.14;
    lArmX = -0.75;
    rArmZ = -2.15 - Math.sin(elapsed * 8) * 0.2;
  } else if (emotion === 'idea') {
    lArmZ = -0.68;
    lArmX = -0.62;
    rArmZ = -1.95;
  } else if (emotion === 'thinking') {
    rArmX = -0.78;
    rArmZ = -0.55;
  } else if (emotion === 'happy' && pokeTimer > 0) {
    rArmZ = -1.9 + Math.sin(elapsed * 15) * 0.32;
  } else if (emotion === 'curious') {
    lArmZ = -0.62;
    lArmX = -0.56;
    rArmZ = -0.35;
  } else if (emotion === 'surprised') {
    lArmZ = -0.82;
    rArmZ = -1.05;
  }

  rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, lArmZ, 8, safeDt);
  rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, lArmX, 8, safeDt);
  rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, rArmZ, 9, safeDt);
  rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, rArmX, 9, safeDt);

  // Counter-rotate hanging lantern so gravity always pulls it straight down with gentle pendulum sway!
  const swayZ = -rig.leftArm.rotation.z + Math.sin(elapsed * 2.6) * 0.07;
  const swayX = -rig.leftArm.rotation.x + Math.cos(elapsed * 2.2) * 0.05;
  rig.lanternPivot.rotation.z = THREE.MathUtils.damp(rig.lanternPivot.rotation.z, swayZ, 10, safeDt);
  rig.lanternPivot.rotation.x = THREE.MathUtils.damp(rig.lanternPivot.rotation.x, swayX, 10, safeDt);

  // Warm flickering candlelight pulse in lantern
  const flamePulse = 1.35 + Math.sin(elapsed * 7.2) * 0.2 + (emotion === 'idea' ? 0.45 : 0);
  rig.lanternFlameMat.emissiveIntensity = flamePulse;

  // 6. Emotion Beacon Color + Floating Props
  _targetColor.setHex(EMOTION_HEX[emotion]);
  rig.antennaBulbMat.emissive.lerp(_targetColor, 1 - Math.exp(-8 * safeDt));
  rig.chestCoreMat.emissive.lerp(_targetColor, 1 - Math.exp(-2.5 * safeDt));

  rig.ideaBulbGroup.visible = emotion === 'idea';
  if (rig.ideaBulbGroup.visible) {
    rig.ideaBulbGroup.position.y = 0.54 + Math.sin(elapsed * 5) * 0.05;
    rig.ideaBulbGroup.rotation.y = elapsed * 1.8;
  }

  rig.starCrownGroup.visible = emotion === 'celebrating';
  if (rig.starCrownGroup.visible) {
    rig.starCrownGroup.rotation.y = elapsed * 2.6;
  }
}
