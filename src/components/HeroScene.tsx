import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Stars, Points, PointMaterial, Line } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ─── Elegant Wireframe Globe ───────────────────────────────────── */
function WireframeGlobe() {
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.05;
    ref.current.rotation.x += delta * 0.02;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={ref}>
        {/* Icosahedron geometry for a high-tech crystal/globe look */}
        <icosahedronGeometry args={[2.2, 3]} />
        <meshStandardMaterial 
          color="#10b981" 
          wireframe={true} 
          transparent={true} 
          opacity={0.15} 
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      
      {/* Inner glowing core */}
      <Sphere args={[1.4, 32, 32]}>
        <meshStandardMaterial 
          color="#064e3b" 
          emissive="#059669"
          emissiveIntensity={0.8} /* High intensity for Bloom */
          transparent={true}
          opacity={0.4}
          wireframe={false}
          roughness={0.4}
        />
      </Sphere>
    </Float>
  );
}

/* ─── Floating Data Particles (Dust) ────────────────────────────── */
function GlowingParticles({ count = 200 }) {
  const points = useRef<THREE.Points>(null!);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = 2.5 + Math.random() * 3;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, [count]);

  useFrame((state, delta) => {
    points.current.rotation.y -= delta * 0.05;
    points.current.rotation.z += delta * 0.02;
  });

  return (
    <Points ref={points} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#34d399"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

/* ─── Orbiting Rings ────────────────────────────────────────────── */
function OrbitingRings() {
    const groupRef = useRef<THREE.Group>(null!);
    
    useFrame((_, delta) => {
        groupRef.current.rotation.x += delta * 0.1;
        groupRef.current.rotation.y -= delta * 0.12;
    });

    return (
        <group ref={groupRef}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2.8, 0.008, 16, 100]} />
                <meshBasicMaterial color="#6ee7b7" transparent opacity={0.4} />
            </mesh>
            <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
                <torusGeometry args={[3.3, 0.005, 16, 100]} />
                <meshBasicMaterial color="#34d399" transparent opacity={0.2} />
            </mesh>
        </group>
    );
}

/* ─── Floating Green Nodes & Connections ─────────────────────────── */
function GlowingNodes() {
    const groupRef = useRef<THREE.Group>(null!);
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        groupRef.current.rotation.y += 0.002;
        groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    });

    const numNodes = 12;
    const nodes = useMemo(() => {
        return Array.from({ length: numNodes }).map(() => ({
            position: [
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 5,
            ] as [number, number, number],
            scale: 0.04 + Math.random() * 0.06
        }));
    }, [numNodes]);

    // Generate random connection lines between nodes representing "matching"
    const lines = useMemo(() => {
        const linesArr = [];
        for (let i = 0; i < numNodes; i++) {
            for (let j = i + 1; j < numNodes; j++) {
                if (Math.random() > 0.75) { // Only connect some nodes
                    linesArr.push([nodes[i].position, nodes[j].position]);
                }
            }
        }
        return linesArr;
    }, [nodes, numNodes]);

    return (
        <group ref={groupRef}>
            {/* Draw connection lines */}
            {lines.map((line, i) => (
                <Line
                    key={`line-${i}`}
                    points={line}
                    color="#10b981"
                    transparent
                    opacity={0.15}
                    lineWidth={1}
                />
            ))}
            {/* Draw nodes */}
            {nodes.map((node, i) => (
                <mesh key={`node-${i}`} position={node.position}>
                    <sphereGeometry args={[node.scale, 16, 16]} />
                    <meshStandardMaterial 
                        color="#2dd4bf" 
                        emissive="#2dd4bf" 
                        emissiveIntensity={3} 
                        toneMapped={false}
                    />
                </mesh>
            ))}
        </group>
    );
}

/* ─── Main Scene ──────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 5, -5]} intensity={2} color="#10b981" distance={20} />
      <pointLight position={[5, -5, 5]} intensity={1.5} color="#059669" distance={20} />

      <WireframeGlobe />
      <GlowingParticles count={400} />
      <OrbitingRings />
      <GlowingNodes />
      
      {/* Background stars for depth */}
      <Stars radius={10} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      {/* Postprocessing for high-tech premium bloom effect */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.5} 
            luminanceSmoothing={0.9} 
            intensity={1.5} 
            radius={0.8}
            mipmapBlur 
        />
      </EffectComposer>
    </>
  );
}

export default function HeroScene() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: -1 }}>
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Scene />
        {/* Slight fog to blend into the background */}
        <fog attach="fog" args={['#030712', 6, 18]} />
      </Canvas>
    </div>
  );
}
