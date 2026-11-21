'use client';

import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface EmergencyOrb3DProps {
  onTriggerSOS?: () => void;
  statusText?: string;
  isPulsing?: boolean;
}

export default function EmergencyOrb3D({
  onTriggerSOS,
  statusText = 'TAP FOR IMMEDIATE EMERGENCY ASSISTANCE',
  isPulsing = true,
}: EmergencyOrb3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      setWebglSupported(Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      setWebglSupported(false);
    }
  }, []);

  useEffect(() => {
    if (!webglSupported || !containerRef.current) return;

    let animId: number;
    let renderer: any;
    let scene: any;
    let camera: any;

    const init = async () => {
      const THREE = await import('three');
      const w = containerRef.current?.clientWidth || 280;
      const h = containerRef.current?.clientHeight || 280;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.z = 6;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);
      }

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0xff3856, 4, 15);
      pointLight.position.set(2, 3, 4);
      scene.add(pointLight);

      const cyanLight = new THREE.PointLight(0x00f0ff, 2, 10);
      cyanLight.position.set(-2, -2, 2);
      scene.add(cyanLight);

      // Core Glassy Orb
      const sphereGeo = new THREE.SphereGeometry(1.6, 32, 32);
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: 0xff3856,
        emissive: 0xb91c1c,
        emissiveIntensity: 0.7,
        roughness: 0.1,
        metalness: 0.2,
        transmission: 0.7,
        thickness: 1.2,
      });
      const orb = new THREE.Mesh(sphereGeo, sphereMat);
      scene.add(orb);

      // Orbiting Safety Rings (Neon Coral & Neon Cyan)
      const ringGeo = new THREE.TorusGeometry(2.3, 0.045, 16, 64);
      const ringMatCoral = new THREE.MeshBasicMaterial({
        color: 0xff3856,
        transparent: true,
        opacity: 0.65,
      });
      const ringMatCyan = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.65,
      });

      const ring1 = new THREE.Mesh(ringGeo, ringMatCoral);
      ring1.rotation.x = Math.PI / 3;
      scene.add(ring1);

      const ring2 = new THREE.Mesh(ringGeo, ringMatCyan);
      ring2.rotation.y = Math.PI / 4;
      scene.add(ring2);

      // Animation Loop
      let clock = new THREE.Clock();
      const animate = () => {
        animId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        ring1.rotation.z = t * 0.8;
        ring2.rotation.x = t * 0.6;
        orb.rotation.y = t * 0.3;

        // Pulse scale
        const scale = 1 + Math.sin(t * 3) * 0.04;
        orb.scale.set(scale, scale, scale);

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(animId);
        renderer?.dispose();
      };
    };

    init();
  }, [webglSupported]);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 sm:p-10">
      <div 
        onClick={onTriggerSOS}
        className="relative cursor-pointer group flex items-center justify-center"
      >
        {/* Pulsing ambient rings */}
        <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-emergency/20 animate-ping opacity-50 pointer-events-none" />
        <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-emergency/30 animate-pulse pointer-events-none" />

        {/* 3D WebGL Canvas or CSS fallback */}
        {webglSupported !== false ? (
          <div ref={containerRef} className="w-56 h-56 sm:w-64 sm:h-64 pointer-events-none" />
        ) : (
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full liquid-glass-emergency-btn flex items-center justify-center text-white shadow-emergency-glow">
            <AlertTriangle className="w-20 h-20 animate-bounce" />
          </div>
        )}

        {/* Overlay center button label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white text-center px-4">
          <div className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-sm mb-1 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          <span className="font-extrabold text-2xl tracking-wider drop-shadow-md">EMERGENCY SOS</span>
          <span className="text-[10px] font-semibold text-white/90 uppercase tracking-widest mt-0.5">PRESS TO REPORT</span>
        </div>
      </div>

      <p className="mt-6 text-xs sm:text-sm font-semibold text-white bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full border border-cyan-500/30 shadow-cyan-glow">
        {statusText}
      </p>
    </div>
  );
}
