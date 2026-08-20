import { Frame, Vec3 } from "./frame";

export type JointType = "revolute" | "prismatic";

export interface JointLimits {
  min: number;
  max: number;
}

export interface JointOptions {
  id: string;
  name: string;

  type: JointType;

  /**
   * Position/orientation of this joint
   * relative to its parent link.
   */
  frame: Frame;

  /**
   * Joint axis in the joint's local coordinate system.
   *
   * Example:
   * [0, 1, 0] = rotate around Y
   */
  axis: Vec3;

  /**
   * Position of the joint relative
   * to its parent frame.
   */
  position?: Vec3;

  min?: number;
  max?: number;
}
