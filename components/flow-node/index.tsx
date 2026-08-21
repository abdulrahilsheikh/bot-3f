"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import { useSegments } from "@/context/segment";
import type { JointType } from "@/interfaces/joint";
import type { SegmentFormData, SegmentNodeType } from "@/interfaces/segment";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SegmentNode({ id, data }: NodeProps<SegmentNodeType>) {
  const { updateSegment } = useSegments();

  const { joint, link, value } = data.segment;

  /* ---------------------------------- */
  /* Update helpers */
  /* ---------------------------------- */

  function update(changes: Partial<SegmentFormData>) {
    updateSegment(id, {
      ...data.segment,
      ...changes,
    });
  }

  function updateJoint(changes: Partial<SegmentFormData["joint"]>) {
    update({
      joint: {
        ...joint,
        ...changes,
      },
    });
  }

  function updateLink(changes: Partial<SegmentFormData["link"]>) {
    update({
      link: {
        ...link,
        ...changes,
      },
    });
  }

  function updateAxis(index: 0 | 1 | 2, value: number) {
    const axis = [...joint.axis] as [number, number, number];

    axis[index] = value;

    updateJoint({ axis });
  }

  function updateChildMount(axis: "x" | "y" | "z", value: number) {
    updateLink({
      childMount: {
        ...link.childMount,
        [axis]: value,
      },
    });
  }

  /* ---------------------------------- */
  /* Value */
  /* ---------------------------------- */

  function updateValue(displayValue: number) {
    if (joint.type === "revolute") {
      update({
        value: degreesToRadians(displayValue),
      });

      return;
    }

    update({
      value: displayValue,
    });
  }

  function displayValue() {
    if (joint.type === "revolute") {
      return radiansToDegrees(value);
    }

    return value;
  }

  /* ---------------------------------- */
  /* Render */
  /* ---------------------------------- */

  return (
    <div
      className="w-[300px] overflow-hidden rounded-xl border bg-background shadow-lg"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* TARGET */}

      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !bg-muted-foreground"
      />

      {/* HEADER */}

      <div className="border-b bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            value={joint.name}
            onChange={(e) =>
              updateJoint({
                name: e.target.value,
              })
            }
            className="nodrag h-8 flex-1 border-0 bg-transparent px-0 text-sm font-semibold shadow-none focus-visible:ring-0"
          />

          <Select
            value={joint.type}
            onValueChange={(value) =>
              updateJoint({
                type: value as JointType,
              })
            }
          >
            <SelectTrigger className="nodrag h-8 w-[105px] bg-black text-xs text-white">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="revolute">Revolute</SelectItem>

              <SelectItem value="prismatic">Prismatic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="mt-1 text-xs capitalize text-muted-foreground">
          {joint.type} joint
        </p>
      </div>

      {/* JOINT */}

      <div className="border-b px-4 py-3">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Joint
        </h4>

        {/* VALUE */}

        <Field label={joint.type === "revolute" ? "Value (°)" : "Value (m)"}>
          <NumberInput value={displayValue()} onChange={updateValue} />
        </Field>

        {/* AXIS */}

        <div className="mb-3">
          <label className="mb-1 block text-xs text-muted-foreground">
            Axis
          </label>

          <div className="grid grid-cols-3 gap-2">
            <NumberInput
              value={joint.axis[0]}
              onChange={(value) => updateAxis(0, value)}
            />

            <NumberInput
              value={joint.axis[1]}
              onChange={(value) => updateAxis(1, value)}
            />

            <NumberInput
              value={joint.axis[2]}
              onChange={(value) => updateAxis(2, value)}
            />
          </div>
        </div>

        {/* LIMITS */}

        <div className="grid grid-cols-2 gap-2">
          <Field label={joint.type === "revolute" ? "Min (°)" : "Min (m)"}>
            <NumberInput
              value={
                joint.type === "revolute"
                  ? radiansToDegrees(joint.min)
                  : joint.min
              }
              onChange={(value) =>
                updateJoint({
                  min:
                    joint.type === "revolute" ? degreesToRadians(value) : value,
                })
              }
            />
          </Field>

          <Field label={joint.type === "revolute" ? "Max (°)" : "Max (m)"}>
            <NumberInput
              value={
                joint.type === "revolute"
                  ? radiansToDegrees(joint.max)
                  : joint.max
              }
              onChange={(value) =>
                updateJoint({
                  max:
                    joint.type === "revolute" ? degreesToRadians(value) : value,
                })
              }
            />
          </Field>
        </div>
      </div>

      {/* LINK */}

      <div className="border-b px-4 py-3">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Link
        </h4>

        <Field label="Name">
          <Input
            value={link.name}
            onChange={(e) =>
              updateLink({
                name: e.target.value,
              })
            }
            className="nodrag"
          />
        </Field>

        <div className="grid grid-cols-3 gap-2">
          <Field label="Length">
            <NumberInput
              value={link.length}
              onChange={(value) =>
                updateLink({
                  length: value,
                })
              }
            />
          </Field>

          <Field label="Width">
            <NumberInput
              value={link.width}
              onChange={(value) =>
                updateLink({
                  width: value,
                })
              }
            />
          </Field>

          <Field label="Depth">
            <NumberInput
              value={link.depth}
              onChange={(value) =>
                updateLink({
                  depth: value,
                })
              }
            />
          </Field>
        </div>
      </div>

      {/* CHILD MOUNT */}

      <div className="px-4 py-3">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Next Joint Mount
        </h4>

        <div className="grid grid-cols-3 gap-2">
          <Field label="X">
            <NumberInput
              value={link.childMount.x}
              onChange={(value) => updateChildMount("x", value)}
            />
          </Field>

          <Field label="Y">
            <NumberInput
              value={link.childMount.y}
              onChange={(value) => updateChildMount("y", value)}
            />
          </Field>

          <Field label="Z">
            <NumberInput
              value={link.childMount.z}
              onChange={(value) => updateChildMount("z", value)}
            />
          </Field>
        </div>
      </div>

      {/* SOURCE */}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !bg-foreground"
      />
    </div>
  );
}

/* ================================== */
/* Field */
/* ================================== */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-xs text-muted-foreground">
        {label}
      </span>

      {children}
    </label>
  );
}

/* ================================== */
/* Number Input */
/* ================================== */

function NumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      onWheel={(e) => e.currentTarget.blur()}
      className="nodrag h-9"
    />
  );
}

/* ================================== */
/* Helpers */
/* ================================== */

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians: number) {
  return radians * (180 / Math.PI);
}
