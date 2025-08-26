import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import { MeshLineMaterial } from 'https://cdn.jsdelivr.net/npm/three.meshline.module@1.0.0/src/THREE.MeshLine.Module.min.js';
import { OrbitControls }  from 'https://unpkg.com/three@0.150.1/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.150.1/examples/jsm/renderers/CSS2DRenderer.js';

/** 위/경도 → 3D 벡터 변환 */
function latLongToVector3(lat, lon, radius=5) {
  const phi   = (90 - lat) * Math.PI/180;
  const theta = (lon + 180) * Math.PI/180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

/** 중간 밀도의 얇은 메쉬 라인 구 생성 */
function createGlobeMesh(radius=5) {
  const group = new THREE.Group();
  const mat2   = new THREE.LineBasicMaterial({ color:0xcccccc, opacity:0.3, transparent:true, linewidth: 5 });
  
  const mat = new MeshLineMaterial({
      color: new THREE.Color(0xcccccc),
      lineWidth: 0.3,           // 굵기 조절
      transparent: true,
      opacity: 0.6,
      depthTest: false
    });
  
  const segs=96, latStep=20, lonStep=30;
  // 위도
  for(let lat=-60; lat<=60; lat+=latStep) {
    const phi = THREE.MathUtils.degToRad(lat);
    const r   = radius*Math.cos(phi), y=radius*Math.sin(phi), pts=[];
    for(let i=0;i<=segs;i++){
      const theta=(i/segs)*Math.PI*2;
      pts.push(new THREE.Vector3(r*Math.cos(theta), y, r*Math.sin(theta)));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
  // 경도
  for(let lon=0; lon<360; lon+=lonStep) {
    const theta = THREE.MathUtils.degToRad(lon), pts=[];
    for(let i=0;i<=segs;i++){
      const phi=(i/segs)*Math.PI;
      pts.push(new THREE.Vector3(
        radius*Math.sin(phi)*Math.cos(theta),
        radius*Math.cos(phi),
        radius*Math.sin(phi)*Math.sin(theta)
      ));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
  return group;
}

function initGlobe() {
  const container = document.querySelector('.map-wrapper');
  const W = container.clientWidth, H = container.clientHeight;

  // Scene / Camera / WebGLRenderer
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(40, W/H, 0.1, 1000);
  camera.position.set(0,0,15);

  const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(W, H);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top      = '0';
  renderer.domElement.style.left     = '0';
  renderer.domElement.style.touchAction = 'none';
  container.appendChild(renderer.domElement);

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate    = true;
  controls.enableZoom      = false;
  controls.enablePan       = false;
  controls.enableDamping   = true;
  controls.dampingFactor   = 0.05;
  controls.autoRotate      = true;
  controls.autoRotateSpeed = 0.3;

  // Globe Group
  const globeGroup = new THREE.Group();

  // 배경 구
  const bg = new THREE.Mesh(
    new THREE.SphereGeometry(5,64,64),
    new THREE.MeshBasicMaterial({ color:0xF2F2F2, transparent:true, opacity:0.5, depthWrite:false, side:THREE.DoubleSide })
  );
  bg.renderOrder = 0;
  globeGroup.add(bg);

  // 메쉬 라인
  const meshLines = createGlobeMesh(5);
  meshLines.renderOrder = 1;
  globeGroup.add(meshLines);

  // 기울기 반전: +30°, -20°
  globeGroup.rotation.x = Math.PI/6;
  globeGroup.rotation.z = -Math.PI/9;
  scene.add(globeGroup);

  // CSS2DRenderer for labels
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(W, H);
  labelRenderer.domElement.style.position      = 'absolute';
  labelRenderer.domElement.style.top           = '0';
  labelRenderer.domElement.style.left          = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  labelRenderer.domElement.style.zIndex        = '1';
  container.appendChild(labelRenderer.domElement);

  // 레이블 생성
  const locations = [
    {text:'Qualitas', lat:36.5, lon:127.5},
    {text:'China',    lat:35.9, lon:104.2},
    {text:'United States', lat:39.8, lon:-98.6}
  ];
  locations.forEach(loc => {
    const div = document.createElement('div');
    div.className = 'map-label';

	div.style.fontSize = '18px';  
	
    div.textContent = loc.text;
    const label = new CSS2DObject(div);
    label.position.copy(latLongToVector3(loc.lat, loc.lon, 5.02));

label.rotation.x = globeGroup.rotation.x;
  label.rotation.z = globeGroup.rotation.z;

    globeGroup.add(label);
  });

  window.addEventListener('resize', () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    labelRenderer.setSize(w, h);
  });

  // 애니메이션 루프
  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  })();
}

window.addEventListener('DOMContentLoaded', initGlobe);