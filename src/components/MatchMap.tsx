import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;

// ─── Custom Animated Marker Icons ───

const createPinIcon = (color: string, glowColor: string, letter: string) => new L.DivIcon({
  html: `
    <div style="position:relative; width:44px; height:56px;">
      <!-- Pulse ring -->
      <div style="
        position:absolute; bottom:0; left:50%; transform:translateX(-50%);
        width:20px; height:8px; border-radius:50%;
        background:${glowColor}; opacity:0.3;
        animation: markerPulse 2s ease-in-out infinite;
      "></div>
      <!-- Pin body -->
      <div style="
        position:absolute; top:0; left:50%; transform:translateX(-50%);
        width:40px; height:40px;
        background: linear-gradient(145deg, ${color}, ${color}dd);
        border-radius: 50% 50% 50% 0;
        transform: translateX(-50%) rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 6px 20px ${glowColor}88, 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
          font-weight: 900;
          font-family: 'Inter', system-ui, sans-serif;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">${letter}</div>
      </div>
    </div>
    <style>
      @keyframes markerPulse {
        0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.3; }
        50% { transform: translateX(-50%) scale(2.5); opacity: 0; }
      }
    </style>
  `,
  className: '',
  iconSize: [44, 56],
  iconAnchor: [22, 56],
  popupAnchor: [0, -56],
});

const sellerIcon = createPinIcon('#ef4444', '#ef4444', 'S');
const buyerIcon = createPinIcon('#10b981', '#10b981', 'B');

function generateCurvedRoute(
  start: [number, number],
  end: [number, number],
  numPoints: number = 40
): [number, number][] {
  const points: [number, number][] = [];
  
  // If start and end are exactly the same, just return the point to prevent NaN crash
  if (start[0] === end[0] && start[1] === end[1]) {
    return [start, end];
  }

  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;

  // Offset for curve (perpendicular to the line)
  const dx = end[1] - start[1];
  const dy = end[0] - start[0];
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Prevent division by zero
  const safeDist = dist === 0 ? 1 : dist;
  const curveFactor = dist * 0.08; // Subtle curve

  const offsetLat = midLat + (dx / safeDist) * curveFactor;
  const offsetLng = midLng - (dy / safeDist) * curveFactor;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * offsetLat + t * t * end[0];
    const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * offsetLng + t * t * end[1];
    points.push([lat, lng]);
  }
  return points;
}

// ─── Animated Route Dots ───
function AnimatedRouteDots({ positions }: { positions: [number, number][] }) {
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotIndex(prev => (prev + 1) % positions.length);
    }, 120);
    return () => clearInterval(interval);
  }, [positions.length]);

  // Show 3 trailing dots for a nice effect
  const dots = [0, 1, 2].map(offset => {
    const idx = (dotIndex - offset * 3 + positions.length) % positions.length;
    return positions[idx];
  });

  return (
    <>
      {dots.map((pos, i) => (
        <CircleMarker
          key={i}
          center={pos}
          radius={i === 0 ? 5 : i === 1 ? 3.5 : 2}
          pathOptions={{
            fillColor: '#ffffff',
            fillOpacity: i === 0 ? 1 : i === 1 ? 0.7 : 0.4,
            color: '#10b981',
            weight: i === 0 ? 2 : 1,
            opacity: i === 0 ? 1 : 0.5,
          }}
        />
      ))}
    </>
  );
}

// ─── Arrow Markers Along Route ───
function RouteArrows({ positions }: { positions: [number, number][] }) {
  // Place arrows at 25%, 50%, 75%
  const arrowPositions = [0.25, 0.5, 0.75].map(frac => {
    const idx = Math.floor(frac * (positions.length - 1));
    const next = Math.min(idx + 1, positions.length - 1);
    const angle = Math.atan2(
      positions[next][0] - positions[idx][0],
      positions[next][1] - positions[idx][1]
    ) * (180 / Math.PI);
    return { pos: positions[idx], angle };
  });

  return (
    <>
      {arrowPositions.map((arrow, i) => (
        <Marker
          key={`arrow-${i}`}
          position={arrow.pos}
          icon={new L.DivIcon({
            html: `<div style="
              width:16px; height:16px;
              display:flex; align-items:center; justify-content:center;
              transform: rotate(${-arrow.angle + 90}deg);
              opacity: 0.8;
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#10b981" stroke="#10b981" stroke-width="3">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>`,
            className: '',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        />
      ))}
    </>
  );
}

// ─── Auto-fit bounds ───
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 10, animate: true, duration: 0.8 });
    }
  }, [map, positions]);
  return null;
}

// ─── Custom zoom control styling ───
function MapStyleOverrides() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    container.style.borderRadius = '16px';
    // Style zoom controls
    const zoomControls = container.querySelectorAll('.leaflet-control-zoom a');
    zoomControls.forEach((el: any) => {
      el.style.background = 'rgba(15, 23, 42, 0.85)';
      el.style.color = '#10b981';
      el.style.border = '1px solid rgba(16, 185, 129, 0.2)';
      el.style.backdropFilter = 'blur(12px)';
      el.style.fontWeight = '900';
    });
    // Style attribution
    const attr = container.querySelector('.leaflet-control-attribution');
    if (attr) {
      (attr as HTMLElement).style.background = 'rgba(15, 23, 42, 0.7)';
      (attr as HTMLElement).style.color = '#64748b';
      (attr as HTMLElement).style.fontSize = '9px';
      (attr as HTMLElement).style.backdropFilter = 'blur(8px)';
    }
  }, [map]);
  return null;
}

// ─── Main Component ───

interface MatchMapProps {
  sellerCoords: [number, number];
  buyerCoords: [number, number];
  sellerName: string;
  buyerName: string;
  sellerLocation: string;
  buyerLocation: string;
  distanceKm: number;
}

export default function MatchMap({
  sellerCoords,
  buyerCoords,
  sellerName,
  buyerName,
  sellerLocation,
  buyerLocation,
  distanceKm,
}: MatchMapProps) {
  const midpoint: [number, number] = [
    (sellerCoords[0] + buyerCoords[0]) / 2,
    (sellerCoords[1] + buyerCoords[1]) / 2,
  ];

  const curvedRoute = generateCurvedRoute(sellerCoords, buyerCoords);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative" style={{ background: '#0f172a' }}>
      <MapContainer
        center={midpoint}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ minHeight: '100%', background: '#0f172a' }}
        zoomControl={true}
      >
        {/* Dark-themed map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <FitBounds positions={[sellerCoords, buyerCoords]} />
        <MapStyleOverrides />

        {/* Route glow (bottom layer — wide soft line) */}
        <Polyline
          positions={curvedRoute}
          pathOptions={{
            color: '#10b981',
            weight: 14,
            opacity: 0.15,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />

        {/* Route mid glow */}
        <Polyline
          positions={curvedRoute}
          pathOptions={{
            color: '#10b981',
            weight: 8,
            opacity: 0.3,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />

        {/* Main route line */}
        <Polyline
          positions={curvedRoute}
          pathOptions={{
            color: '#10b981',
            weight: 4,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />

        {/* Dashed overlay for animation feel */}
        <Polyline
          positions={curvedRoute}
          pathOptions={{
            color: '#34d399',
            weight: 2,
            opacity: 0.6,
            dashArray: '8, 12',
            lineCap: 'round',
          }}
        />

        {/* Animated dots moving along route */}
        <AnimatedRouteDots positions={curvedRoute} />

        {/* Direction arrows */}
        <RouteArrows positions={curvedRoute} />

        {/* Seller marker */}
        <Marker position={sellerCoords} icon={sellerIcon}>
          <Popup>
            <div style={{ textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', padding: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                📦 Seller Origin
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{sellerName}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{sellerLocation}</div>
            </div>
          </Popup>
        </Marker>

        {/* Buyer marker */}
        <Marker position={buyerCoords} icon={buyerIcon}>
          <Popup>
            <div style={{ textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', padding: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                🏭 Buyer Destination
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{buyerName}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{buyerLocation}</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* ── Distance Badge (Top Right) ── */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div style={{
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '16px',
          padding: '12px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(16,185,129,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Distance
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'white', lineHeight: 1, fontFamily: 'Inter, system-ui' }}>
                {distanceKm.toFixed(0)} <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Legend (Bottom Left) ── */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div style={{
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '12px',
          padding: '10px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f87171, #ef4444)',
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 0 8px rgba(239,68,68,0.5)',
              }}></div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>Seller Origin</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #34d399, #10b981)',
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 0 8px rgba(16,185,129,0.5)',
              }}></div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>Buyer Destination</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px', height: '3px', borderRadius: '2px',
                background: '#10b981',
                boxShadow: '0 0 6px rgba(16,185,129,0.5)',
              }}></div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>Route Path</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── "LIVE" badge (Top Left) ── */}
      <div className="absolute top-4 left-14 z-[1000]">
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '20px',
          padding: '5px 12px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
            animation: 'livePulse 1.5s ease-in-out infinite',
          }}></div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Live Route
          </span>
        </div>
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
