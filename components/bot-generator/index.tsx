"use client";
import { useSegments } from "@/context/segment";
import type { SegmentFormData } from "@/interfaces/segment";
import { getConnectedSegments } from "@/utils/bot";
import { useMemo } from "react";
import * as THREE from "three";
import { GizmoViewport, Line } from "@react-three/drei";

interface RobotProps {
  segments: SegmentFormData[];
}

export default function BotComponent() {
  const { nodes, edges } = useSegments();
  const list = useMemo(() => {
    return getConnectedSegments(nodes, edges, "root");
  }, [nodes, edges]);

  return <>{!!list.length && <BotMesh segments={list} />}</>;
}

export function BotMesh({ segments }: RobotProps) {
  return (
    <group name="robot">
      <SegmentChain segments={segments} index={0} />
    </group>
  );
}

interface SegmentChainProps {
  segments: SegmentFormData[];
  index: number;
}

function SegmentChain({ segments, index }: SegmentChainProps) {
  const segment = segments[index];

  const { joint, link, value } = segment;

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
  const jointQuaternion = useMemo(() => {
    const quaternion = new THREE.Quaternion();

    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);

    return quaternion;
  }, [axis]);

  /*
   * Rotation of the segment
   */
  const jointPosition = useMemo(() => {
    if (joint.type === "prismatic") {
      return axis.clone().multiplyScalar(value);
    }

    return new THREE.Vector3(0, 0, 0);
  }, [axis, value, joint.type]);

  const segmentQuaternion = useMemo(() => {
    const quaternion = new THREE.Quaternion();

    if (joint.type === "revolute") {
      quaternion.setFromAxisAngle(axis, value);
    }

    return quaternion;
  }, [axis, value, joint.type]);
  return (
    <group name={joint.name}>
      {/* Joint disk */}
      <JointLimits
        type={joint.type}
        value={value}
        max={joint.max}
        min={joint.min}
        axis={axis}
      />

      <mesh quaternion={jointQuaternion}>
        {joint.type == "revolute" ? (
          <cylinderGeometry args={[0.18, 0.18, 0.04, 32]} />
        ) : (
          <boxGeometry args={[0.1, Math.abs(joint.max - joint.min), 0.2]} />
        )}
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Everything below this joint rotates */}

      <group position={jointPosition} quaternion={segmentQuaternion}>
        {/* Link */}
        <JointGizmo size={0.25} />
        <mesh position={[0, link.length / 2, 0]}>
          <boxGeometry args={[link.width, link.length, link.depth]} />

          <meshStandardMaterial
            color="#F5F3EE"
            roughness={0.65}
            metalness={0.15}
          />
        </mesh>

        {/* Next joint */}
        {index == segments.length - 1 && (
          <mesh
            position={[link.childMount.x, link.childMount.y, link.childMount.z]}
          >
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#ff4fa3"
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
        )}
        {index + 1 < segments.length && (
          <group
            position={[link.childMount.x, link.childMount.y, link.childMount.z]}
          >
            <SegmentChain segments={segments} index={index + 1} />
          </group>
        )}
      </group>
    </group>
  );
}
function JointGizmo({ size = 0.35 }) {
  return (
    <group scale={size}>
      <GizmoViewport
        scale={1}
        axisColors={["hotpink", "aquamarine", "#3498DB"]}
        labelColor="black"
        disabled
      />
    </group>
  );
}

function JointLimits({
  axis,
  min,
  max,
  value,
  type,
  radius = 0.32,
}: {
  axis: THREE.Vector3;
  min: number;
  max: number;
  value: number;
  type: "revolute" | "prismatic";
  radius?: number;
}) {
  if (type === "prismatic") {
    return <PrismaticLimits axis={axis} min={min} max={max} value={value} />;
  }

  return <RevoluteLimits axis={axis} min={min} max={max} radius={radius} />;
}

function RevoluteLimits({
  axis,
  min,
  max,
  radius = 0.32,
}: {
  axis: THREE.Vector3;
  min: number;
  max: number;
  radius?: number;
}) {
  const { points, minPoint, maxPoint } = useMemo(() => {
    const reference =
      Math.abs(axis.y) < 0.9
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(1, 0, 0);

    reference.projectOnPlane(axis).normalize();

    const points: THREE.Vector3[] = [];
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = min + (max - min) * t;

      points.push(
        reference.clone().applyAxisAngle(axis, angle).multiplyScalar(radius),
      );
    }

    const minPoint = reference
      .clone()
      .applyAxisAngle(axis, min)
      .multiplyScalar(radius);

    const maxPoint = reference
      .clone()
      .applyAxisAngle(axis, max)
      .multiplyScalar(radius);

    return {
      points,
      minPoint,
      maxPoint,
    };
  }, [axis, min, max, radius]);

  return (
    <group>
      {/* Limit arc */}
      <Line
        points={points}
        color="#888888"
        lineWidth={2}
        transparent
        opacity={0.8}
      />

      {/* MIN */}
      <mesh position={minPoint}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>

      {/* MAX */}
      <mesh position={maxPoint}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

function PrismaticLimits({
  axis,
  min,
  max,
  value,
}: {
  axis: THREE.Vector3;
  min: number;
  max: number;
  value: number;
}) {
  const { points, minPoint, maxPoint, currentPoint } = useMemo(() => {
    const minPoint = axis.clone().multiplyScalar(min);

    const maxPoint = axis.clone().multiplyScalar(max);

    const currentPoint = axis.clone().multiplyScalar(value);

    return {
      points: [minPoint, maxPoint],
      minPoint,
      maxPoint,
      currentPoint,
    };
  }, [axis, min, max, value]);

  return (
    <group>
      {/* Rail */}
      <Line points={points} color="#888888" lineWidth={3} />

      {/* MIN */}
      <mesh position={minPoint}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>

      {/* MAX */}
      <mesh position={maxPoint}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Current position */}
      <mesh position={currentPoint}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
    </group>
  );
}
