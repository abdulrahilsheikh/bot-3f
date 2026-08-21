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
  initialNodes = [],
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
    // Never delete root
    if (nodeId === "root") {
      return;
    }

    setNodes((current) => current.filter((node) => node.id !== nodeId));

    setEdges((current) =>
      current.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      ),
    );
  }

  /* ------------------------------ */
  /* Node changes */
  /* ------------------------------ */

  function onNodesChange(changes: NodeChange<SegmentNodeType>[]) {
    /*
     * Remove delete changes for the root node.
     *
     * React Flow can generate a "remove" change
     * independently of deleteSegment().
     */
    const filteredChanges = changes.filter(
      (change) => change.type !== "remove" || change.id !== "root",
    );

    setNodes((current) => applyNodeChanges(filteredChanges, current));
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
