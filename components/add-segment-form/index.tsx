import { JointType } from "@/interfaces/joint";
import { SegmentFormData } from "@/interfaces/segment";
import { useState } from "react";


interface AddSegmentFormProps {
    onSubmit: (data: SegmentFormData) => void;
    onCancel?: () => void;
}

export function AddSegmentForm({
    onSubmit,
    onCancel,
}: AddSegmentFormProps) {
    const [jointName, setJointName] =
        useState("Joint 1");

    const [jointType, setJointType] =
        useState<JointType>("revolute");

    const [axis, setAxis] =
        useState<[number, number, number]>([
            0,
            1,
            0,
        ]);

    const [min, setMin] =
        useState(-180);

    const [max, setMax] =
        useState(180);

    const [linkName, setLinkName] =
        useState("Link 1");

    const [length, setLength] =
        useState(1);

    const [width, setWidth] =
        useState(0.5);

    const [depth, setDepth] =
        useState(0.5);

    const [childMount, setChildMount] =
        useState({
            x: 0,
            y: 1,
            z: 0,
        });

    function submit() {
        onSubmit({
            joint: {
                name: jointName,
                type: jointType,

                axis,

                min:
                    jointType === "revolute"
                        ? degreesToRadians(min)
                        : min,

                max:
                    jointType === "revolute"
                        ? degreesToRadians(max)
                        : max,
            },

            link: {
                name: linkName,

                length,
                width,
                depth,

                childMount,
            },
            value: 0
        });
    }

    return (
        <div className="w-[360px] rounded-xl border bg-white p-5 shadow-xl">
            <div className="mb-5">
                <h2 className="text-lg font-semibold">
                    Add Segment
                </h2>

                <p className="text-sm text-gray-500">
                    Define a joint and the link attached
                    to it.
                </p>
            </div>

            {/* JOINT */}

            <section className="mb-6">
                <h3 className="mb-3 text-sm font-semibold">
                    Joint
                </h3>

                <Field label="Name">
                    <input
                        value={jointName}
                        onChange={(e) =>
                            setJointName(e.target.value)
                        }
                    />
                </Field>

                <Field label="Type">
                    <select
                        value={jointType}
                        onChange={(e) =>
                            setJointType(
                                e.target.value as JointType,
                            )
                        }
                    >
                        <option value="revolute">
                            Revolute
                        </option>

                        <option value="linear">
                            Linear
                        </option>
                    </select>
                </Field>

                <div className="mb-3">
                    <label className="mb-1 block text-xs text-gray-500">
                        Axis
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                        <NumberInput
                            value={axis[0]}
                            onChange={(v) =>
                                setAxis([
                                    v,
                                    axis[1],
                                    axis[2],
                                ])
                            }
                        />

                        <NumberInput
                            value={axis[1]}
                            onChange={(v) =>
                                setAxis([
                                    axis[0],
                                    v,
                                    axis[2],
                                ])
                            }
                        />

                        <NumberInput
                            value={axis[2]}
                            onChange={(v) =>
                                setAxis([
                                    axis[0],
                                    axis[1],
                                    v,
                                ])
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Field
                        label={
                            jointType === "revolute"
                                ? "Min (°)"
                                : "Min (m)"
                        }
                    >
                        <NumberInput
                            value={min}
                            onChange={setMin}
                        />
                    </Field>

                    <Field
                        label={
                            jointType === "revolute"
                                ? "Max (°)"
                                : "Max (m)"
                        }
                    >
                        <NumberInput
                            value={max}
                            onChange={setMax}
                        />
                    </Field>
                </div>
            </section>

            {/* LINK */}

            <section className="mb-6">
                <h3 className="mb-3 text-sm font-semibold">
                    Link
                </h3>

                <Field label="Name">
                    <input
                        value={linkName}
                        onChange={(e) =>
                            setLinkName(e.target.value)
                        }
                    />
                </Field>

                <div className="grid grid-cols-3 gap-2">
                    <Field label="Length">
                        <NumberInput
                            value={length}
                            onChange={setLength}
                        />
                    </Field>

                    <Field label="Width">
                        <NumberInput
                            value={width}
                            onChange={setWidth}
                        />
                    </Field>

                    <Field label="Depth">
                        <NumberInput
                            value={depth}
                            onChange={setDepth}
                        />
                    </Field>
                </div>
            </section>

            {/* CHILD MOUNT */}

            <section className="mb-6">
                <h3 className="mb-1 text-sm font-semibold">
                    Next Joint Mount
                </h3>

                <p className="mb-3 text-xs text-gray-500">
                    Position of the next joint relative
                    to this link.
                </p>

                <div className="grid grid-cols-3 gap-2">
                    <Field label="X">
                        <NumberInput
                            value={childMount.x}
                            onChange={(x) =>
                                setChildMount({
                                    ...childMount,
                                    x,
                                })
                            }
                        />
                    </Field>

                    <Field label="Y">
                        <NumberInput
                            value={childMount.y}
                            onChange={(y) =>
                                setChildMount({
                                    ...childMount,
                                    y,
                                })
                            }
                        />
                    </Field>

                    <Field label="Z">
                        <NumberInput
                            value={childMount.z}
                            onChange={(z) =>
                                setChildMount({
                                    ...childMount,
                                    z,
                                })
                            }
                        />
                    </Field>
                </div>
            </section>

            {/* ACTIONS */}

            <div className="flex justify-end gap-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg px-4 py-2 text-sm"
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="button"
                    onClick={submit}
                    className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                >
                    Add Segment
                </button>
            </div>
        </div>
    );
}

/* ---------------------------------- */

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="mb-3 block">
            <span className="mb-1 block text-xs text-gray-500">
                {label}
            </span>

            {children}
        </label>
    );
}

function NumberInput({
    value,
    onChange,
}: {
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <input
            type="number"
            value={value}
            onChange={(e) =>
                onChange(
                    Number(e.target.value),
                )
            }
            className="w-full rounded-md border px-2 py-1.5 text-sm"
        />
    );
}

function degreesToRadians(
    degrees: number,
) {
    return (
        degrees *
        (Math.PI / 180)
    );
}