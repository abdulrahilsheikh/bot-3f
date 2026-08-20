"use client";

import { useFrame } from "@react-three/fiber";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import * as THREE from "three";

import { SegmentFormData } from "@/interfaces/segment";
import { ik } from "@/utils/ik";
import { BotMesh } from "../bot-generator";
import ThreeJsCanvas from "../three-js-canvas";
import { fk } from "@/utils/fk";

type Props = {
  segments: SegmentFormData[];
};

export default function IkCalculator({ segments }: Props) {
  /*
   * Current runtime joint values.
   *
   * These are what actually control the robot.
   */
  const [jointValues, setJointValues] = useState<number[]>(() =>
    segments.map((segment) => segment.value),
  );
  const [targetInput, setTargetInput] = useState({
    x: 2,
    y: 0,
    z: 0,
  });

  /*
   * IK target position.
   */
  const [target, setTarget] = useState<[number, number, number] | null>(null);

  /*
   * Target joint configuration returned by IK.
   *
   * Example:
   *
   * [
   *   0.2,
   *   1.1,
   *   -0.4
   * ]
   */
  const animationTarget = useRef<number[] | null>(null);

  /*
   * If the robot definition changes,
   * reset runtime joint values.
   */
  useEffect(() => {
    setJointValues(segments.map((segment) => segment.value));

    animationTarget.current = null;
  }, [segments]);

  /*
   * Combine the static robot definition
   * with the current runtime joint state.
   */
  const animatedSegments = segments.map((segment, index) => ({
    ...segment,
    value: jointValues[index] ?? segment.value,
  }));
  console.log(animatedSegments);

  /*
   * ================================
   * COMPUTE IK
   * ================================
   */
  const calculateIK = () => {
    if (!target) return;

    /*
     * IK expects THREE.Vector3.
     */
    const targetVector = new THREE.Vector3(target[0], target[1], target[2]);

    /*
     * Give IK the robot in its CURRENT
     * configuration.
     */
    const currentSegments = segments.map((segment, index) => ({
      ...segment,
      value: jointValues[index] ?? segment.value,
    }));

    /*
     * Solve.
     */
    const result = ik(currentSegments, targetVector, {
      maxIterations: 500,
      tolerance: 0.001,
    });

    if (!result.success) {
      console.warn("IK failed. Error:", result.error, result.joints);

      return;
    }

    /*
     * DON'T immediately setJointValues().
     *
     * Store the solution.
     *
     * IKController will animate
     * the robot toward this solution.
     */

    const testSegments = segments.map((segment, index) => ({
      ...segment,
      value: result.joints[index],
    }));

    const pose = fk(testSegments, result.joints);

    console.log("FK of IK solution:", pose.position);

    animationTarget.current = result.joints;
  };

  return (
    <div className="h-screen flex font-sans">
      {/* ========================= */}
      {/* CONTROLS */}
      {/* ========================= */}

      <div className="w-80 bg-white border-r p-5">
        <h2 className="text-lg font-semibold mb-5">IK Calculator</h2>

        <div className="space-y-3">
          {/* ========================= */}
          {/* PLACE MARKER */}
          {/* ========================= */}

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div>
              <label className="text-xs text-gray-500">X</label>
              <input
                type="number"
                step="0.01"
                value={targetInput.x}
                onChange={(e) =>
                  setTargetInput((v) => ({
                    ...v,
                    x: Number(e.target.value),
                  }))
                }
                className="w-full rounded-md border px-2 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Y</label>
              <input
                type="number"
                step="0.01"
                value={targetInput.y}
                onChange={(e) =>
                  setTargetInput((v) => ({
                    ...v,
                    y: Number(e.target.value),
                  }))
                }
                className="w-full rounded-md border px-2 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Z</label>
              <input
                type="number"
                step="0.01"
                value={targetInput.z}
                onChange={(e) =>
                  setTargetInput((v) => ({
                    ...v,
                    z: Number(e.target.value),
                  }))
                }
                className="w-full rounded-md border px-2 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setTarget([targetInput.x, targetInput.y, targetInput.z])
            }
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Place Marker
          </button>

          {/* ========================= */}
          {/* COMPUTE IK */}
          {/* ========================= */}

          <button
            type="button"
            disabled={!target}
            onClick={calculateIK}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Compute IK
          </button>
        </div>

        {/* ========================= */}
        {/* JOINT VALUES */}
        {/* ========================= */}

        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">Joint Values</h3>

          <div className="space-y-3">
            {jointValues.map((value, index) => {
              const joint = segments[index]?.joint;

              if (!joint) return null;

              const degrees = THREE.MathUtils.radToDeg(value);
              const minDegrees = THREE.MathUtils.radToDeg(joint.min);
              const maxDegrees = THREE.MathUtils.radToDeg(joint.max);

              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-10 text-sm font-medium">J{index + 1}</span>

                  <input
                    type="number"
                    value={Number(degrees.toFixed(2))}
                    min={minDegrees}
                    max={maxDegrees}
                    step={1}
                    onChange={(e) => {
                      const degreesValue = Number(e.target.value);
                      const radians = THREE.MathUtils.degToRad(degreesValue);

                      setJointValues((current) => {
                        const next = [...current];

                        next[index] = THREE.MathUtils.clamp(
                          radians,
                          joint.min,
                          joint.max,
                        );

                        return next;
                      });
                    }}
                    className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right font-mono text-sm"
                  />

                  <span className="text-xs text-gray-500">°</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* THREE.JS */}
      {/* ========================= */}

      <div className="flex-1">
        <ThreeJsCanvas>
          <IKController
            target={target}
            setTarget={setTarget}
            setJointValues={setJointValues}
            animationTarget={animationTarget}
          />

          <BotMesh segments={animatedSegments} />
        </ThreeJsCanvas>
      </div>
    </div>
  );
}

/* ========================================================= */
/* IK CONTROLLER                                             */
/* ========================================================= */

type ControllerProps = {
  target: [number, number, number] | null;

  setTarget: Dispatch<SetStateAction<[number, number, number] | null>>;

  setJointValues: Dispatch<SetStateAction<number[]>>;

  animationTarget: RefObject<number[] | null>;
};

function IKController({
  target,
  setTarget,
  setJointValues,
  animationTarget,
}: ControllerProps) {
  useFrame((_, delta) => {
    const target = animationTarget.current;

    if (!target) return;

    setJointValues((current) => {
      let finished = true;

      const next = current.map((value, index) => {
        const targetValue = target[index];

        if (targetValue === undefined) {
          return value;
        }

        const nextValue = THREE.MathUtils.damp(value, targetValue, 6, delta);

        if (Math.abs(nextValue - targetValue) > 0.0005) {
          finished = false;
        }

        return nextValue;
      });

      if (finished) {
        animationTarget.current = null;
      }

      return next;
    });
  });

  return (
    !!target && (
      <mesh position={target}>
        <sphereGeometry args={[0.12, 32, 32]} />

        <meshStandardMaterial
          color="#ff4fa3"
          emissive="#ff4fa3"
          emissiveIntensity={0.2}
        />
      </mesh>
    )
  );
}
