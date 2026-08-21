import { SegmentFormData, SegmentNodeType } from "@/interfaces/segment";
import {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  EdgeChange,
  NodeChange,
} from "@xyflow/react";
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

  updateSegment: (nodeId: string, data: SegmentFormData) => void;

  deleteSegment: (nodeId: string) => void;

  setNodes: React.Dispatch<React.SetStateAction<SegmentNodeType[]>>;

  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange(changes: NodeChange<SegmentNodeType>[]): void;

  onEdgesChange(changes: EdgeChange[]): void;

  handleCopyJson(): void;
}

/* ---------------------------------- */
/* Context */
/* ---------------------------------- */

const SegmentContext = createContext<SegmentContextValue | null>(null);

/* ---------------------------------- */
/* Provider */
/* ---------------------------------- */

export function SegmentProvider({
  children,
  initialNodes = [
    {
      id: "root",
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
          value: 0,
        },
      },
    },
  ],
  initialEdges = [],
}: {
  children: ReactNode;
  initialNodes?: SegmentNodeType[];
  initialEdges?: Edge[];
}) {
  const [nodes, setNodes] = useState<SegmentNodeType[]>(initialNodes);

  const [edges, setEdges] = useState<Edge[]>(initialEdges);

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

    setNodes((current) => [...current, newNode]);
  }

  /* ------------------------------ */
  /* Update */
  /* ------------------------------ */

  function updateSegment(nodeId: string, data: SegmentFormData) {
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

  function deleteSegment(nodeId: string) {
    setNodes((current) => current.filter((node) => node.id !== nodeId));

    setEdges((current) =>
      current.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      ),
    );
  }

  function onNodesChange(changes: NodeChange<SegmentNodeType>[]) {
    setNodes((current) => applyNodeChanges(changes, current));
  }

  function onEdgesChange(changes: EdgeChange[]) {
    setEdges((current) => applyEdgeChanges(changes, current));
  }

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify({ nodes, edges }, null, 2),
      );

      console.log("JSON copied");
    } catch (error) {
      console.error("Failed to copy JSON", error);
    }
  };
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
      onEdgesChange,

      handleCopyJson,
    }),
    [nodes, edges],
  );

  return (
    <SegmentContext.Provider value={value}>{children}</SegmentContext.Provider>
  );
}

/* ---------------------------------- */
/* Hook */
/* ---------------------------------- */

export function useSegments() {
  const context = useContext(SegmentContext);

  if (!context) {
    throw new Error("useSegments must be used inside SegmentProvider");
  }

  return context;
}
