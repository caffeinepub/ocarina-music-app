import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Hole index mapping:
// 0 = Left Hand Index  (top-left on shell)
// 1 = Left Hand Middle (top-right on shell)
// 2 = Right Hand Index (bottom-left on shell)
// 3 = Right Hand Middle(bottom-right on shell)

interface Ocarina3DModelProps {
  fingering: [boolean, boolean, boolean, boolean];
}

function FingertipMesh({ position, isClosed }: { position: [number, number, number]; isClosed: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetY = isClosed ? position[1] + 0.03 : position[1] + 0.2;

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.12;
  });

  return (
    <mesh ref={meshRef} position={[position[0], position[1] + 0.2, position[2]]}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshStandardMaterial color="#c8956c" roughness={0.7} metalness={0.0} />
    </mesh>
  );
}

function TurtleShell() {
  // Domed oval shell body
  const shellGeom = useMemo(() => {
    const geom = new THREE.SphereGeometry(0.55, 32, 24);
    // Flatten bottom, widen sides, dome the top
    geom.applyMatrix4(new THREE.Matrix4().makeScale(1.35, 0.72, 1.0));
    return geom;
  }, []);

  // Shell pattern segments (raised ridges on the dome)
  const ridgePositions: [number, number, number, number, number][] = [
    // [x, y, z, rotY, scale]
    [0, 0.38, 0, 0, 1],
    [0.22, 0.3, 0.18, 0.5, 0.7],
    [-0.22, 0.3, 0.18, -0.5, 0.7],
    [0.22, 0.3, -0.18, -0.5, 0.7],
    [-0.22, 0.3, -0.18, 0.5, 0.7],
  ];

  return (
    <group>
      {/* Main shell body */}
      <mesh geometry={shellGeom} castShadow receiveShadow>
        <meshStandardMaterial
          color="#4a7c3f"
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* Shell underside / belly (flat, lighter) — use circleGeometry scaled to ellipse */}
      <mesh position={[0, -0.38, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.72, 0.52, 1]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#c8a84b" roughness={0.8} metalness={0.0} side={THREE.DoubleSide} />
      </mesh>

      {/* Shell scute pattern - central hexagonal plates */}
      {ridgePositions.map(([x, y, z, rotY, s], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, rotY, 0]} scale={[s, s, s]}>
          <cylinderGeometry args={[0.14, 0.14, 0.025, 6]} />
          <meshStandardMaterial
            color="#3d6b34"
            roughness={0.8}
            metalness={0.0}
          />
        </mesh>
      ))}

      {/* Amber/gold shell edge trim */}
      <mesh position={[0, -0.05, 0]}>
        <torusGeometry args={[0.72, 0.04, 8, 48]} />
        <meshStandardMaterial color="#c8a84b" roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  );
}

function TurtleHead() {
  // Head / mouthpiece at the front (+X direction)
  const neckGeom = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.1, 0.13, 0.28, 16);
    return g;
  }, []);

  const headGeom = useMemo(() => {
    const g = new THREE.SphereGeometry(0.18, 20, 16);
    // Slightly flatten head
    g.applyMatrix4(new THREE.Matrix4().makeScale(1.1, 0.85, 0.95));
    return g;
  }, []);

  return (
    <group>
      {/* Neck connecting shell to head */}
      <mesh
        position={[0.72, 0.04, 0]}
        rotation={[0, 0, Math.PI / 2]}
        geometry={neckGeom}
        castShadow
      >
        <meshStandardMaterial color="#3d6b34" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Head */}
      <mesh position={[0.92, 0.06, 0]} geometry={headGeom} castShadow>
        <meshStandardMaterial color="#4a7c3f" roughness={0.65} metalness={0.05} />
      </mesh>

      {/* Mouth opening (mouthpiece) */}
      <mesh position={[1.08, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.07, 0.1, 16]} />
        <meshStandardMaterial color="#2a4a22" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.88, 0.16, 0.1]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshStandardMaterial color="#1a1a0a" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0.88, 0.16, -0.1]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshStandardMaterial color="#1a1a0a" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Eye shine */}
      <mesh position={[0.9, 0.18, 0.11]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.0} />
      </mesh>
      <mesh position={[0.9, 0.18, -0.11]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.0} />
      </mesh>
    </group>
  );
}

function TurtleTail() {
  return (
    <group>
      {/* Tail at the back (-X direction) */}
      <mesh position={[-0.82, -0.08, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <coneGeometry args={[0.07, 0.28, 12]} />
        <meshStandardMaterial color="#3d6b34" roughness={0.8} metalness={0.0} />
      </mesh>
    </group>
  );
}

function TurtleFlipper({ side }: { side: 'frontLeft' | 'frontRight' | 'backLeft' | 'backRight' }) {
  const isLeft = side === 'frontLeft' || side === 'backLeft';
  const isFront = side === 'frontLeft' || side === 'frontRight';

  const x = isFront ? 0.35 : -0.35;
  const z = isLeft ? 0.62 : -0.62;
  const rotY = isLeft
    ? (isFront ? -0.4 : 0.4)
    : (isFront ? 0.4 : -0.4);
  const rotZ = isLeft ? 0.3 : -0.3;

  const flipperGeom = useMemo(() => {
    const g = new THREE.SphereGeometry(0.18, 12, 8);
    g.applyMatrix4(new THREE.Matrix4().makeScale(1.4, 0.3, 0.7));
    return g;
  }, []);

  return (
    <mesh
      position={[x, -0.22, z]}
      rotation={[0, rotY, rotZ]}
      geometry={flipperGeom}
      castShadow
    >
      <meshStandardMaterial color="#3d6b34" roughness={0.8} metalness={0.0} />
    </mesh>
  );
}

function TurtleHoles({ fingering }: { fingering: [boolean, boolean, boolean, boolean] }) {
  // 2x2 grid on top of shell
  // Index 0 = Left Hand Index  (top-left)
  // Index 1 = Left Hand Middle (top-right)
  // Index 2 = Right Hand Index (bottom-left)
  // Index 3 = Right Hand Middle(bottom-right)
  const holePositions: [number, number, number][] = [
    [-0.16, 0.42, 0.14],  // Left Hand Index
    [ 0.16, 0.42, 0.14],  // Left Hand Middle
    [-0.16, 0.42, -0.14], // Right Hand Index
    [ 0.16, 0.42, -0.14], // Right Hand Middle
  ];

  return (
    <>
      {holePositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.052, 0.052, 0.07, 16]} />
          <meshStandardMaterial
            color={fingering[i] ? '#1a0a02' : '#f5e8d0'}
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      ))}
    </>
  );
}

export default function Ocarina3DModel({ fingering }: Ocarina3DModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Fingertip positions matching hole positions on shell top
  // 0 = Left Hand Index  (top-left)
  // 1 = Left Hand Middle (top-right)
  // 2 = Right Hand Index (bottom-left)
  // 3 = Right Hand Middle(bottom-right)
  const holePositions: [number, number, number][] = [
    [-0.16, 0.42, 0.14],
    [ 0.16, 0.42, 0.14],
    [-0.16, 0.42, -0.14],
    [ 0.16, 0.42, -0.14],
  ];

  return (
    <group ref={groupRef}>
      {/* Turtle shell body */}
      <TurtleShell />

      {/* Turtle head / mouthpiece at front */}
      <TurtleHead />

      {/* Turtle tail at back */}
      <TurtleTail />

      {/* Four flippers */}
      <TurtleFlipper side="frontLeft" />
      <TurtleFlipper side="frontRight" />
      <TurtleFlipper side="backLeft" />
      <TurtleFlipper side="backRight" />

      {/* Fingering holes on shell top */}
      <TurtleHoles fingering={fingering} />

      {/* Animated fingertips hovering over holes */}
      {holePositions.map((pos, i) => (
        <FingertipMesh key={i} position={pos} isClosed={fingering[i]} />
      ))}
    </group>
  );
}
