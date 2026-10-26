import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Base orientation of a disc lying on a table, seen from above at an angle
const BASE = { x: -0.86, y: 0.12, z: 0.42 };

export function createStage(canvas, discCanvases, backAlphaCanvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-4, 6, 7);
  scene.add(key, new THREE.AmbientLight(0xffffff, 0.25));

  const aniso = renderer.capabilities.getMaxAnisotropy();
  const faceGeo = new THREE.CircleGeometry(1, 180);
  const edgeGeo = new THREE.CylinderGeometry(1, 1, 0.014, 180, 1, true);
  const backAlpha = new THREE.CanvasTexture(backAlphaCanvas);

  const discs = discCanvases.map((cv, i) => {
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = aniso;

    const front = new THREE.Mesh(
      faceGeo,
      new THREE.MeshPhysicalMaterial({
        map: tex,
        transparent: true,
        roughness: 0.4,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 0.55,
      })
    );
    front.position.z = 0.007;

    const back = new THREE.Mesh(
      faceGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0xd7dbe1,
        metalness: 1,
        roughness: 0.14,
        iridescence: 1,
        iridescenceIOR: 1.6,
        iridescenceThicknessRange: [120, 900],
        alphaMap: backAlpha,
        transparent: true,
      })
    );
    back.rotation.y = Math.PI;
    back.position.z = -0.007;

    const edge = new THREE.Mesh(
      edgeGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0xc9ced6,
        metalness: 0.5,
        roughness: 0.22,
        transparent: true,
        opacity: 0.9,
      })
    );
    edge.rotation.x = Math.PI / 2;

    const spin = new THREE.Group();
    spin.add(front, back, edge);
    spin.rotation.z = -i * 1.3;
    const tilt = new THREE.Group();
    tilt.rotation.order = 'YXZ';
    tilt.add(spin);
    const root = new THREE.Group();
    root.add(tilt);
    scene.add(root);

    const mats = [front.material, back.material, edge.material];
    const baseOpacity = mats.map((m) => m.opacity);
    return { root, tilt, spin, mats, baseOpacity, speed: 0.22 };
  });

  const state = {
    progress: 0,
    hover: false,
    pointer: { x: 0, y: 0, sx: 0, sy: 0 },
    intro: 1,
    open: 0,
    reduce: false,
    layout: null,
  };

  function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * camera.aspect;
    const mobile = camera.aspect < 0.85;
    const R = mobile ? Math.min(visW * 0.45, visH * 0.27) : Math.min(visH * 0.3, visW * 0.24);
    const Rn = R * (mobile ? 0.42 : 0.36);
    state.layout = {
      visW,
      visH,
      R,
      Rn,
      xN: visW / 2 - Rn * (mobile ? 0.35 : 0.75),
      yC: mobile ? -visH * 0.015 : -visH * 0.03,
      yN: mobile ? -visH * 0.05 : -visH * 0.07,
    };
  }
  layout();

  const v = new THREE.Vector3();
  let last = performance.now();

  function render() {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const L = state.layout;
    const p = state.progress;
    const P = state.pointer;
    P.sx += (P.x - P.sx) * 0.06;
    P.sy += (P.y - P.sy) * 0.06;

    discs.forEach((d, i) => {
      const dist = i - p;
      const ad = Math.abs(dist);
      const sd = Math.sign(dist);
      const a = Math.min(ad, 1);
      const e = a * a * (3 - 2 * a);
      const focus = 1 - e;

      let x = sd * (e * L.xN + Math.max(ad - 1, 0) * L.Rn * 3);
      let y = L.yC + (L.yN - L.yC) * e;
      let s = L.R + (L.Rn - L.R) * e;

      // intro: the centred disc drops in from below
      y -= (1 - state.intro) * L.visH * 0.9 * focus;
      // opening: the centred disc lifts away with the panel
      y += state.open * L.visH * 0.85 * focus;
      s *= 1 + state.open * 0.25 * focus;

      d.root.position.set(x, y, 0);
      d.root.scale.setScalar(s);
      d.root.rotation.z = BASE.z;
      d.tilt.rotation.x = BASE.x + P.sy * 0.12 * focus - (1 - state.intro) * 0.6 * focus;
      d.tilt.rotation.y = BASE.y - dist * 0.65 + P.sx * 0.18 * focus;

      const target = state.reduce ? 0 : focus > 0.9 && state.hover ? 2.6 : 0.22;
      d.speed += (target - d.speed) * 0.06;
      d.spin.rotation.z -= dt * (d.speed + state.open * 4 * focus + (1 - state.intro) * 3);

      const fade = Math.min(Math.max(1 - (ad - 1.15) / 0.4, 0), 1) * (focus > 0.5 ? 1 : state.intro);
      d.root.visible = fade > 0.001;
      d.mats.forEach((m, k) => (m.opacity = d.baseOpacity[k] * fade));
    });
    renderer.render(scene, camera);
  }

  // Screen-space ellipse of the centred disc, used to place the DOM hit area
  function activeEllipse() {
    const i = Math.round(state.progress);
    if (Math.abs(i - state.progress) > 0.08 || state.open > 0.01 || state.intro < 0.98) return null;
    const d = discs[i];
    d.root.updateMatrixWorld(true);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const toScreen = (vec) => {
      vec.project(camera);
      return [(vec.x * 0.5 + 0.5) * w, (-vec.y * 0.5 + 0.5) * h];
    };
    // Perspective shifts the true centre, so fit the ellipse from opposite rim points
    const N = 48;
    const pts = [];
    for (let k = 0; k < N; k++) {
      const t = (k / N) * Math.PI * 2;
      pts.push(toScreen(d.spin.localToWorld(v.set(Math.cos(t), Math.sin(t), 0))));
    }
    let max = 0;
    let min = Infinity;
    let angle = 0;
    let cx = 0;
    let cy = 0;
    for (let k = 0; k < N / 2; k++) {
      const [ax, ay] = pts[k];
      const [bx, by] = pts[k + N / 2];
      const len = Math.hypot(bx - ax, by - ay) / 2;
      if (len > max) {
        max = len;
        angle = Math.atan2(by - ay, bx - ax);
        cx = (ax + bx) / 2;
        cy = (ay + by) / 2;
      }
      if (len < min) min = len;
    }
    return { index: i, cx, cy, rx: max, ry: min, angle };
  }

  window.addEventListener('resize', layout);

  return { state, render, layout, activeEllipse, renderer };
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch {
    return false;
  }
}
