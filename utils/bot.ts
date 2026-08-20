import * as THREE from "three";
import type { SegmentFormData, SegmentNodeType } from "@/interfaces/segment";

import type { Edge } from "@xyflow/react";
export function getConnectedSegments(
  nodes: SegmentNodeType[],
  edges: Edge[],
  rootId: string,
): SegmentFormData[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const root = nodeMap.get(rootId);

  if (!root) {
    return [];
  }

  /*
   * source -> target
   */
  const nextNode = new Map<string, string>();

  for (const edge of edges) {
    nextNode.set(edge.source, edge.target);
  }

  const segments: SegmentFormData[] = [];

  let currentId: string | undefined = rootId;

  while (currentId) {
    const node = nodeMap.get(currentId);

    if (!node) {
      break;
    }

    /*
     * Add root/segment itself.
     */
    if (node.type === "segmentNode") {
      segments.push(node.data.segment);
    }

    /*
     * Find next node.
     */
    currentId = nextNode.get(currentId);
  }

  return segments;
}

export function setJointValue(
  robot: THREE.Group,
  jointName: string,
  value: number,
) {
  const joint = robot.getObjectByName(jointName);

  if (!joint) {
    return;
  }

  const { type, axis, min, max } = joint.userData;

  const clamped = THREE.MathUtils.clamp(value, min, max);

  const axisVector = new THREE.Vector3(...axis).normalize();

  if (type === "revolute") {
    joint.quaternion.setFromAxisAngle(axisVector, clamped);
  }

  if (type === "linear") {
    joint.position.copy(axisVector).multiplyScalar(clamped);
  }
}
