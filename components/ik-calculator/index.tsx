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
import { fk } from "@/utils/fk";

import { BotMesh } from "../bot-generator";
import ThreeJsCanvas from "../three-js-canvas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type Props = {
  segments: SegmentFormData[];
};

export default function IkCalculator({ segments }: Props) {
  /*
   * Current runtime joint values.
   *
   * Stored internally in RADIANS for revolute joints.
   */
  const [jointValues, setJointValues] = useState<number[]>(() =>
    segments.map((segment) => segment.value),
  );

  /*
   * Target input fields.
   */
  const [targetInput, setTargetInput] = useState({
    x: 2,
    y: 0,
    z: 0,
  });

  /*
   * Actual IK target.
   */
  const [target, setTarget] = useState<[number, number, number] | null>(null);

  /*
   * IK solution that the animation should move toward.
   */
  const animationTarget = useRef<number[] | null>(null);

  /*
   * Reset runtime joint values whenever
   * the robot definition changes.
   */
  useEffect(() => {
    setJointValues(segments.map((segment) => segment.value));

    animationTarget.current = null;
  }, [segments]);

  /*
   * Robot definition + current runtime values.
   */
  const animatedSegments = segments.map((segment, index) => ({
    ...segment,
    value: jointValues[index] ?? segment.value,
  }));

  /*
   * ================================
   * COMPUTE IK
   * ================================
   */
  const calculateIK = () => {
    if (!target) return;

    const targetVector = new THREE.Vector3(target[0], target[1], target[2]);

    /*
     * Current robot configuration.
     */
    const currentSegments = segments.map((segment, index) => ({
      ...segment,
      value: jointValues[index] ?? segment.value,
    }));

    /*
     * Solve IK.
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
     * Verify IK result using FK.
     */
    const testSegments = segments.map((segment, index) => ({
      ...segment,
      value: result.joints[index],
    }));

    const pose = fk(testSegments, result.joints);

    console.log("FK of IK solution:", pose.position);

    /*
     * Animate toward IK solution.
     */
    animationTarget.current = result.joints;
  };

  /*
   * ================================
   * RENDER
   * ================================
   */
  return (
    <div className="flex h-screen">
      {/* ================================================= */}
      {/* SIDEBAR                                           */}
      {/* ================================================= */}

      <aside className="w-80 shrink-0 border-r bg-background">
        <div className="flex h-full flex-col overflow-y-auto p-4 scrollbar-dark">
          {/* HEADER */}

          <div className="mb-6">
            <h2 className="text-lg font-semibold">IK Calculator</h2>

            <p className="text-sm text-muted-foreground">
              Configure the target and solve the robot pose.
            </p>
          </div>

          {/* ================================================= */}
          {/* TARGET CARD                                       */}
          {/* ================================================= */}

          <Card className="h-auto shrink-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Target Position</CardTitle>

                {target && <Badge variant="secondary">Active</Badge>}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* X Y Z */}

              <div className="grid grid-cols-3 h-max gap-2">
                {/* X */}

                <div className="space-y-1.5">
                  <Label htmlFor="target-x">X</Label>

                  <Input
                    id="target-x"
                    type="number"
                    step="0.01"
                    value={targetInput.x}
                    onChange={(e) =>
                      setTargetInput((current) => ({
                        ...current,
                        x: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                {/* Y */}

                <div className="space-y-1.5">
                  <Label htmlFor="target-y">Y</Label>

                  <Input
                    id="target-y"
                    type="number"
                    step="0.01"
                    value={targetInput.y}
                    onChange={(e) =>
                      setTargetInput((current) => ({
                        ...current,
                        y: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                {/* Z */}

                <div className="space-y-1.5">
                  <Label htmlFor="target-z">Z</Label>

                  <Input
                    id="target-z"
                    type="number"
                    step="0.01"
                    value={targetInput.z}
                    onChange={(e) =>
                      setTargetInput((current) => ({
                        ...current,
                        z: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              {/* PLACE MARKER */}

              <Button
                type="button"
                className="w-full"
                onClick={() =>
                  setTarget([targetInput.x, targetInput.y, targetInput.z])
                }
              >
                Place Marker
              </Button>

              {/* TARGET DISPLAY */}

              {target && (
                <div className="rounded-md bg-muted p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Target</p>

                  <p className="font-mono text-sm">
                    ({target[0].toFixed(3)}, {target[1].toFixed(3)},{" "}
                    {target[2].toFixed(3)})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ================================================= */}
          {/* IK BUTTON                                         */}
          {/* ================================================= */}

          <Button
            type="button"
            className="mt-4 w-full"
            variant="default"
            disabled={!target}
            onClick={calculateIK}
          >
            Compute IK
          </Button>

          <Separator className="my-6" />

          {/* ================================================= */}
          {/* JOINT VALUES                                     */}
          {/* ================================================= */}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Joint Values</h3>

                <p className="text-xs text-muted-foreground">
                  Manually adjust the FK pose.
                </p>
              </div>

              <Badge variant="outline">{jointValues.length} joints</Badge>
            </div>

            <div className="space-y-3">
              {jointValues.map((value, index) => {
                const joint = segments[index]?.joint;

                if (!joint) return null;

                /*
                 * Revolute values are stored in radians.
                 *
                 * UI displays degrees.
                 */
                const isRevolute = joint.type === "revolute";

                const displayValue = isRevolute
                  ? THREE.MathUtils.radToDeg(value)
                  : value;

                const minValue = isRevolute
                  ? THREE.MathUtils.radToDeg(joint.min)
                  : joint.min;

                const maxValue = isRevolute
                  ? THREE.MathUtils.radToDeg(joint.max)
                  : joint.max;

                return (
                  <div key={index} className="rounded-lg border bg-card p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <Label
                        htmlFor={`joint-${index}`}
                        className="text-sm font-medium"
                      >
                        {joint.name || `J${index + 1}`}
                      </Label>

                      <Badge variant="secondary">J{index + 1}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        id={`joint-${index}`}
                        type="number"
                        value={Number(displayValue.toFixed(2))}
                        min={minValue}
                        max={maxValue}
                        step={1}
                        onChange={(e) => {
                          const inputValue = Number(e.target.value);

                          const internalValue = isRevolute
                            ? THREE.MathUtils.degToRad(inputValue)
                            : inputValue;

                          setJointValues((current) => {
                            const next = [...current];

                            next[index] = THREE.MathUtils.clamp(
                              internalValue,
                              joint.min,
                              joint.max,
                            );

                            return next;
                          });

                          /*
                           * If user manually changes a joint,
                           * cancel any running IK animation.
                           */
                          animationTarget.current = null;
                        }}
                      />

                      <span className="w-8 text-sm text-muted-foreground">
                        {isRevolute ? "°" : "m"}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                      <span>Min: {minValue.toFixed(1)}</span>

                      <span>Max: {maxValue.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* ================================================= */}
      {/* THREE JS                                          */}
      {/* ================================================= */}

      <main className="min-w-0 flex-1">
        <ThreeJsCanvas>
          <IKController
            target={target}
            setTarget={setTarget}
            setJointValues={setJointValues}
            animationTarget={animationTarget}
          />

          <BotMesh segments={animatedSegments} />
        </ThreeJsCanvas>
      </main>
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
    const targetValues = animationTarget.current;

    if (!targetValues) return;

    setJointValues((current) => {
      let finished = true;

      const next = current.map((value, index) => {
        const targetValue = targetValues[index];

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

  if (!target) {
    return null;
  }

  return (
    <mesh position={target}>
      <sphereGeometry args={[0.12, 32, 32]} />

      <meshStandardMaterial
        color="#ff4fa3"
        emissive="#ff4fa3"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}
