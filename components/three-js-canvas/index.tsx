import { GizmoHelper, GizmoViewport, Grid, OrbitControls, Plane, } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { PropsWithChildren, Suspense } from 'react'


const ThreeJsCanvas = ({ children }: PropsWithChildren) => {
    return (
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }} >
            <ambientLight intensity={1} />
            <pointLight
                position={[100, 100, 100]}
                intensity={0.8 * Math.PI}
                decay={0}
            />

            <directionalLight
                position={[5, 5, 5]}
                intensity={3}
            />

            <Grid
                args={[10, 10]}
                cellSize={0.5}
                cellThickness={1}
                cellColor="#444444"
                sectionSize={2}
                sectionThickness={1.5}
                sectionColor="#888888"
                fadeDistance={20}
                infiniteGrid
            />
            <Suspense>
                {children}
            </Suspense>
            <GizmoHelper
                alignment="bottom-right"
                margin={[80, 80]}

            >
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

    )
}

export default ThreeJsCanvas