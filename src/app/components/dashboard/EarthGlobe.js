"use client";
import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
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

// Pulsing marker for countries
function CountryMarker({ position, country, orderCount, userCount, isSelected, onClick }) {
  const markerRef = useRef();
  const outerRingRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (markerRef.current) {
      const pulse = 1 + Math.sin(time * 2.5) * 0.15;
      markerRef.current.scale.setScalar(hovered || isSelected ? pulse * 1.3 : pulse);
    }

    if (outerRingRef.current) {
      const wave = (time * 0.6) % 1.5;
      const scale = 1 + wave * 2;
      const opacity = Math.max(0, 0.5 - wave * 0.4);
      outerRingRef.current.scale.setScalar(scale);
      outerRingRef.current.material.opacity = opacity;
    }
  });

  const baseSize = Math.max(0.02, Math.min(0.05, 0.02 + (orderCount / 100) * 0.03));

  const getColor = () => {
    if (orderCount > 50) return { main: "#ef4444", glow: "#fca5a5" };
    if (orderCount > 20) return { main: "#f59e0b", glow: "#fcd34d" };
    return { main: "#10b981", glow: "#6ee7b7" };
  };
  const colors = getColor();

  return (
    <group position={position}>
      {/* Outer ring wave */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[baseSize * 1.5, baseSize * 2.2, 32]} />
        <meshBasicMaterial color={colors.glow} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Glow */}
      <mesh scale={2.2}>
        <sphereGeometry args={[baseSize, 16, 16]} />
        <meshBasicMaterial color={colors.glow} transparent opacity={0.2} depthWrite={false} />
      </mesh>

      {/* Main marker */}
      <mesh
        ref={markerRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      >
        <sphereGeometry args={[baseSize, 20, 20]} />
        <meshStandardMaterial color={colors.main} emissive={colors.main} emissiveIntensity={0.8} roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Bright center */}
      <mesh scale={0.4}>
        <sphereGeometry args={[baseSize, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      {/* Tooltip */}
      {(hovered || isSelected) && (
        <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div className="bg-gray-900/95 backdrop-blur-xl text-white px-3 py-2 rounded-lg shadow-2xl border border-gray-600/50 whitespace-nowrap transform -translate-x-1/2 -translate-y-full -mt-3">
            <p className="font-bold text-sm capitalize">{country}</p>
            <div className="flex items-center gap-3 text-xs mt-1">
              <span className="text-emerald-400">{userCount} users</span>
              <span className="text-blue-400">{orderCount} orders</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Create realistic Earth texture that looks like actual Earth
function createEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // Ocean gradient - realistic blue
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGradient.addColorStop(0, "#1a4c7c");
  oceanGradient.addColorStop(0.15, "#1565a8");
  oceanGradient.addColorStop(0.35, "#1976c2");
  oceanGradient.addColorStop(0.5, "#1e88d0");
  oceanGradient.addColorStop(0.65, "#1976c2");
  oceanGradient.addColorStop(0.85, "#1565a8");
  oceanGradient.addColorStop(1, "#1a4c7c");
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ocean texture - subtle variation
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const alpha = Math.random() * 0.1;
    const brightness = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw realistic continents
  const drawLand = (path, baseColor, darkColor, lightColor) => {
    // Main fill
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i][0], path[i][1]);
    }
    ctx.closePath();
    ctx.fill();

    // Add terrain variation
    ctx.save();
    ctx.clip();

    // Dark areas (mountains/forests)
    for (let i = 0; i < 40; i++) {
      const idx = Math.floor(Math.random() * path.length);
      const x = path[idx][0] + (Math.random() - 0.5) * 100;
      const y = path[idx][1] + (Math.random() - 0.5) * 80;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.random() * 40 + 20);
      gradient.addColorStop(0, darkColor);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(x - 60, y - 60, 120, 120);
    }

    // Light areas (plains/deserts)
    for (let i = 0; i < 30; i++) {
      const idx = Math.floor(Math.random() * path.length);
      const x = path[idx][0] + (Math.random() - 0.5) * 80;
      const y = path[idx][1] + (Math.random() - 0.5) * 60;
      ctx.fillStyle = `rgba(180, 160, 120, ${Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 25 + 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Coastline
    ctx.strokeStyle = "rgba(100, 180, 100, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Continent colors
  const green1 = "#3d7c47";  // Forest green
  const green2 = "#2d5a34";  // Dark forest
  const green3 = "#5a9c64";  // Light green
  const brown = "#8b7355";   // Desert/mountain
  const darkBrown = "#5c4a3d";

  // North America
  drawLand([
    [85, 95], [140, 75], [220, 65], [300, 75], [380, 95], [420, 130],
    [440, 180], [430, 220], [400, 260], [380, 300], [340, 340], [300, 360],
    [260, 370], [220, 360], [180, 340], [150, 300], [130, 250], [100, 200],
    [85, 150]
  ], green1, green2, green3);

  // Alaska
  drawLand([
    [50, 110], [90, 90], [130, 100], [120, 140], [80, 150], [50, 140]
  ], green2, darkBrown, green1);

  // Greenland
  drawLand([
    [380, 50], [440, 40], [480, 55], [490, 100], [470, 130], [420, 140], [380, 110]
  ], "#e8e8e8", "#c0c0c0", "#f5f5f5");

  // Central America & Caribbean
  drawLand([
    [240, 380], [280, 370], [310, 390], [300, 420], [270, 440], [240, 430], [220, 400]
  ], green1, green2, green3);

  // South America
  drawLand([
    [300, 460], [360, 440], [400, 470], [420, 530], [400, 620], [360, 720],
    [320, 800], [280, 820], [260, 780], [250, 700], [260, 600], [280, 520]
  ], green1, green2, green3);

  // Europe
  drawLand([
    [940, 120], [1000, 100], [1060, 110], [1100, 140], [1120, 180],
    [1100, 220], [1060, 250], [1000, 260], [960, 240], [930, 200], [920, 160]
  ], green1, green2, green3);

  // Scandinavia
  drawLand([
    [980, 60], [1020, 45], [1060, 55], [1070, 100], [1040, 130], [1000, 120], [970, 90]
  ], green2, darkBrown, green1);

  // British Isles
  drawLand([
    [900, 130], [930, 120], [940, 145], [930, 180], [905, 185], [890, 160]
  ], green1, green2, green3);

  // Iceland
  drawLand([
    [850, 70], [880, 65], [895, 80], [885, 100], [860, 100], [845, 85]
  ], green2, "#a0a0a0", green1);

  // Africa
  drawLand([
    [960, 290], [1040, 270], [1100, 290], [1140, 350], [1150, 440],
    [1130, 550], [1080, 650], [1020, 700], [960, 680], [920, 600],
    [910, 500], [920, 400], [940, 330]
  ], "#c4a55a", brown, "#d4b56a");

  // Madagascar
  drawLand([
    [1160, 580], [1175, 570], [1185, 600], [1180, 660], [1165, 680], [1150, 650], [1150, 600]
  ], green1, green2, green3);

  // Middle East
  drawLand([
    [1100, 260], [1160, 250], [1200, 280], [1220, 340], [1180, 380], [1120, 360], [1100, 310]
  ], "#c4a55a", brown, "#b89a4a");

  // Russia/Asia North
  drawLand([
    [1080, 80], [1300, 60], [1550, 70], [1750, 100], [1850, 150],
    [1850, 200], [1750, 220], [1550, 200], [1300, 180], [1100, 160]
  ], green2, darkBrown, green1);

  // Asia Main
  drawLand([
    [1200, 220], [1350, 200], [1500, 220], [1620, 280], [1680, 360],
    [1650, 420], [1550, 450], [1400, 440], [1280, 400], [1220, 340]
  ], green1, green2, "#b89a4a");

  // India
  drawLand([
    [1320, 340], [1380, 320], [1420, 360], [1410, 450], [1370, 520],
    [1320, 500], [1300, 440], [1300, 380]
  ], green1, brown, green3);

  // Southeast Asia
  drawLand([
    [1450, 400], [1520, 380], [1560, 420], [1540, 500], [1490, 540], [1450, 500], [1440, 450]
  ], green1, green2, green3);

  // Japan
  drawLand([
    [1720, 240], [1750, 230], [1760, 270], [1750, 320], [1720, 310], [1710, 270]
  ], green1, green2, green3);

  // Korea
  drawLand([
    [1660, 260], [1685, 255], [1690, 300], [1670, 330], [1650, 310], [1650, 280]
  ], green1, green2, green3);

  // Philippines
  drawLand([
    [1620, 420], [1640, 410], [1650, 450], [1640, 500], [1620, 490], [1610, 450]
  ], green1, green2, green3);

  // Indonesia islands
  const indonesiaIslands = [
    [[1500, 540], [1540, 530], [1560, 555], [1530, 575], [1500, 565]],
    [[1570, 545], [1610, 535], [1630, 560], [1600, 585], [1565, 570]],
    [[1640, 550], [1680, 545], [1700, 570], [1680, 595], [1640, 585]],
    [[1520, 590], [1560, 585], [1575, 610], [1550, 630], [1515, 615]],
  ];
  indonesiaIslands.forEach(island => drawLand(island, green1, green2, green3));

  // Australia
  drawLand([
    [1600, 620], [1720, 600], [1820, 640], [1860, 720], [1820, 820],
    [1720, 860], [1620, 840], [1560, 780], [1560, 700]
  ], "#c4955a", brown, "#d4a56a");

  // New Zealand
  drawLand([
    [1920, 780], [1940, 770], [1955, 810], [1945, 860], [1920, 850], [1910, 810]
  ], green1, green2, green3);

  // Tasmania
  drawLand([
    [1780, 860], [1810, 855], [1820, 880], [1800, 905], [1775, 895], [1770, 870]
  ], green1, green2, green3);

  // Papua New Guinea
  drawLand([
    [1750, 540], [1810, 530], [1850, 560], [1830, 600], [1770, 600], [1740, 570]
  ], green1, green2, green3);

  // Antarctica hint (ice)
  ctx.fillStyle = "#e0e8f0";
  ctx.fillRect(0, 950, canvas.width, 74);
  ctx.fillStyle = "#d0d8e0";
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, 970 + Math.random() * 40, Math.random() * 30 + 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Arctic ice
  ctx.fillStyle = "#e8f0f8";
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 0, 300, 50, 0, 0, Math.PI);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Cloud texture
function createCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Cloud patterns
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 80 + 30;
    const opacity = Math.random() * 0.4 + 0.1;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    gradient.addColorStop(0.6, `rgba(255, 255, 255, ${opacity * 0.4})`);
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 1.5, size * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Weather bands
  [200, 400, 600, 800].forEach(y => {
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * canvas.width;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(x - 80, y - 30, 160, 60);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Earth component
function Earth({ userData, selectedCountry, onSelectCountry }) {
  const earthRef = useRef();
  const cloudsRef = useRef();

  const [earthTexture, cloudTexture] = useMemo(() => {
    return [createEarthTexture(), createCloudTexture()];
  }, []);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.02;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.025;
    }
  });

  const markers = useMemo(() => {
    if (!userData || userData.length === 0) return [];
    return userData.map((user, index) => {
      const countryKey = Object.keys(countryCoordinates).find(
        key => key.toLowerCase() === user.country?.toLowerCase()
      ) || "Unknown";
      const coords = countryCoordinates[countryKey] || countryCoordinates["Unknown"];
      const position = latLngToVector3(coords.lat, coords.lng, 1.015);
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
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef} scale={1.008}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh scale={1.12}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            glowColor: { value: new THREE.Color("#4da6ff") },
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPosition = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 glowColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              float intensity = pow(0.6 - dot(vNormal, vPosition), 2.5);
              gl_FragColor = vec4(glowColor, intensity * 0.7);
            }
          `}
        />
      </mesh>

      {/* Outer glow */}
      <mesh scale={1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            glowColor: { value: new THREE.Color("#87ceeb") },
          }}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 glowColor;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
              gl_FragColor = vec4(glowColor, intensity * 0.3);
            }
          `}
        />
      </mesh>

      {/* Markers */}
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

// Stars
function Stars() {
  const starsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = [];
    const col = [];
    const starTypes = [
      [1, 1, 1],
      [0.9, 0.95, 1],
      [1, 0.95, 0.85],
      [0.85, 0.9, 1],
    ];

    for (let i = 0; i < 3000; i++) {
      const radius = 30 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
      const color = starTypes[Math.floor(Math.random() * starTypes.length)];
      col.push(color[0], color[1], color[2]);
    }
    return [new Float32Array(pos), new Float32Array(col)];
  }, []);

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.00003;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} vertexColors transparent opacity={0.85} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Main component
export default function EarthGlobe({ userData = [], onCountrySelect, loading = false }) {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    onCountrySelect?.(country);
  };

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
    <div className="relative w-full h-[550px] bg-gradient-to-b from-[#000510] via-[#001030] to-[#000510] rounded-2xl overflow-hidden border border-gray-800/30 shadow-2xl">
      {/* Header */}
      <div className="absolute top-5 left-5 z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <h3 className="text-white font-semibold text-lg">Global Reach</h3>
        </div>
        <p className="text-gray-500 text-sm">Real-time customer distribution</p>
      </div>

      {/* Stats */}
      <div className="absolute top-5 right-5 z-10 flex gap-2">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/10">
          <p className="text-gray-400 text-xs font-medium">Countries</p>
          <p className="text-white text-2xl font-bold">{userData.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/10">
          <p className="text-gray-400 text-xs font-medium">Users</p>
          <p className="text-emerald-400 text-2xl font-bold">{totals.users.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/10">
          <p className="text-gray-400 text-xs font-medium">Orders</p>
          <p className="text-blue-400 text-2xl font-bold">{totals.orders.toLocaleString()}</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#000510]/95">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 text-sm">Loading global data...</p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#000510"]} />
        <fog attach="fog" args={["#000510", 25, 60]} />

        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, -2, -5]} intensity={0.3} color="#4da6ff" />
        <pointLight position={[0, 0, 3]} intensity={0.3} color="#ffffff" />

        <Suspense fallback={null}>
          <Stars />
          <Earth userData={userData} selectedCountry={selectedCountry} onSelectCountry={handleCountrySelect} />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1.5}
          maxDistance={4}
          rotateSpeed={0.4}
          zoomSpeed={0.5}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Selected Country */}
      {selectedCountry && (
        <div className="absolute bottom-16 left-5 z-10">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl px-4 py-3 border border-gray-700/50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold capitalize">{selectedCountry.country}</p>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="text-emerald-400">{selectedCountry.userCount} Users</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-blue-400">{selectedCountry.orderCount} Orders</span>
                </div>
              </div>
              <button onClick={() => setSelectedCountry(null)} className="p-1.5 hover:bg-white/10 rounded-lg">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-5 right-5 z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3.5 border border-white/10">
          <p className="text-gray-400 text-xs mb-2.5 font-semibold">Activity Level</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30"></div>
              <span className="text-gray-300">High (50+)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/30"></div>
              <span className="text-gray-300">Medium (20-50)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"></div>
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
