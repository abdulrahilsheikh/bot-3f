import * as THREE from "three";
import type { SegmentFormData } from "@/interfaces/segment";
import { fk, getJointWorldStates } from "./fk";

export interface IKOptions {
  maxIterations?: number;
  tolerance?: number;

  /**
   * Maximum revolute angle change per CCD step.
   * Radians.
   */
  angleStep?: number;

  /**
   * Fraction of prismatic correction applied per step.
   */
  linearStep?: number;
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
  const {
    maxIterations = 500,
    tolerance = 0.001,

    // ~14 degrees
    angleStep = THREE.MathUtils.degToRad(14),

    // Apply 50% of calculated translation
    linearStep = 0.5,
  } = options;

  if (!segments.length) {
    return {
      success: false,
      joints: [],
      error: Infinity,
      iterations: 0,
    };
  }

  /*
   * Start from current configuration.
   *
   * Revolute values are radians.
   * Prismatic values are linear units.
   */
  const joints = segments.map((segment) => segment.value);

  /*
   * Clamp initial configuration.
   */
  for (let i = 0; i < joints.length; i++) {
    joints[i] = THREE.MathUtils.clamp(
      joints[i],
      segments[i].joint.min,
      segments[i].joint.max,
    );
  }

  /*
   * =========================================================
   * CCD
   * =========================================================
   *
   * Solve from TIP -> ROOT.
   */
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    /*
     * Current end-effector position.
     */
    const currentPose = fk(segments, joints);

    const currentEnd = currentPose.position;

    /*
     * Current error.
     */
    const initialError = target.distanceTo(currentEnd);

    if (initialError <= tolerance) {
      return {
        success: true,
        joints: [...joints],
        error: initialError,
        iterations: iteration,
      };
    }

    /*
     * -------------------------------------------------------
     * Walk from tip toward root.
     * -------------------------------------------------------
     */
    for (let j = segments.length - 1; j >= 0; j--) {
      /*
       * IMPORTANT:
       *
       * Recalculate this AFTER every joint modification.
       *
       * The parent transforms change when a child/parent joint
       * is modified.
       */
      const states = getJointWorldStates(segments, joints);

      const state = states[j];

      if (!state) {
        continue;
      }

      const segment = segments[j];

      /*
       * Current end effector.
       */
      const pose = fk(segments, joints);

      const endPosition = pose.position;

      /*
       * Joint world position.
       */
      const jointPosition = state.position.clone();

      /*
       * WORLD joint axis.
       */
      const axis = state.axis.clone().normalize();

      /*
       * Vector:
       *
       * joint -> end effector
       */
      const toEnd = endPosition.clone().sub(jointPosition);

      /*
       * Vector:
       *
       * joint -> target
       */
      const toTarget = target.clone().sub(jointPosition);

      /*
       * Degenerate case.
       */
      if (toEnd.lengthSq() < 1e-10) {
        continue;
      }

      if (toTarget.lengthSq() < 1e-10) {
        continue;
      }

      /*
       * =====================================================
       * PRISMATIC JOINT
       * =====================================================
       *
       * A prismatic joint can only move along its axis.
       */
      if (segment.joint.type === "prismatic") {
        /*
         * Project both vectors onto the joint axis.
         *
         * This gives the amount of distance along the
         * prismatic axis.
         */
        const endAlongAxis = toEnd.dot(axis);

        const targetAlongAxis = toTarget.dot(axis);

        /*
         * Difference between where the end effector currently
         * is and where it should be along this axis.
         */
        const correction = targetAlongAxis - endAlongAxis;

        /*
         * Apply only part of the correction.
         *
         * This prevents huge jumps.
         */
        const movement = correction * linearStep;

        joints[j] += movement;

        /*
         * Respect prismatic limits.
         */
        joints[j] = THREE.MathUtils.clamp(
          joints[j],
          segment.joint.min,
          segment.joint.max,
        );

        continue;
      }

      /*
       * =====================================================
       * REVOLUTE JOINT
       * =====================================================
       *
       * A revolute joint can only rotate around its axis.
       */

      /*
       * Project the end-effector vector onto the plane
       * perpendicular to the joint axis.
       */
      const endProjected = toEnd.clone().projectOnPlane(axis);

      /*
       * Project the target vector onto the same plane.
       */
      const targetProjected = toTarget.clone().projectOnPlane(axis);

      /*
       * If either vector is almost parallel to the axis,
       * this joint cannot meaningfully rotate toward the target.
       */
      if (
        endProjected.lengthSq() < 1e-10 ||
        targetProjected.lengthSq() < 1e-10
      ) {
        continue;
      }

      endProjected.normalize();
      targetProjected.normalize();

      /*
       * Calculate signed angle:
       *
       * current direction
       *        ↓
       *
       * target direction
       *
       * around the joint axis.
       */
      const cross = endProjected.clone().cross(targetProjected);

      const dot = THREE.MathUtils.clamp(
        endProjected.dot(targetProjected),
        -1,
        1,
      );

      let angle = Math.atan2(cross.dot(axis), dot);

      /*
       * Prevent a single CCD step from rotating too much.
       */
      angle = THREE.MathUtils.clamp(angle, -angleStep, angleStep);

      /*
       * Apply rotation.
       */
      joints[j] += angle;

      /*
       * Respect revolute joint limits.
       */
      joints[j] = THREE.MathUtils.clamp(
        joints[j],
        segment.joint.min,
        segment.joint.max,
      );
    }

    /*
     * -------------------------------------------------------
     * Check after complete CCD pass.
     * -------------------------------------------------------
     */
    const updatedPose = fk(segments, joints);

    const updatedError = target.distanceTo(updatedPose.position);

    if (updatedError <= tolerance) {
      return {
        success: true,
        joints: [...joints],
        error: updatedError,
        iterations: iteration + 1,
      };
    }
  }

  /*
   * =========================================================
   * FINAL RESULT
   * =========================================================
   */

  const finalPose = fk(segments, joints);

  const finalError = target.distanceTo(finalPose.position);

  return {
    success: finalError <= tolerance,
    joints: [...joints],
    error: finalError,
    iterations: maxIterations,
  };
}
