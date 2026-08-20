import * as THREE from "three";
import type { SegmentFormData } from "@/interfaces/segment";
import { fk, getJointWorldStates } from "./fk";

export interface IKOptions {
  maxIterations?: number;
  tolerance?: number;
  step?: number;
}

export interface IKResult {
  success: boolean;
  joints: number[];
  error: number;
  iterations: number;
}

export function ik(
  segments: SegmentFormData[],
  target: THREE.Vector3,
  options: IKOptions = {},
): IKResult {
  const { maxIterations = 500, tolerance = 0.001, step = 0.25 } = options;

  const joints = segments.map((segment) => segment.value);

  if (!segments.length) {
    return {
      success: false,
      joints,
      error: Infinity,
      iterations: 0,
    };
  }

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const pose = fk(segments, joints);

    const error = target.clone().sub(pose.position);

    const errorLength = error.length();

    /*
     * Already at target.
     */
    if (errorLength <= tolerance) {
      return {
        success: true,
        joints: [...joints],
        error: errorLength,
        iterations: iteration,
      };
    }

    /*
     * Get WORLD position and WORLD axis
     * of every joint.
     */
    const states = getJointWorldStates(segments, joints);

    /*
     * CCD:
     *
     * TIP -> ROOT
     */
    for (let j = segments.length - 1; j >= 0; j--) {
      const segment = segments[j];
      const state = states[j];

      const jointPosition = state.position;
      const axis = state.axis;

      /*
       * Current end effector.
       */
      const currentPose = fk(segments, joints);

      const endPosition = currentPose.position;

      /*
       * Vectors from joint to:
       *
       *   end effector
       *   target
       */
      const toEnd = endPosition.clone().sub(jointPosition);

      const toTarget = target.clone().sub(jointPosition);

      if (toEnd.lengthSq() < 1e-10 || toTarget.lengthSq() < 1e-10) {
        continue;
      }

      /*
       * PRISMATIC
       */
      if (segment.joint.type === "prismatic") {
        const movement = toTarget.dot(axis) - toEnd.dot(axis);

        joints[j] = THREE.MathUtils.clamp(
          joints[j] + movement * step,
          segment.joint.min,
          segment.joint.max,
        );

        continue;
      }

      /*
       * REVOLUTE
       *
       * Project both vectors onto the plane
       * perpendicular to the joint axis.
       */
      const endProjected = toEnd.clone().projectOnPlane(axis);

      const targetProjected = toTarget.clone().projectOnPlane(axis);

      if (
        endProjected.lengthSq() < 1e-10 ||
        targetProjected.lengthSq() < 1e-10
      ) {
        continue;
      }

      endProjected.normalize();
      targetProjected.normalize();

      /*
       * Signed angle around the joint axis.
       */
      const cross = endProjected.clone().cross(targetProjected);

      const dot = THREE.MathUtils.clamp(
        endProjected.dot(targetProjected),
        -1,
        1,
      );

      let angle = Math.atan2(cross.dot(axis), dot);

      /*
       * Prevent huge jumps.
       */
      angle = THREE.MathUtils.clamp(angle, -step, step);

      joints[j] = THREE.MathUtils.clamp(
        joints[j] + angle,
        segment.joint.min,
        segment.joint.max,
      );
    }
  }

  /*
   * Final check.
   */
  const finalPose = fk(segments, joints);

  const finalError = target.clone().sub(finalPose.position).length();

  return {
    success: finalError <= tolerance,
    joints: [...joints],
    error: finalError,
    iterations: maxIterations,
  };
}
