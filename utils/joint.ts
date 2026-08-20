import { Frame } from "@/interfaces/frame";
import { JointOptions, JointType } from "@/interfaces/joint";

export class Joint {
  readonly id: string;
  readonly name: string;

  readonly type: JointType;

  readonly frame: Frame;

  readonly axis: [number, number, number];

  readonly min: number;
  readonly max: number;

  /**
   * Current joint value.
   *
   * revolute -> radians
   * linear   -> meters
   */
  value = 0;

  constructor(options: JointOptions) {
    this.id = options.id;
    this.name = options.name;

    this.type = options.type;

    this.frame = options.frame;

    this.axis = options.axis;

    this.min =
      options.min ?? (options.type === "revolute" ? -Math.PI : -Infinity);

    this.max =
      options.max ?? (options.type === "revolute" ? Math.PI : Infinity);
  }

  setValue(value: number): void {
    this.value = Math.max(this.min, Math.min(this.max, value));
  }

  reset(): void {
    this.value = 0;
  }
}
