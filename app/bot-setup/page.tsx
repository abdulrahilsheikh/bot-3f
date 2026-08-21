"use client";
import { SegmentProvider } from "@/context/segment";
import { SegmentNodeType } from "@/interfaces/segment";
import { decodeRobotConfig } from "@/utils/helper";
import { Edge, ReactFlowProvider } from "@xyflow/react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import ResizablePanelView from "./_components/resizable-pannel-view";

export default function Home() {
  const searchParams = useSearchParams();
  const config = useMemo(() => {
    const encoded = searchParams.get("config");

    if (!encoded) {
      return {
        nodes: [],
        edges: [],
      };
    }

    try {
      return decodeRobotConfig<{
        nodes: SegmentNodeType[];
        edges: Edge[];
      }>(encoded);
    } catch (error) {
      console.error("Invalid robot configuration:", error);
      return {
        nodes: [],
        edges: [],
      };
    }
  }, [searchParams]);
  return (
    <ReactFlowProvider>
      <SegmentProvider initialEdges={config.edges} initialNodes={config.nodes}>
        <div className="h-screen  ">
          <ResizablePanelView />
        </div>
      </SegmentProvider>
    </ReactFlowProvider>
  );
}
