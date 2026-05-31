/**
 * InteractiveGlobe Component
 * ----------------------------
 * A high-end WebGL interactive 3D globe built using Three.js.
 * Features:
 * - Particle-based wireframe sphere (dynamic dot matrix)
 * - Atmospheric particle halo (revolving starfield)
 * - Animated city pulse markers (glowing 3D coordinates)
 * - Bezier energy waves connecting active regions
 * - Mouse drag controls & hover parallax inertia
 * - Full responsive canvas resizing
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function InteractiveGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // ─── Scene & Camera Setup ──────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030303, 0.0015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ─── Globe Definition ──────────────────────────────────────────────
    const globeRadius = 60;
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // ─── Cinematic Lighting Setup (For Photorealistic Low-Poly Shading) ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(120, 150, 100);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.4); // Tech-cyan rim fill light
    rimLight.position.set(-120, -80, -100);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111827, 0.3); // Sky/Ground ambient gradient
    scene.add(hemiLight);

    // Helper: Map spherical coordinates
    const getLatLongOnSphere = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
    };

    // 1. Draw a highly recognizable Earth outline on an in-memory canvas
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = 360;
    mapCanvas.height = 180;
    const mapCtx = mapCanvas.getContext('2d');
    if (mapCtx) {
      mapCtx.fillStyle = '#000000';
      mapCtx.fillRect(0, 0, 360, 180);
      mapCtx.fillStyle = '#ffffff';

      const drawPolygon = (points: { lat: number; lon: number }[]) => {
        mapCtx.beginPath();
        points.forEach((pt, idx) => {
          const x = pt.lon + 180;
          const y = 90 - pt.lat;
          if (idx === 0) mapCtx.moveTo(x, y);
          else mapCtx.lineTo(x, y);
        });
        mapCtx.closePath();
        mapCtx.fill();
      };

      // North America
      drawPolygon([
        { lat: 70, lon: -168 },
        { lat: 75, lon: -100 },
        { lat: 80, lon: -40 },
        { lat: 60, lon: -40 },
        { lat: 45, lon: -50 },
        { lat: 25, lon: -80 },
        { lat: 20, lon: -100 },
        { lat: 10, lon: -80 },
        { lat: 15, lon: -105 },
        { lat: 30, lon: -120 },
        { lat: 50, lon: -130 },
        { lat: 60, lon: -140 },
      ]);

      // South America
      drawPolygon([
        { lat: 10, lon: -80 },
        { lat: -5, lon: -35 },
        { lat: -35, lon: -50 },
        { lat: -55, lon: -70 },
        { lat: -40, lon: -75 },
        { lat: -20, lon: -75 },
        { lat: -5, lon: -80 },
      ]);

      // Africa
      drawPolygon([
        { lat: 35, lon: -10 },
        { lat: 36, lon: 15 },
        { lat: 30, lon: 32 },
        { lat: 10, lon: 51 },
        { lat: -34, lon: 20 },
        { lat: -30, lon: 15 },
        { lat: -5, lon: 10 },
        { lat: 5, lon: 10 },
        { lat: 15, lon: -17 },
      ]);

      // Eurasia (Europe + Asia)
      drawPolygon([
        { lat: 70, lon: 10 },
        { lat: 80, lon: 80 },
        { lat: 70, lon: 180 },
        { lat: 55, lon: 160 },
        { lat: 35, lon: 140 },
        { lat: 20, lon: 110 },
        { lat: 10, lon: 105 },
        { lat: 10, lon: 75 },
        { lat: 15, lon: 45 },
        { lat: 20, lon: 35 },
        { lat: 30, lon: 32 },
        { lat: 40, lon: 0 },
      ]);

      // Australia
      drawPolygon([
        { lat: -20, lon: 115 },
        { lat: -15, lon: 145 },
        { lat: -35, lon: 150 },
        { lat: -35, lon: 115 },
      ]);

      // Greenland
      drawPolygon([
        { lat: 80, lon: -60 },
        { lat: 80, lon: -30 },
        { lat: 60, lon: -40 },
        { lat: 60, lon: -55 },
      ]);
    }

    const imgData = mapCtx ? mapCtx.getImageData(0, 0, 360, 180) : null;
    const data = imgData ? imgData.data : new Uint8ClampedArray(360 * 180 * 4);

    // 1. Create a beautiful faceted low-poly ocean sphere
    const oceanGeo = new THREE.IcosahedronGeometry(globeRadius - 0.5, 3);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Rich deep ocean blue
      flatShading: true,
      roughness: 0.7,
      metalness: 0.15,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    globeGroup.add(oceanMesh);

    // 2. Generate Low-Poly Land Tiles (extruding outward from land pixels)
    // Scan at a grid step of 3.8 degrees to get a beautifully dense but highly performant low-poly mesh
    for (let lat = -80; lat <= 80; lat += 3.8) {
      for (let lon = -180; lon < 180; lon += 3.8) {
        const xCanvas = Math.round(lon + 180);
        const yCanvas = Math.round(90 - lat);
        
        if (xCanvas >= 0 && xCanvas < 360 && yCanvas >= 0 && yCanvas < 180) {
          const pixelIdx = (yCanvas * 360 + xCanvas) * 4;
          const isLand = data[pixelIdx] > 128;

          if (isLand) {
            const pos = getLatLongOnSphere(lat, lon, globeRadius - 0.2);
            const upVec = pos.clone().normalize();
            const targetPos = pos.clone().add(upVec);

            // Determine landscape biome color
            let landColor = 0x22c55e; // Grass green
            if (Math.abs(lat) > 55) {
              landColor = 0xf9fafb; // Arctic snow
            } else if (Math.abs(lat) < 20 && Math.random() > 0.6) {
              landColor = 0xeab308; // Desert sand (golden)
            } else if (Math.random() > 0.65) {
              landColor = 0x16a34a; // Rich forest green
            } else if (Math.random() > 0.85) {
              landColor = 0xca8a04; // Autumn fields
            }

            // Extruded low-poly block
            const tHeight = 1.0 + Math.random() * 3.0; // Rugged vertical terrain height
            const tileGeo = new THREE.BoxGeometry(4.0, 4.0, tHeight);
            tileGeo.translate(0, 0, tHeight / 2); // Shift so base sits on sphere

            const tileMat = new THREE.MeshStandardMaterial({
              color: landColor,
              flatShading: true,
              roughness: 0.85,
              metalness: 0.05,
            });

            const tileMesh = new THREE.Mesh(tileGeo, tileMat);
            tileMesh.position.copy(pos);
            tileMesh.lookAt(targetPos);
            globeGroup.add(tileMesh);

            // 3. Populate Little Low-Poly Trees occasionally on green biomes
            if ((landColor === 0x22c55e || landColor === 0x16a34a) && Math.random() > 0.86) {
              const treeGroup = new THREE.Group();

              // Trunk (Brown box/cylinder)
              const trunkHeight = 0.8 + Math.random() * 0.8;
              const trunkGeo = new THREE.CylinderGeometry(0.18, 0.22, trunkHeight, 4);
              trunkGeo.rotateX(Math.PI / 2); // Align Z-axis
              const trunkMat = new THREE.MeshStandardMaterial({
                color: 0x78350f,
                flatShading: true,
                roughness: 0.9,
              });
              const trunk = new THREE.Mesh(trunkGeo, trunkMat);
              trunk.position.z = tHeight; // Sit on top of land block
              treeGroup.add(trunk);

              // Foliage (Green octahedron/cone)
              const foliageSize = 0.7 + Math.random() * 0.6;
              const foliageGeo = new THREE.ConeGeometry(foliageSize, foliageSize * 2.0, 4);
              foliageGeo.rotateX(Math.PI / 2); // Align Z-axis
              const foliageMat = new THREE.MeshStandardMaterial({
                color: 0x15803d,
                flatShading: true,
                roughness: 0.8,
              });
              const foliage = new THREE.Mesh(foliageGeo, foliageMat);
              foliage.position.z = tHeight + trunkHeight + (foliageSize * 0.5);
              treeGroup.add(foliage);

              treeGroup.position.copy(pos);
              treeGroup.lookAt(targetPos);
              globeGroup.add(treeGroup);
            }
          }
        }
      }
    }

    // 4. Create Floating Low-Poly Clouds rotating around the atmosphere
    const cloudGroup = new THREE.Group();
    globeGroup.add(cloudGroup);

    const cloudCount = 12;
    for (let c = 0; c < cloudCount; c++) {
      const singleCloud = new THREE.Group();
      
      const cloudRadius = globeRadius + 12 + Math.random() * 6;
      
      // Evenly distribute in orbit
      const theta = (c / cloudCount) * Math.PI * 2 + Math.random() * 0.4;
      const phi = Math.acos((Math.random() * 0.7) - 0.35); // Concentrate clouds around standard visible lat

      const x = cloudRadius * Math.sin(phi) * Math.cos(theta);
      const y = cloudRadius * Math.sin(phi) * Math.sin(theta);
      const z = cloudRadius * Math.cos(phi);

      const partCount = 3 + Math.floor(Math.random() * 3);
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.95,
        metalness: 0.05,
        flatShading: true,
        transparent: true,
        opacity: 0.95,
      });

      for (let p = 0; p < partCount; p++) {
        const pSize = 2.0 + Math.random() * 3.0;
        const partGeo = new THREE.DodecahedronGeometry(pSize, 0);
        const part = new THREE.Mesh(partGeo, cloudMat);
        
        // Offset parts to create a beautiful, fluffy low-poly cloud cluster
        part.position.set(
          (Math.random() - 0.5) * 3.5,
          (Math.random() - 0.5) * 2.2,
          (Math.random() - 0.5) * 2.2
        );
        singleCloud.add(part);
      }

      singleCloud.position.set(x, y, z);
      singleCloud.lookAt(new THREE.Vector3(0, 0, 0));
      cloudGroup.add(singleCloud);
    }

    const pulseBeacons: THREE.Mesh[] = [];
    const pulseMaterials: THREE.ShaderMaterial[] = [];

    // Predefined active coordinates representing civic nodes (e.g., city hotspots)
    const coordinates = [
      { lat: 26.2183, lon: 78.1828 }, // Maharaj Bada
      { lat: 26.2483, lon: 78.2028 }, // Morar Bypass
      { lat: 26.1983, lon: 78.1628 }, // Lashkar West
      { lat: 26.2283, lon: 78.2328 }, // Phool Bagh
      { lat: 19.0760, lon: 72.8777 }, // Mumbai Outpost
      { lat: 28.6139, lon: 77.2090 }, // Delhi Outpost
      { lat: 12.9716, lon: 77.5946 }, // Bangalore Outpost
    ];

    // Pulsing Beacon Shader
    const beaconVertex = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const beaconFragment = `
      uniform float time;
      uniform vec3 glowColor;
      varying vec2 vUv;
      void main() {
        float pulse = sin(time * 6.0) * 0.5 + 0.5;
        float dist = distance(vUv, vec2(0.5));
        float alpha = smoothstep(0.5, 0.0, dist) * (0.3 + 0.7 * pulse);
        if (dist > 0.5) discard;
        gl_FragColor = vec4(glowColor, alpha * 0.8);
      }
    `;

    // Instantiate Glowing Beacons
    coordinates.forEach((coord, i) => {
      const pos = getLatLongOnSphere(coord.lat, coord.lon, globeRadius + 0.2);

      const beaconMat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          glowColor: { value: new THREE.Color(i % 3 === 0 ? 0xff3b30 : i % 2 === 0 ? 0x00f0ff : 0x8a2be2) },
        },
        vertexShader: beaconVertex,
        fragmentShader: beaconFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      // Construct flat ring oriented towards sphere surface
      const planeGeo = new THREE.PlaneGeometry(6, 6);
      const planeMesh = new THREE.Mesh(planeGeo, beaconMat);
      planeMesh.position.copy(pos);
      planeMesh.lookAt(new THREE.Vector3(0, 0, 0));
      planeMesh.translateZ(0.1);

      globeGroup.add(planeMesh);
      pulseBeacons.push(planeMesh);
      pulseMaterials.push(beaconMat);

      // ─── Add Low-Poly skyscraper cluster on top of beacons ───────────
      const upVec = pos.clone().normalize();
      const targetPos = pos.clone().add(upVec);
      
      const cityGroup = new THREE.Group();
      const towerColors = [0x94a3b8, 0xcbd5e1, 0xe2e8f0, 0xf1f5f9]; // Silver-gray metallics
      
      const towerCount = 2 + Math.floor(Math.random() * 2);
      let maxHeight = 0;

      for (let t = 0; t < towerCount; t++) {
        const tHeight = 6.0 + Math.random() * 8.0;
        const tWidth = 1.2 + Math.random() * 0.6;
        if (tHeight > maxHeight) maxHeight = tHeight;
        
        const towerGeo = new THREE.BoxGeometry(tWidth, tWidth, tHeight);
        towerGeo.translate(0, 0, tHeight / 2); // Base sits at pos
        
        const towerMat = new THREE.MeshStandardMaterial({
          color: towerColors[t % towerColors.length],
          metalness: 0.8,
          roughness: 0.2,
          flatShading: true,
        });
        
        const towerMesh = new THREE.Mesh(towerGeo, towerMat);
        
        // Cluster offsetting
        const offsetDist = 0.9;
        const offsetX = (t === 0 ? -1 : t === 1 ? 1 : 0) * offsetDist;
        const offsetY = (t === 2 ? 1 : 0) * offsetDist;
        towerMesh.position.set(offsetX, offsetY, 0);
        
        cityGroup.add(towerMesh);
      }
      
      cityGroup.position.copy(pos);
      cityGroup.lookAt(targetPos);
      globeGroup.add(cityGroup);

      // Add elegant radial spike line rising from the tallest tower roof
      const lineMat = new THREE.LineBasicMaterial({
        color: i % 3 === 0 ? 0xff3b30 : i % 2 === 0 ? 0x00f0ff : 0x8a2be2,
        transparent: true,
        opacity: 0.7,
      });
      // Start the spike line exactly from the tallest tower roof
      const startPosSpike = pos.clone().add(upVec.clone().multiplyScalar(maxHeight));
      const endPos = pos.clone().multiplyScalar(1.22);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([startPosSpike, endPos]);
      const spike = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(spike);
    });

    // 3. Cyber Arc Energy Waves (Connecting Beacons)
    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);

    const createArc = (start: THREE.Vector3, end: THREE.Vector3, colorVal: number) => {
      const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const dist = start.distanceTo(end);

      // Arc rises based on distance
      midPoint.normalize().multiplyScalar(globeRadius + dist * 0.25);

      // Quadratic Bezier Interpolation
      const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
      const curvePoints = curve.getPoints(32);

      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: colorVal,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(arcGeo, arcMat);
      arcGroup.add(line);
    };

    // Draw arcs between consecutive nodes
    for (let i = 0; i < pulseBeacons.length - 1; i++) {
      const color = i % 2 === 0 ? 0x00f0ff : 0x8a2be2;
      createArc(pulseBeacons[i].position, pulseBeacons[i + 1].position, color);
    }

    // 4. Orbital Atmospheric Starfield Halo
    const starsCount = 600;
    const starsGeometry = new THREE.BufferGeometry();
    const starsPositions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      const r = globeRadius * 1.5 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starsPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starsPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starsPositions[i * 3 + 2] = r * Math.cos(phi);
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.8,
      color: 0x52525b,
      transparent: true,
      opacity: 0.4,
    });
    const starfield = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starfield);

    // ─── Interaction & Physics Inertia ─────────────────────────────────
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationX = 0;
    let targetRotationY = 0;
    let rotationSpeedY = 0.0015;

    const handleMouseDown = () => {
      isDragging = true;
    };

    const handleMouseMove = (event: MouseEvent) => {
      const deltaMove = {
        x: event.offsetX - previousMousePosition.x,
        y: event.offsetY - previousMousePosition.y,
      };

      if (isDragging) {
        targetRotationY += deltaMove.x * 0.005;
        targetRotationX += deltaMove.y * 0.005;
      } else {
        // Hover Parallax
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseX * 25, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouseY * 25, 0.05);
        camera.lookAt(scene.position);
      }

      previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY,
      };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // ─── Animation Loop ────────────────────────────────────────────────
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Slow orbital self-rotation
      if (!isDragging) {
        targetRotationY += rotationSpeedY;
      }

      // Physics Interia smoothing
      globeGroup.rotation.y = THREE.MathUtils.lerp(globeGroup.rotation.y, targetRotationY, 0.08);
      globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, targetRotationX, 0.08);

      // Starfield counter-rotation
      starfield.rotation.y = -elapsedTime * 0.008;

      // Rotate clouds slowly in the opposite direction/orbit for dynamic parallax breeze
      cloudGroup.rotation.y = elapsedTime * 0.025;

      // Update shader materials
      pulseMaterials.forEach((mat) => {
        if (mat.uniforms.time) {
          mat.uniforms.time.value = elapsedTime;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // ─── Screen Resize System ──────────────────────────────────────────
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // ─── Cleanup ───────────────────────────────────────────────────────
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] lg:min-h-[600px] cursor-grab active:cursor-grabbing flex items-center justify-center relative overflow-hidden"
    />
  );
}
