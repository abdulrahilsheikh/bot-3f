import * as THREE from "three";
import type { SegmentFormData } from "@/interfaces/segment";

export interface FKResult {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
}

export interface JointWorldState {
  position: THREE.Vector3;
  axis: THREE.Vector3;
}

/**
 * Forward Kinematics
 *
 * Returns the WORLD position and WORLD orientation
 * of the end effector.
 *
 * Revolute:
 *   value = radians
 *
 * Prismatic:
 *   value = scene/world units
 */
export function fk(segments: SegmentFormData[], values: number[]): FKResult {
  const position = new THREE.Vector3();

  /*
   * This represents the accumulated parent/world rotation.
   */
  const rotation = new THREE.Quaternion();

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    const localAxis = new THREE.Vector3(
      segment.joint.axis[0],
      segment.joint.axis[1],
      segment.joint.axis[2],
    ).normalize();

    const value = values[i] ?? segment.value;

    /*
     * =====================================================
     * JOINT MOTION
     * =====================================================
     */

    if (segment.joint.type === "revolute") {
      /*
       * The BotMesh does:
       *
       * quaternion.setFromAxisAngle(axis, value)
       *
       * on the local group.
       *
       * Therefore accumulate the local rotation.
       */
      const jointRotation = new THREE.Quaternion().setFromAxisAngle(
        localAxis,
        value,
      );

      rotation.multiply(jointRotation);
    }

    /*
     * =====================================================
     * PRISMATIC
     * =====================================================
     */

    if (segment.joint.type === "prismatic") {
      /*
       * The axis is local to the joint.
       *
       * Convert it into world space using the accumulated
       * parent rotation.
       */
      const worldAxis = localAxis.clone().applyQuaternion(rotation).normalize();

      position.add(worldAxis.multiplyScalar(value));
    }

    /*
     * =====================================================
     * CHILD MOUNT
     * =====================================================
     *
     * BotMesh does:
     *
     * <group
     *   position={[childMount.x, childMount.y, childMount.z]}
     * >
     *
     * inside the rotated joint group.
     *
     * Therefore childMount is expressed in the current
     * joint's local coordinate system and must be rotated
     * into world space.
     */
    const childMount = new THREE.Vector3(
      segment.link.childMount.x,
      segment.link.childMount.y,
      segment.link.childMount.z,
    );

    childMount.applyQuaternion(rotation);

    position.add(childMount);
  }

  return {
    position,
    rotation,
  };
}

/**
 * Get the WORLD position and WORLD axis of every joint.
 *
 * This is used by CCD IK.
 */
export function getJointWorldStates(
  segments: SegmentFormData[],
  values: number[],
): JointWorldState[] {
  const position = new THREE.Vector3();

  const rotation = new THREE.Quaternion();

  const states: JointWorldState[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    const localAxis = new THREE.Vector3(
      segment.joint.axis[0],
      segment.joint.axis[1],
      segment.joint.axis[2],
    ).normalize();

    /*
     * =====================================================
     * JOINT WORLD POSITION
     * =====================================================
     *
     * This is BEFORE this joint's motion.
     */
    states.push({
      position: position.clone(),

      axis: localAxis.clone().applyQuaternion(rotation).normalize(),
    });

    const value = values[i] ?? segment.value;

    /*
     * =====================================================
     * JOINT MOTION
     * =====================================================
     */

    if (segment.joint.type === "revolute") {
      /*
       * Local rotation, exactly like BotMesh.
       */
      const jointRotation = new THREE.Quaternion().setFromAxisAngle(
        localAxis,
        value,
      );

      rotation.multiply(jointRotation);
    }

    if (segment.joint.type === "prismatic") {
      /*
       * Prismatic movement happens along the joint's
       * WORLD axis.
       */
      const worldAxis = localAxis.clone().applyQuaternion(rotation).normalize();

      position.add(worldAxis.multiplyScalar(value));
    }

    /*
     * =====================================================
     * CHILD MOUNT
     * =====================================================
     */

    const childMount = new THREE.Vector3(
      segment.link.childMount.x,
      segment.link.childMount.y,
      segment.link.childMount.z,
    );

    childMount.applyQuaternion(rotation);

    position.add(childMount);
  }

  return states;
}
