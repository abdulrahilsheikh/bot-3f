import { Frame, Vec3 } from "./frame";

export type LinkGeometry =
  | {
      type: "box";
      width: number;
      height: number;
      depth: number;
    }
  | {
      type: "cylinder";
      radius: number;
      height: number;
    }
  | {
      type: "sphere";
      radius: number;
    }
  | {
      type: "mesh";
      asset: string;
    };

export interface LinkOptions {
  id: string;
  name: string;

  /**
   * Link frame relative to the
   * parent joint.
   */
  frame: Frame;

  /**
   * Where the next joint is mounted
   * relative to this link.
   */
  childFrame: Frame;

  /**
   * Optional visual dimensions.
   */
  size?: [number, number, number];
}
