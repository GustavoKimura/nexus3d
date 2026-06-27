import { useMemo, useLayoutEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export default function PointCloudViewer({ data }: { data: string }) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  const positions = useMemo(() => {
    const lines = data.split("\n");
    const pts: number[] = [];
    let count = 0;

    for (const line of lines) {
      if (count >= 15000) break;
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        const z = parseFloat(parts[2]);
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          pts.push(x, y, z);
          count++;
        }
      }
    }
    return new Float32Array(pts);
  }, [data]);

  useLayoutEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.computeBoundingSphere();
      geometryRef.current.center();
    }
  }, [positions]);

  return (
    <div className="w-full h-full bg-slate-950/80 rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative flex-1 min-h-0">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <points>
          <bufferGeometry ref={geometryRef}>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.15}
            color="#22d3ee"
            transparent
            opacity={0.8}
            sizeAttenuation
          />
        </points>
        <OrbitControls
          autoRotate
          autoRotateSpeed={1.5}
          enableDamping
          enableZoom
          enablePan
        />
      </Canvas>
    </div>
  );
}
