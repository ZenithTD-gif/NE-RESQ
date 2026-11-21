'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import SceneFallback from './SceneFallback';
import { NORTHEAST_STATES, NORTHEAST_DISTRICTS } from '@shared/northeast-data';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Layers, 
  Compass, 
  MapPin, 
  Mountain,
  Waves,
  Shield,
  Home,
  Activity,
  AlertTriangle,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface TerrainHero3DProps {
  onSelectEntity?: (entity: any) => void;
  activeFilters?: {
    shelters?: boolean;
    riverGauges?: boolean;
    alerts?: boolean;
    state?: string;
  };
}

// Exact WGS84 Geographic Extents of Northeast India
const GEO_BOUNDS = {
  minLng: 88.0, // West Sikkim
  maxLng: 97.4, // East Arunachal border
  minLat: 21.8, // South Mizoram
  maxLat: 29.5, // North Arunachal border
};

const TERRAIN_DIM = {
  width: 36,
  height: 26,
  baseY: -2.0,
};

// Pure mathematical hypsometric elevation function
function computeTerrainElevation(x: number, y: number): number {
  let z = 0;

  // 1. Great Himalayan Alpine Range (North & Northwest)
  if (y > 1.2) {
    const northFactor = (y - 1.2) / 12.5;
    const alpineRidges = 
      Math.sin(x * 0.38 + 1.5) * 1.6 + 
      Math.sin(x * 0.75 - y * 0.4) * 0.9 +
      Math.cos(x * 1.2 + y * 0.6) * 0.45;
    z += Math.max(0, alpineRidges * northFactor * 2.8);

    // Kanchenjunga Massif (Sikkim far West)
    const distSikkim = Math.hypot(x - (-11.5), y - 6.5);
    if (distSikkim < 5.5) {
      z += Math.max(0, (5.5 - distSikkim) * 0.75);
    }
  }

  // 2. Shillong Plateau (Meghalaya, south of central river)
  const distMeghalaya = Math.hypot(x - (-4), y - (-1.5));
  if (distMeghalaya < 5.8) {
    z += Math.max(0, (5.8 - distMeghalaya) * 0.42);
  }

  // 3. Eastern Patkai, Naga & Barail Hills (East)
  if (x > 3 && y > -6) {
    const eastRidges = Math.sin(x * 0.5 - y * 0.8) * 1.2 + Math.cos(y * 0.4) * 0.6;
    z += Math.max(0, eastRidges * 0.8);
  }

  // 4. Mizoram & Manipur Parallel Ridges (South)
  if (y < 0 && x > 0) {
    const parallelValleys = Math.sin(x * 1.4) * 0.9 + Math.cos(y * 0.5) * 0.4;
    z += Math.max(0, parallelValleys * 0.65);
  }

  // 5. Brahmaputra Central Basin Carving (Assam Valley)
  const riverCenterY = 0.8 + Math.sin(x * 0.22) * 2.4 + Math.cos(x * 0.45) * 0.6;
  const distFromRiver = Math.abs(y - riverCenterY);

  if (distFromRiver < 4.2) {
    const valleyDepth = (1 - distFromRiver / 4.2);
    z = Math.max(0, z * (1 - valleyDepth * 0.85) + (Math.sin(x * 0.5) * 0.12));
  }

  return z;
}

// Convert GPS (lat, lng) to Three.js World (X, Y, Z) anchored to the terrain surface
function geoToWorldSurface(lat: number, lng: number): { x: number; y: number; z: number } {
  const normX = (lng - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng);
  const normY = (lat - GEO_BOUNDS.minLat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat);

  // Local plane coordinate
  const px = (normX - 0.5) * TERRAIN_DIM.width;
  const py = (normY - 0.5) * TERRAIN_DIM.height;

  // Exact elevation at (px, py)
  const elevation = computeTerrainElevation(px, py);

  // Since PlaneGeometry is oriented horizontally on X-Z:
  // World X = px
  // World Z = -py
  // World Y = baseY + elevation
  const worldX = px;
  const worldZ = -py;
  const worldY = TERRAIN_DIM.baseY + elevation;

  return { x: worldX, y: worldY, z: worldZ };
}

export default function TerrainHero3D({ onSelectEntity, activeFilters }: TerrainHero3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showRivers, setShowRivers] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Controls references
  const controlsRef = useRef<{
    resetCamera: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    focusEntity: (lat: number, lng: number) => void;
  } | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebglSupported(Boolean(gl));
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  useEffect(() => {
    if (!webglSupported || !containerRef.current) return;

    let animationFrameId: number;
    let renderer: any;
    let scene: any;
    let camera: any;

    const initThree = async () => {
      const THREE = await import('three');

      const width = containerRef.current?.clientWidth || 800;
      const height = containerRef.current?.clientHeight || 560;

      scene = new THREE.Scene();
      // Serene Apple Light Blue atmospheric background
      scene.background = new THREE.Color(0xebf3fa);
      scene.fog = new THREE.FogExp2(0xebf3fa, 0.024);

      camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
      const defaultCamPos = new THREE.Vector3(0, 24, 28);
      camera.position.copy(defaultCamPos);
      camera.lookAt(0, -0.5, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);
      }

      // Lighting Rig — Fresh Morning Light on Northeast Topography
      const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.85);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x475569, 0.65);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xfffae0, 1.4);
      keyLight.position.set(20, 36, 16);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      scene.add(keyLight);

      const cyanRimLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
      cyanRimLight.position.set(-24, 18, -18);
      scene.add(cyanRimLight);

      // 3D DIGITAL ELEVATION MODEL (DEM)
      const gridX = 120;
      const gridY = 90;
      const terrainGeo = new THREE.PlaneGeometry(TERRAIN_DIM.width, TERRAIN_DIM.height, gridX, gridY);
      const pos = terrainGeo.attributes.position;
      const colors = new Float32Array(pos.count * 3);

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = computeTerrainElevation(x, y);
        pos.setZ(i, z);

        // Natural Hypsometric Colors (Alluvial green -> ochre -> slate -> snow)
        let r = 0.22, g = 0.48, b = 0.28;

        if (z < 0.7) {
          // Lowlands / Alluvial River Basins (Lush Brahmaputra Green)
          const t = z / 0.7;
          r = THREE.MathUtils.lerp(0.18, 0.32, t);
          g = THREE.MathUtils.lerp(0.48, 0.56, t);
          b = THREE.MathUtils.lerp(0.24, 0.32, t);
        } else if (z < 1.8) {
          // Plateaus & Foothills (Shillong terracotta / ochre)
          const t = (z - 0.7) / 1.1;
          r = THREE.MathUtils.lerp(0.35, 0.58, t);
          g = THREE.MathUtils.lerp(0.48, 0.44, t);
          b = THREE.MathUtils.lerp(0.28, 0.26, t);
        } else if (z < 3.2) {
          // High Ridges (Granite Slate)
          const t = (z - 1.8) / 1.4;
          r = THREE.MathUtils.lerp(0.45, 0.52, t);
          g = THREE.MathUtils.lerp(0.42, 0.52, t);
          b = THREE.MathUtils.lerp(0.38, 0.54, t);
        } else {
          // Alpine Glacier Summits (Glaciated White)
          const t = Math.min(1, (z - 3.2) / 1.0);
          r = THREE.MathUtils.lerp(0.75, 0.98, t);
          g = THREE.MathUtils.lerp(0.80, 0.99, t);
          b = THREE.MathUtils.lerp(0.88, 1.00, t);
        }

        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }

      terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      terrainGeo.computeVertexNormals();

      const terrainMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.68,
        metalness: 0.25,
        flatShading: false,
      });

      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      // Place horizontally on X-Z plane
      terrainMesh.rotation.x = -Math.PI / 2;
      terrainMesh.position.y = TERRAIN_DIM.baseY;
      terrainMesh.receiveShadow = true;
      terrainMesh.castShadow = true;
      scene.add(terrainMesh);

      // Neon Topographic Wireframe Contour Grid
      const contourMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.16,
      });
      const contourMesh = new THREE.Mesh(terrainGeo, contourMat);
      contourMesh.rotation.x = -Math.PI / 2;
      contourMesh.position.y = TERRAIN_DIM.baseY + 0.02; // Tiny offset to prevent z-fighting
      scene.add(contourMesh);

      // GLOWING NEON RIVER NETWORK (Brahmaputra & Tributaries)
      const riverGroup = new THREE.Group();
      
      const brahmaputraCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-14, TERRAIN_DIM.baseY + 0.18, 5.5),
        new THREE.Vector3(-9, TERRAIN_DIM.baseY + 0.16, 3.2),
        new THREE.Vector3(-4, TERRAIN_DIM.baseY + 0.14, 1.2),
        new THREE.Vector3(1, TERRAIN_DIM.baseY + 0.12, -0.6),
        new THREE.Vector3(6, TERRAIN_DIM.baseY + 0.16, -2.4),
        new THREE.Vector3(11, TERRAIN_DIM.baseY + 0.22, -4.5),
        new THREE.Vector3(15, TERRAIN_DIM.baseY + 0.35, -6.8),
      ]);
      const riverGeo = new THREE.TubeGeometry(brahmaputraCurve, 80, 0.32, 10, false);
      const riverMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.7,
      });
      const riverMesh = new THREE.Mesh(riverGeo, riverMat);
      riverGroup.add(riverMesh);

      // Barak River (Southern Sector)
      const barakCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5, TERRAIN_DIM.baseY + 0.12, -3.8),
        new THREE.Vector3(-1, TERRAIN_DIM.baseY + 0.14, -4.6),
        new THREE.Vector3(4, TERRAIN_DIM.baseY + 0.18, -5.2),
      ]);
      const barakGeo = new THREE.TubeGeometry(barakCurve, 30, 0.2, 8, false);
      const barakMesh = new THREE.Mesh(barakGeo, riverMat);
      riverGroup.add(barakMesh);
      scene.add(riverGroup);

      // GROUND-ANCHORED STATE BEACONS & LOCATION MARKERS
      const markerGroup = new THREE.Group();
      const pulsingDiscs: any[] = [];

      // 8 Northeast State Capitals (Strict WGS84 coordinates)
      NORTHEAST_STATES.forEach((state) => {
        const coords = geoToWorldSurface(state.latitude, state.longitude);
        const beacon = new THREE.Group();
        beacon.position.set(coords.x, coords.y, coords.z);

        // 1. Ground Shadow (Dark contact ring directly on surface)
        const shadowGeo = new THREE.RingGeometry(0.08, 0.55, 20);
        const shadowMat = new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide,
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.01; // Sits directly on ground
        beacon.add(shadow);

        // 2. Glowing Ground Contact Indicator Disc
        const contactGeo = new THREE.CircleGeometry(0.32, 24);
        const contactMat = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        });
        const contactDisc = new THREE.Mesh(contactGeo, contactMat);
        contactDisc.rotation.x = -Math.PI / 2;
        contactDisc.position.y = 0.02;
        beacon.add(contactDisc);

        // 3. Animated Pulsing Ground Radar Wave
        const pulseGeo = new THREE.RingGeometry(0.32, 0.75, 24);
        const pulseMat = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
        });
        const pulseRing = new THREE.Mesh(pulseGeo, pulseMat);
        pulseRing.rotation.x = -Math.PI / 2;
        pulseRing.position.y = 0.025;
        beacon.add(pulseRing);
        pulsingDiscs.push(pulseRing);

        // 4. Ground-Anchored Vertical Laser Rod
        const rodHeight = 1.4;
        const rodGeo = new THREE.CylinderGeometry(0.035, 0.035, rodHeight, 8);
        const rodMat = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          transparent: true,
          opacity: 0.85,
        });
        const rod = new THREE.Mesh(rodGeo, rodMat);
        rod.position.y = rodHeight / 2; // Anchored at ground y=0, stands up
        beacon.add(rod);

        // 5. Glowing Top Beacon Diamond Node
        const headGeo = new THREE.OctahedronGeometry(0.32, 0);
        const headMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0x00f0ff,
          emissiveIntensity: 1.2,
          roughness: 0.1,
          metalness: 0.9,
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = rodHeight + 0.15;
        beacon.add(head);

        // 6. Holographic Orbit Ring around Head
        const haloGeo = new THREE.RingGeometry(0.42, 0.55, 16);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = Math.PI / 2;
        halo.position.y = rodHeight + 0.15;
        beacon.add(halo);

        beacon.userData = {
          type: 'STATE_CAPITAL',
          stateCode: state.code,
          name: state.name,
          capital: state.capital,
          eocHelpline: state.eocHelpline,
          districtsCount: state.districtsCount,
          lat: state.latitude,
          lng: state.longitude,
          sdmaWebsite: state.sdmaWebsite,
        };

        markerGroup.add(beacon);
      });

      // Ground-Anchored Verified Shelters (if active)
      const sampleShelters = [
        { id: 'sh-01', name: 'Sarusajai Relief Complex', state: 'Assam', lat: 26.1158, lng: 91.7618, cap: 2400 },
        { id: 'sh-02', name: 'Shillong Sports Complex Shelter', state: 'Meghalaya', lat: 25.5788, lng: 91.8933, cap: 1200 },
        { id: 'sh-03', name: 'Itanagar Multipurpose Hall', state: 'Arunachal Pradesh', lat: 27.0844, lng: 93.6053, cap: 950 },
      ];

      sampleShelters.forEach((sh) => {
        const coords = geoToWorldSurface(sh.lat, sh.lng);
        const shelterBeacon = new THREE.Group();
        shelterBeacon.position.set(coords.x, coords.y, coords.z);

        const contact = new THREE.Mesh(
          new THREE.CircleGeometry(0.28, 16),
          new THREE.MeshBasicMaterial({ color: 0x00ff9d, side: THREE.DoubleSide, opacity: 0.8, transparent: true })
        );
        contact.rotation.x = -Math.PI / 2;
        contact.position.y = 0.02;
        shelterBeacon.add(contact);

        const rod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8),
          new THREE.MeshBasicMaterial({ color: 0x00ff9d, opacity: 0.8, transparent: true })
        );
        rod.position.y = 0.45;
        shelterBeacon.add(rod);

        const head = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.25, 0.25),
          new THREE.MeshStandardMaterial({ color: 0x00ff9d, emissive: 0x00ff9d, emissiveIntensity: 0.9 })
        );
        head.position.y = 1.0;
        shelterBeacon.add(head);

        shelterBeacon.userData = {
          type: 'SHELTER',
          name: sh.name,
          state: sh.state,
          capacity: sh.cap,
          lat: sh.lat,
          lng: sh.lng,
        };
        markerGroup.add(shelterBeacon);
      });

      scene.add(markerGroup);

      // Atmospheric Cyber Mist Particles
      const mistCount = 120;
      const mistGeo = new THREE.BufferGeometry();
      const mistPos = new Float32Array(mistCount * 3);
      for (let i = 0; i < mistCount * 3; i += 3) {
        mistPos[i] = (Math.random() - 0.5) * 38;
        mistPos[i + 1] = Math.random() * 8 + TERRAIN_DIM.baseY;
        mistPos[i + 2] = (Math.random() - 0.5) * 28;
      }
      mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
      const mistMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.18,
        transparent: true,
        opacity: 0.35,
      });
      const mist = new THREE.Points(mistGeo, mistMat);
      scene.add(mist);

      // INTERACTIVE CAMERA & ORBIT CONTROLS
      let isDragging = false;
      let prevMousePos = { x: 0, y: 0 };
      let spherical = {
        radius: 36,
        theta: 0,
        phi: Math.PI / 3.2,
      };
      let targetLookAt = new THREE.Vector3(0, -0.5, 0);

      const updateCamera = () => {
        spherical.phi = Math.max(0.12, Math.min(Math.PI / 2.05, spherical.phi));
        spherical.radius = Math.max(10, Math.min(65, spherical.radius));

        camera.position.x = targetLookAt.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        camera.position.y = targetLookAt.y + spherical.radius * Math.cos(spherical.phi);
        camera.position.z = targetLookAt.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
        camera.lookAt(targetLookAt);
      };
      updateCamera();

      // Controls API
      controlsRef.current = {
        resetCamera: () => {
          spherical.radius = 36;
          spherical.theta = 0;
          spherical.phi = Math.PI / 3.2;
          targetLookAt.set(0, -0.5, 0);
          updateCamera();
        },
        zoomIn: () => {
          spherical.radius = Math.max(12, spherical.radius - 4);
          updateCamera();
        },
        zoomOut: () => {
          spherical.radius = Math.min(60, spherical.radius + 4);
          updateCamera();
        },
        focusEntity: (lat: number, lng: number) => {
          const world = geoToWorldSurface(lat, lng);
          targetLookAt.set(world.x, world.y, world.z);
          spherical.radius = 18;
          updateCamera();
        },
      };

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        prevMousePos = { x: e.clientX, y: e.clientY };
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        prevMousePos = { x: e.clientX, y: e.clientY };

        spherical.theta -= deltaX * 0.007;
        spherical.phi += deltaY * 0.007;
        updateCamera();
      };

      const onMouseUp = () => {
        isDragging = false;
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        spherical.radius += e.deltaY * 0.03;
        updateCamera();
      };

      // Raycaster for Marker Selection
      const raycaster = new THREE.Raycaster();
      const mouseVec = new THREE.Vector2();

      const onClick = (e: MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

        raycaster.setFromCamera(mouseVec, camera);
        const intersects = raycaster.intersectObjects(markerGroup.children, true);

        if (intersects.length > 0) {
          let topObj: any = intersects[0].object;
          while (topObj.parent && topObj.parent !== markerGroup) {
            topObj = topObj.parent;
          }
          if (topObj && topObj.userData) {
            setSelectedEntity(topObj.userData);
            if (onSelectEntity) {
              onSelectEntity(topObj.userData);
            }
            controlsRef.current?.focusEntity(topObj.userData.lat, topObj.userData.lng);
          }
        }
      };

      const domEl = containerRef.current;
      if (domEl) {
        domEl.addEventListener('mousedown', onMouseDown);
        domEl.addEventListener('wheel', onWheel, { passive: false });
        domEl.addEventListener('click', onClick);
      }
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      // Render loop with pulse animation
      let clock = new THREE.Clock();
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Animate ground radar ripple discs
        pulsingDiscs.forEach((disc, idx) => {
          const scale = 1 + (Math.sin(elapsedTime * 2.5 + idx) + 1) * 0.4;
          disc.scale.set(scale, scale, 1);
          disc.material.opacity = 0.5 - (scale - 1) * 0.4;
        });

        // Subtle ambient mist drift
        mist.rotation.y = elapsedTime * 0.02;

        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!containerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        if (domEl) {
          domEl.removeEventListener('mousedown', onMouseDown);
          domEl.removeEventListener('wheel', onWheel);
          domEl.removeEventListener('click', onClick);
        }
        renderer.dispose();
      };
    };

    initThree();
  }, [webglSupported, onSelectEntity]);

  if (webglSupported === false) {
    return <SceneFallback />;
  }

  return (
    <div className={`relative w-full h-full min-h-[580px] rounded-3xl overflow-hidden liquid-glass-card border border-cyan-500/20 bg-background ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full min-h-[580px] cursor-grab active:cursor-grabbing" />

      {/* Floating Tactical Top HUD */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-sky-200 text-xs font-bold text-charcoal shadow-sm flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t('hero3d.status', '3D GIS Terrain Engine • Ground-Anchored Nodes')}</span>
        </div>

        <div className="pointer-events-auto text-[11px] font-mono text-charcoal-muted bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-100 shadow-xs">
          WGS84 • DEM 120x90 Mesh
        </div>
      </div>

      {/* Camera Controls Panel (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => controlsRef.current?.resetCamera()}
          title="Reset Orbit View"
          className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white text-charcoal hover:text-cyan-600 border border-sky-200 transition-all shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => controlsRef.current?.zoomIn()}
          title="Zoom In"
          className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white text-charcoal hover:text-cyan-600 border border-sky-200 transition-all shadow-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => controlsRef.current?.zoomOut()}
          title="Zoom Out"
          className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white text-charcoal hover:text-cyan-600 border border-sky-200 transition-all shadow-sm"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white text-charcoal hover:text-cyan-600 border border-sky-200 transition-all shadow-sm"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Entity Intelligence Card */}
      {selectedEntity && (
        <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-md z-20 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-2xl border border-sky-200 shadow-glass-md text-charcoal">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-wider">
                {selectedEntity.type}
              </span>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-xs text-charcoal-muted hover:text-charcoal px-2 py-0.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <h4 className="text-base font-black text-charcoal tracking-tight">
              {selectedEntity.name}
            </h4>
            <p className="text-xs text-charcoal-muted mt-0.5">
              {selectedEntity.capital ? `Capital: ${selectedEntity.capital} • ${selectedEntity.districtsCount} Districts` : `Capacity: ${selectedEntity.capacity} occupants`}
            </p>

            {selectedEntity.eocHelpline && (
              <div className="mt-3 p-2.5 rounded-xl bg-emergency/10 border border-emergency/25 text-xs flex items-center justify-between">
                <span className="text-emergency font-semibold">Emergency Helpline:</span>
                <span className="font-mono font-bold text-emergency">{selectedEntity.eocHelpline}</span>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-charcoal-muted">
              <span>GPS: {selectedEntity.lat.toFixed(4)}°N, {selectedEntity.lng.toFixed(4)}°E</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ground Anchored
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tactical Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-sky-200 shadow-sm text-[11px] font-medium text-charcoal flex items-center gap-4 hidden sm:flex">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 shadow-sm" />
          <span>State Capitals (Anchored)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-sm" />
          <span>Designated Shelters</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emergency shadow-sm" />
          <span>Hazard Warning Corridors</span>
        </div>
      </div>
    </div>
  );
}
