import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Shop } from '@/types';

interface GlobalGlobeProps {
  shops: Shop[];
  onSelectShop?: (shop: Shop) => void;
}

const GlobalGlobe: React.FC<GlobalGlobeProps> = ({ shops, onSelectShop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H(), 0.1, 1000);
    camera.position.set(0, 0, 6);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const tealLight = new THREE.PointLight(0x00e6b4, 2, 20);
    tealLight.position.set(5, 3, 5);
    scene.add(tealLight);

    const blueLight = new THREE.PointLight(0x0088ff, 2, 20);
    blueLight.position.set(-5, -3, 5);
    scene.add(blueLight);

    // --- GLOBE ---
    const GLOBE_R = 2.0;
    const globeGeo = new THREE.SphereGeometry(GLOBE_R, 64, 64);

    // Land-mass texture painted on a canvas (from your mockup)
    const TX = 1024, TY = 512;
    const tc = document.createElement('canvas');
    tc.width = TX; tc.height = TY;
    const ctx = tc.getContext('2d')!;
    ctx.fillStyle = '#051830';
    ctx.fillRect(0, 0, TX, TY);

    const lands = [
      { x: 0.13, y: 0.30, rx: 0.09, ry: 0.14 },   // N America
      { x: 0.18, y: 0.57, rx: 0.055, ry: 0.13 },  // S America
      { x: 0.47, y: 0.29, rx: 0.042, ry: 0.072 }, // Europe
      { x: 0.48, y: 0.52, rx: 0.055, ry: 0.14 },  // Africa
      { x: 0.63, y: 0.27, rx: 0.15,  ry: 0.12 },  // Asia
      { x: 0.75, y: 0.63, rx: 0.056, ry: 0.052 }, // Australia
      { x: 0.22, y: 0.14, rx: 0.025, ry: 0.04 },  // Greenland
    ];

    lands.forEach(l => {
      ctx.beginPath();
      ctx.ellipse(l.x * TX, l.y * TY, l.rx * TX, l.ry * TY, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0b3354';
      ctx.fill();
      const grad = ctx.createRadialGradient(l.x*TX, l.y*TY, 0, l.x*TX, l.y*TY, l.rx*TX*1.6);
      grad.addColorStop(0, 'rgba(0,230,180,0.15)');
      grad.addColorStop(1, 'rgba(0,230,180,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(l.x*TX, l.y*TY, l.rx*TX*1.6, l.ry*TY*1.6, 0, 0, Math.PI*2);
      ctx.fill();
    });

    const globeTex = new THREE.CanvasTexture(tc);
    const globeMat = new THREE.MeshPhongMaterial({
      map: globeTex,
      color: 0x071a33,
      emissive: 0x001428,
      shininess: 50,
      transparent: true,
      opacity: 0.95
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Wireframe overlay
    const wfMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_R + 0.01, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x00e6b4, wireframe: true, transparent: true, opacity: 0.08 })
    );
    scene.add(wfMesh);

    // Atmosphere glow
    const atmMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_R + 0.1, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x00e6b4, transparent: true, opacity: 0.05, side: THREE.BackSide })
    );
    scene.add(atmMesh);

    // --- RINGS ---
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(GLOBE_R + 0.25, 0.01, 8, 100),
      new THREE.MeshBasicMaterial({ color: 0x00e6b4, transparent: true, opacity: 0.3 })
    );
    ring1.rotation.x = Math.PI / 2.2;
    scene.add(ring1);

    // --- SHOP MARKERS ---
    const markers: THREE.Group[] = [];
    shops.forEach((shop, index) => {
      const lat = Number(shop.settings?.location?.lat);
      const lng = Number(shop.settings?.location?.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const r = GLOBE_R + 0.02;

      const markerGroup = new THREE.Group();
      
      // Main beacon dot
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x00e6b4 })
      );
      
      // Pulse ring
      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x00e6b4, transparent: true, opacity: 0.4 })
      );

      markerGroup.add(dot);
      markerGroup.add(pulse);
      
      markerGroup.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );

      markerGroup.userData = { shop, phase: Math.random() * Math.PI * 2 };
      scene.add(markerGroup);
      markers.push(markerGroup);
    });

    // Animation Loop
    let t = 0;
    let requestRef: number;

    const animate = () => {
      t += 0.01;
      globe.rotation.y += 0.002;
      wfMesh.rotation.y += 0.002;
      ring1.rotation.z += 0.005;

      markers.forEach(m => {
        const pulse = m.children[1] as THREE.Mesh;
        const phase = m.userData.phase;
        const s = 1 + 0.5 * Math.sin(t * 3 + phase);
        pulse.scale.setScalar(s);
        (pulse.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - (s - 0.5) / 1);
      });

      renderer.render(scene, camera);
      requestRef = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      renderer.setSize(newW, newH);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef);
      renderer.dispose();
      scene.clear();
    };
  }, [shops]);

  return (
    <div 
      ref={containerRef} 
      className="relative h-full w-full bg-[#060e1c] cursor-grab active:cursor-grabbing"
      style={{ borderRadius: 'inherit' }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      
      {/* Overlay Instructions */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center space-x-3 shadow-2xl">
          <div className="h-2 w-2 bg-accent rounded-full animate-pulse shadow-[0_0_10px_#00e6b4]"></div>
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            3D Global Network Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalGlobe;
