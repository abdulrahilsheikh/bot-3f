// import * as THREE from "three";
// import type { SegmentFormData } from "@/interfaces/segment";

// export interface RobotPose {
//   position: THREE.Vector3;
//   rotation: THREE.Quaternion;

//   jointPositions: THREE.Vector3[];
//   jointAxes: THREE.Vector3[];
// }

// export function fk(segments: SegmentFormData[], joints: number[]): RobotPose {
//   const position = new THREE.Vector3();
//   const rotation = new THREE.Quaternion();

//   const jointPositions: THREE.Vector3[] = [];
//   const jointAxes: THREE.Vector3[] = [];

//   for (let i = 0; i < segments.length; i++) {
//     const segment = segments[i];
//     const angle = joints[i];

//     const axis = new THREE.Vector3(
//       segment.joint.axis[0],
//       segment.joint.axis[1],
//       segment.joint.axis[2],
//     ).normalize();

//     // Position of this joint in world space
//     jointPositions.push(position.clone());

//     // Axis in world space
//     const worldAxis = axis.clone().applyQuaternion(rotation).normalize();

//     jointAxes.push(worldAxis.clone());

//     // Joint motion
//     if (segment.joint.type === "revolute") {
//       const q = new THREE.Quaternion();

//       q.setFromAxisAngle(worldAxis, angle);

//       rotation.multiply(q);
//     }

//     if (segment.joint.type === "prismatic") {
//       position.add(worldAxis.clone().multiplyScalar(angle));
//     }

//     // Move to child mount
//     const childMount = new THREE.Vector3(
//       segment.link.childMount.x,
//       segment.link.childMount.y,
//       segment.link.childMount.z,
//     );

//     childMount.applyQuaternion(rotation);

//     position.add(childMount);
//   }

//   return {
//     position,
//     rotation,
//     jointPositions,
//     jointAxes,
//   };
// }

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

export function getJointWorldStates(
  segments: SegmentFormData[],
  values: number[],
) {
  const position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();

  const states = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    const localAxis = new THREE.Vector3(
      segment.joint.axis[0],
      segment.joint.axis[1],
      segment.joint.axis[2],
    ).normalize();

    /*
     * Axis after all parent rotations.
     */
    const worldAxis = localAxis.clone().applyQuaternion(rotation).normalize();

    states.push({
      position: position.clone(),
      axis: worldAxis.clone(),
    });

    const value = values[i];

    /*
     * EXACTLY like BotMesh.
     */
    if (segment.joint.type === "revolute") {
      const q = new THREE.Quaternion().setFromAxisAngle(localAxis, value);

      rotation.multiply(q);
    }

    if (segment.joint.type === "prismatic") {
      const translation = localAxis
        .clone()
        .multiplyScalar(value)
        .applyQuaternion(rotation);

      position.add(translation);
    }

    /*
     * EXACTLY like childMount in BotMesh.
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

export function fk(segments: SegmentFormData[], values: number[]): FKResult {
  const position = new THREE.Vector3();
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
     * Joint motion.
     */
    if (segment.joint.type === "revolute") {
      const q = new THREE.Quaternion().setFromAxisAngle(localAxis, value);

      rotation.multiply(q);
    }

    if (segment.joint.type === "prismatic") {
      const translation = localAxis
        .clone()
        .multiplyScalar(value)
        .applyQuaternion(rotation);

      position.add(translation);
    }

    /*
     * Move to child mount.
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
