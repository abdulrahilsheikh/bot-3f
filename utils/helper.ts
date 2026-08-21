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

// utils/config.ts

function encodeRobotConfig(config: unknown): string {
  const json = JSON.stringify(config);

  const base64 = btoa(
    encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    ),
  );

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeRobotConfig<T>(encoded: string): T {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

  const binary = atob(base64);

  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  const json = new TextDecoder().decode(bytes);

  return JSON.parse(json) as T;
}

export { normalize, multiply, encodeRobotConfig, decodeRobotConfig };
