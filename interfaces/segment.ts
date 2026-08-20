import { Joint } from "../utils/joint";
import { Link } from "../utils/link";
import { JointType } from "./joint";

import { Node } from "@xyflow/react";

export interface RobotSegment {
  joint: Joint;
  link: Link;
}

export interface SegmentFormData {
  joint: {
    name: string;
    type: JointType;

    axis: [number, number, number];

    min: number;
    max: number;
  };

  link: {
    name: string;

    length: number;
    width: number;
    depth: number;

    childMount: {
      x: number;
      y: number;
      z: number;
    };
  };
  value: number;
}
export type SegmentNodeData = {
  segment: SegmentFormData;
};

export type SegmentNodeType = Node<SegmentNodeData, "segmentNode">;
