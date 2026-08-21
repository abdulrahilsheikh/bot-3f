import {
  GizmoHelper,
  GizmoViewport,
  Grid,
  OrbitControls,
  Plane,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { PropsWithChildren, Suspense } from "react";

const ThreeJsCanvas = ({ children }: PropsWithChildren) => {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 50, near: 0.01, far: 1000 }}>
      <ambientLight intensity={1} />
      <pointLight
        position={[100, 100, 100]}
        intensity={0.8 * Math.PI}
        decay={0}
      />

      <directionalLight position={[5, 5, 5]} intensity={3} />
      <Plane
        args={[2000, 2000]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.2, 0]}
      >
        <meshStandardMaterial color="#0a2942" roughness={0.85} metalness={0} />
      </Plane>

      <Grid
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.7}
        cellColor="#287da8"
        sectionSize={2}
        sectionThickness={1.2}
        sectionColor="#55c7f2"
        fadeDistance={150}
        infiniteGrid
      />

      <Suspense>{children}</Suspense>
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={["hotpink", "aquamarine", "#3498DB"]}
          labelColor="black"
        />
      </GizmoHelper>
      <OrbitControls
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.75}
      />
    </Canvas>
  );
};

export default ThreeJsCanvas;
