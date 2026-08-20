/* -------------------------------- */
/* Math helpers                     */
/* -------------------------------- */

import { Vec3 } from "@/interfaces/frame";

function normalize(vector: Vec3): Vec3 {
  const length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2);

  if (length === 0) {
    throw new Error("Joint axis cannot be zero.");
  }

  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function multiply(vector: Vec3, scalar: number): Vec3 {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

export { normalize, multiply };
