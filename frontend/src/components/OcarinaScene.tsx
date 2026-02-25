import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import Ocarina3DModel from './Ocarina3DModel';

interface OcarinaSceneProps {
  fingering: [boolean, boolean, boolean, boolean];
  className?: string;
}

export default function OcarinaScene({ fingering, className }: OcarinaSceneProps) {
  return (
    <div className={className} style={{ touchAction: 'none' }}>
      <Canvas
        camera={{ position: [0, 1.2, 3.2], fov: 45 }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#00000000']} />
        <ambientLight intensity={0.6} color="#ffe8c0" />
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.2}
          color="#ffd580"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-2, 2, -2]} intensity={0.4} color="#c8e8c0" />
        <pointLight position={[0, 3, 1]} intensity={0.5} color="#ffcc88" />

        <Suspense fallback={null}>
          <Ocarina3DModel fingering={fingering} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={6}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI * 0.75}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
    </div>
  );
}
