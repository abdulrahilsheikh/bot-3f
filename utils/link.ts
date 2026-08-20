import { Frame } from "@/interfaces/frame";
import { LinkOptions } from "@/interfaces/link";

export class Link {
  readonly id: string;
  readonly name: string;

  /**
   * Link's own coordinate frame.
   */
  readonly frame: Frame;

  /**
   * Mounting point for the next joint.
   */
  readonly childFrame: Frame;

  readonly size: [number, number, number];

  constructor(options: LinkOptions) {
    this.id = options.id;
    this.name = options.name;

    this.frame = options.frame;

    this.childFrame = options.childFrame;

    this.size = options.size ?? [1, 1, 1];
  }
}
