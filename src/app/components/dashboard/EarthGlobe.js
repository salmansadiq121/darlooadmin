"use client";
import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";

// Country coordinates mapping (latitude, longitude)
const countryCoordinates = {
  "United States": { lat: 37.0902, lng: -95.7129 },
  "United Kingdom": { lat: 55.3781, lng: -3.436 },
  Germany: { lat: 51.1657, lng: 10.4515 },
  France: { lat: 46.2276, lng: 2.2137 },
  Italy: { lat: 41.8719, lng: 12.5674 },
  Spain: { lat: 40.4637, lng: -3.7492 },
  Netherlands: { lat: 52.1326, lng: 5.2913 },
  Belgium: { lat: 50.5039, lng: 4.4699 },
  Austria: { lat: 47.5162, lng: 14.5501 },
  Switzerland: { lat: 46.8182, lng: 8.2275 },
  Poland: { lat: 51.9194, lng: 19.1451 },
  Sweden: { lat: 60.1282, lng: 18.6435 },
  Norway: { lat: 60.472, lng: 8.4689 },
  Denmark: { lat: 56.2639, lng: 9.5018 },
  Finland: { lat: 61.9241, lng: 25.7482 },
  Portugal: { lat: 39.3999, lng: -8.2245 },
  Ireland: { lat: 53.1424, lng: -7.6921 },
  Greece: { lat: 39.0742, lng: 21.8243 },
  "Czech Republic": { lat: 49.8175, lng: 15.473 },
  Romania: { lat: 45.9432, lng: 24.9668 },
  Hungary: { lat: 47.1625, lng: 19.5033 },
  Canada: { lat: 56.1304, lng: -106.3468 },
  Mexico: { lat: 23.6345, lng: -102.5528 },
  Brazil: { lat: -14.235, lng: -51.9253 },
  Argentina: { lat: -38.4161, lng: -63.6167 },
  Australia: { lat: -25.2744, lng: 133.7751 },
  "New Zealand": { lat: -40.9006, lng: 174.886 },
  Japan: { lat: 36.2048, lng: 138.2529 },
  China: { lat: 35.8617, lng: 104.1954 },
  India: { lat: 20.5937, lng: 78.9629 },
  "South Korea": { lat: 35.9078, lng: 127.7669 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  Malaysia: { lat: 4.2105, lng: 101.9758 },
  Thailand: { lat: 15.87, lng: 100.9925 },
  Indonesia: { lat: -0.7893, lng: 113.9213 },
  Philippines: { lat: 12.8797, lng: 121.774 },
  Vietnam: { lat: 14.0583, lng: 108.2772 },
  "Saudi Arabia": { lat: 23.8859, lng: 45.0792 },
  UAE: { lat: 23.4241, lng: 53.8478 },
  Egypt: { lat: 26.8206, lng: 30.8025 },
  "South Africa": { lat: -30.5595, lng: 22.9375 },
  Nigeria: { lat: 9.082, lng: 8.6753 },
  Kenya: { lat: -0.0236, lng: 37.9062 },
  Morocco: { lat: 31.7917, lng: -7.0926 },
  Turkey: { lat: 38.9637, lng: 35.2433 },
  Russia: { lat: 61.524, lng: 105.3188 },
  Ukraine: { lat: 48.3794, lng: 31.1656 },
  Pakistan: { lat: 30.3753, lng: 69.3451 },
  pakistan: { lat: 30.3753, lng: 69.3451 },
  Bangladesh: { lat: 23.685, lng: 90.3563 },
  Colombia: { lat: 4.5709, lng: -74.2973 },
  Chile: { lat: -35.6751, lng: -71.543 },
  Peru: { lat: -9.19, lng: -75.0152 },
  Israel: { lat: 31.0461, lng: 34.8516 },
  Unknown: { lat: 0, lng: 0 },
};

// Convert lat/lng to 3D sphere coordinates
const latLngToVector3 = (lat, lng, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
};

// Animated connection arc between two points
function ConnectionArc({ start, end, color = "#10b981" }) {
  const curve = useMemo(() => {
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    midPoint.normalize().multiplyScalar(1.3);
    return new THREE.QuadraticBezierCurve3(start, midPoint, end);
  }, [start, end]);

  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.4} />
    </line>
  );
}

// Pulsing marker for countries
function CountryMarker({ position, country, orderCount, userCount, isSelected, onClick }) {
  const markerRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (markerRef.current) {
      // Pulse animation
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      markerRef.current.scale.setScalar(hovered || isSelected ? pulse * 1.3 : pulse);
    }
    if (ringRef.current) {
      // Expanding ring animation
      const scale = 1 + ((state.clock.elapsedTime * 0.5) % 1) * 2;
      const opacity = 1 - ((state.clock.elapsedTime * 0.5) % 1);
      ringRef.current.scale.setScalar(scale);
      ringRef.current.material.opacity = opacity * 0.5;
    }
  });

  // Size and color based on order count
  const baseSize = Math.max(0.015, Math.min(0.05, 0.015 + (orderCount / 200) * 0.035));
  const color = orderCount > 50 ? "#ef4444" : orderCount > 20 ? "#f59e0b" : "#10b981";

  return (
    <group position={position}>
      {/* Main marker dot */}
      <mesh
        ref={markerRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      >
        <sphereGeometry args={[baseSize, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Glow effect */}
      <mesh scale={2}>
        <sphereGeometry args={[baseSize, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Pulsing ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[baseSize * 1.5, baseSize * 2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Tooltip - Small compact card */}
      {(hovered || isSelected) && (
        <Html distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div className="bg-gray-900/95 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg shadow-lg border border-gray-700 whitespace-nowrap transform -translate-x-1/2">
            <p className="font-semibold text-xs capitalize">{country}</p>
            <div className="flex items-center gap-2 mt-0.5 text-[10px]">
              <span className="text-emerald-400">{userCount}</span>
              <span className="text-gray-500">|</span>
              <span className="text-blue-400">{orderCount}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Earth component with realistic textures
function Earth({ userData, selectedCountry, onSelectCountry }) {
  const earthRef = useRef();
  const atmosphereRef = useRef();
  const { gl } = useThree();

  // Create Earth texture
  const earthTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Create gradient ocean
    const oceanGradient = ctx.createRadialGradient(1024, 512, 0, 1024, 512, 1200);
    oceanGradient.addColorStop(0, "#1a365d");
    oceanGradient.addColorStop(0.5, "#1e3a5f");
    oceanGradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle ocean texture
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(59, 130, 246, ${Math.random() * 0.3})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 3 + 1,
        Math.random() * 3 + 1
      );
    }
    ctx.globalAlpha = 1;

    // Draw continents with more detail
    ctx.fillStyle = "#1f4d3a";

    // North America
    ctx.beginPath();
    ctx.moveTo(150, 180);
    ctx.bezierCurveTo(200, 120, 350, 100, 400, 150);
    ctx.bezierCurveTo(420, 200, 380, 280, 350, 320);
    ctx.bezierCurveTo(320, 380, 280, 400, 250, 380);
    ctx.bezierCurveTo(200, 350, 160, 300, 150, 250);
    ctx.closePath();
    ctx.fill();

    // South America
    ctx.beginPath();
    ctx.moveTo(320, 420);
    ctx.bezierCurveTo(380, 400, 400, 450, 390, 520);
    ctx.bezierCurveTo(380, 600, 350, 700, 310, 750);
    ctx.bezierCurveTo(280, 780, 260, 720, 270, 650);
    ctx.bezierCurveTo(280, 580, 290, 500, 320, 420);
    ctx.closePath();
    ctx.fill();

    // Europe
    ctx.beginPath();
    ctx.moveTo(980, 150);
    ctx.bezierCurveTo(1050, 130, 1120, 150, 1150, 180);
    ctx.bezierCurveTo(1180, 220, 1160, 280, 1120, 300);
    ctx.bezierCurveTo(1080, 320, 1020, 310, 980, 280);
    ctx.bezierCurveTo(950, 250, 940, 200, 980, 150);
    ctx.closePath();
    ctx.fill();

    // Africa
    ctx.beginPath();
    ctx.moveTo(1000, 340);
    ctx.bezierCurveTo(1080, 320, 1140, 360, 1160, 420);
    ctx.bezierCurveTo(1180, 500, 1150, 600, 1100, 680);
    ctx.bezierCurveTo(1050, 720, 980, 700, 950, 640);
    ctx.bezierCurveTo(920, 580, 930, 500, 960, 420);
    ctx.bezierCurveTo(980, 360, 1000, 340, 1000, 340);
    ctx.closePath();
    ctx.fill();

    // Asia
    ctx.beginPath();
    ctx.moveTo(1200, 150);
    ctx.bezierCurveTo(1350, 120, 1550, 150, 1700, 200);
    ctx.bezierCurveTo(1800, 250, 1850, 350, 1800, 420);
    ctx.bezierCurveTo(1750, 480, 1600, 500, 1500, 480);
    ctx.bezierCurveTo(1400, 460, 1300, 420, 1250, 380);
    ctx.bezierCurveTo(1180, 320, 1150, 250, 1200, 150);
    ctx.closePath();
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.moveTo(1650, 580);
    ctx.bezierCurveTo(1750, 560, 1850, 600, 1880, 680);
    ctx.bezierCurveTo(1900, 750, 1850, 800, 1780, 800);
    ctx.bezierCurveTo(1700, 800, 1620, 750, 1600, 680);
    ctx.bezierCurveTo(1580, 620, 1600, 580, 1650, 580);
    ctx.closePath();
    ctx.fill();

    // Add continent highlights
    ctx.fillStyle = "#2d6a4f";
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 15 + 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Add country borders effect
    ctx.strokeStyle = "#3d8b67";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Slow rotation
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
  });

  // Convert user data to markers
  const markers = useMemo(() => {
    if (!userData || userData.length === 0) return [];
    return userData.map((user, index) => {
      const countryKey = Object.keys(countryCoordinates).find(
        key => key.toLowerCase() === user.country?.toLowerCase()
      ) || "Unknown";
      const coords = countryCoordinates[countryKey] || countryCoordinates["Unknown"];
      const position = latLngToVector3(coords.lat, coords.lng, 1.01);
      return { ...user, position, key: `${user.country}-${index}` };
    });
  }, [userData]);

  return (
    <group>
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          uniforms={{
            glowColor: { value: new THREE.Color("#60a5fa") },
          }}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            uniform vec3 glowColor;
            void main() {
              float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
              gl_FragColor = vec4(glowColor, intensity * 0.4);
            }
          `}
        />
      </mesh>

      {/* Country markers */}
      {markers.map((marker) => (
        <CountryMarker
          key={marker.key}
          position={marker.position}
          country={marker.country}
          orderCount={marker.orderCount}
          userCount={marker.userCount}
          isSelected={selectedCountry?.country === marker.country}
          onClick={() => onSelectCountry?.(marker)}
        />
      ))}
    </group>
  );
}

// Stars background
function Stars() {
  const starsRef = useRef();

  const starPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 2000; i++) {
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    }
    return new Float32Array(positions);
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#ffffff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// Main Globe component
export default function EarthGlobe({ userData = [], onCountrySelect, loading = false }) {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    onCountrySelect?.(country);
  };

  // Calculate totals
  const totals = useMemo(() => {
    return userData.reduce(
      (acc, item) => ({
        users: acc.users + (item.userCount || 0),
        orders: acc.orders + (item.orderCount || 0),
      }),
      { users: 0, orders: 0 }
    );
  }, [userData]);

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-[#0a0f1a] via-[#0d1424] to-[#0a0f1a] rounded-2xl overflow-hidden border border-gray-800/50">
      {/* Header */}
      <div className="absolute top-5 left-5 z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <h3 className="text-white font-semibold text-lg">Global Reach</h3>
        </div>
        <p className="text-gray-500 text-sm">Real-time customer distribution</p>
      </div>

      {/* Stats Cards */}
      <div className="absolute top-5 right-5 z-10 flex gap-2">
        <div className="bg-white/5 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
          <p className="text-gray-400 text-xs">Countries</p>
          <p className="text-white text-xl font-bold">{userData.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
          <p className="text-gray-400 text-xs">Users</p>
          <p className="text-emerald-400 text-xl font-bold">{totals.users.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
          <p className="text-gray-400 text-xs">Orders</p>
          <p className="text-blue-400 text-xl font-bold">{totals.orders.toLocaleString()}</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0f1a]/90">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 text-sm">Loading global data...</p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0a0f1a"]} />

        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#60a5fa" />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#ffffff" />

        <Suspense fallback={null}>
          <Stars />
          <Earth
            userData={userData}
            selectedCountry={selectedCountry}
            onSelectCountry={handleCountrySelect}
          />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1.8}
          maxDistance={4}
          autoRotate={false}
          rotateSpeed={0.5}
          zoomSpeed={0.5}
        />
      </Canvas>

      {/* Selected Country Panel - Compact */}
      {selectedCountry && (
        <div className="absolute bottom-12 left-5 z-10">
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700 flex items-center gap-3">
            <div>
              <p className="text-white font-semibold text-sm capitalize">{selectedCountry.country}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-400">{selectedCountry.userCount} Users</span>
                <span className="text-gray-600">•</span>
                <span className="text-blue-400">{selectedCountry.orderCount} Orders</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCountry(null)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-5 right-5 z-10">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <p className="text-gray-400 text-xs mb-2 font-medium">Activity Level</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="text-gray-300">High (50+)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <span className="text-gray-300">Medium (20-50)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-gray-300">Growing (1-20)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
        <p className="text-gray-600 text-xs">Drag to rotate • Scroll to zoom • Click markers for details</p>
      </div>
    </div>
  );
}
