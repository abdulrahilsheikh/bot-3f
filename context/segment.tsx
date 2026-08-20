
import { SegmentFormData, SegmentNodeType } from "@/interfaces/segment";
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, NodeChange } from "@xyflow/react";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface SegmentContextValue {
    nodes: SegmentNodeType[];
    edges: Edge[];

    addSegment: (
        data: SegmentFormData,
        position?: {
            x: number;
            y: number;
        },
    ) => void;

    updateSegment: (
        nodeId: string,
        data: SegmentFormData,
    ) => void;

    deleteSegment: (
        nodeId: string,
    ) => void;

    setNodes: React.Dispatch<
        React.SetStateAction<SegmentNodeType[]>
    >;

    setEdges: React.Dispatch<
        React.SetStateAction<Edge[]>
    >;
    onNodesChange(
        changes: NodeChange<SegmentNodeType>[],
    ): void;

    onEdgesChange(
        changes: EdgeChange[],
    ): void;
}

/* ---------------------------------- */
/* Context */
/* ---------------------------------- */

const SegmentContext =
    createContext<SegmentContextValue | null>(
        null,
    );

/* ---------------------------------- */
/* Provider */
/* ---------------------------------- */

export function SegmentProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [nodes, setNodes] = useState<
        SegmentNodeType[]
    >([{
        id: "segment-1",
        type: "segmentNode",
        position: {
            x: 100,
            y: 100,
        },
        data: {
            segment: {
                joint: {
                    name: "Joint 1",
                    type: "revolute",
                    axis: [0, 1, 0],
                    min: -Math.PI,
                    max: Math.PI,
                },

                link: {
                    name: "Link 1",
                    length: 1,
                    width: 0.25,
                    depth: 0.25,

                    childMount: {
                        x: 0,
                        y: 1,
                        z: 0,
                    },
                },
                value: Math.PI / 4,
            },
        },
    }, {
        id: "segment-2",
        type: "segmentNode",
        position: {
            x: 200,
            y: 100,
        },
        data: {
            segment: {
                joint: {
                    name: "Joint 2",
                    type: "revolute",
                    axis: [1, 0, 0],
                    min: -Math.PI,
                    max: Math.PI,
                },

                link: {
                    name: "Link 2",
                    length: 1,
                    width: 0.25,
                    depth: 0.25,

                    childMount: {
                        x: 0,
                        y: 1,
                        z: 0,
                    },
                },
                value: Math.PI / 4,
            },
        },
    }]);

    const [edges, setEdges] = useState<Edge[]>(
        [],
    );

    /* ------------------------------ */
    /* Add */
    /* ------------------------------ */

    function addSegment(
        data: SegmentFormData,
        position = {
            x: 100,
            y: 100,
        },
    ) {
        const id = crypto.randomUUID();

        const newNode: SegmentNodeType = {
            id,
            type: "segmentNode",
            position,
            data: {
                segment: data,
            },
        };

        setNodes((current) => [
            ...current,
            newNode,
        ]);
    }

    /* ------------------------------ */
    /* Update */
    /* ------------------------------ */

    function updateSegment(
        nodeId: string,
        data: SegmentFormData,
    ) {
        setNodes((current) =>
            current.map((node) => {
                if (node.id !== nodeId) {
                    return node;
                }

                return {
                    ...node,

                    data: {
                        segment: data,
                    },
                };
            }),
        );
    }

    /* ------------------------------ */
    /* Delete */
    /* ------------------------------ */

    function deleteSegment(
        nodeId: string,
    ) {
        setNodes((current) =>
            current.filter(
                (node) => node.id !== nodeId,
            ),
        );

        setEdges((current) =>
            current.filter(
                (edge) =>
                    edge.source !== nodeId &&
                    edge.target !== nodeId,
            ),
        );
    }


    function onNodesChange(
        changes: NodeChange<SegmentNodeType>[],
    ) {
        setNodes((current) =>
            applyNodeChanges(
                changes,
                current,
            ),
        );
    }

    function onEdgesChange(
        changes: EdgeChange[],
    ) {
        setEdges((current) =>
            applyEdgeChanges(
                changes,
                current,
            ),
        );
    }
    /* ------------------------------ */

    const value = useMemo(
        () => ({
            nodes,
            edges,

            addSegment,
            updateSegment,
            deleteSegment,

            setNodes,
            setEdges,

            onNodesChange,
            onEdgesChange
        }),
        [nodes, edges],
    );

    return (
        <SegmentContext.Provider value={value}>
            {children}
        </SegmentContext.Provider>
    );
}

/* ---------------------------------- */
/* Hook */
/* ---------------------------------- */

export function useSegments() {
    const context =
        useContext(SegmentContext);

    if (!context) {
        throw new Error(
            "useSegments must be used inside SegmentProvider",
        );
    }

    return context;
}