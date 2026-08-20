"use client";
import { useSegments } from "@/context/segment";
import type { SegmentFormData } from "@/interfaces/segment";
import { getConnectedSegments } from "@/utils/bot";
import { useMemo } from "react";
import * as THREE from "three";

interface RobotProps {
    segments: SegmentFormData[];
}

export default function BotComponent() {
    const { nodes, edges } = useSegments()
    const list = useMemo(() => {
        return getConnectedSegments(nodes, edges, "segment-1")
    }, [nodes, edges])
    console.log(list);

    return <>
        {!!list.length && <BotMesh segments={list} />}</>
}

export function BotMesh({
    segments,
}: RobotProps) {
    return (
        <group name="robot">
            <SegmentChain
                segments={segments}
                index={0}
            />
        </group>
    );
}


interface SegmentChainProps {
    segments: SegmentFormData[];
    index: number;
}

function SegmentChain({
    segments,
    index,
}: SegmentChainProps) {
    const segment = segments[index];

    const {
        joint,
        link, value,
    } = segment;

    /*
       * Joint rotation axis
       */
    const axis = useMemo(() => {
        return new THREE.Vector3(
            joint.axis[0],
            joint.axis[1],
            joint.axis[2],
        ).normalize();
    }, [joint.axis]);

    /*
     * Align cylinder's local Y axis
     * with the joint axis.
     *
     * cylinderGeometry's axis = Y
     */
    const diskQuaternion = useMemo(() => {
        const quaternion =
            new THREE.Quaternion();

        quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            axis,
        );

        return quaternion;
    }, [axis]);

    /*
     * Rotation of the segment
     */
    const segmentQuaternion = useMemo(() => {
        const quaternion =
            new THREE.Quaternion();

        if (joint.type === "revolute") {
            quaternion.setFromAxisAngle(
                axis,
                value,
            );
        }

        return quaternion;
    }, [axis, value, joint.type]);

    return (
        <group name={joint.name}>
            {/* Joint disk */}


            <mesh
                quaternion={diskQuaternion}
            >
                <cylinderGeometry
                    args={[
                        0.18,
                        0.18,
                        0.04,
                        32,
                    ]}
                />

                <meshStandardMaterial
                    color="#333333"
                    roughness={0.5}
                    metalness={0.3}
                />
            </mesh>


            {/* Everything below this joint rotates */}

            <group quaternion={segmentQuaternion}>
                {/* Link */}

                <mesh
                    position={[
                        0,
                        link.length / 2,
                        0,
                    ]}
                >
                    <boxGeometry
                        args={[
                            link.width,
                            link.length,
                            link.depth,
                        ]}
                    />

                    <meshStandardMaterial
                        color="#F5F3EE"
                        roughness={0.65}
                        metalness={0.15}
                    />
                </mesh>

                {/* Next joint */}

                {index + 1 < segments.length && <group
                    position={[
                        link.childMount.x,
                        link.childMount.y,
                        link.childMount.z,
                    ]}
                >
                    <SegmentChain
                        segments={segments}
                        index={index + 1}
                    />
                </group>}
            </group>
        </group>
    );
}
