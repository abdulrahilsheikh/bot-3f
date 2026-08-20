export type Vec3 = [number, number, number];

export interface Frame {
  position: Vec3;
  rotation: Vec3;
}

export const IDENTITY_FRAME: Frame = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
};
